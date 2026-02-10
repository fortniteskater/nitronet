const express = require('express');
const multer = require('multer');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Setup Storage for Folder Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userFolder = path.join(__dirname, 'user_sites', req.body.username || 'guest');
        cb(null, userFolder);
    },
    filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// 2. Serve the Dashboard (Frontend)
app.use(express.static('public'));

// 3. Folder Upload Route
app.post('/upload', upload.array('files'), (req, res) => {
    res.send('Website uploaded successfully! Access it at /sites/' + req.body.username);
});

// 4. Host the Uploaded User Websites
app.use('/sites', express.static(path.join(__dirname, 'user_sites')));

// 5. THE ADVANCED WEB PROXY (Browse real websites through Nitronet)
app.use('/proxy', (req, res, next) => {
    const targetUrl = req.query.url; // Example: /proxy?url=https://google.com
    if (!targetUrl) return res.send("Please provide a URL.");
    
    createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        pathRewrite: { '^/proxy': '' },
    })(req, res, next);
});

app.listen(PORT, () => console.log(`Nitronet running on port ${PORT}`));
