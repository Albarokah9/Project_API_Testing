const jsonServer = require('json-server');
const path = require('path');
const server = jsonServer.create();
const dbPath = path.join(__dirname, 'db.json');
const router = jsonServer.router(dbPath);

// 1. Load default middleware
server.use(jsonServer.defaults());
server.use(jsonServer.bodyParser);

// Middleware untuk logging
server.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// 2. Middleware untuk validasi struktur data
server.use((req, res, next) => {
    if (req.method === 'POST' && Array.isArray(req.body)) {
        if (req.body.some((item) => Array.isArray(item))) {
            return res.status(400).json({
                error: 'Invalid data structure',
                message: 'Do not nest arrays. Send a flat array directly.',
            });
        }
        if (req.body.length === 0) {
            return res.status(400).json({
                error: 'Empty array',
                message: 'Cannot process empty array',
            });
        }
    }
    next();
});

// 3. Middleware untuk auto-timestamp dan ID berurutan
server.use((req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        // Gunakan timezone Jakarta (WIB UTC+7)
        const now =
            new Date()
                .toLocaleString('sv-SE', {
                    timeZone: 'Asia/Jakarta',
                    hour12: false,
                })
                .replace(' ', 'T') + '.000Z';
        // Dapatkan nama koleksi dari URL path, misal '/tourist/1' -> 'tourist'
        const collectionName = req.path.split('/')[1];

        try {
            const getMaxId = () => {
                const items = router.db.get(collectionName).value() || [];
                return items.length > 0 ? Math.max(...items.map((item) => item.id || 0)) : 0;
            };

            if (Array.isArray(req.body)) {
                let currentMaxId = getMaxId();
                req.body = req.body.map((item, index) => {
                    const existing = item.id
                        ? router.db.get(collectionName).find({ id: item.id }).value()
                        : null;
                    return {
                        ...(existing || {}),
                        ...item,
                        id: item.id || currentMaxId + index + 1,
                        createdAt: existing?.createdAt || now,
                        updatedAt: now, // Selalu update timestamp
                    };
                });
            } else {
                // Single object (POST, PUT, PATCH)
                const existing = req.body.id
                    ? router.db.get(collectionName).find({ id: req.body.id }).value()
                    : null;
                req.body = {
                    ...(existing || {}),
                    ...req.body,
                    id: req.body.id || getMaxId() + 1,
                    createdAt: existing?.createdAt || now,
                    updatedAt: now, // Selalu update timestamp
                };
            }
        } catch (error) {
            console.error('Timestamp middleware error:', error);
            return next(error);
        }
    }
    next();
});

// 4. Middleware untuk menangani POST array data
// Ini penting agar POST array berfungsi dengan benar
server.use((req, res, next) => {
    if (req.method === 'POST' && Array.isArray(req.body)) {
        try {
            const collectionName = req.path.split('/')[1] || 'tourist';
            req.body.forEach((item) => {
                router.db.get(collectionName).push(item).write();
            });
            // Mengirimkan kembali array data yang sudah diproses, termasuk ID dan timestamps
            return res.status(201).json(req.body);
        } catch (error) {
            console.error('Error saving array data:', error);
            return next(error);
        }
    }
    next();
});

// **5. Middleware PATCH yang diperbaiki untuk menangani requirements Anda**
server.patch('/:collection/:id', (req, res, next) => {
    const collectionName = req.params.collection;
    const id = parseInt(req.params.id);
    // Gunakan timezone Jakarta (WIB UTC+7)
    const now =
        new Date()
            .toLocaleString('sv-SE', {
                timeZone: 'Asia/Jakarta',
                hour12: false,
            })
            .replace(' ', 'T') + '.000Z';

    const db = router.db.get(collectionName);
    const existingItem = db.find({ id: id }).value();

    if (!existingItem) {
        // Jika item tidak ditemukan, return 404
        return res.status(404).json({
            error: 'Not Found',
            message: `Item with id ${id} not found in ${collectionName}`,
        });
    }

    // Buat copy dari request body dan hapus id jika ada (agar tidak bisa diubah)
    const bodyWithoutId = { ...req.body };
    delete bodyWithoutId.id;
    delete bodyWithoutId.createdAt; // Pastikan createdAt tidak bisa diubah dari request

    // Gabungkan data yang ada dengan data dari request body
    // Pastikan id tetap sama, createdAt tetap, dan updatedAt diupdate
    const updatedItem = {
        ...existingItem,
        ...bodyWithoutId, // Data yang dikirim dari request (tanpa id dan createdAt)
        id: existingItem.id, // Pastikan id tidak berubah
        createdAt: existingItem.createdAt, // Pastikan createdAt tidak berubah
        updatedAt: now, // Update dengan waktu sekarang
    };

    // Lakukan update di db.json (dengan createdAt tetap disimpan)
    db.find({ id: id }).assign(updatedItem).write();

    // Buat response TANPA createdAt tapi dengan updatedAt
    const responseData = {
        ...Object.fromEntries(
            Object.entries(updatedItem).filter(
                ([key]) => key !== 'createdAt', // Filter keluar HANYA createdAt
            ),
        ),
    };

    // Kirim respons dengan data yang sudah diupdate (tanpa createdAt)
    res.json(responseData);
});

// 6. Middleware response formatter (modifikasi untuk mengecualikan PATCH yang sudah ditangani)
server.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function (body) {
        try {
            // Jika response sudah dikirim oleh middleware PATCH di atas, jangan format lagi
            if (res.headersSent) {
                return originalSend.call(this, body);
            }

            // Skip formatting untuk PATCH karena sudah ditangani di middleware khusus
            if (req.method === 'PATCH') {
                return originalSend.call(this, body);
            }

            // Skip formatting for non-JSON responses
            if (typeof body !== 'string' || (body[0] !== '{' && body[0] !== '[')) {
                return originalSend.call(this, body);
            }

            const data = JSON.parse(body);
            let response;

            const formatItem = (item) => {
                // Tentukan apakah createdAt harus ditampilkan
                const shouldShowCreatedAt = req.method === 'GET' || req.method === 'POST';

                const formatted = {
                    id: item.id,
                    ...Object.fromEntries(
                        Object.entries(item).filter(
                            // Filter keluar createdAt dan updatedAt dari bagian utama
                            ([key]) => !['createdAt', 'updatedAt'].includes(key),
                        ),
                    ),
                    // Tambahkan createdAt jika shouldShowCreatedAt true
                    ...(shouldShowCreatedAt && item.createdAt && { createdAt: item.createdAt }),
                    // Tambahkan updatedAt (akan selalu ada untuk PATCH/PUT/POST yang sudah diproses)
                    ...(item.updatedAt && { updatedAt: item.updatedAt }),
                };
                return formatted;
            };

            if (Array.isArray(data)) {
                response = data.map((item) => formatItem(item));
            } else {
                // Single object
                response = formatItem(data);
            }

            return originalSend.call(this, JSON.stringify(response));
        } catch (e) {
            console.error('Error in response formatter:', e);
            return originalSend.call(this, body);
        }
    };
    next();
});

// 7. Error handling middleware
server.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
    });
});

// 8. Use router (pastikan ini di paling akhir, setelah semua custom middleware)
server.use(router);

// 9. Start server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`JSON Server is running on http://localhost:${PORT}`);
    console.log(`Database file: ${dbPath}`);
});
