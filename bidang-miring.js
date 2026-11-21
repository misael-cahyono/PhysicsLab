// =========================================
// 1. MENGAMBIL ELEMEN DARI HTML
// =========================================
const canvas = document.getElementById('incline-canvas');
const ctx = canvas.getContext('2d');

// Input kontrol
const inputAngle = document.getElementById('input-angle');
const inputM = document.getElementById('input-m');
const inputMu = document.getElementById('input-mu');
const presetSurface = document.getElementById('preset-surface');
const checkVectors = document.getElementById('check-vectors');

// Label nilai slider
const valAngle = document.getElementById('val-angle');
const valM = document.getElementById('val-m');
const valMu = document.getElementById('val-mu');

// Indikator status & Output kartu
const statusBox = document.getElementById('status-box');
const outA = document.getElementById('out-a');
const outFg = document.getElementById('out-fg');
const outN = document.getElementById('out-n');
const outV = document.getElementById('out-v');

// Tombol-tombol
const btnStart = document.getElementById('btn-start');
const btnReset = document.getElementById('btn-reset');
const btnFormula = document.getElementById('btn-formula');
const formulaPanel = document.getElementById('formula-panel');
const themeToggle = document.getElementById('theme-toggle');

// =========================================
// 2. VARIABEL FISIKA & GEOMETRI PAPAN
// =========================================
let angle = 30;
let m = 2.0;
let mu = 0.20;
const g = 9.8; // Gravitasi Bumi (m/s²)

let isSliding = false;
let distanceMoved = 0; // Jarak tempuh balok di atas papan (meter)
let currentVelocity = 0;
let t = 0;

// Geometri papan miring di layar
const rampLengthMeters = 5.0; // Panjang lintasan papan dianggap 5 meter
const scale = 85;             // 1 meter = 85 pixel
const rampLengthPx = rampLengthMeters * scale;
const baseBottomY = canvas.height - 40;
const baseRightX = canvas.width - 70;

// =========================================
// 3. PERHITUNGAN FISIKA & STATUS BENDA
// =========================================
function calculatePhysics() {
    angle = parseFloat(inputAngle.value);
    m = parseFloat(inputM.value);
    mu = parseFloat(inputMu.value);

    valAngle.textContent = `${angle}°`;
    valM.textContent = `${m.toFixed(1)} kg`;
    valMu.textContent = mu.toFixed(2);

    const rad = angle * (Math.PI / 180);
    const weight = m * g;
    const wParallel = weight * Math.sin(rad); // Gaya penarik ke bawah bidang
    const normalForce = weight * Math.cos(rad); // Gaya normal (N)
    const maxFriction = mu * normalForce;     // Gaya gesek maksimum

    let acceleration = 0;
    let actualFriction = 0;

    // Cek syarat benda bergerak: gaya penarik harus lebih besar dari gaya gesek maks
    if (wParallel > maxFriction) {
        actualFriction = maxFriction;
        acceleration = (wParallel - actualFriction) / m;

        statusBox.className = 'status-badge status-gerak';
        statusBox.textContent = isSliding 
            ? 'Status: Balok Sedang Meluncur Turun!' 
            : 'Status: Siap Meluncur (w·sin θ > f_gesek)';
        btnStart.disabled = false;
        btnStart.style.opacity = '1';
    } else {
        actualFriction = wParallel; // Gaya gesek statis menahan tepat sebesar gaya penarik
        acceleration = 0;
        isSliding = false;

        statusBox.className = 'status-badge status-diam';
        statusBox.textContent = 'Status: Balok Diam Tertahan Gesekan (w·sin θ ≤ f_gesek)';
        btnStart.disabled = true;
        btnStart.style.opacity = '0.5';
    }

    // Tampilkan hasil ke kartu output
    outA.textContent = `${acceleration.toFixed(2)} m/s²`;
    outFg.textContent = `${actualFriction.toFixed(2)} N`;
    outN.textContent = `${normalForce.toFixed(2)} N`;
    outV.textContent = `${currentVelocity.toFixed(2)} m/s`;

    return { rad, weight, wParallel, normalForce, actualFriction, acceleration };
}

// =========================================
// 4. ANIMASI PELUNCURAN BALOK
// =========================================
function animate() {
    if (!isSliding) return;

    const phys = calculatePhysics();
    
    // Rumus GLBB: s = 1/2 * a * t^2 dan v = a * t
    t += 0.025;
    distanceMoved = 0.5 * phys.acceleration * Math.pow(t, 2);
    currentVelocity = phys.acceleration * t;

    // Cek jika balok sudah mencapai ujung bawah papan (5 meter)
    const maxTravel = rampLengthMeters - 0.6; // Dikurangi lebar balok
    if (distanceMoved >= maxTravel) {
        distanceMoved = maxTravel;
        currentVelocity = Math.sqrt(2 * phys.acceleration * maxTravel);
        isSliding = false;
        calculatePhysics();
        drawScene();
        return;
    }

    outV.textContent = `${currentVelocity.toFixed(2)} m/s`;
    drawScene();
    requestAnimationFrame(animate);
}

