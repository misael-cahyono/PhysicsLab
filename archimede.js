const canvas = document.getElementById('archimedes-canvas');
const ctx = canvas.getContext('2d');

const inputRhoObj = document.getElementById('input-rho-obj');
const presetMaterial = document.getElementById('preset-material');
const inputVol = document.getElementById('input-vol');
const inputFluid = document.getElementById('input-fluid');

const valRhoObj = document.getElementById('val-rho-obj');
const valVol = document.getElementById('val-vol');

const statusBox = document.getElementById('status-box');
const outW = document.getElementById('out-w');
const outFa = document.getElementById('out-fa');
const outWsemu = document.getElementById('out-wsemu');
const outVcelup = document.getElementById('out-vcelup');

const btnReset = document.getElementById('btn-reset');
const btnFormula = document.getElementById('btn-formula');
const formulaPanel = document.getElementById('formula-panel');
const btnNewMission = document.getElementById('btn-new-mission');
const btnCheckMission = document.getElementById('btn-check-mission');
const challengeDesc = document.getElementById('challenge-desc');
const challengeFeedback = document.getElementById('challenge-feedback');

let rhoObj = 600, volume = 0.05, rhoFluid = 1000;
const g = 9.8;
let currentFa = 294.0, targetFa = null, missionSolved = false;
let currentBlockY = 140, targetBlockY = 140;

const tankX = 160, tankY = 70, tankW = 330, tankH = 260, baseFluidTopY = 140;

function calculateAndDraw() {
    rhoObj = parseFloat(inputRhoObj.value);
    volume = parseFloat(inputVol.value);
    rhoFluid = parseFloat(inputFluid.value);

    valRhoObj.textContent = rhoObj + ' kg/m³';
    valVol.textContent = volume.toFixed(2) + ' m³';

    const weight = rhoObj * volume * g;
    let submergedRatio = 1.0;
    const boxSize = 55 + (volume * 450);
    const centerX = tankX + (tankW / 2);

    if (rhoObj < rhoFluid) {
        submergedRatio = rhoObj / rhoFluid;
        statusBox.className = 'status-badge status-terapung';
        statusBox.textContent = 'Status: Benda TERAPUNG (' + (submergedRatio * 100).toFixed(0) + '% Volume Terendam)';
        const surfaceY = baseFluidTopY - ((volume * submergedRatio) * 220);
        targetBlockY = surfaceY - boxSize * (1 - submergedRatio);
    } else if (rhoObj === rhoFluid) {
        statusBox.className = 'status-badge status-melayang';
        statusBox.textContent = 'Status: Benda MELAYANG Seimbang (100% Terendam)';
        targetBlockY = tankY + (tankH / 2) - (boxSize / 2) + 25;
    } else {
        statusBox.className = 'status-badge status-tenggelam';
        statusBox.textContent = 'Status: Benda TENGGELAM di Dasar Tangki (100% Terendam)';
        targetBlockY = (tankY + tankH) - boxSize - 4;
    }

    const vSubmerged = volume * submergedRatio;
    const buoyantForce = rhoFluid * g * vSubmerged;
    currentFa = buoyantForce;

    outW.textContent = weight.toFixed(1) + ' N';
    outFa.textContent = buoyantForce.toFixed(1) + ' N';
    outWsemu.textContent = Math.max(0, weight - buoyantForce).toFixed(1) + ' N';
    outVcelup.textContent = vSubmerged.toFixed(3) + ' m³ (' + (submergedRatio * 100).toFixed(0) + '%)';

    currentBlockY += (targetBlockY - currentBlockY) * 0.12;
    drawTankAndObject(centerX, currentBlockY, boxSize, vSubmerged, weight, buoyantForce);
    requestAnimationFrame(calculateAndDraw);
}

