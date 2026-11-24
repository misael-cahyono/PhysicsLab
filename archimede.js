const canvas = document.getElementById('archimedes-canvas');
const ctx = canvas.getContext('2d');

// Elemen Input
const inputRhoObj = document.getElementById('input-rho-obj');
const presetMaterial = document.getElementById('preset-material');
const inputVol = document.getElementById('input-vol');
const inputFluid = document.getElementById('input-fluid');

// Label Nilai Slider
const valRhoObj = document.getElementById('val-rho-obj');
const valVol = document.getElementById('val-vol');

// Status & Output
const statusBox = document.getElementById('status-box');
const outW = document.getElementById('out-w');
const outFa = document.getElementById('out-fa');
const outWsemu = document.getElementById('out-wsemu');
const outVcelup = document.getElementById('out-vcelup');

// Tombol & Misi
const btnReset = document.getElementById('btn-reset');
const btnFormula = document.getElementById('btn-formula');
const formulaPanel = document.getElementById('formula-panel');
const btnNewMission = document.getElementById('btn-new-mission');
const btnCheckMission = document.getElementById('btn-check-mission');
const challengeDesc = document.getElementById('challenge-desc');
const challengeFeedback = document.getElementById('challenge-feedback');

// Variabel Fisika & Animasi
let rhoObj = 600;
let volume = 0.05;
let rhoFluid = 1000;
const g = 9.8;

let currentFa = 294.0;
let targetFa = null;
let missionSolved = false;

let currentBlockY = 140; // Posisi Y balok saat ini untuk animasi halus
let targetBlockY = 140;

// Geometri Tangki Air di Kanvas
const tankX = 160;
const tankY = 70;
const tankW = 330;
const tankH = 260;
const baseFluidTopY = 140; // Tinggi permukaan cairan awal

function calculateAndDraw() {
    rhoObj = parseFloat(inputRhoObj.value);
    volume = parseFloat(inputVol.value);
    rhoFluid = parseFloat(inputFluid.value);

    valRhoObj.textContent = rhoObj + ' kg/m³';
    valVol.textContent = volume.toFixed(2) + ' m³';

    // --- RUMUS FISIKA HUKUM ARCHIMEDES ---
    const weight = rhoObj * volume * g; // Berat benda di udara (N)
    let submergedRatio = 1.0;
    let statusText = '';
    let statusClass = '';

    // Ukuran kotak balok di layar menyesuaikan volume
    const boxSize = 55 + (volume * 450); // antara 60px sampai 100px
    const centerX = tankX + (tankW / 2);

    if (rhoObj < rhoFluid) {
        // TERAPUNG: Rasio terendam = rho_benda / rho_cair
        submergedRatio = rhoObj / rhoFluid;
        statusClass = 'status-badge status-terapung';
        statusText = 'Status: Benda TERAPUNG (' + (submergedRatio * 100).toFixed(0) + '% Volume Terendam)';
        
        // Posisi Y balok agar sebagian terendam di permukaan air
        const fluidRise = (volume * submergedRatio) * 220;
        const surfaceY = baseFluidTopY - fluidRise;
        targetBlockY = surfaceY - boxSize * (1 - submergedRatio);
    } else if (rhoObj === rhoFluid) {
        // MELAYANG: 100% terendam di tengah cairan
        submergedRatio = 1.0;
        statusClass = 'status-badge status-melayang';
        statusText = 'Status: Benda MELAYANG Seimbang (100% Volume Terendam)';
        targetBlockY = tankY + (tankH / 2) - (boxSize / 2) + 25;
    } else {
        // TENGGELAM: 100% terendam di dasar tangki
        submergedRatio = 1.0;
        statusClass = 'status-badge status-tenggelam';
        statusText = 'Status: Benda TENGGELAM di Dasar Tangki (100% Terendam)';
        targetBlockY = (tankY + tankH) - boxSize - 4;
    }

    const vSubmerged = volume * submergedRatio;
    const buoyantForce = rhoFluid * g * vSubmerged; // Fa = rho_cair * g * V_celup
    const apparentWeight = Math.max(0, weight - buoyantForce);
    currentFa = buoyantForce;

    // Perbarui UI Teks & Kartu Output
    statusBox.className = statusClass;
    statusBox.textContent = statusText;
    outW.textContent = weight.toFixed(1) + ' N';
    outFa.textContent = buoyantForce.toFixed(1) + ' N';
    outWsemu.textContent = apparentWeight.toFixed(1) + ' N';
    outVcelup.textContent = vSubmerged.toFixed(3) + ' m³ (' + (submergedRatio * 100).toFixed(0) + '%)';

    // Animasi perpindahan halus menuju targetBlockY
    currentBlockY += (targetBlockY - currentBlockY) * 0.12;

    drawTankAndObject(centerX, currentBlockY, boxSize, vSubmerged, weight, buoyantForce);
    requestAnimationFrame(calculateAndDraw);
}