// =========================================
// 5. MENGGAMBAR PAPAN MIRING, BALOK & VEKTOR
// =========================================
function drawScene() {
    const phys = calculatePhysics();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rad = phys.rad;
    const rampWidthPx = rampLengthPx * Math.cos(rad);
    const rampHeightPx = rampLengthPx * Math.sin(rad);

    const topX = baseRightX - rampWidthPx;
    const topY = baseBottomY - rampHeightPx;

    // 1. Gambar Lantai Dasar
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(30, baseBottomY);
    ctx.lineTo(canvas.width - 30, baseBottomY);
    ctx.stroke();

    // 2. Gambar Segitiga Bidang Miring
    ctx.fillStyle = mu === 0 ? '#e0f2fe' : '#e2e8f0'; // Biru muda jika es licin
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(baseRightX, baseBottomY); // Sudut siku-siku kanan bawah
    ctx.lineTo(topX, topY);              // Puncak atas papan
    ctx.lineTo(topX, baseBottomY);       // Sudut kiri bawah
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tulis keterangan sudut theta di pojok kanan bawah
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 13px Segoe UI';
    ctx.fillText(`θ = ${angle}°`, baseRightX - 65, baseBottomY - 10);

    // 3. Gambar Balok di Atas Papan (Menggunakan Rotasi Kanvas)
    const boxSize = 40 + (m * 2); // Ukuran balok menyesuaikan massa
    const distPx = 25 + (distanceMoved * scale); // Posisi balok dari puncak

    ctx.save();
    // Pindahkan titik pusat koordinat ke puncak papan lalu putar sesuai sudut kemiringan
    ctx.translate(topX, topY);
    ctx.rotate(rad);

    // Gambar kotak balok tepat di atas permukaan miring
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(distPx, -boxSize, boxSize, boxSize);
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2;
    ctx.strokeRect(distPx, -boxSize, boxSize, boxSize);

    // Tulis massa di dalam balok
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(`${m}kg`, distPx + boxSize / 2, -boxSize / 2 + 4);
    ctx.textAlign = 'left';

    // 4. Gambar Panah Vektor Gaya (Jika dicentang)
    if (checkVectors.checked) {
        const centerX = distPx + boxSize / 2;
        const centerY = -boxSize / 2;

        // Vektor Gaya Normal (N) - Tegak lurus ke atas bidang (Hijau)
        const nLen = Math.min(30 + phys.normalForce * 0.7, 85);
        drawVector(centerX, centerY, centerX, centerY - nLen, '#16a34a', 'N');

        // Vektor Gaya Gesek (f) - Berlawanan arah luncur ke atas papan (Merah)
        if (phys.actualFriction > 0.1) {
            const fLen = Math.min(25 + phys.actualFriction * 1.2, 80);
            drawVector(centerX, centerY, centerX - fLen, centerY, '#dc2626', 'f');
        }

        // Vektor Gaya Berat (w) - Selalu lurus ke pusat bumi (Oranye)
        // Putar balik sebesar -rad agar panah selalu lurus vertikal ke bawah layar
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(-rad);
        const wLen = Math.min(35 + phys.weight * 0.7, 95);
        drawVector(0, 0, 0, wLen, '#ea580c', 'w = m·g');
        ctx.restore();
    }

    ctx.restore();
}

// Fungsi bantu menggambar panah vektor
function drawVector(x1, y1, x2, y2, color, label) {
    const headlen = 8;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const ang = Math.atan2(dy, dx);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Kepala panah
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headlen * Math.cos(ang - Math.PI / 6), y2 - headlen * Math.sin(ang - Math.PI / 6));
    ctx.lineTo(x2 - headlen * Math.cos(ang + Math.PI / 6), y2 - headlen * Math.sin(ang + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // Label vektor
    ctx.font = 'bold 12px Segoe UI';
    ctx.fillText(label, x2 + 6, y2 + 4);
}

// =========================================
// 6. EVENT LISTENER (KONTROL & TOMBOL)
// =========================================
function resetSimulation() {
    isSliding = false;
    distanceMoved = 0;
    currentVelocity = 0;
    t = 0;
    drawScene();
}

inputAngle.addEventListener('input', resetSimulation);
inputM.addEventListener('input', resetSimulation);
inputMu.addEventListener('input', () => {
    presetSurface.value = 'custom';
    resetSimulation();
});

presetSurface.addEventListener('change', () => {
    if (presetSurface.value !== 'custom') {
        inputMu.value = presetSurface.value;
        resetSimulation();
    }
});

checkVectors.addEventListener('change', drawScene);

btnStart.addEventListener('click', () => {
    if (distanceMoved > 0) {
        distanceMoved = 0;
        currentVelocity = 0;
        t = 0;
    }
    isSliding = true;
    animate();
});

btnReset.addEventListener('click', resetSimulation);

btnFormula.addEventListener('click', () => {
    if (formulaPanel.style.display === 'none') {
        formulaPanel.style.display = 'block';
        btnFormula.textContent = 'Sembunyikan Rumus';