function drawTankAndObject(centerX, blockY, boxSize, vSubmerged, weight, buoyantForce) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const surfaceY = baseFluidTopY - (vSubmerged * 220);

    let fluidColor = 'rgba(56, 189, 248, 0.45)', fluidName = 'Air Tawar (1000 kg/m³)';
    if (rhoFluid === 800) { fluidColor = 'rgba(250, 204, 21, 0.45)'; fluidName = 'Minyak Goreng (800 kg/m³)'; }
    else if (rhoFluid === 1030) { fluidColor = 'rgba(14, 165, 233, 0.55)'; fluidName = 'Air Laut (1030 kg/m³)'; }
    else if (rhoFluid === 1420) { fluidColor = 'rgba(217, 119, 6, 0.55)'; fluidName = 'Madu Murni (1420 kg/m³)'; }

    // Garis acuan awal
    ctx.save(); ctx.globalAlpha = 0.6; ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(tankX - 35, baseFluidTopY); ctx.lineTo(tankX, baseFluidTopY); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#64748b'; ctx.font = '11px Segoe UI'; ctx.fillText('Awal', tankX - 65, baseFluidTopY + 4);

    // Balok benda
    const blockX = centerX - (boxSize / 2);
    ctx.fillStyle = rhoObj < 1000 ? '#d97706' : '#475569';
    ctx.fillRect(blockX, blockY, boxSize, boxSize);
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2; ctx.strokeRect(blockX, blockY, boxSize, boxSize);

    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 11px Segoe UI'; ctx.textAlign = 'center';
    ctx.fillText(rhoObj + ' kg/m³', centerX, blockY + (boxSize / 2) + 4);
    ctx.textAlign = 'left';

    // Cairan & permukaan
    ctx.fillStyle = fluidColor;
    ctx.fillRect(tankX, surfaceY, tankW, (tankY + tankH) - surfaceY);
    ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(tankX, surfaceY); ctx.lineTo(tankX + tankW, surfaceY); ctx.stroke();

    // Dinding tangki kaca
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(tankX, tankY); ctx.lineTo(tankX, tankY + tankH);
    ctx.lineTo(tankX + tankW, tankY + tankH); ctx.lineTo(tankX + tankW, tankY); ctx.stroke();

    ctx.fillStyle = '#1e293b'; ctx.font = 'bold 12px Segoe UI';
    ctx.fillText(fluidName, tankX + 12, tankY + tankH - 10);

    // Panah vektor Fa & w
    const midY = blockY + (boxSize / 2);
    drawArrow(centerX - 14, midY, centerX - 14, midY - Math.min(25 + buoyantForce * 0.08, 85), '#16a34a', 'Fa = ' + buoyantForce.toFixed(0) + 'N', true);
    drawArrow(centerX + 14, midY, centerX + 14, midY + Math.min(25 + weight * 0.08, 85), '#dc2626', 'w = ' + weight.toFixed(0) + 'N', false);
}

function drawArrow(x1, y1, x2, y2, color, label, isUp) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2);
    if (isUp) { ctx.lineTo(x2 - 5, y2 + 8); ctx.lineTo(x2 + 5, y2 + 8); }
    else { ctx.lineTo(x2 - 5, y2 - 8); ctx.lineTo(x2 + 5, y2 - 8); }
    ctx.closePath(); ctx.fill();
    ctx.font = 'bold 11px Segoe UI';
    ctx.fillText(label, isUp ? x2 - 75 : x2 + 8, isUp ? y2 + 10 : y2 - 4);
}

inputRhoObj.addEventListener('input', () => { presetMaterial.value = 'custom'; });
presetMaterial.addEventListener('change', () => { if (presetMaterial.value !== 'custom') inputRhoObj.value = presetMaterial.value; });

if (btnNewMission) {
    btnNewMission.addEventListener('click', () => {
        targetFa = Math.floor(Math.random() * 701) + 150;
        missionSolved = false;
        challengeDesc.innerHTML = 'Atur variabel agar menghasilkan Gaya Apung <strong>Fa = ' + targetFa + ' N</strong> (±25 N).';
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
                challengeFeedback.textContent = '🎉 TEPAT! Fa = ' + currentFa.toFixed(1) + ' N (+100 Poin)!';
            } else {
                challengeFeedback.textContent = '✅ Misi selesai! Klik Buat Misi Baru.';
            }
        } else {
            challengeFeedback.className = 'challenge-feedback feedback-fail';
            challengeFeedback.textContent = '❌ Belum pas! Fa saat ini ' + currentFa.toFixed(1) + ' N (Target: ' + targetFa + ' N).';
        }
    });
}

btnReset.addEventListener('click', () => {
    inputRhoObj.value = 600; presetMaterial.value = 'custom'; inputVol.value = 0.05; inputFluid.value = 1000;
});

if (btnFormula) {
    btnFormula.addEventListener('click', () => {
        formulaPanel.style.display = formulaPanel.style.display === 'none' ? 'block' : 'none';
        btnFormula.textContent = formulaPanel.style.display === 'none' ? 'Lihat Rumus' : 'Sembunyikan Rumus';
    });
}

calculateAndDraw();
