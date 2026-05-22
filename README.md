# Poolapack Student & Regional Management

## Ringkasan

Project ini terdiri dari:

- `backend/`: REST API dengan Go, Gin, Gorm, MySQL
- `frontend/`: aplikasi React + Vite untuk login, manajemen siswa, kabupaten, dan kecamatan

## Dummy User Login Backend

Gunakan data login berikut untuk mengakses API setelah seed dijalankan:

- username: `admin`
- password: `password123`

## Prasyarat

Pastikan sudah terpasang:

- Go (minimal 1.20+)
- Node.js dan npm
- MySQL

## Konfigurasi Backend

1. Buka folder backend:
   ```bash
   cd backend
   ```
2. Buat file `.env` di folder `backend/` dengan isi contoh berikut:
   ```env
   DB_USER=root
   DB_PASSWORD=
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_NAME=poolapack_db
   JWT_SECRET=poolapack-secret-key-2026
   PORT=8889
   ```
3. Jika menggunakan password MySQL, ganti nilai `DB_PASSWORD` sesuai pengaturan lokal.

## Menjalankan Backend

1. Install dependensi Go (jika perlu):
   ```bash
   go mod tidy
   ```
2. Jalankan server backend:
   ```bash
   go run main.go
   ```
3. Backend akan tersedia di:
   ```text
   http://localhost:8889
   ```
4. API utama berada di:
   ```text
   http://localhost:8889/api
   ```

## Menambahkan Data Dummy

Backend sudah menyediakan skrip seed untuk membuat data dummy default.

1. Pastikan server backend tidak perlu dijalankan, lalu jalankan seed:
   ```bash
   go run ./cmd/seed
   ```
2. Skrip seed ini akan membuat:
   - user admin dengan password `password123`
   - beberapa kabupaten
   - beberapa kecamatan
   - beberapa siswa

## Konfigurasi Frontend

1. Buka folder frontend:
   ```bash
   cd ../frontend
   ```
2. Install dependensi:
   ```bash
   npm install
   ```

## Menjalankan Frontend

1. Jalankan aplikasi frontend:
   ```bash
   npm run dev
   ```
2. Buka browser di alamat yang ditampilkan, biasanya:
   ```text
   http://localhost:5173
   ```

## Detail Login Frontend

Halaman login frontend mengirim data ke endpoint:

```text
http://localhost:8889/api/auth/login
```

Setelah login berhasil, token JWT akan disimpan di `localStorage` dan digunakan untuk mengakses route yang dilindungi.

## Catatan Tambahan

- Jika MySQL belum dibuat, backend akan membuat database secara otomatis jika `.env` dan koneksi benar.
- Jika ingin membuat user baru, gunakan endpoint register di:
  ```text
  POST /api/auth/register
  ```

Selamat mencoba! Jika ada masalah, pastikan MySQL berjalan dan konfigurasi `.env` sudah sesuai.
