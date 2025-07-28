const jsonServer = require('json-server');
const path = require('path');
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Middleware untuk menambahkan createdAt dan updatedAt otomatis
server.use((req, res, next) => {
    if (req.method === 'POST') {
        const now = new Date().toISOString();
        req.body.createdAt = now;
        req.body.updatedAt = now;
    }
    next();
});

// Middleware untuk mengatur agar "id" muncul di urutan paling atas
server.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function (body) {
        try {
            const data = JSON.parse(body);
            if (Array.isArray(data)) return originalSend.call(this, body);

            // Pindahkan id ke posisi paling atas
            const { id, ...rest } = data;
            const reordered = Object.assign({ id }, rest);
            return originalSend.call(this, JSON.stringify(reordered));
        } catch (e) {
            return originalSend.call(this, body);
        }
    };
    next();
});

server.use(router);

server.listen(3000, () => {
    console.log('JSON Server is running on port 3000');
});
