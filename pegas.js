// =========================================
// 1. MENGAMBIL ELEMEN DARI HTML
// =========================================
const canvas = document.getElementById('pegas-canvas');
const ctx = canvas.getContext('2d');

// Input kontrol
const inputK = document.getElementById('input-k');
const inputM = document.getElementById('input-m');
const inputG = document.getElementById('input-g');
const inputMode = document.getElementById('input-mode');

// Label nilai di samping slider
const valK = document.getElementById('val-k');
const valM = document.getElementById('val-m');

// Output hasil perhitungan
const outF = document.getElementById('out-f');
const outDx = document.getElementById('out-dx');
const outEp = document.getElementById('out-ep');
const outT = document.getElementById('out-t');

// Tombol-tombol
const btnReset = document.getElementById('btn-reset');
const btnFormula = document.getElementById('btn-formula');
const formulaPanel = document.getElementById('formula-panel');
const themeToggle = document.getElementById('theme-toggle');

// =========================================
// 2. VARIABEL FISIKA & ANIMASI
// =========================================
let k = 50;           // Konstanta pegas (N/m)
let m = 1.0;          // Massa beban (kg)
let g = 9.8;          // Gravitasi (m/s²)
let mode = 'static';  // 'static' atau 'dynamic'

let time = 0;         // Waktu berjalan untuk animasi getaran
const x0_pixel = 100; // Panjang awal pegas dalam satuan pixel (dianggap 0 meter)
const scale = 120;    // Skala visual: 1 meter = 120 pixel di layar

// =========================================
// 3. FUNGSI PERHITUNGAN FISIKA & GAMBAR
// =========================================
function updateSimulation() {
    // Ambil nilai terbaru dari input pengguna
    k = parseFloat(inputK.value);
    m = parseFloat(inputM.value);
    g = parseFloat(inputG.value);
    mode = inputMode.value;

    // Perbarui teks label di samping slider
    valK.textContent = `${k} N/m`;
    valM.textContent = `${m.toFixed(1)} kg`;

    // --- RUMUS FISIKA HUKUM HOOKE ---
    const F = m * g;                        // Gaya berat (Newton)
    const dx = F / k;                       // Pertambahan panjang (meter)
    const ep = 0.5 * k * Math.pow(dx, 2);   // Energi potensial pegas (Joule)
    const T = m > 0 ? 2 * Math.PI * Math.sqrt(m / k) : 0; // Periode getaran (detik)

    // Tampilkan hasil ke kartu output HTML
    outF.textContent = `${F.toFixed(2)} N`;
    outDx.textContent = `${dx.toFixed(2)} m (${(dx * 100).toFixed(0)} cm)`;
    outEp.textContent = `${ep.toFixed(2)} J`;
    outT.textContent = m > 0 ? `${T.toFixed(2)} s` : `0.00 s`;

    // Hitung posisi akhir pegas di layar (dalam pixel)
    let currentDx = dx;
    if (mode === 'dynamic' && m > 0) {
        // Frekuensi sudut omega = akar(k / m)
        const omega = Math.sqrt(k / m);
        // Gerak Harmonik Sederhana: berosilasi di sekitar titik setimbang (dx)
        // Amplitudo getaran dibatasi agar tetap rapi di layar
        const amplitudo = Math.min(dx * 0.6, 0.5); 
        currentDx = dx + amplitudo * Math.cos(omega * time);
        time += 0.03; // Tambah waktu animasi
    } else {
        time = 0;
    }

    // Batasi agar pegas tidak menembus batas bawah kanvas
    const totalLengthPixel = Math.min(x0_pixel + (currentDx * scale), 330);

    // Gambar ulang seluruh isi kanvas
    drawCanvas(totalLengthPixel, dx, F);

    // Jalankan terus animasi setiap frame layar
    requestAnimationFrame(updateSimulation);
}

