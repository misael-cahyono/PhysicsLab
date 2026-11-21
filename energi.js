// =========================================
// 1. MENGAMBIL ELEMEN DARI HTML
// =========================================
const canvas = document.getElementById('energy-canvas');
const ctx = canvas.getContext('2d');

// Input kontrol
const inputH1 = document.getElementById('input-h1');
const inputH2 = document.getElementById('input-h2');
const inputM = document.getElementById('input-m');

// Label nilai slider
const valH1 = document.getElementById('val-h1');
const valH2 = document.getElementById('val-h2');
const valM = document.getElementById('val-m');

// Indikator status & Output kartu
const statusBox = document.getElementById('status-box');
const outEp = document.getElementById('out-ep');
const outEk = document.getElementById('out-ek');
const outEm = document.getElementById('out-em');
const outV = document.getElementById('out-v');

// Tombol-tombol
const btnPlay = document.getElementById('btn-play');
const btnReset = document.getElementById('btn-reset');
const btnFormula = document.getElementById('btn-formula');
const formulaPanel = document.getElementById('formula-panel');
const themeToggle = document.getElementById('theme-toggle');

// =========================================
// 2. VARIABEL FISIKA & LINTASAN ROLLER COASTER
// =========================================
let h1 = 15;       // Tinggi bukit awal (meter)
let h2 = 10;       // Tinggi bukit kedua (meter)
let m = 50;        // Massa kereta (kg)
const g = 9.8;     // Gravitasi Bumi (m/s²)

let isRunning = false;
let direction = 1; // 1 = maju ke kanan, -1 = mundur ke kiri
let currentX = 50; // Posisi horizontal kereta di kanvas (pixel)

// Batas area lintasan di layar
const startX = 50;
const valleyX = 270;
const hill2X = 460;
const endX = 590;
const groundY = canvas.height - 35;
const scaleY = 10.5; // 1 meter ketinggian = 10.5 pixel

// =========================================
// 3. FUNGSI MENGHITUNG KETINGGIAN LINTASAN h(x)
// =========================================
// Menggunakan kurva kosinus agar lintasan bukit & lembah mulus seperti roller coaster
function getTrackHeight(x) {
    if (x <= startX) return h1;
    
    // Bagian 1: Turun dari Bukit 1 (startX) ke Lembah Dasar (valleyX)
    if (x <= valleyX) {
        const progress = (x - startX) / (valleyX - startX);
        return h1 * 0.5 * (1 + Math.cos(Math.PI * progress));
    }
    
    // Bagian 2: Naik dari Lembah Dasar (valleyX) ke Puncak Bukit 2 (hill2X)
    if (x <= hill2X) {
        const progress = (x - valleyX) / (hill2X - valleyX);
        return h2 * 0.5 * (1 - Math.cos(Math.PI * progress));
    }
    
    // Bagian 3: Turun landai dari Bukit 2 menuju garis finis (endX)
    if (x <= endX) {
        const progress = (x - hill2X) / (endX - hill2X);
        const endHeight = h2 * 0.3;
        return endHeight + (h2 - endHeight) * 0.5 * (1 + Math.cos(Math.PI * progress));
    }

    return h2 * 0.3;
}

// =========================================
// 4. PERHITUNGAN ENERGI & UPDATE TAMPILAN
// =========================================
function updateDisplay() {
    h1 = parseFloat(inputH1.value);
    h2 = parseFloat(inputH2.value);
    m = parseFloat(inputM.value);

    valH1.textContent = `${h1.toFixed(1)} m`;
    valH2.textContent = `${h2.toFixed(1)} m`;
    valM.textContent = `${m} kg`;

    // Cek prediksi apakah kereta mampu melewati bukit kedua
    if (h1 >= h2) {
        statusBox.className = 'status-badge status-lolos';
        statusBox.textContent = 'Prediksi: Kereta Mampu Melewati Bukit Kedua (h₁ ≥ h₂)';
    } else {
        statusBox.className = 'status-badge status-gagal';
        statusBox.textContent = 'Prediksi: Bukit Kedua Terlalu Tinggi! Kereta Akan Berbalik Arah (h₁ < h₂)';
    }

    const currentH = getTrackHeight(currentX);
    const totalEM = m * g * h1; // Energi mekanik total selalu konstan sebesar EP awal
    const currentEP = m * g * currentH;
    const currentEK = Math.max(0, totalEM - currentEP);
    const velocity = Math.sqrt((2 * currentEK) / m);

    // Tampilkan angka ke kartu output
    outEp.textContent = `${Math.round(currentEP)} J`;
    outEk.textContent = `${Math.round(currentEK)} J`;
    outEm.textContent = `${Math.round(totalEM)} J`;
    outV.textContent = `${velocity.toFixed(2)} m/s`;

    drawScene(currentH, currentEP, currentEK, totalEM);
}

