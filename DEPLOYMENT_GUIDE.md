
# 🚀 Panduan Deployment ke VPS

Berikut langkah-langkah untuk mengupdate aplikasi di VPS Anda dengan kode terbaru.

## 1. Pastikan Kode Sudah di GitHub (Local)
Saya sudah mencoba melakukan push otomatis. Untuk memastikan, cek terminal Anda atau jalankan ulang perintah ini di VS Code:

```bash
git add .
git commit -m "Update inventory system: Worker portal & Stock sync"
git push origin HEAD
```
*Jika diminta username/password, masukkan sesuai akun GitHub Anda.*

---

## 2. Update di VPS (Server)
Silakan login ke VPS Anda via SSH/Terminal, lalu jalankan perintah berikut satu per satu:

### a. Masuk ke Folder Project
```bash
cd inventorymanagement
# atau sesuaikan dengan nama folder di VPS Anda
```

### b. Ambil Kode Terbaru
```bash
git pull origin main
# atau: git pull origin master (tergantung branch utama Anda)
```

### c. Install Dependenty & Sync Database
```bash
npm install
npx prisma generate
```

### d. Build Ulang Aplikasi
```bash
npm run build
```

### e. Restart Aplikasi
```bash
pm2 restart all
# atau: pm2 restart 0 (sesuai ID/Nama proses di PM2)
```

---

## ✅ Cek Hasilnya
1. **Worker Portal**: Buka `/worker/home` - harusnya loading cepat & tidak logout sendiri.
2. **Stok**: Cek dashboard admin, stok barang baru harusnya sudah sinkron.
