const canvas = document.getElementById('pendulum-canvas');
const ctx = canvas.getContext('2d');

const inputL = document.getElementById('input-l');
const inputM = document.getElementById('input-m');
const inputAngle = document.getElementById('input-angle');
const inputG = document.getElementById('input-g');

const valL = document.getElementById('val-l');
const valM = document.getElementById('val-m');
const valAngle = document.getElementById('val-angle');

const outPeriod = document.getElementById('out-period');
const outFreq = document.getElementById('out-freq');
const outSwings = document.getElementById('out-swings');
const outOmega = document.getElementById('out-omega');

const expCalc = document.getElementById('exp-calc');
const expReason = document.getElementById('exp-reason');

const btnToggle = document.getElementById('btn-toggle');
const btnReset = document.getElementById('btn-reset');
const btnFormula = document.getElementById('btn-formula');
const formulaPanel = document.getElementById('formula-panel');

const swDisplay = document.getElementById('sw-display');
const btnSwStart = document.getElementById('btn-sw-start');
const btnSwReset = document.getElementById('btn-sw-reset');

const btnNewMission = document.getElementById('btn-new-mission');
const btnCheckMission = document.getElementById('btn-check-mission');
const challengeDesc = document.getElementById('challenge-desc');
const challengeFeedback = document.getElementById('challenge-feedback');

let L = 1.00, m = 2.0, angleMaxDeg = 25, g = 9.8;
let isRunning = true, simTime = 0, lastTimestamp = null;
let swRunning = false, swElapsed = 0;
let currentPeriod = 2.01, targetPeriod = null, missionSolved = false;

function animatePendulum(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    L = parseFloat(inputL.value);
    m = parseFloat(inputM.value);
    angleMaxDeg = parseFloat(inputAngle.value);
    g = parseFloat(inputG.value);

    valL.textContent = L.toFixed(2) + ' m';
    valM.textContent = m.toFixed(1) + ' kg';
    valAngle.textContent = angleMaxDeg + '°';

    const omega = Math.sqrt(g / L);
    const period = (2 * Math.PI) / omega;
    const freq = 1 / period;
    currentPeriod = period;

    if (isRunning) {
        simTime += dt;
        if (swRunning) {
            swElapsed += dt;
            if (swDisplay) swDisplay.textContent = swElapsed.toFixed(2) + ' s';
        }
    }

    const swings = Math.floor(simTime / period);
    const thetaMaxRad = angleMaxDeg * (Math.PI / 180);
    const currentTheta = thetaMaxRad * Math.cos(omega * simTime);

    outPeriod.textContent = period.toFixed(2) + ' s';
    outFreq.textContent = freq.toFixed(2) + ' Hz';
    outSwings.textContent = swings + ' Kali';
    outOmega.textContent = omega.toFixed(2) + ' rad/s';

    if (expCalc && expReason) {
        expCalc.innerHTML =
            '1. Periode Ayunan (T) = <code>2π · √(L / g) = 2(3,14) · √(' + L.toFixed(2) + ' / ' + g + ') = ' + period.toFixed(2) + ' s</code><br>' +
            '2. Frekuensi (f) = <code>1 / T = 1 / ' + period.toFixed(2) + ' = ' + freq.toFixed(2) + ' Hz</code><br>' +
            '3. Kecepatan Sudut (ω) = <code>√(g / L) = √(' + g + ' / ' + L.toFixed(2) + ') = ' + omega.toFixed(2) + ' rad/s</code>';

        expReason.textContent = 'Periode ayunan bandul hanya bergantung pada panjang tali (L = ' + L.toFixed(2) + ' m) dan percepatan gravitasi (g = ' + g + ' m/s²), sedangkan massa bandul (' + m.toFixed(1) + ' kg) tidak memengaruhi waktu ayunan. Makin panjang tali, lintasan ayunan makin lebar sehingga waktu satu ayunan penuh menjadi lebih lama.';
    }

    drawPendulumScene(currentTheta);
    requestAnimationFrame(animatePendulum);
}
function drawPendulumScene(theta) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pivotX = canvas.width / 2, pivotY = 45;
    const ropePx = 70 + L * 95;
    const bobX = pivotX + ropePx * Math.sin(theta);
    const bobY = pivotY + ropePx * Math.cos(theta);

    // 1. Tiang Penyangga Atas
    ctx.fillStyle = '#334155';
    ctx.fillRect(pivotX - 100, pivotY - 12, 200, 12);

    // 2. Garis Vertikal Acuan (Titik Setimbang)
    ctx.save(); ctx.globalAlpha = 0.45; ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(pivotX, pivotY); ctx.lineTo(pivotX, pivotY + ropePx + 35); ctx.stroke();
    ctx.restore();

    // 3. Busur Lintasan Ayunan
    const maxRad = angleMaxDeg * (Math.PI / 180);
    ctx.save(); ctx.globalAlpha = 0.25; ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, ropePx, Math.PI / 2 - maxRad, Math.PI / 2 + maxRad);
    ctx.stroke(); ctx.restore();

    // 4. Tali Bandul
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(pivotX, pivotY); ctx.lineTo(bobX, bobY); ctx.stroke();

    // 5. Titik Poros & Bola Bandul
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2); ctx.fill();

    const bobRadius = 14 + m * 1.4;
    ctx.fillStyle = '#2563eb';
    ctx.beginPath(); ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#1e3a8a'; ctx.lineWidth = 2; ctx.stroke();

    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center';
    ctx.fillText(m.toFixed(1) + 'kg', bobX, bobY + 4);
    ctx.textAlign = 'left';
}

