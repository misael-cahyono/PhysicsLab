const canvas = document.getElementById('energy-canvas');
const ctx = canvas.getContext('2d');

const inputH1 = document.getElementById('input-h1');
const inputH2 = document.getElementById('input-h2');
const inputM = document.getElementById('input-m');

const valH1 = document.getElementById('val-h1');
const valH2 = document.getElementById('val-h2');
const valM = document.getElementById('val-m');

const statusBox = document.getElementById('status-box');
const outEp = document.getElementById('out-ep');
const outEk = document.getElementById('out-ek');
const outEm = document.getElementById('out-em');
const outV = document.getElementById('out-v');

const btnPlay = document.getElementById('btn-play');
const btnReset = document.getElementById('btn-reset');
const btnFormula = document.getElementById('btn-formula');
const formulaPanel = document.getElementById('formula-panel');

const btnNewMission = document.getElementById('btn-new-mission');
const btnCheckMission = document.getElementById('btn-check-mission');
const challengeDesc = document.getElementById('challenge-desc');
const challengeFeedback = document.getElementById('challenge-feedback');

let h1 = 15, h2 = 10, m = 50;
const g = 9.8;

let targetValleySpeed = null;
let missionSolved = false;

let isRunning = false;
let direction = 1;
let currentX = 50;

const startX = 50;
const valleyX = 270;
const hill2X = 460;
const endX = 590;
const groundY = canvas.height - 35;
const scaleY = 10.5;

function getTrackHeight(x) {
    if (x <= startX) return h1;
    if (x <= valleyX) {
        const progress = (x - startX) / (valleyX - startX);
        return h1 * 0.5 * (1 + Math.cos(Math.PI * progress));
    }
    if (x <= hill2X) {
        const progress = (x - valleyX) / (hill2X - valleyX);
        return h2 * 0.5 * (1 - Math.cos(Math.PI * progress));
    }
    if (x <= endX) {
        const progress = (x - hill2X) / (endX - hill2X);
        const endHeight = h2 * 0.3;
        return endHeight + (h2 - endHeight) * 0.5 * (1 + Math.cos(Math.PI * progress));
    }
    return h2 * 0.3;
}

function updateDisplay() {
    h1 = parseFloat(inputH1.value);
    h2 = parseFloat(inputH2.value);
    m = parseFloat(inputM.value);

    valH1.textContent = h1.toFixed(1) + ' m';
    valH2.textContent = h2.toFixed(1) + ' m';
    valM.textContent = m + ' kg';

    if (h1 >= h2) {
        statusBox.className = 'status-badge status-lolos';
        statusBox.textContent = 'Prediksi: Kereta Mampu Melewati Bukit Kedua (h₁ ≥ h₂)';
    } else {
        statusBox.className = 'status-badge status-gagal';
        statusBox.textContent = 'Prediksi: Bukit Kedua Terlalu Tinggi! Kereta Akan Berbalik Arah (h₁ < h₂)';
    }

    const currentH = getTrackHeight(currentX);
    const totalEM = m * g * h1;
    const currentEP = m * g * currentH;
    const currentEK = Math.max(0, totalEM - currentEP);
    const velocity = Math.sqrt((2 * currentEK) / m);

    outEp.textContent = Math.round(currentEP) + ' J';
    outEk.textContent = Math.round(currentEK) + ' J';
    outEm.textContent = Math.round(totalEM) + ' J';
    outV.textContent = velocity.toFixed(2) + ' m/s';

    drawScene(currentH, currentEP, currentEK, totalEM);
}

