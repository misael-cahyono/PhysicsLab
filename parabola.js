const canvas = document.getElementById('parabola-canvas');
const ctx = canvas.getContext('2d');

const inputAngle = document.getElementById('input-angle');
const inputV0 = document.getElementById('input-v0');
const inputG = document.getElementById('input-g');

const valAngle = document.getElementById('val-angle');
const valV0 = document.getElementById('val-v0');

const outT = document.getElementById('out-t');
const outPos = document.getElementById('out-pos');
const outYmax = document.getElementById('out-ymax');
const outXmax = document.getElementById('out-xmax');

const btnFire = document.getElementById('btn-fire');
const btnPause = document.getElementById('btn-pause');
const btnClear = document.getElementById('btn-clear');
const btnFormula = document.getElementById('btn-formula');
const formulaPanel = document.getElementById('formula-panel');
const historyBody = document.getElementById('history-body');
const btnClearTable = document.getElementById('btn-clear-table');

const btnNewMission = document.getElementById('btn-new-mission');
const challengeDesc = document.getElementById('challenge-desc');
const challengeFeedback = document.getElementById('challenge-feedback');

let angle = 45;
let v0 = 25;
let g = 9.8;

let isRunning = false;
let isPaused = false;
let t = 0;

let targetDistance = null;
let missionSolved = false;

const scale = 4.5;
const originX = 45;
const originY = canvas.height - 35;

let trajectories = new Array();
let currentTrail = new Array();
let shotCount = 0;
const colors = new Array('#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea');

function updatePreview() {
    angle = parseFloat(inputAngle.value);
    v0 = parseFloat(inputV0.value);
    g = parseFloat(inputG.value);

    valAngle.textContent = angle + '°';
    valV0.textContent = v0 + ' m/s';

    const rad = angle * (Math.PI / 180);
    const yMax = (Math.pow(v0, 2) * Math.pow(Math.sin(rad), 2)) / (2 * g);
    const xMax = (Math.pow(v0, 2) * Math.sin(2 * rad)) / g;

    outYmax.textContent = yMax.toFixed(2) + ' m';
    outXmax.textContent = xMax.toFixed(2) + ' m';

    if (!isRunning) {
        drawScene(0, 0);
    }
}

function animate() {
    if (!isRunning || isPaused) return;

    const rad = angle * (Math.PI / 180);
    const vx = v0 * Math.cos(rad);
    const vy = v0 * Math.sin(rad);

    const x = vx * t;
    const y = (vy * t) - (0.5 * g * Math.pow(t, 2));

    outT.textContent = t.toFixed(2) + ' s';
    outPos.textContent = x.toFixed(1) + 'm, ' + Math.max(0, y).toFixed(1) + 'm';

    currentTrail.push({ x: x, y: Math.max(0, y) });
    drawScene(x, Math.max(0, y));

    if (t > 0.05 && y <= 0) {
        isRunning = false;

        const totalTime = (2 * vy) / g;
        const finalX = vx * totalTime;
        const maxY = Math.pow(vy, 2) / (2 * g);

        outT.textContent = totalTime.toFixed(2) + ' s';
        outPos.textContent = finalX.toFixed(1) + 'm, 0.0m';

        const color = colors[(shotCount - 1) % colors.length];
        trajectories.push({
            points: currentTrail.slice(),
            color: color,
            peakX: finalX / 2,
            peakY: maxY
        });

        addHistoryRow(shotCount, angle, v0, g, maxY, finalX);
        checkMissionResult(finalX);
        drawScene(finalX, 0);
        return;
    }

    t += 0.04;
    requestAnimationFrame(animate);
}

function createNewMission() {
    targetDistance = Math.floor(Math.random() * 91) + 25;
    missionSolved = false;

    if (challengeDesc) {
        challengeDesc.innerHTML = 'Sasaran muncul di jarak <strong>' + targetDistance + '.0 meter</strong>! Atur sudut (θ) dan kecepatan (v₀) agar bola jatuh tepat di papan target (toleransi ±2.0 m).';
    }
    if (challengeFeedback) {
        challengeFeedback.style.display = 'none';
        challengeFeedback.className = 'challenge-feedback';
    }

    drawScene(0, 0);
}

function checkMissionResult(landingX) {
    if (targetDistance === null || !challengeFeedback) return;

    const selisih = Math.abs(landingX - targetDistance);
    if (selisih <= 2.0) {
        challengeFeedback.className = 'challenge-feedback feedback-success';
        if (!missionSolved) {
            missionSolved = true;
            if (typeof updateChallengeScore === 'function') {
                updateChallengeScore(100);
            }
            challengeFeedback.textContent = '🎉 TEPAT SASARAN! Bola jatuh di ' + landingX.toFixed(1) + ' m (selisih ' + selisih.toFixed(1) + ' m). +100 Poin!';
        } else {
            challengeFeedback.textContent = '✅ Mengenai sasaran lagi (' + landingX.toFixed(1) + ' m)! Klik "Buat Misi Baru" untuk tantangan berikutnya.';
        }
    } else {
        challengeFeedback.className = 'challenge-feedback feedback-fail';
        const arah = landingX < targetDistance ? 'terlalu pendek' : 'terlalu jauh';
        challengeFeedback.textContent = '❌ Meleset! Bola jatuh di ' + landingX.toFixed(1) + ' m (' + arah + ' ' + selisih.toFixed(1) + ' m dari target ' + targetDistance + ' m). Coba lagi!';
    }
}

