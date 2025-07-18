# 🖥️ Aplikasi Absensi WFH - Frontend

Aplikasi **frontend (client-side)** untuk platform **Absensi WFH**.  
Aplikasi ini berinteraksi dengan backend **microservices** seperti **User Service** & **Attendance Service** untuk menyediakan antarmuka pengguna yang interaktif.

---

## ✨ Tampilan

- Login Page (untuk login karyawan dan admin ke dalam sistem)
![alt text](image.png)

- Daily Attendance (untuk melakukan absensi harian)
![alt text](image-1.png)
![alt text](image-2.png)

- Attendance History (untuk melihat riwayat absensi)
![alt text](image-3.png)

- Manage Employees (untuk admin untuk mengelola karyawan)
![alt text](image-4.png)

- Attendance Control (untuk admin melihat absensi karyawan (view only))
![alt text](image-5.png)

## ✨ Fitur Utama

✅ **Login Page**  
Halaman login untuk masuk ke aplikasi menggunakan JWT.

✅ **Daily Attendance**  
Halaman utama setelah login, menampilkan fungsi absensi harian (take photo atau upload photo)

✅ **History**  
Halaman History untuk melihat riwayat absensi.

✅ **Manage Employees (Admin)**  
Halaman untuk manajemen karyawan (admin) untuk menambah, mengubah, atau menghapus karyawan.

✅ **Attendance Control**  
Halaman (view) untuk melihat riwayat absensi.

---

## 🚀 Teknologi yang Digunakan

- **[Vite](https://vitejs.dev/)** → Build tool modern untuk React
- **[React](https://react.dev/)** → Library untuk membangun antarmuka pengguna
- **[TanStack Router](https://tanstack.com/router)** → Type-safe routing untuk React
- **[Axios](https://axios-http.com/)** → Client HTTP untuk komunikasi API backend
- **[shadcn/ui](https://ui.shadcn.com/)** → Komponen UI yang reusable
- **[Tailwind CSS](https://tailwindcss.com/)** → Framework CSS untuk styling
- **[Lucide React](https://lucide.dev/)** → Library ikon ringan & modern
- **[js-cookie](https://github.com/js-cookie/js-cookie)** → Mengelola JWT (token otentikasi) di browser

---

## ⚙️ Cara Instalasi & Menjalankan

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/absensi-wfh-frontend.git
cd absensi-wfh-frontend
```
