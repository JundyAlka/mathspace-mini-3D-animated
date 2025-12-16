# MathSpace Mini 3D

MathSpace Mini adalah aplikasi pembelajaran interaktif untuk memvisualisasikan bangun ruang 3D dan jaring-jaringnya. Aplikasi ini dirancang untuk membantu siswa memahami konsep geometri ruang dengan cara yang menyenangkan dan intuitif.

![Tampilan Aplikasi](screenshot.png)

## Fitur Utama

- **Visualisasi 3D Interaktif**: Eksplorasi bangun ruang (Kubus, Balok, Tabung, Limas, Kerucut, Prisma) dari berbagai sudut.
- **Jaring-Jaring Bangun Ruang**: Mode visualisasi untuk melihat bentuk jaring-jaring dari setiap bangun ruang.
- **Kalkulator Rumus Otomatis**: Menampilkan dan menghitung rumus luas permukaan dan volume secara real-time berdasarkan parameter yang dimasukkan.
- **Kustomisasi Ukuran**: Kontrol penuh untuk mengubah dimensi (panjang, lebar, tinggi, jari-jari) bangun ruang.
- **Reset Kamera**: Kemudahan untuk mengembalikan tampilan ke posisi awal.

## Teknologi yang Digunakan

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla).
- **Library 3D**: [Three.js](https://threejs.org/).
- **Matematika**: [MathJax](https://www.mathjax.org/) untuk rendering rumus matematika yang indah.
- **Backend**: Node.js dengan Express (untuk serving file statis).

## Cara Menjalankan

Ikuti langkah-langkah berikut untuk menjalankan aplikasi di komputer lokal Anda:

1.  **Prasyarat**: Pastikan [Node.js](https://nodejs.org/) sudah terinstal.

2.  **Clone Repository**:
    ```bash
    git clone https://github.com/JundyAlka/mathspace-mini-3D.git
    cd mathspace-mini-3D
    ```

3.  **Install Dependencies**:
    ```bash
    npm install
    ```

4.  **Jalankan Server**:
    ```bash
    npm start
    ```
    Atau jika Anda tidak menggunakan `npm start`:
    ```bash
    node server.js
    ```

5.  **Buka Aplikasi**:
    Buka browser dan kunjungi alamat berikut:
    [http://localhost:3000](http://localhost:3000)

## Struktur Folder

- `assets/`: Menyimpan gambar dan aset statis.
- `src/`: Berisi logika JavaScript utama (`math.js`, `shapes.js`, `ui.js`).
- `styles/`: File CSS untuk styling.
- `index.html`: File utama aplikasi.
- `server.js`: Server sederhana menggunakan Node.js.

## Lisensi

Project ini dibuat untuk tujuan edukasi.