// =========================================
// 5. ANIMASI PERGERAKAN KERETA
// =========================================
function animate() {
    if (!isRunning) return;

    const currentH = getTrackHeight(currentX);
    const totalEM = m * g * h1;
    const currentEP = m * g * currentH;
    const currentEK = totalEM - currentEP;

    // Jika energi kinetik habis saat menanjak bukit kedua (h2 > h1), kereta berbalik arah!
    if (currentEK <= 0 && currentX > valleyX && direction === 1) {
        direction = -1;
    }

    // Jika kereta kembali ke bukit awal saat mundur, berbalik maju lagi (osilasi)
    if (currentX <= startX + 2 && direction === -1) {
        currentX = startX + 2;
        direction = 1;
    }

    // Hitung kecepatan visual kereta (diberi kecepatan minimum 1.5 px agar tidak macet di titik puncak)
    const speedPhysics = Math.sqrt(Math.max(0, (2 * currentEK) / m));
    const moveStep = Math.max(1.5, speedPhysics * 0.35);

    currentX += moveStep * direction;

    // Cek jika kereta berhasil melewati bukit kedua dan mencapai ujung lintasan
    if (currentX >= endX) {
        currentX = endX;
        isRunning = false;
        btnPlay.textContent = '▶ Luncurkan Ulang';
        updateDisplay();
        return;
    }

    updateDisplay();
    requestAnimationFrame(animate);
}

// =========================================
// 6. MENGGAMBAR LINTASAN, KERETA & GRAFIK ENERGI
// =========================================
function drawScene(currentH, ep, ek, em) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Gambar Garis Acuan Ketinggian h1 & h2 (Putus-putus)
    const yH1 = groundY - h1 * scaleY;
    const yH2 = groundY - h2 * scaleY;

    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;

    // Garis h1
    ctx.beginPath();
    ctx.moveTo(20, yH1);
    ctx.lineTo(startX + 40, yH1);
    ctx.stroke();
    ctx.fillStyle = '#475569';
    ctx.font = '11px Segoe UI';
    ctx.fillText(`h₁ = ${h1}m`, 15, yH1 - 5);

    // Garis h2
    ctx.beginPath();
    ctx.moveTo(hill2X - 40, yH2);
    ctx.lineTo(hill2X + 45, yH2);
    ctx.stroke();
    ctx.fillText(`h₂ = ${h2}m`, hill2X - 15, yH2 - 8);
    ctx.setLineDash([]);

    // 2. Gambar Badan Bukit & Lintasan Roller Coaster
    ctx.beginPath();
    ctx.moveTo(startX, groundY);
    for (let x = startX; x <= endX; x += 4) {
        const y = groundY - getTrackHeight(x) * scaleY;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(endX, groundY);
    ctx.closePath();

    // Isi warna bukit
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();

    // Garis rel lintasan biru tebal di bagian atas
    ctx.beginPath();
    for (let x = startX; x <= endX; x += 4) {
        const y = groundY - getTrackHeight(x) * scaleY;
        if (x === startX) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 3. Gambar Tanah Dasar
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(15, groundY);
    ctx.lineTo(canvas.width - 15, groundY);
    ctx.stroke();

    // 4. Gambar Kereta Roller Coaster (Mengikuti Kemiringan Rel)
    const cartY = groundY - currentH * scaleY;
    // Hitung kemiringan lokal rel untuk memutar kereta
    const nextH = getTrackHeight(currentX + 2);
    const slopeAngle = Math.atan2(-(nextH - currentH) * scaleY, 2);

    ctx.save();
    ctx.translate(currentX, cartY);
    ctx.rotate(slopeAngle);

    // Badan kereta
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-16, -20, 32, 14);
    // Roda kereta
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-9, -4, 4, 0, Math.PI * 2);
    ctx.arc(9, -4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 5. Gambar Diagram Batang Energi Live di Pojok Kanan Atas
    drawEnergyBars(ep, ek, em);
}

function drawEnergyBars(ep, ek, em) {
    const boxX = canvas.width - 175;
    const boxY = 15;
    const maxBarHeight = 90;

    // Kotak latar diagram batang
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.fillRect(boxX, boxY, 160, 130);
    ctx.strokeRect(boxX, boxY, 160, 130);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 11px Segoe UI';
    ctx.fillText('Grafik Energi Live', boxX + 32, boxY + 16);

    const baseLineY = boxY + 112;
    const epHeight = em > 0 ? (ep / em) * maxBarHeight : 0;
    const ekHeight = em > 0 ? (ek / em) * maxBarHeight : 0;
    const emHeight = em > 0 ? maxBarHeight : 0;

    // Batang EP (Biru)
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(boxX + 22, baseLineY - epHeight, 26, epHeight);
    ctx.fillText('EP', boxX + 28, baseLineY + 13);

    // Batang EK (Hijau)
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(boxX + 67, baseLineY - ekHeight, 26, ekHeight);
    ctx.fillText('EK', boxX + 73, baseLineY + 13);

    // Batang EM Total (Oranye)
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(boxX + 112, baseLineY - emHeight, 26, emHeight);
    ctx.fillText('EM', boxX + 117, baseLineY + 13);
}

// =========================================
// 7. EVENT LISTENER (TOMBOL & SLIDER)
// =========================================
function resetCart() {
    isRunning = false;
    direction = 1;
    currentX = startX;
    btnPlay.textContent = '▶ Luncurkan Kereta';
    updateDisplay();
}

inputH1.addEventListener('input', resetCart);
inputH2.addEventListener('input', resetCart);
inputM.addEventListener('input', updateDisplay);

btnPlay.addEventListener('click', () => {
    if (currentX >= endX) {
        currentX = startX;
        direction = 1;
    }
    isRunning = !isRunning;
