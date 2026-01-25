# 📘 Panduan Operasional Sistem Inventory - Apix Interior

Selamat datang di Sistem Manajemen Inventori Premium **Apix Interior**. Dokumen ini menjelaskan cara kerja sistem, fitur unggulan, dan langkah-langkah penggunaan untuk tim Anda.

---

## 🏗️ 1. Cara Kerja Sistem (Flow Utama)

Sistem ini dirancang untuk menghubungkan **Kantor (Admin)** dengan **Gudang/Workshop (Worker)** secara real-time.

1.  **Tahap Perencanaan (Admin)**: Admin membuat proyek dan daftar belanja/pengambilan barang (Picklist).
2.  **Tahap Eksekusi (Worker)**: Worker menerima notifikasi tugas di HP, mengambil barang di gudang, dan mengunggah foto bukti.
3.  **Tahap Pengembalian**: Setelah proyek selesai, sisa barang dikembalikan ke gudang dan otomatis terdata sebagai "Stok Bekas".
4.  **Tahap Audit (Admin)**: Sistem menghitung performa tim, melacak jejak barang, dan memberikan rekomendasi supplier termurah.

---

## ✨ 2. Fitur Unggulan

### 🛡️ Dashboard Audit & Intelligence
- **Supplier Benchmarking**: Bandingkan harga antar supplier secara otomatis. Sistem akan menandai supplier mana yang menjadi "Price Leader" (termurah).
- **KPI Performa**: Grafik yang menunjukkan siapa worker paling rajin dan berapa banyak tugas yang diselesaikan.
- **Traceability**: Lacak barang A dipakai oleh siapa, untuk proyek apa, dan kapan.

### 📦 Manajemen Stok Modern
- **Double-Stock Tracking**: Memisahkan **Stok Baru** (dari supplier) dan **Stok Bekas** (sisa proyek) agar akurasi nilai inventori tetap terjaga.
- **Visual Evidence**: Worker **wajib** foto barang saat ambil dan saat kembali. Tanpa foto, tugas tidak bisa diselesaikan.
- **Lokasi Rak**: Navigasi rak (Rak 01 - Rak 04) muncul otomatis di HP worker untuk mempercepat pencarian barang.

### 📱 Antarmuka Premium & Mobile Friendly
- Desain **Navy & Gold** yang elegan (Glassmorphism).
- Responsif untuk digunakan di HP (Worker) maupun PC (Admin).

---

## 🚀 3. Langkah-langkah Penggunaan

### 👤 Bagi Administrator (Admin)
1.  **Login**: Masuk melalui [Portal Admin](/admin/login).
2.  **Kelola Data**: Pastikan data Karyawan, Supplier, dan Item Gudang sudah terisi di menu **Master Data**.
3.  **Buat Penugasan**:
    - Buka menu **Picklist**.
    - Klik **+ Buat Picklist**.
    - Pilih Proyek (atau buat proyek baru langsung di sana).
    - Pilih Worker dan daftar barang yang perlu diambil.
4.  **Audit**: Pantau menu **Audit** secara berkala untuk melihat efisiensi biaya belanja.

### 👷 Bagi Warehouse Worker (Pekerja)
1.  **Login**: Masuk melalui [Portal Worker](/worker/login) menggunakan Employee ID dan PIN.
2.  **Ambil Tugas**: Pilih tugas yang berstatus **READY**. Klik **Mulai Mengerjakan**.
3.  **Pengambilan Barang**:
    - Lihat lokasi rak yang tertera.
    - Ambil foto bukti barang di tangan/keranjang.
    - Klik **Konfirmasi Selesai Ambil**. (Stok baru otomatis berkurang).
4.  **Pengembalian (Return)**:
    - Jika proyek selesai dan ada sisa, input jumlah sisa.
    - Ambil foto bukti barang yang ditaruh kembali ke rak.
    - Klik **Selesaikan Projek & Return**. (Stok bekas otomatis bertambah).

---

> [!IMPORTANT]
> **Keamanan**: PIN/Password worker jangan diberikan kepada orang lain. Admin bisa mereset kredensial jika lupa melalui menu **Data Karyawan**.

> [!TIP]
> **Efisiensi**: Selalu cek menu **Audit > Supplier** sebelum belanja stok baru untuk melihat rekomendasi harga termurah yang sudah tersimpan di sistem.
