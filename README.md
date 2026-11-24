# PhysicsLab
A platform for student to play with physics!
# ⚛️ PhysLab 10 — Laboratorium Fisika Virtual SMA Kelas 10

## A. Judul & Deskripsi Produk
**PhysLab 10** adalah aplikasi web interaktif (*Progressive Web App*) yang berfungsi sebagai laboratorium praktikum fisika virtual untuk siswa SMA Kelas 10. 

* **Latar Belakang Masalah:** Keterbatasan alat peraga praktikum fisika di laboratorium sekolah, risiko kerusakan alat saat eksperimen mandiri, serta sulitnya memvisualisasikan konsep abstrak (seperti vektor gaya, lintasan parabola, perubahan energi mekanik, dan gaya apung fluida) hanya melalui buku teks.
* **Solusi yang Ditawarkan:** Menyediakan 6 ruang simulasi praktikum fisika yang interaktif, visual, dilengkapi misi tantangan berbasis skor, Lembar Kerja Siswa (LKS), fitur ekspor laporan (`.PNG` & `.CSV`), serta dapat di-*install* dan dijalankan secara **100% offline** tanpa koneksi internet.
* **Target Pengguna:** Siswa SMA Kelas 10 (sebagai media belajar dan praktikum mandiri) serta Guru Fisika (sebagai alat peraga visual di kelas).

---

## B. Teknologi yang Digunakan
* **Bahasa Pemrograman:** HTML5, CSS3, dan JavaScript (ES6+ Vanilla JS).
* **API & Modul Bawaan Web:** 
  * `HTML5 Canvas API` untuk merender animasi simulasi fisika secara *real-time*.
  * `Web Storage API (localStorage)` untuk menyimpan skor misi tantangan pengguna.
  * `Service Worker API` & `Web App Manifest` (PWA) untuk dukungan akses *offline* dan instalasi aplikasi ke perangkat.
  * `Blob & DataURL API` untuk fitur unduh grafik percobaan (`.PNG`) dan tabel data (`.CSV`).
* **Platform Publikasi (*Live Deploy*):** GitHub Pages.

---

## C. Pemanfaatan AI (*AI Usage Disclosure*)
Dalam pengembangan proyek ini, kecerdasan artifisial dimanfaatkan sebagai asisten perancangan, referensi struktur kode, dan alat *debugging* dengan rincian sebagai berikut:

1. **Alat AI yang Digunakan:** Google Gemini.
2. **Contoh Perintah (*Prompt*) Utama yang Digunakan:**
   * *"Rancang konsep website laboratorium fisika virtual SMA kelas 10 yang interaktif, ringan, dan bisa berjalan offline."*
   * *"Buatkan logika perhitungan fisika dan animasi HTML5 Canvas untuk simulasi Gerak Parabola, Hukum Hooke, Bidang Miring, Ayunan Bandul, Kekekalan Energi Mekanik, dan Hukum Archimedes."*
   * *"Tambahkan fitur gamifikasi misi tantangan, Lembar Kerja Siswa (LKS), serta tombol ekspor data tabel ke CSV dan gambar kanvas ke PNG."*
   * *"Bantu perbaiki error sintaks dan sinkronisasi Service Worker agar halaman dapat di-install secara offline."*
3. **Penyesuaian & Modifikasi Mandiri oleh Pengembang:**
   * Mengubah tata letak dan tema antarmuka beranda serta seluruh modul menjadi gaya **Dark Glassmorphism Futuristik** sesuai konsep visual tim.
   * Menambahkan aset ilustrasi visual laboratorium khusus pada bagian *hero* beranda dan ikon aplikasi (`icon-app.png`).
   * Melakukan pengujian nilai variabel fisika (*slider* sudut, massa, konstanta pegas, dan massa jenis fluida) serta memperbaiki struktur tag HTML dan pemanggilan *script* di seluruh halaman agar berjalan tanpa galat (*bug-free*).
   * Menyusun alur navigasi antar-halaman dan dokumentasi proyek secara mandiri.

---

## D. Panduan Penggunaan & Tautan Website Aktif
* **Tautan Website Aktif (*Live Demo*):** [https://github.io](https://github.io)
* **Langkah-Langkah Menggunakan Aplikasi:**
  1. Buka tautan website di atas melalui browser (Chrome, Edge, atau Safari).
  2. Pada halaman **Beranda**, pilih salah satu dari **6 Modul Praktikum** yang tersedia (*Gerak Parabola, Hukum Hooke, Bidang Miring, Ayunan Bandul, Kekekalan Energi,* atau *Hukum Archimedes*).
  3. Geser **slider variabel** di panel sebelah kiri (misalnya sudut, kecepatan, massa, atau jenis cairan) untuk mengamati perubahan gerak dan perhitungan rumus secara langsung di kanvas sebelah kanan.
  4. Klik tombol **"🎲 Buat Misi Baru"** di kotak *Misi Tantangan* untuk mengerjakan soal target interaktif dan mengumpulkan poin peringkat.
  5. Gunakan tombol **"📷 Simpan Gambar (.PNG)"** atau **"📊 Unduh Excel (.CSV)"** untuk menyimpan hasil percobaan sebagai laporan praktikum.
  6. *(Opsional)* Klik ikon **Install App** di bilah alamat browser untuk memasang **PhysLab 10** ke layar utama perangkat dan menggunakannya secara *offline*.

---

## E. Identitas Pengembang
Karya ini disusun oleh tim beranggotakan 2 (dua) siswa:

1. **Anggota 1:**
   * **Nama Lengkap:** Naufal Dzaky Pratama
   * **Kelas / Jurusan:** X-10
   * **Asal Sekolah:** SMAN 1 KOTA BLITAR
2. **Anggota 2:**
   * **Nama Lengkap:** Misael Cahyono
   * **Kelas / Jurusan:** X-3
   * **Asal Sekolah:** SMAN 1 KOTA BLITAR
