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

// Elemen Misi Tantangan
const btnNewMission = document.getElementById('btn-new-mission');
const btnCheckMission = document.getElementById('btn-check-mission');
const challengeDesc = document.getElementById('challenge-desc');
const challengeFeedback = document.getElementById('challenge-feedback');

// =========================================
// 2. VARIABEL FISIKA, ANIMASI & MISI TARGET
// =========================================
let k = 50;
let m = 1.0;
let g = 9.8;
let mode = 'static';
let currentCalculatedDx = 0.20;

// Variabel Misi Target
let targetDx = null;
let missionSolved = false;

let time = 0;
const x0_pixel = 100;
const scale = 120; // 1 meter = 120 pixel

// =========================================
// 3. FUNGSI PERHITUNGAN FISIKA & GAMBAR
// =========================================
function updateSimulation() {
    k = parseFloat(inputK.value);
    m = parseFloat(inputM.value);
    g = parseFloat(inputG.value);
    mode = inputMode.value;

    valK.textContent = k + ' N/m';
    valM.textContent = m.toFixed(1) + ' kg';

    // --- RUMUS FISIKA HUKUM HOOKE ---
    const F = m * g;
    const dx = F / k;
    currentCalculatedDx = dx;
    const ep = 0.5 * k * Math.pow(dx, 2);
    const T = m > 0 ? 2 * Math.PI * Math.sqrt(m / k) : 0;

    // Tampilkan hasil ke kartu output HTML
    outF.textContent = F.toFixed(2) + ' N';
    outDx.textContent = dx.toFixed(2) + ' m (' + (dx * 100).toFixed(0) + ' cm)';
    outEp.textContent = ep.toFixed(2) + ' J';
    outT.textContent = m > 0 ? T.toFixed(2) + ' s' : '0.00 s';

    let currentDx = dx;
    if (mode === 'dynamic' && m > 0) {
        const omega = Math.sqrt(k / m);
        const amplitudo = Math.min(dx * 0.6, 0.5); 
        currentDx = dx + amplitudo * Math.cos(omega * time);
        time += 0.03;
    } else {
        time = 0;
    }

    const totalLengthPixel = Math.min(x0_pixel + (currentDx * scale), 330);
    drawCanvas(totalLengthPixel, dx, F);

    requestAnimationFrame(updateSimulation);
}

// =========================================
// 4. LOGIKA MISI TANTANGAN (GAMIFIKASI)
// =========================================
function createNewMission() {
    // Acak target pertambahan panjang antara 0.20 m hingga 1.20 m (kelipatan 0.05 m)
    const steps = Math.floor(Math.random() * 21) + 4; // 4 sampai 24
    targetDx = parseFloat((steps * 0.05).toFixed(2));
    missionSolved = false;

    challengeDesc.innerHTML = 'Atur <strong>Konstanta Pegas (k)</strong> dan <strong>Massa Beban (m)</strong> sehingga pertambahan panjang pegas tepat berada di garis target hijau: <strong>Δx = ' + targetDx.toFixed(2) + ' m (' + (targetDx * 100).toFixed(0) + ' cm)</strong> (toleransi ±0.02 m).';
    btnCheckMission.style.display = 'inline-block';
    challengeFeedback.style.display = 'none';
    challengeFeedback.className = 'challenge-feedback';
}

function checkMissionResult() {
    if (targetDx === null) return;

    const selisih = Math.abs(currentCalculatedDx - targetDx);
    if (selisih <= 0.02) {
        challengeFeedback.className = 'challenge-feedback feedback-success';
        if (!missionSolved) {
            missionSolved = true;
            if (typeof updateChallengeScore === 'function') {
                updateChallengeScore(100);
            }
            challengeFeedback.textContent = '🎉 BERHASIL! Pertambahan panjang kamu ' + currentCalculatedDx.toFixed(2) + ' m tepat mengenai target ' + targetDx.toFixed(2) + ' m. +100 Poin!';
        } else {
            challengeFeedback.textContent = '✅ Misi ini sudah selesai! Klik "Buat Misi Baru" untuk tantangan berikutnya.';
        }
    } else {
        challengeFeedback.className = 'challenge-feedback feedback-fail';
        const ket = currentCalculatedDx < targetDx ? 'kurang panjang' : 'terlalu panjang';
        challengeFeedback.textContent = '❌ Belum pas! Δx saat ini ' + currentCalculatedDx.toFixed(2) + ' m (' + ket + ' dari target ' + targetDx.toFixed(2) + ' m). Sesuaikan lagi!';
    }
}

