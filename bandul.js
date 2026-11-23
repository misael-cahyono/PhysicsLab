const canvas = document.getElementById('pendulum-canvas');
const ctx = canvas.getContext('2d');

const inputL = document.getElementById('input-l');
const inputM = document.getElementById('input-m');
const inputAngle = document.getElementById('input-angle');
const inputG = document.getElementById('input-g');

const valL = document.getElementById('val-l');
const valM = document.getElementById('val-m');
const valAngle = document.getElementById('val-angle');

const outT = document.getElementById('out-t');
const outF = document.getElementById('out-f');
const outTheta = document.getElementById('out-theta');
const outCount = document.getElementById('out-count');

const btnToggle = document.getElementById('btn-toggle');
const btnReset = document.getElementById('btn-reset');
const swDisplay = document.getElementById('sw-display');
const swStart = document.getElementById('sw-start');
const swReset = document.getElementById('sw-reset');
const btnFormula = document.getElementById('btn-formula');
const formulaPanel = document.getElementById('formula-panel');

const btnNewMission = document.getElementById('btn-new-mission');
const btnCheckMission = document.getElementById('btn-check-mission');
const challengeDesc = document.getElementById('challenge-desc');
const challengeFeedback = document.getElementById('challenge-feedback');

let L = 1.0, m = 1.0, maxAngleDeg = 20, g = 9.8;
let currentPeriod = 2.01;
let targetPeriod = null;
let missionSolved = false;

let isSwinging = true;
let simTime = 0;
let lastFrameTime = performance.now();

let swRunning = false;
let swElapsed = 0;

const pivotX = canvas.width / 2;
const pivotY = 45;
const scale = 150;

function updatePhysicsAndDraw(now) {
    const dt = (now - lastFrameTime) / 1000;
    lastFrameTime = now;

    L = parseFloat(inputL.value);
    m = parseFloat(inputM.value);
    maxAngleDeg = parseFloat(inputAngle.value);
    g = parseFloat(inputG.value);

    valL.textContent = L.toFixed(2) + ' m';
    valM.textContent = m.toFixed(1) + ' kg';
    valAngle.textContent = maxAngleDeg + '°';

    const T = 2 * Math.PI * Math.sqrt(L / g);
    currentPeriod = T;
    const f = 1 / T;
    const omega = Math.sqrt(g / L);

    if (isSwinging) {
        simTime += dt;
    }

    const theta0Rad = maxAngleDeg * (Math.PI / 180);
    const currentThetaRad = theta0Rad * Math.cos(omega * simTime);
    const currentThetaDeg = currentThetaRad * (180 / Math.PI);
    const swingCount = Math.floor(simTime / T);

    outT.textContent = T.toFixed(2) + ' s';
    outF.textContent = f.toFixed(2) + ' Hz';
    outTheta.textContent = currentThetaDeg.toFixed(1) + '°';
    outCount.textContent = swingCount + ' Kali';

    if (swRunning) {
        swElapsed += dt;
        const formattedSw = swElapsed < 10 ? '0' + swElapsed.toFixed(2) : swElapsed.toFixed(2);
        swDisplay.textContent = formattedSw + ' s';
    }

    drawPendulum(currentThetaRad);
    requestAnimationFrame(updatePhysicsAndDraw);
}

function drawPendulum(thetaRad) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const ropeLengthPx = L * scale;
    const bobX = pivotX + ropeLengthPx * Math.sin(thetaRad);
    const bobY = pivotY + ropeLengthPx * Math.cos(thetaRad);

    // 1. Busur Derajat
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 65, Math.PI * 0.25, Math.PI * 0.75);
    ctx.stroke();

    // 2. Garis Vertikal Titik Setimbang (Semi-transparan)
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(pivotX, pivotY + ropeLengthPx + 35);
    ctx.stroke();
    ctx.restore();

    // 3. Lintasan Ayunan
    const maxRad = maxAngleDeg * (Math.PI / 180);
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.2)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, ropeLengthPx, Math.PI / 2 - maxRad, Math.PI / 2 + maxRad);
    ctx.stroke();

    // 4. Penyangga Atas
    ctx.fillStyle = '#334155';
    ctx.fillRect(pivotX - 90, pivotY - 12, 180, 12);

    // 5. Tali Bandul
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2);
    ctx.fill();

    // 6. Bola Bandul
    const bobRadius = 14 + (m * 3);
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(m + 'kg', bobX, bobY + 4);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#475569';
    ctx.font = '12px Segoe UI';
    ctx.fillText('L = ' + L.toFixed(2) + ' m', (pivotX + bobX) / 2 + 12, (pivotY + bobY) / 2);
}

function resetPendulum() {
    simTime = 0;
}

inputL.addEventListener('input', resetPendulum);
inputAngle.addEventListener('input', resetPendulum);
inputG.addEventListener('change', resetPendulum);

if (btnNewMission) {
    btnNewMission.addEventListener('click', () => {
        // Acak target periode antara 1.10 detik hingga 2.70 detik (di gravitasi Bumi)
        const randomT = (Math.floor(Math.random() * 161) + 110) / 100;
        targetPeriod = randomT;
        missionSolved = false;
        challengeDesc.innerHTML = 'Atur <strong>Panjang Tali (L)</strong> di gravitasi Bumi (9,8 m/s²) sehingga bandul berayun dengan periode tepat <strong>T = ' + targetPeriod.toFixed(2) + ' detik</strong> (toleransi ±0.05 s).';
        btnCheckMission.style.display = 'inline-block';
        challengeFeedback.style.display = 'none';
    });
}

if (btnCheckMission) {
    btnCheckMission.addEventListener('click', () => {
        if (targetPeriod === null) return;
        const selisih = Math.abs(currentPeriod - targetPeriod);
        if (selisih <= 0.05) {
            challengeFeedback.className = 'challenge-feedback feedback-success';
            if (!missionSolved) {
                missionSolved = true;
                if (typeof updateChallengeScore === 'function') updateChallengeScore(100);
                challengeFeedback.textContent = '🎉 TEPAT! Periode bandul ' + currentPeriod.toFixed(2) + ' s sesuai target (+100 Poin)!';
            } else {
                challengeFeedback.textContent = '✅ Misi selesai! Klik Buat Misi Baru untuk soal berikutnya.';
            }
        } else {
            challengeFeedback.className = 'challenge-feedback feedback-fail';
            challengeFeedback.textContent = '❌ Belum pas! Periode saat ini ' + currentPeriod.toFixed(2) + ' s (Target: ' + targetPeriod.toFixed(2) + ' s).';
        }
    });
}

btnToggle.addEventListener('click', () => {
    isSwinging = !isSwinging;
    btnToggle.textContent = isSwinging ? '⏸ Jeda Ayunan' : '▶ Lanjut Ayunan';
});

btnReset.addEventListener('click', () => {
    simTime = 0;
    isSwinging = true;
    btnToggle.textContent = '⏸ Jeda Ayunan';
});

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

if (btnFormula) {
    btnFormula.addEventListener('click', () => {
        formulaPanel.style.display = formulaPanel.style.display === 'none' ? 'block' : 'none';
        btnFormula.textContent = formulaPanel.style.display === 'none' ? 'Lihat Rumus' : 'Sembunyikan Rumus';
    });
}

requestAnimationFrame(updatePhysicsAndDraw);