function drawScene(ballX, ballY) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    if (targetDistance !== null) {
        drawTarget(targetDistance);
    }

    for (let i = 0; i < trajectories.length; i++) {
        const traj = trajectories[i];
        drawTrail(traj.points, traj.color);
        if (traj.peakY > 0.5) {
            const px = originX + traj.peakX * scale;
            const py = originY - traj.peakY * scale;
            ctx.fillStyle = traj.color;
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.font = '11px Segoe UI';
            ctx.fillText('Puncak (' + traj.peakY.toFixed(1) + 'm)', px - 30, py - 8);
        }
    }

    if (currentTrail.length > 0) {
        const activeColor = colors[(shotCount - 1) % colors.length];
        drawTrail(currentTrail, activeColor);
    }

    drawCannon();

    const screenX = originX + (ballX * scale);
    const screenY = originY - (ballY * scale);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(screenX, screenY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 1.5;
    ctx.stroke();
}

function drawTarget(distMeters) {
    const tx = originX + distMeters * scale;
    const ty = originY;

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(tx - 10, ty - 5, 20, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(tx - 5, ty - 5, 10, 10);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(tx - 2, ty - 5, 4, 10);

    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tx, ty - 5);
    ctx.lineTo(tx, ty - 32);
    ctx.stroke();

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 11px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('Target (' + distMeters + 'm)', tx, ty - 36);
    ctx.textAlign = 'left';
}

function drawGrid() {
    ctx.strokeStyle = '#e2e8f0';
    ctx.fillStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.font = '10px Segoe UI';

    for (let m = 0; m <= 130; m += 10) {
        const x = originX + m * scale;
        if (x > canvas.width) break;
        ctx.beginPath();
        ctx.moveTo(x, 10);
        ctx.lineTo(x, originY);
        ctx.stroke();
        if (m > 0) ctx.fillText(m + 'm', x - 10, originY + 15);
    }

    for (let m = 10; m <= 80; m += 10) {
        const y = originY - m * scale;
        if (y < 10) break;
        ctx.beginPath();
        ctx.moveTo(originX, y);
        ctx.lineTo(canvas.width - 10, y);
        ctx.stroke();
        ctx.fillText(m + 'm', 12, y + 3);
    }

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, originY);
    ctx.lineTo(canvas.width - 10, originY);
    ctx.stroke();
}

function drawTrail(points, color) {
    if (points.length < 2) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash(new Array(6, 4));
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
        const sx = originX + points[i].x * scale;
        const sy = originY - points[i].y * scale;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    ctx.setLineDash(new Array());
}

function drawCannon() {
    const rad = -angle * (Math.PI / 180);
    ctx.save();
    ctx.translate(originX, originY);
    ctx.rotate(rad);

    ctx.fillStyle = '#334155';
    ctx.fillRect(0, -6, 32, 12);
    ctx.restore();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(originX, originY, 10, 0, Math.PI * 2);
    ctx.fill();
}

function addHistoryRow(no, ang, vel, grav, ymax, xmax) {
    if (!historyBody) return;
    const row = document.createElement('tr');
    row.innerHTML =
        '<td>' + no + '</td>' +
        '<td>' + ang + '°</td>' +
        '<td>' + vel + ' m/s</td>' +
        '<td>' + grav + ' m/s²</td>' +
        '<td>' + ymax.toFixed(2) + ' m</td>' +
        '<td>' + xmax.toFixed(2) + ' m</td>';
    historyBody.prepend(row);
}

inputAngle.addEventListener('input', updatePreview);
inputV0.addEventListener('input', updatePreview);
inputG.addEventListener('change', updatePreview);

if (btnNewMission) {
    btnNewMission.addEventListener('click', createNewMission);
}

btnFire.addEventListener('click', () => {
    t = 0;
    currentTrail = new Array();
    isRunning = true;
    isPaused = false;
    btnPause.textContent = 'Jeda';
    shotCount++;
    animate();
});

btnPause.addEventListener('click', () => {
    if (!isRunning) return;
    isPaused = !isPaused;
    btnPause.textContent = isPaused ? 'Lanjut' : 'Jeda';
    if (!isPaused) animate();
});

btnClear.addEventListener('click', () => {
    isRunning = false;
    isPaused = false;
    t = 0;
    trajectories = new Array();
    currentTrail = new Array();
    outT.textContent = '0.00 s';
    outPos.textContent = '0.0m, 0.0m';
    drawScene(0, 0);
});

if (btnClearTable) {
btnClearTable.addEventListener('click', () => {
historyBody.innerHTML = '';
shotCount = 0;
});
}
if (btnFormula) {
btnFormula.addEventListener('click', () => {
if (formulaPanel.style.display === 'none') {
formulaPanel.style.display = 'block';
btnFormula.textContent = 'Sembunyikan Rumus';
} else {
formulaPanel.style.display = 'none';
btnFormula.textContent = 'Lihat Rumus';
}
});
}
updatePreview();