function drawTankAndObject(centerX, blockY, boxSize, vSubmerged, weight, buoyantForce) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Kenaikan permukaan air akibat volume benda yang tercelup
    const fluidRise = vSubmerged * 220;
    const surfaceY = baseFluidTopY - fluidRise;

    // Pilih warna cairan sesuai jenis fluida
    let fluidColor = 'rgba(56, 189, 248, 0.45)'; // Air tawar (biru cerah)
    let fluidName = 'Air Tawar (1000 kg/m³)';
    if (rhoFluid === 800) {
        fluidColor = 'rgba(250, 204, 21, 0.45)'; // Minyak (kuning)
        fluidName = 'Minyak Goreng (800 kg/m³)';
    } else if (rhoFluid === 1030) {
        fluidColor = 'rgba(14, 165, 233, 0.55)'; // Air laut (biru tua)
        fluidName = 'Air Laut (1030 kg/m³)';
    } else if (rhoFluid === 1420) {
        fluidColor = 'rgba(217, 119, 6, 0.55)'; // Madu (cokelat amber)
        fluidName = 'Madu Murni (1420 kg/m³)';
    }

    // 1. Gambar Garis Acuan Permukaan Awal (Putus-putus semi transparan)
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(tankX - 35, baseFluidTopY);
    ctx.lineTo(tankX, baseFluidTopY);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#64748b';
    ctx.font = '11px Segoe UI';
    ctx.fillText('Awal', tankX - 65, baseFluidTopY + 4);

    // 2. Gambar Balok Benda
    const blockX = centerX - (boxSize / 2);
    ctx.fillStyle = rhoObj < 1000 ? '#d97706' : '#475569'; // Cokelat kayu jika ringan, abu batu jika berat
    ctx.fillRect(blockX, blockY, boxSize, boxSize);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(blockX, blockY, boxSize, boxSize);

    // Label massa jenis di tengah balok
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(rhoObj + ' kg/m³', centerX, blockY + (boxSize / 2) + 4);
    ctx.textAlign = 'left';

    // 3. Gambar Cairan di Dalam Tangki (Menutupi bagian balok yang tercelup)
    ctx.fillStyle = fluidColor;
    ctx.fillRect(tankX, surfaceY, tankW, (tankY + tankH) - surfaceY);

    // Garis permukaan cairan
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tankX, surfaceY);
    ctx.lineTo(tankX + tankW, surfaceY);
    ctx.stroke();

    // 4. Gambar Dinding Tangki Kaca (Kiri, Bawah, Kanan)
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(tankX, tankY);
    ctx.lineTo(tankX, tankY + tankH);
    ctx.lineTo(tankX + tankW, tankY + tankH);
    ctx.lineTo(tankX + tankW, tankY);
    ctx.stroke();

    // Keterangan jenis cairan di dasar tangki
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px Segoe UI';
    ctx.fillText(fluidName, tankX + 12, tankY + tankH - 10);

    // 5. Gambar Panah Vektor Gaya Apung (Fa ke atas) & Gaya Berat (w ke bawah)
    const midY = blockY + (boxSize / 2);
    const faLen = Math.min(25 + buoyantForce * 0.08, 85);
    const wLen = Math.min(25 + weight * 0.08, 85);

    // Panah Gaya Apung (Hijau ke atas)
    drawArrow(centerX - 14, midY, centerX - 14, midY - faLen, '#16a34a', 'Fa = ' + buoyantForce.toFixed(0) + 'N', true);

    // Panah Gaya Berat (Merah ke bawah)
    drawArrow(centerX + 14, midY, centerX + 14, midY + wLen, '#dc2626', 'w = ' + weight.toFixed(0) + 'N', false);
}

