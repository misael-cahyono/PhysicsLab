<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lab Virtual Hukum Hooke & Pegas - PhysLab 10</title>
    <link rel="stylesheet" href="style.css">
</head>
<body class="futuristic-home">

    <header class="navbar">
        <div class="container nav-content">
            <div class="logo">
                <span class="logo-icon">⚛️</span>
                <h1>PhysLab <span>10</span></h1>
            </div>
            <nav style="flex-wrap: wrap;">
                <a href="index.html">Beranda</a>
                <a href="parabola.html">Parabola</a>
                <a href="pegas.html" class="active">Pegas</a>
                <a href="bidang-miring.html">Bidang Miring</a>
                <a href="bandul.html">Bandul</a>
                <a href="energi.html">Energi</a>
                <a href="archimedes.html">Archimedes</a>
                <a href="listrik.html">Listrik</a>
                <a href="elektromagnet.html">Elektromagnet</a>
                <a href="faraday.html">Faraday</a>
            </nav>
        </div>
    </header>

    <main class="container">
        <div style="margin-bottom: 1.5rem;">
            <h2>2. Lab Virtual Hukum Hooke & Getaran Pegas</h2>
            <p style="color: #94a3b8;">Uji hubungan gaya tarik beban dan konstanta kekakuan pegas terhadap pertambahan panjang serta energi potensial elastis.</p>
        </div>

        <div class="sim-layout">
            
            <aside class="control-panel">
                <h3 style="margin-bottom: 1rem;">Variabel Pegas</h3>

                <div class="control-group">
                    <label>
                        <span>Konstanta Pegas (k)</span>
                        <span id="val-k" style="color: #38bdf8;">50 N/m</span>
                    </label>
                    <input type="range" id="input-k" min="20" max="200" step="10" value="50">
                </div>

                <div class="control-group">
                    <label>
                        <span>Massa Beban (m)</span>
                        <span id="val-m" style="color: #38bdf8;">2.0 kg</span>
                    </label>
                    <input type="range" id="input-m" min="0.5" max="10" step="0.5" value="2.0">
                </div>

                <div class="control-group">
                    <label for="input-mode">Mode Simulasi</label>
                    <select id="input-mode">
                        <option value="static" selected>Mode Statis (Diam Setimbang)</option>
                        <option value="oscillate">Mode Dinamis (Getaran Harmonik)</option>
                    </select>
                </div>

                <div class="btn-group">
                    <button id="btn-reset" class="btn-secondary">Reset</button>
                    <button id="btn-formula" class="btn-primary" style="flex: 1;">Lihat Rumus</button>
                </div>

                <div id="formula-panel" class="formula-box" style="display: none; margin-top: 1rem; margin-bottom: 0;">
                    <strong>Rumus Hukum Hooke:</strong><br>
                    • Gaya Pegas: <code>F = m · g = k · Δx</code><br>
                    • Pertambahan Panjang: <code>Δx = (m · g) / k</code><br>
                    • Energi Potensial Pegas: <code>Ep = ½ · k · Δx²</code>
                </div>
            </aside>

            <section class="visual-panel">
                
                <div class="challenge-box">
                    <div class="challenge-header">
                        <h4>🎯 Misi Tantangan: Kalibrasi Regangan Pegas!</h4>
                        <span id="total-score" class="score-badge">0 Poin</span>
                    </div>
                    <p id="challenge-desc" class="challenge-text">
                        Klik tombol "Buat Misi Baru" untuk mendapatkan target pertambahan panjang pegas!
                    </p>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button id="btn-new-mission" class="btn-secondary" style="padding: 0.4rem 0.9rem; font-size: 0.85rem;">🎲 Buat Misi Baru</button>
                        <button id="btn-check-mission" class="btn-primary" style="padding: 0.4rem 0.9rem; font-size: 0.85rem; display: none;">✅ Cek Jawaban</button>
                    </div>
                    <div id="challenge-feedback" class="challenge-feedback"></div>
                </div>

                <canvas id="spring-canvas" width="650" height="360"></canvas>

                <div class="export-bar">
                    <button class="btn-export" onclick="downloadCanvasImage('spring-canvas', 'laporan-hukum-hooke')">
                        📷 Simpan Gambar Pegas (.PNG)
                    </button>
                </div>

                <div class="output-grid">
                    <div class="output-item">
                        <span>Gaya Tarik Beban (F)</span>
                        <strong id="out-f">19.60 N</strong>
                    </div>
                    <div class="output-item">
                        <span>Pertambahan Panjang (Δx)</span>
                        <strong id="out-dx" style="color: #38bdf8;">0.39 m (39.2 cm)</strong>
                    </div>
                    <div class="output-item">
                        <span>Energi Potensial (Ep)</span>
                        <strong id="out-ep" style="color: #4ade80;">3.84 J</strong>
                    </div>
                    <div class="output-item">
                        <span>Periode Getaran (T)</span>
                        <strong id="out-period">1.26 s</strong>
                    </div>
                </div>

                <!-- KOTAK ANALISIS & PENJELASAN OTOMATIS -->
                <div class="explanation-box">
                    <h4>💡 Analisis & Penjelasan Otomatis</h4>
                    <div class="exp-section">
                        <span class="exp-title">🧮 Langkah Cara Menghitung:</span>
                        <p id="exp-calc" class="exp-text">Memuat langkah perhitungan...</p>
                    </div>
                    <div class="exp-section">
                        <span class="exp-title">🔬 Mengapa Hasilnya Begini? (Analisis Konsep):</span>
                        <p id="exp-reason" class="exp-text">Memuat penjelasan konsep fisika...</p>
                    </div>
                </div>
            </section>

        </div>

        <section class="lks-panel">
            <h3>📖 Lembar Kerja Siswa (LKS) — Panduan Eksperimen Hukum Hooke</h3>
            <p>Ikuti langkah-langkah di bawah ini dan centang kotak jika sudah selesai mengujinya:</p>
            <ul class="lks-list">
                <li>
                    <input type="checkbox">
                    <span><strong>Percobaan 1 (Hukum Hooke):</strong> Pada konstanta <code>k = 50 N/m</code>, ubah massa beban dari <code>1 kg</code> menjadi <code>2 kg</code> lalu <code>4 kg</code>. Amati apakah pertambahan panjang (Δx) bertambah secara sebanding (linear)!</span>
                </li>
                <li>
                    <input type="checkbox">
                    <span><strong>Percobaan 2 (Kekakuan Pegas):</strong> Pada massa tetap <code>3 kg</code>, naikkan konstanta <code>k</code> dari <code>30 N/m</code> ke <code>150 N/m</code>. Amati perubahan panjang pegas dan energi potensialnya!</span>
                </li>
                <li>
                    <input type="checkbox">
                    <span><strong>Percobaan 3 (Getaran Harmonik):</strong> Ubah <strong>Mode Simulasi</strong> menjadi <em>Mode Dinamis</em> dan amati pengaruh massa beban terhadap kecepatan naik-turun pegas!</span>
                </li>
            </ul>
        </section>
    </main>

    <footer>
        <div class="container">
            <p>PhysLab 10 • Modul Elastisitas & Hukum Hooke</p>
        </div>
    </footer>

    <script src="lab-tools.js"></script>
    <script src="pegas.js"></script>
</body>
</html>