// =========================================
// 4. FUNGSI MENGGAMBAR VISUAL DI KANVAS
// =========================================
function drawCanvas(endY, equilibriumDx, force) {
    // Bersihkan layar kanvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = 280; // Posisi horizontal tengah pegas
    const startY = 30;   // Posisi atap gantungan pegas

    // 1. Gambar Penggaris Skala di sebelah kiri
    drawRuler(110, startY + x0_pixel);

    // 2. Gambar Atap Penyangga Pegas
    ctx.fillStyle = '#475569';
    ctx.fillRect(centerX - 80, startY - 10, 160, 10);

    // 3. Gambar Garis Acuan Panjang Awal (x0) - Biru Putus-putus
    const initialBottomY = startY + x0_pixel;
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(130, initialBottomY);
    ctx.lineTo(centerX + 120, initialBottomY);
    ctx.stroke();

    ctx.fillStyle = '#3b82f6';
    ctx.font = '12px Segoe UI';
    ctx.fillText('Panjang Awal (x₀)', centerX + 60, initialBottomY - 6);

    // 4. Gambar Garis Titik Setimbang Baru - Merah Putus-putus
    if (m > 0) {
        const eqY = Math.min(startY + x0_pixel + (equilibriumDx * scale), 360);
        ctx.strokeStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(130, eqY);
        ctx.lineTo(centerX + 120, eqY);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.fillText(`Setimbang (Δx = ${equilibriumDx.toFixed(2)} m)`, centerX + 60, eqY - 6);
    }
    ctx.setLineDash([]); // Kembalikan ke garis lurus normal

    // 5. Gambar Ulir Pegas (Zig-Zag)
    const springBottomY = startY + endY;
    const coils = 14; // Jumlah lekukan pegas
    // Ketebalan garis pegas menyesuaikan konstanta k (makin besar k, makin tebal)
    ctx.lineWidth = 2 + (k / 25); 
    ctx.strokeStyle = '#334155';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(centerX, startY);
    ctx.lineTo(centerX, startY + 15); // Kait atas

    const coilSpace = (springBottomY - (startY + 30)) / coils;
    for (let i = 0; i < coils; i++) {
        const y1 = startY + 15 + (i * coilSpace) + (coilSpace * 0.25);
        const y2 = startY + 15 + (i * coilSpace) + (coilSpace * 0.75);
        ctx.lineTo(centerX - 22, y1);
        ctx.lineTo(centerX + 22, y2);
    }
    ctx.lineTo(centerX, springBottomY - 15);
    ctx.lineTo(centerX, springBottomY); // Kait bawah
    ctx.stroke();

    // 6. Gambar Kotak Beban (jika massa > 0)
    if (m > 0) {
        // Ukuran kotak membesar sesuai massa
        const boxSize = 36 + (m * 6); 
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(centerX - boxSize / 2, springBottomY, boxSize, boxSize);

        // Tulis label massa di tengah kotak
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText(`${m} kg`, centerX, springBottomY + (boxSize / 2) + 5);
        ctx.textAlign = 'left'; // Reset perataan teks

        // 7. Gambar Panah Vektor Gaya Berat (ke bawah)
        const arrowLen = Math.min(20 + force * 1.2, 70);
        const arrowStartY = springBottomY + boxSize;
        drawArrow(centerX, arrowStartY, centerX, arrowStartY + arrowLen, '#dc2626', `w = ${force.toFixed(1)} N`);
    }
}

// Fungsi bantu menggambar penggaris ukur
function drawRuler(x, zeroY) {
    ctx.strokeStyle = '#94a3b8';
    ctx.fillStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.font = '11px Segoe UI';

    // Garis utama penggaris
    ctx.beginPath();
    ctx.moveTo(x, zeroY);
    ctx.lineTo(x, zeroY + 260);
    ctx.stroke();

    // Skala tiap 0.2 meter (20 cm)
    for (let cm = 0; cm <= 200; cm += 20) {
        const y = zeroY + (cm / 100) * scale;
        if (y > 400) break;
        ctx.beginPath();
        ctx.moveTo(x - 8, y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillText(`${(cm / 100).toFixed(1)}m`, x - 42, y + 4);
    }
}

// Fungsi bantu menggambar panah vektor gaya
function drawArrow(fromX, fromY, toX, toY, color, label) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Ujung segitiga panah
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - 5, toY - 8);
    ctx.lineTo(toX + 5, toY - 8);
    ctx.closePath();
    ctx.fill();

    // Teks keterangan gaya
    ctx.font = 'bold 12px Segoe UI';
    ctx.fillText(label, toX + 10, toY - 2);
}

// =========================================
// 5. EVENT LISTENER (TOMBOL RESET, RUMUS, TEMA)
// =========================================
btnReset.addEventListener('click', () => {
    inputK.value = 50;
    inputM.value = 1;
    inputG.value = 9.8;
    inputMode.value = 'static';
    time = 0;
});

btnFormula.addEventListener('click', () => {
    if (formulaPanel.style.display === 'none') {
        formulaPanel.style.display = 'block';
        btnFormula.textContent = 'Sembunyikan Rumus';
    } else {
        formulaPanel.style.display = 'none';
        btnFormula.textContent = 'Lihat Rumus';
    }
});

themeToggle.addEventListener('click', () => {
    const htmlElement = document.documentElement;
    if (htmlElement.getAttribute('data-theme') === 'light') {
        htmlElement.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️ Mode Terang';
    } else {
        htmlElement.setAttribute('data-theme', 'light');
        themeToggle.textContent = '🌙 Mode Gelap';
    }
});

// Mulai jalankan simulasi saat halaman dibuka
updateSimulation();
