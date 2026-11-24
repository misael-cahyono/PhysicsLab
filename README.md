# ⚛️ PhysLab 10 — Laboratorium Fisika Virtual SMA Kelas 10

## A. Judul & Deskripsi Produk
**PhysLab 10** adalah aplikasi web interaktif (*Progressive Web App*) yang berfungsi sebagai laboratorium praktikum fisika virtual untuk siswa SMA Kelas 10.

* **Latar Belakang Masalah:** Keterbatasan alat peraga praktikum fisika di laboratorium sekolah, risiko kerusakan alat listrik/magnet saat eksperimen mandiri, serta kesulitan siswa memahami proses perhitungan dan alasan konsep di balik hasil angka praktikum.
* **Solusi yang Ditawarkan:** Menyediakan **9 ruang simulasi praktikum fisika interaktif** (mencakup Mekanika, Fluida Statis, Listrik Dinamis, dan Kemagnetan), dilengkapi fitur **Analisis & Penjelasan Otomatis** (*real-time*), misi tantangan berbasis skor, Lembar Kerja Siswa (LKS), ekspor laporan (`.PNG` & `.CSV`), serta dukungan **100% offline**.
* **Target Pengguna:** Siswa SMA Kelas 10 sebagai media praktikum mandiri dan Guru Fisika sebagai alat peraga visual interaktif di kelas.

---

## B. Teknologi yang Digunakan
* **Bahasa Pemrograman:** HTML5, CSS3 (Dark Glassmorphism UI), dan JavaScript (ES6+ Vanilla JS).
* **API & Fitur Web:**
  * `HTML5 Canvas API` untuk animasi simulasi fisika dan vektor gaya secara *real-time*.
  * `Web Storage API (localStorage)` untuk menyimpan skor dan peringkat peneliti pengguna.
  * `Service Worker API` & `Web App Manifest` (PWA) untuk instalasi aplikasi dan akses penuh secara *offline*.
  * `Blob & DataURL API` untuk fitur unduh gambar percobaan (`.PNG`) dan tabel data Excel (`.CSV`).
* **Platform Publikasi:** GitHub Pages.

---

## C. Pemanfaatan AI (*AI Usage Disclosure*)
Kecerdasan artifisial digunakan sebagai asisten perancangan struktur kode, referensi rumus fisika, dan alat *debugging* dengan rincian sebagai berikut:

1. **Alat AI yang Digunakan:** Google Gemini.
2. **Contoh Perintah (*Prompt*) Utama:**
   * *"Rancang aplikasi web simulasi laboratorium fisika virtual SMA kelas 10 untuk 9 topik (Gerak Parabola, Hukum Hooke, Bidang Miring, Ayunan Bandul, Kekekalan Energi, Hukum Archimedes, Hukum Ohm & Rangkaian Listrik, Elektromagnet, dan Induksi Faraday)."*
   * *"Tambahkan fitur Analisis & Penjelasan Otomatis di bawah hasil perhitungan pada setiap modul yang menampilkan langkah substitusi rumus dan penjelasan konsep fisika secara dinamis."*
   * *"Bantu perbaiki galat sintaks JavaScript dan perbarui Service Worker agar seluruh 9 modul dapat dijalankan secara offline."*
3. **Penyesuaian & Modifikasi Mandiri oleh Pengembang:**
   * Merancang ulang antarmuka seluruh halaman dengan tema **Dark Glassmorphism Futuristik** dan menyiapkan aset visual khusus (`hero-lab.png` serta `icon-app.png`).
   * Melakukan pengujian langsung terhadap seluruh variasi input (*slider*, saklar rangkaian seri/paralel, pembalikan kutub magnet, serta batas keamanan arus listrik) untuk memvalidasi kesesuaian perhitungan dan narasi penjelasannya.
   * Menyusun dokumentasi, alur navigasi 9 halaman, dan pengujian instalasi PWA secara mandiri.

---

## D. Panduan Penggunaan & Tautan Website Aktif
* **Tautan Website Aktif (*Live Demo*):** https://naufaldzaky079.github.io/PhysicsLab/index.html
* **Cara Menggunakan Aplikasi:**
  1. Buka tautan website di atas melalui browser.
  2. Pilih salah satu dari **9 Modul Praktikum** yang tersedia pada halaman Beranda.
  3. Atur variabel pada panel kiri (seperti sudut, massa, tegangan listrik, atau jumlah lilitan kawat).
  4. Amati perubahan animasi di kanvas, angka output, serta baca kotak **💡 Analisis & Penjelasan Otomatis** di bagian bawah untuk memahami langkah perhitungan dan alasan konsep fisikanya.
  5. Kerjakan **Misi Tantangan** (+100 Poin) atau unduh hasil praktikum menggunakan tombol **Simpan Gambar (.PNG)** / **Unduh Excel (.CSV)**.

---

## E. Identitas Pengembang
Karya ini disusun oleh tim beranggotakan 2 (dua) siswa:

1. **Anggota 1:**
   * **Nama Lengkap:** Naufal Dzaky Pratama
   * **Kelas / Jurusan:** X-10
   * **Asal Sekolah:** SMAN 1 Kota Blitar
2. **Anggota 2:**
   * **Nama Lengkap:** Misael Cahyono
   * **Kelas / Jurusan:** X-3
   * **Asal Sekolah:**  SMAN 1 Kota Blitar
