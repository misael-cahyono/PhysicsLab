const canvas = document.getElementById('incline-canvas');
const ctx = canvas.getContext('2d');

const inputAngle = document.getElementById('input-angle');
const inputM = document.getElementById('input-m');
const inputMu = document.getElementById('input-mu');
const presetSurface = document.getElementById('preset-surface');
const checkVectors = document.getElementById('check-vectors');

const valAngle = document.getElementById('val-angle');
const valM = document.getElementById('val-m');
const valMu = document.getElementById('val-mu');

const statusBox = document.getElementById('status-box');
const outA = document.getElementById('out-a');
const outFg = document.getElementById('out-fg');
const outN = document.getElementById('out-n');
const outV = document.getElementById('out-v');

const btnStart = document.getElementById('btn-start');
const btnReset = document.getElementById('btn-reset');
const btnFormula = document.getElementById('btn-formula');
const formulaPanel = document.getElementById('formula-panel');

const btnNewMission = document.getElementById('btn-new-mission');
const btnCheckMission = document.getElementById('btn-check-mission');
const challengeDesc = document.getElementById('challenge-desc');
const challengeFeedback = document.getElementById('challenge-feedback');

let angle = 30, m = 2.0, mu = 0.20;
const g = 9.8;
let currentAcceleration = 0;

let targetAccel = null;
let missionSolved = false;

let isSliding = false;
let distanceMoved = 0;
let currentVelocity = 0;
let t = 0;

const rampLengthMeters = 5.0;
const scale = 85;
const rampLengthPx = rampLengthMeters * scale;
const baseBottomY = canvas.height - 40;
const baseRightX = canvas.width - 70;

function calculatePhysics() {
    angle = parseFloat(inputAngle.value);
    m = parseFloat(inputM.value);
    mu = parseFloat(inputMu.value);

    valAngle.textContent = angle + '°';
    valM.textContent = m.toFixed(1) + ' kg';
    valMu.textContent = mu.toFixed(2);

    const rad = angle * (Math.PI / 180);
    const weight = m * g;
    const wParallel = weight * Math.sin(rad);
    const normalForce = weight * Math.cos(rad);
    const maxFriction = mu * normalForce;

    let acceleration = 0;
    let actualFriction = 0;

    if (wParallel > maxFriction) {
        actualFriction = maxFriction;
        acceleration = (wParallel - actualFriction) / m;

        statusBox.className = 'status-badge status-gerak';
        statusBox.textContent = isSliding ? 'Status: Balok Sedang Meluncur Turun!' : 'Status: Siap Meluncur (w·sin θ > f_gesek)';
        btnStart.disabled = false;
        btnStart.style.opacity = '1';
    } else {
        actualFriction = wParallel;
        acceleration = 0;
        isSliding = false;

        statusBox.className = 'status-badge status-diam';
        statusBox.textContent = 'Status: Balok Diam Tertahan Gesekan (w·sin θ ≤ f_gesek)';
        btnStart.disabled = true;
        btnStart.style.opacity = '0.5';
    }

    currentAcceleration = acceleration;
    outA.textContent = acceleration.toFixed(2) + ' m/s²';
    outFg.textContent = actualFriction.toFixed(2) + ' N';
    outN.textContent = normalForce.toFixed(2) + ' N';
    outV.textContent = currentVelocity.toFixed(2) + ' m/s';

    return { rad: rad, weight: weight, normalForce: normalForce, actualFriction: actualFriction, acceleration: acceleration };
}

function animate() {
    if (!isSliding) return;
    const phys = calculatePhysics();
    
    t += 0.025;
    distanceMoved = 0.5 * phys.acceleration * t * t;
    currentVelocity = phys.acceleration * t;

    const maxTravel = rampLengthMeters - 0.6;
    if (distanceMoved >= maxTravel) {
        distanceMoved = maxTravel;
        currentVelocity = Math.sqrt(2 * phys.acceleration * maxTravel);
        isSliding = false;
        calculatePhysics();
        drawScene();
        return;
    }

    outV.textContent = currentVelocity.toFixed(2) + ' m/s';
    drawScene();
    requestAnimationFrame(animate);
}