btnToggle.addEventListener('click', () => {
    isRunning = !isRunning;
    btnToggle.textContent = isRunning ? '⏸ Jeda Ayunan' : '▶ Lanjutkan Ayunan';
});

btnReset.addEventListener('click', () => {
    inputL.value = 1.00; inputM.value = 2.0; inputAngle.value = 25; inputG.value = 9.8;
    simTime = 0; isRunning = true; btnToggle.textContent = '⏸ Jeda Ayunan';
});

if (btnSwStart) {
    btnSwStart.addEventListener('click', () => { swRunning = !swRunning; });
}
if (btnSwReset) {
    btnSwReset.addEventListener('click', () => {
        swRunning = false; swElapsed = 0;
        if (swDisplay) swDisplay.textContent = '00.00 s';
    });
}

if (btnNewMission) {
    btnNewMission.addEventListener('click', () => {
        const targets = new Array(1.20, 1.50, 2.01, 2.45, 2.84, 3.17);
        targetPeriod = targets[Math.floor(Math.random() * targets.length)];
        missionSolved = false;
        challengeDesc.innerHTML = 'Atur panjang tali (L) & gravitasi planet agar bandul berayun dengan periode <strong>T = ' + targetPeriod.toFixed(2) + ' detik</strong> (±0.08 s).';
        btnCheckMission.style.display = 'inline-block';
        challengeFeedback.style.display = 'none';
    });
}

if (btnCheckMission) {
    btnCheckMission.addEventListener('click', () => {
        if (targetPeriod === null) return;
        if (Math.abs(currentPeriod - targetPeriod) <= 0.08) {
            challengeFeedback.className = 'challenge-feedback feedback-success';
            if (!missionSolved) {
                missionSolved = true;
                if (typeof updateChallengeScore === 'function') updateChallengeScore(100);
                challengeFeedback.textContent = '🎉 TEPAT! Periode bandul ' + currentPeriod.toFixed(2) + ' s sesuai target (+100 Poin)!';
            } else challengeFeedback.textContent = '✅ Misi selesai! Klik Buat Misi Baru.';
        } else {
            challengeFeedback.className = 'challenge-feedback feedback-fail';
            challengeFeedback.textContent = '❌ Belum pas! Periode saat ini ' + currentPeriod.toFixed(2) + ' s (Target: ' + targetPeriod.toFixed(2) + ' s).';
        }
    });
}

if (btnFormula) {
    btnFormula.addEventListener('click', () => {
        formulaPanel.style.display = formulaPanel.style.display === 'none' ? 'block' : 'none';
        btnFormula.textContent = formulaPanel.style.display === 'none' ? 'Lihat Rumus' : 'Sembunyikan Rumus';
    });
}

requestAnimationFrame(animatePendulum);