function drawArrow(x1, y1, x2, y2, color, label, isUp) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    if (isUp) {
        ctx.lineTo(x2 - 5, y2 + 8);
        ctx.lineTo(x2 + 5, y2 + 8);
    } else {
        ctx.lineTo(x2 - 5, y2 - 8);
        ctx.lineTo(x2 + 5, y2 - 8);
    }
    ctx.closePath();
    ctx.fill();

    ctx.font = 'bold 11px Segoe UI';
    if (isUp) {
        ctx.fillText(label, x2 - 75, y2 + 10);
    } else {
        ctx.fillText(label, x2 + 8, y2 - 4);
    }
}

// =========================================
// EVENT LISTENER (KONTROL & MISI)
// =========================================
inputRhoObj.addEventListener('input', () => {
    presetMaterial.value = 'custom';
});

presetMaterial.addEventListener('change', () => {
    if (presetMaterial.value !== 'custom') {
        inputRhoObj.value = presetMaterial.value;
    }
});

if (btnNewMission) {
    btnNewMission.addEventListener('click', () => {
        // Acak target gaya apung antara 150 N hingga 850 N
        targetFa = Math.floor(Math.random() * 701) + 150;
        missionSolved = false;
        challengeDesc.innerHTML = 'Atur <strong>Volume Benda</strong>, <strong>Massa Jenis</strong>, atau <strong>Jenis Cairan</strong> sehingga menghasilkan Gaya Apung sebesar <strong>Fa = ' + targetFa + ' N</strong> (toleransi ±25 N).';
        btnCheckMission.style.display = 'inline-block';
        challengeFeedback.style.display = 'none';
    });
}
if (btnCheckMission) {
    btnCheckMission.addEventListener('click', () => {
        if (targetFa === null) return;
        const selisih = Math.abs(currentFa - targetFa);
        if (selisih <= 25) {
            challengeFeedback.className = 'challenge-feedback feedback-success';
            if (!missionSolved) {
                missionSolved = true;
                if (typeof updateChallengeScore === 'function') updateChallengeScore(100);
                challengeFeedback.textContent = '🎉 TEPAT! Gaya apung saat ini ' + currentFa.toFixed(1) + ' N sesuai target (+100 Poin)!';
            } else {
                challengeFeedback.textContent = '✅ Misi selesai! Klik Buat Misi Baru untuk soal berikutnya.';
            }
        } else {
            challengeFeedback.className = 'challenge-feedback feedback-fail';
            challengeFeedback.textContent = '❌ Belum pas! Gaya apung saat ini ' + currentFa.toFixed(1) + ' N (Target: ' + targetFa + ' N).';
        }
    });
}

inputRhoObj.value = 600;
presetMaterial.value = 'custom';
inputVol.value = 0.05;
inputFluid.value = 1000;
});
if (btnFormula) {
btnFormula.addEventListener('click', () => {
formulaPanel.style.display = formulaPanel.style.display === 'none' ? 'block' : 'none';
btnFormula.textContent = formulaPanel.style.display === 'none' ? 'Lihat Rumus' : 'Sembunyikan Rumus';
});
}
// Mulai animasi simulasi
calculateAndDraw();
