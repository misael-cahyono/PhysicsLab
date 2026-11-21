// =========================================
// 1. MENGAMBIL ELEMEN DARI HTML
// =========================================
const canvas = document.getElementById('pendulum-canvas');
const ctx = canvas.getContext('2d');

// Input kontrol
const inputL = document.getElementById('input-l');
const inputM = document.getElementById('input-m');
const inputAngle = document.getElementById('input-angle');
const inputG = document.getElementById('input-g');

// Label nilai slider
const valL = document.getElementById('val-l');
const valM = document.getElementById('val-m');
const valAngle = document.getElementById('val-angle');

// Output hasil
const outT = document.getElementById('out-t');
const outF = document.getElementById('out-f');
const outTheta = document.getElementById('out-theta');
const outCount = document.getElementById('out-count');

// Tombol kontrol & Stopwatch
const btnToggle = document.getElementById('btn-toggle');
const btnReset = document.getElementById('btn-reset');
const swDisplay = document.getElementById('sw-display');
const swStart = document.getElementById('sw-start');
const swReset = document.getElementById('sw-reset');
const btnFormula = document.getElementById('btn-formula');
const formulaPanel = document.getElementById('formula-panel');
const themeToggle = document.getElementById('theme-toggle');

// =========================================
// 2. VARIABEL FISIKA & STATUS ANIMASI
// =========================================
let L = 1.0;          // Panjang tali (meter)
let m = 1.0;          // Massa beban (kg)
let maxAngleDeg = 20; // Sudut simpangan awal (derajat)
let g = 9.8;          // Gravitasi (m/s²)

let isSwinging = true;
let simTime = 0;
let lastFrameTime = performance.now();

// Variabel Stopwatch
let swRunning = false;
let swElapsed = 0;

// Pengaturan visual kanvas
const pivotX = canvas.width / 2;
const pivotY = 45;
const scale = 150; // 1 meter = 150 pixel

// =========================================
// 3. PERHITUNGAN FISIKA & LOOP ANIMASI
// =========================================
function updatePhysicsAndDraw(now) {
    // Hitung selisih waktu nyata antar-frame (dalam detik)
    const dt = (now - lastFrameTime) / 1000;
    lastFrameTime = now;

    // Ambil nilai terbaru dari kontrol
    L = parseFloat(inputL.value);
    m = parseFloat(inputM.value);
    maxAngleDeg = parseFloat(inputAngle.value);
    g = parseFloat(inputG.value);

    // Perbarui teks label slider
    valL.textContent = `${L.toFixed(2)} m`;
    valM.textContent = `${m.toFixed(1)} kg`;
    valAngle.textContent = `${maxAngleDeg}°`;

    // --- RUMUS AYUNAN BANDUL SEDERHANA ---
    const T = 2 * Math.PI * Math.sqrt(L / g); // Periode (detik)
    const f = 1 / T;                          // Frekuensi (Hz)
    const omega = Math.sqrt(g / L);           // Frekuensi sudut (rad/s)

    // Update waktu simulasi jika sedang berayun
    if (isSwinging) {
        simTime += dt;
    }

    // Hitung sudut saat ini: theta(t) = theta0 * cos(omega * t)
    const theta0Rad = maxAngleDeg * (Math.PI / 180);
    const currentThetaRad = theta0Rad * Math.cos(omega * simTime);
    const currentThetaDeg = currentThetaRad * (180 / Math.PI);

    // Hitung jumlah ayunan penuh (1 ayunan = 1 periode T)
    const swingCount = Math.floor(simTime / T);

    // Tampilkan ke kartu output
    outT.textContent = `${T.toFixed(2)} s`;
    outF.textContent = `${f.toFixed(2)} Hz`;
    outTheta.textContent = `${currentThetaDeg.toFixed(1)}°`;
    outCount.textContent = `${swingCount} Kali`;

    // Update Stopwatch jika sedang berjalan
    if (swRunning) {
        swElapsed += dt;
        swDisplay.textContent = `${swElapsed.toFixed(2).padStart(5, '0')} s`;
    }

    // Gambar visual bandul di kanvas
    drawPendulum(currentThetaRad);

    requestAnimationFrame(updatePhysicsAndDraw);
}

// =========================================
// 4. FUNGSI MENGGAMBAR BANDUL DI KANVAS
// =========================================
function drawPendulum(thetaRad) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const ropeLengthPx = L * scale;
    const bobX = pivotX + ropeLengthPx * Math.sin(thetaRad);
    const bobY = pivotY + ropeLengthPx * Math.cos(thetaRad);

    // 1. Gambar Busur Derajat Acuan di Titik Gantung
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 65, Math.PI * 0.25, Math.PI * 0.75);
    ctx.stroke();

    // 2. Gambar Garis Vertikal Titik Setimbang (Putus-putus)
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(pivotX, pivotY + ropeLengthPx + 35);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Gambar Lintasan Ayunan (Busur Tipis)
    const maxRad = maxAngleDeg * (Math.PI / 180);
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.2)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, ropeLengthPx, Math.PI / 2 - maxRad, Math.PI / 2 + maxRad);
    ctx.stroke();

    // 4. Gambar Penyangga Atas (Atap)
    ctx.fillStyle = '#334155';
    ctx.fillRect(pivotX - 90, pivotY - 12, 180, 12);

    // 5. Gambar Tali Bandul
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    // Titik Poros Gantungan
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2);
    ctx.fill();

    // 6. Gambar Bola Bandul (Ukuran menyesuaikan massa m)
    const bobRadius = 14 + (m * 3);
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label massa di tengah bola
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(`${m}kg`, bobX, bobY + 4);
    ctx.textAlign = 'left';

    // 7. Keterangan Panjang Tali di Samping Tali
    ctx.fillStyle = '#475569';
    ctx.font = '12px Segoe UI';
    ctx.fillText(`L = ${L.toFixed(2)} m`, (pivotX + bobX) / 2 + 12, (pivotY + bobY) / 2);
}

// =========================================
// 5. EVENT LISTENER (TOMBOL & STOPWATCH)
// =========================================
function resetPendulum() {
    simTime = 0;
}

inputL.addEventListener('input', resetPendulum);
inputAngle.addEventListener('input', resetPendulum);
inputG.addEventListener('change', resetPendulum);

btnToggle.addEventListener('click', () => {
    isSwinging = !isSwinging;
    btnToggle.textContent = isSwinging ? '⏸ Jeda Ayunan' : '▶ Lanjut Ayunan';
});

btnReset.addEventListener('click', () => {
    simTime = 0;
    isSwinging = true;
    btnToggle.textContent = '⏸ Jeda Ayunan';
});

// Kontrol Stopwatch
swStart.addEventListener('click', () => {
    swRunning = !swRunning;
    swStart.textContent = swRunning ? 'Stop' : 'Mulai / Stop';
});

swReset.addEventListener('click', () => {
    swRunning = false;
    swElapsed = 0;
    swDisplay.textContent = '00.00 s';
    swStart.textContent = 'Mulai / Stop';
});

// Lihat Rumus & Tema
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

// Mulai animasi saat halaman dibuka
requestAnimationFrame(updatePhysicsAndDraw);