function drawScene() {
    const phys = calculatePhysics();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rad = phys.rad;
    const rampWidthPx = rampLengthPx * Math.cos(rad);
    const rampHeightPx = rampLengthPx * Math.sin(rad);
    const topX = baseRightX - rampWidthPx;
    const topY = baseBottomY - rampHeightPx;

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(30, baseBottomY);
    ctx.lineTo(canvas.width - 30, baseBottomY);
    ctx.stroke();

    ctx.fillStyle = mu === 0 ? '#e0f2fe' : '#e2e8f0';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(baseRightX, baseBottomY);
    ctx.lineTo(topX, topY);
    ctx.lineTo(topX, baseBottomY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 13px Segoe UI';
    ctx.fillText('θ = ' + angle + '°', baseRightX - 65, baseBottomY - 10);

    const boxSize = 40 + (m * 2);
    const distPx = 25 + (distanceMoved * scale);

    ctx.save();
    ctx.translate(topX, topY);
    ctx.rotate(rad);

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(distPx, -boxSize, boxSize, boxSize);
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2;
    ctx.strokeRect(distPx, -boxSize, boxSize, boxSize);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(m + 'kg', distPx + boxSize / 2, -boxSize / 2 + 4);
    ctx.textAlign = 'left';

    if (checkVectors && checkVectors.checked) {
        const centerX = distPx + boxSize / 2;
        const centerY = -boxSize / 2;

        const nLen = Math.min(30 + phys.normalForce * 0.7, 85);
        drawVector(centerX, centerY, centerX, centerY - nLen, '#16a34a', 'N');

        if (phys.actualFriction > 0.1) {
            const fLen = Math.min(25 + phys.actualFriction * 1.2, 80);
            drawVector(centerX, centerY, centerX - fLen, centerY, '#dc2626', 'f');
        }

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(-rad);
        const wLen = Math.min(35 + phys.weight * 0.7, 95);
        drawVector(0, 0, 0, wLen, '#ea580c', 'w');
        ctx.restore();
    }

    ctx.restore();
}

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

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headlen * Math.cos(ang - Math.PI / 6), y2 - headlen * Math.sin(ang - Math.PI / 6));
    ctx.lineTo(x2 - headlen * Math.cos(ang + Math.PI / 6), y2 - headlen * Math.sin(ang + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    ctx.font = 'bold 12px Segoe UI';
    ctx.fillText(label, x2 + 6, y2 + 4);
}

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

if (checkVectors) checkVectors.addEventListener('change', drawScene);

if (btnNewMission) {
    btnNewMission.addEventListener('click', () => {
        const randomVal = (Math.floor(Math.random() * 45) + 10) / 10; // 1.0 - 5.4 m/s²
        targetAccel = randomVal;
        missionSolved = false;
        challengeDesc.innerHTML = 'Atur <strong>Sudut Kemiringan (θ)</strong> dan <strong>Koefisien Gesek (μ)</strong> agar balok memiliki percepatan luncur sebesar <strong>a = ' + targetAccel.toFixed(2) + ' m/s²</strong> (toleransi ±0.15 m/s²).';
        btnCheckMission.style.display = 'inline-block';
        challengeFeedback.style.display = 'none';
    });
}

if (btnCheckMission) {
    btnCheckMission.addEventListener('click', () => {
        if (targetAccel === null) return;
        const selisih = Math.abs(currentAcceleration - targetAccel);
        if (selisih <= 0.15) {
            challengeFeedback.className = 'challenge-feedback feedback-success';
            if (!missionSolved) {
                missionSolved = true;
                if (typeof updateChallengeScore === 'function') updateChallengeScore(100);
                challengeFeedback.textContent = '🎉 TEPAT! Percepatan balok ' + currentAcceleration.toFixed(2) + ' m/s² sesuai target (+100 Poin)!';
            } else {
                challengeFeedback.textContent = '✅ Misi selesai! Klik Buat Misi Baru untuk soal berikutnya.';
            }
        } else {
            challengeFeedback.className = 'challenge-feedback feedback-fail';
            challengeFeedback.textContent = '❌ Belum pas! Percepatan saat ini ' + currentAcceleration.toFixed(2) + ' m/s² (Target: ' + targetAccel.toFixed(2) + ' m/s²).';
        }
    });
}

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

if (btnFormula) {
    btnFormula.addEventListener('click', () => {
        formulaPanel.style.display = formulaPanel.style.display === 'none' ? 'block' : 'none';
        btnFormula.textContent = formulaPanel.style.display === 'none' ? 'Lihat Rumus' : 'Sembunyikan Rumus';
    });
}

drawScene();