// =========================================
// 5. FUNGSI MENGGAMBAR VISUAL DI KANVAS
// =========================================
function drawCanvas(endY, equilibriumDx, force) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = 280;
    const startY = 30;

    // 1. Gambar Penggaris Skala
    drawRuler(110, startY + x0_pixel);

    // 2. Gambar Atap Penyangga Pegas
    ctx.fillStyle = '#475569';
    ctx.fillRect(centerX - 80, startY - 10, 160, 10);

    // 3. Gambar Garis Acuan Panjang Awal (x0) - Biru Putus-putus
    const initialBottomY = startY + x0_pixel;
    ctx.setLineDash(new Array(6, 4));
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(130, initialBottomY);
    ctx.lineTo(centerX + 120, initialBottomY);
    ctx.stroke();

    ctx.fillStyle = '#3b82f6';
    ctx.font = '12px Segoe UI';
    ctx.fillText('Panjang Awal (x₀)', centerX + 60, initialBottomY - 6);

    // 4. Gambar Garis Target Misi (Jika aktif) - Hijau Putus-putus
    if (targetDx !== null) {
        const targetY = Math.min(startY + x0_pixel + (targetDx * scale), 360);
        ctx.strokeStyle = '#16a34a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(120, targetY);
        ctx.lineTo(centerX + 140, targetY);
        ctx.stroke();

        ctx.fillStyle = '#16a34a';
        ctx.font = 'bold 12px Segoe UI';
        ctx.fillText('🎯 Target (' + targetDx.toFixed(2) + ' m)', centerX + 60, targetY + 14);
    }

    // 5. Gambar Garis Titik Setimbang Baru - Merah Putus-putus
    if (m > 0) {
        const eqY = Math.min(startY + x0_pixel + (equilibriumDx * scale), 360);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(130, eqY);
        ctx.lineTo(centerX + 120, eqY);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = '12px Segoe UI';
        ctx.fillText('Setimbang (Δx = ' + equilibriumDx.toFixed(2) + ' m)', centerX + 60, eqY - 6);
    }
    ctx.setLineDash([]);

    // 6. Gambar Ulir Pegas (Zig-Zag)
    const springBottomY = startY + endY;
    const coils = 14;
    ctx.lineWidth = 2 + (k / 25); 
    ctx.strokeStyle = '#334155';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(centerX, startY);
    ctx.lineTo(centerX, startY + 15);

    const coilSpace = (springBottomY - (startY + 30)) / coils;
    for (let i = 0; i < coils; i++) {
        const y1 = startY + 15 + (i * coilSpace) + (coilSpace * 0.25);
        const y2 = startY + 15 + (i * coilSpace) + (coilSpace * 0.75);
        ctx.lineTo(centerX - 22, y1);
        ctx.lineTo(centerX + 22, y2);
    }
    ctx.lineTo(centerX, springBottomY - 15);
    ctx.lineTo(centerX, springBottomY);
    ctx.stroke();

    // 7. Gambar Kotak Beban
    if (m > 0) {
        const boxSize = 36 + (m * 6); 
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(centerX - boxSize / 2, springBottomY, boxSize, boxSize);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText(m + ' kg', centerX, springBottomY + (boxSize / 2) + 5);
        ctx.textAlign = 'left';

        // 8. Gambar Panah Vektor Gaya Berat
        const arrowLen = Math.min(20 + force * 1.2, 70);
        const arrowStartY = springBottomY + boxSize;
        drawArrow(centerX, arrowStartY, centerX, arrowStartY + arrowLen, '#dc2626', 'w = ' + force.toFixed(1) + ' N');
    }
}

function drawRuler(x, zeroY) {
    ctx.strokeStyle = '#94a3b8';
    ctx.fillStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.font = '11px Segoe UI';

    ctx.beginPath();
    ctx.moveTo(x, zeroY);
    ctx.lineTo(x, zeroY + 260);
    ctx.stroke();

    for (let cm = 0; cm <= 200; cm += 20) {
        const y = zeroY + (cm / 100) * scale;
        if (y > 400) break;
        ctx.beginPath();
        ctx.moveTo(x - 8, y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillText((cm / 100).toFixed(1) + 'm', x - 42, y + 4);
    }
}

function drawArrow(fromX, fromY, toX, toY, color, label) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - 5, toY - 8);
    ctx.lineTo(toX + 5, toY - 8);
    ctx.closePath();
    ctx.fill();

    ctx.font = 'bold 12px Segoe UI';
    ctx.fillText(label, toX + 10, toY - 2);
}

// =========================================
// 6. EVENT LISTENER (TOMBOL)
// =========================================
btnNewMission.addEventListener('click', createNewMission);
btnCheckMission.addEventListener('click', checkMissionResult);

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
// Mulai jalankan simulasi
updateSimulation();