function animate() {
    if (!isRunning) return;

    const currentH = getTrackHeight(currentX);
    const totalEM = m * g * h1;
    const currentEP = m * g * currentH;
    const currentEK = totalEM - currentEP;

    if (currentEK <= 0 && currentX > valleyX && direction === 1) {
        direction = -1;
    }

    if (currentX <= startX + 2 && direction === -1) {
        currentX = startX + 2;
        direction = 1;
    }

    const speedPhysics = Math.sqrt(Math.max(0, (2 * currentEK) / m));
    const moveStep = Math.max(1.5, speedPhysics * 0.35);

    currentX += moveStep * direction;

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

function drawScene(currentH, ep, ek, em) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const yH1 = groundY - h1 * scaleY;
    const yH2 = groundY - h2 * scaleY;

    // 1. Garis Acuan Ketinggian h1 & h2 (Semi-transparan)
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.moveTo(20, yH1);
    ctx.lineTo(startX + 40, yH1);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(hill2X - 40, yH2);
    ctx.lineTo(hill2X + 45, yH2);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#475569';
    ctx.font = '11px Segoe UI';
    ctx.fillText('h₁ = ' + h1 + 'm', 15, yH1 - 5);
    ctx.fillText('h₂ = ' + h2 + 'm', hill2X - 15, yH2 - 8);

    // 2. Badan Bukit & Rel Lintasan
    ctx.beginPath();
    ctx.moveTo(startX, groundY);
    for (let x = startX; x <= endX; x += 4) {
        const y = groundY - getTrackHeight(x) * scaleY;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(endX, groundY);
    ctx.closePath();

    ctx.fillStyle = '#e2e8f0';
    ctx.fill();

    ctx.beginPath();
    for (let x = startX; x <= endX; x += 4) {
        const y = groundY - getTrackHeight(x) * scaleY;
        if (x === startX) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 3. Tanah Dasar
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(15, groundY);
    ctx.lineTo(canvas.width - 15, groundY);
    ctx.stroke();

    // 4. Kereta Roller Coaster
    const cartY = groundY - currentH * scaleY;
    const nextH = getTrackHeight(currentX + 2);
    const slopeAngle = Math.atan2(-(nextH - currentH) * scaleY, 2);

    ctx.save();
    ctx.translate(currentX, cartY);
    ctx.rotate(slopeAngle);

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-16, -20, 32, 14);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-9, -4, 4, 0, Math.PI * 2);
    ctx.arc(9, -4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 5. Diagram Batang Energi Live
    drawEnergyBars(ep, ek, em);
}

function drawEnergyBars(ep, ek, em) {
    const boxX = canvas.width - 175;
    const boxY = 15;
    const maxBarHeight = 90;

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

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(boxX + 22, baseLineY - epHeight, 26, epHeight);
    ctx.fillText('EP', boxX + 28, baseLineY + 13);

    ctx.fillStyle = '#16a34a';
    ctx.fillRect(boxX + 67, baseLineY - ekHeight, 26, ekHeight);
    ctx.fillText('EK', boxX + 73, baseLineY + 13);

    ctx.fillStyle = '#ea580c';
    ctx.fillRect(boxX + 112, baseLineY - emHeight, 26, emHeight);
    ctx.fillText('EM', boxX + 117, baseLineY + 13);
}

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

if (btnNewMission) {
    btnNewMission.addEventListener('click', () => {
        // Pilih acak tinggi target tersembunyi antara 6m sampai 24m lalu hitung kecepatan lembahnya
        const secretH = Math.floor(Math.random() * 19) + 6;
        targetValleySpeed = Math.sqrt(2 * g * secretH);
        missionSolved = false;
        challengeDesc.innerHTML = 'Atur <strong>Tinggi Bukit Awal (h₁)</strong> sehingga kereta mencapai kecepatan <strong>v = ' + targetValleySpeed.toFixed(2) + ' m/s</strong> saat tiba di titik terendah lembah (toleransi ±0.40 m/s).';
        btnCheckMission.style.display = 'inline-block';
        challengeFeedback.style.display = 'none';
    });
}

if (btnCheckMission) {
    btnCheckMission.addEventListener('click', () => {
        if (targetValleySpeed === null) return;
        const actualValleySpeed = Math.sqrt(2 * g * h1);
        const selisih = Math.abs(actualValleySpeed - targetValleySpeed);
        if (selisih <= 0.40) {
            challengeFeedback.className = 'challenge-feedback feedback-success';
            if (!missionSolved) {
                missionSolved = true;
                if (typeof updateChallengeScore === 'function') updateChallengeScore(100);
                challengeFeedback.textContent = '🎉 TEPAT! Dengan h₁ = ' + h1 + ' m, kecepatan di dasar lembah adalah ' + actualValleySpeed.toFixed(2) + ' m/s (+100 Poin)!';
            } else {
                challengeFeedback.textContent = '✅ Misi selesai! Klik Buat Misi Baru untuk tantangan berikutnya.';
            }
        } else {
            challengeFeedback.className = 'challenge-feedback feedback-fail';
            challengeFeedback.textContent = '❌ Belum pas! Dengan h₁ = ' + h1 + ' m, kecepatan lembah adalah ' + actualValleySpeed.toFixed(2) + ' m/s (Target: ' + targetValleySpeed.toFixed(2) + ' m/s).';
        }
    });
}

btnPlay.addEventListener('click', () => {
    if (currentX >= endX) {
        currentX = startX;
        direction = 1;
    }
    isRunning = !isRunning;
    btnPlay.textContent = isRunning ? '⏸ Jeda' : '▶ Lanjutkan';
    if (isRunning) animate();
});

btnReset.addEventListener('click', resetCart);

if (btnFormula) {
    btnFormula.addEventListener('click', () => {
        formulaPanel.style.display = formulaPanel.style.display === 'none' ? 'block' : 'none';
        btnFormula.textContent = formulaPanel.style.display === 'none' ? 'Lihat Rumus' : 'Sembunyikan Rumus';
    });
}

updateDisplay();
