const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Sajikan file statis dari direktori saat ini
app.use(express.static(__dirname));

// Rute untuk halaman utama
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Tangani 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Tangani error
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Terjadi kesalahan pada server!');
});

// Mulai server
app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(60));
    console.log(`🚀 Server Express berjalan di:`);
    console.log(`   - Local: http://localhost:${PORT}`);
    console.log(`   - Network: http://${require('os').networkInterfaces()['Wi-Fi']?.[1]?.address || 'localhost'}:${PORT}`);
    console.log('='.repeat(60));
    console.log('Tekan Ctrl+C untuk menghentikan server');
});
