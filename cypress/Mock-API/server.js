// const jsonServer = require('json-server');
// const path = require('path');
// const server = jsonServer.create();
// const router = jsonServer.router(path.join(__dirname, 'db.json'));
// const middlewares = jsonServer.defaults();

// server.use(middlewares);
// server.use(jsonServer.bodyParser);

// // Middleware untuk menambahkan createdAt dan updatedAt otomatis
// server.use((req, res, next) => {
//     if (req.method === 'POST') {
//         const now = new Date().toISOString();
//         req.body.createdAt = now;
//         req.body.updatedAt = now;
//     }
//     next();
// });

// // Middleware untuk mengatur agar "id" muncul di urutan paling atas
// server.use((req, res, next) => {
//     const originalSend = res.send;
//     res.send = function (body) {
//         try {
//             const data = JSON.parse(body);
//             if (Array.isArray(data)) return originalSend.call(this, body);

//             // Pindahkan id ke posisi paling atas
//             const { id, ...rest } = data;
//             const reordered = Object.assign({ id }, rest);
//             return originalSend.call(this, JSON.stringify(reordered));
//         } catch (e) {
//             return originalSend.call(this, body);
//         }
//     };
//     next();
// });

// server.use(router);

// server.listen(3000, () => {
//     console.log('JSON Server is running on port 3000');
// });

const jsonServer = require('json-server');
const path = require('path');
const server = jsonServer.create();
const dbPath = path.join(__dirname, 'db.json');
const router = jsonServer.router(dbPath);

// 1. Load middleware default TERLEBIH DAHULU
server.use(jsonServer.defaults()); // Ini termasuk bodyParser
server.use(jsonServer.bodyParser); // Explicit tambahan (optional)

// 2. Baru tambahkan middleware custom
server.use((req, res, next) => {
    const now = new Date().toISOString();

    // Pastikan req.body ada (handle case undefined)
    if (!req.body) req.body = {}; // Tambahkan baris ini

    if (req.method === 'POST') {
        req.body.createdAt = now;
        req.body.updatedAt = now;
    } else if (req.method === 'PUT' || req.method === 'PATCH') {
        req.body.updatedAt = now;

        // Pertahankan createdAt dari data existing
        if (req.body.id && !req.body.createdAt) {
            const existingData = router.db.get('tourist').find({ id: req.body.id }).value();
            if (existingData) req.body.createdAt = existingData.createdAt;
        }
    }
    next();
});

// 3. Reorder field id (opsional)
server.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function (body) {
        try {
            const data = JSON.parse(body);
            if (Array.isArray(data)) return originalSend.call(this, body);
            const { id, ...rest } = data;
            const reordered = { id, ...rest };
            return originalSend.call(this, JSON.stringify(reordered));
        } catch (e) {
            return originalSend.call(this, body);
        }
    };
    next();
});

// 4. Gunakan router
server.use(router);

// 5. Jalankan server
server.listen(3000, () => {
    console.log('JSON Server is running at http://localhost:3000');
});
