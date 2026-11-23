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

let angle = 45, v0 = 25, g = 9.8;
let isRunning = false, isPaused = false, t = 0;
let targetDistance = null, missionSolved = false;

const scale = 4.5, originX = 45, originY = canvas.height - 35;
let trajectories = [], currentTrail = [], shotCount = 0;
const colors = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea'];

function updatePreview() {
    angle = parseFloat(inputAngle.value);
    v0 = parseFloat(inputV0.value);
    g = parseFloat(inputG.value);
    valAngle.textContent = angle + '°';
    valV0.textContent = v0 + ' m/s';

    const rad = angle * Math.PI / 180;
    outYmax.textContent = ((v0 * v0 * Math.pow(Math.sin(rad), 2)) / (2 * g)).toFixed(2) + ' m';
    outXmax.textContent = ((v0 * v0 * Math.sin(2 * rad)) / g).toFixed(2) + ' m';
    if (!isRunning) drawScene(0, 0);
}

function animate() {
    if (!isRunning || isPaused) return;
    const rad = angle * Math.PI / 180;
    const vx = v0 * Math.cos(rad), vy = v0 * Math.sin(rad);
    const x = vx * t, y = vy * t - 0.5 * g * t * t;

    outT.textContent = t.toFixed(2) + ' s';
    outPos.textContent = x.toFixed(1) + 'm, ' + Math.max(0, y).toFixed(1) + 'm';
    currentTrail.push({ x: x, y: Math.max(0, y) });
    drawScene(x, Math.max(0, y));

    if (t > 0.05 && y <= 0) {
        isRunning = false;
        const totalTime = (2 * vy) / g, finalX = vx * totalTime, maxY = (vy * vy) / (2 * g);
        outT.textContent = totalTime.toFixed(2) + ' s';
        outPos.textContent = finalX.toFixed(1) + 'm, 0.0m';

        trajectories.push({ points: currentTrail.slice(), color: colors[(shotCount - 1) % colors.length], peakX: finalX / 2, peakY: maxY });
        if (historyBody) {
            const row = document.createElement('tr');
            row.innerHTML = '<td>' + shotCount + '</td><td>' + angle + '°</td><td>' + v0 + ' m/s</td><td>' + g + ' m/s²</td><td>' + maxY.toFixed(2) + ' m</td><td>' + finalX.toFixed(2) + ' m</td>';
            historyBody.prepend(row);
        }
        checkMission(finalX);
        drawScene(finalX, 0);
        return;
    }
    t += 0.04;
    requestAnimationFrame(animate);
}

function checkMission(landingX) {
    if (targetDistance === null || !challengeFeedback) return;
    const selisih = Math.abs(landingX - targetDistance);
    if (selisih <= 2.0) {
        challengeFeedback.className = 'challenge-feedback feedback-success';
        if (!missionSolved) {
            missionSolved = true;
            if (typeof updateChallengeScore === 'function') updateChallengeScore(100);
            challengeFeedback.textContent = '🎉 TEPAT SASARAN! Jarak: ' + landingX.toFixed(1) + ' m (+100 Poin)';
        } else {
            challengeFeedback.textContent = '✅ Kena lagi (' + landingX.toFixed(1) + ' m)! Klik Buat Misi Baru.';
        }
    } else {
        challengeFeedback.className = 'challenge-feedback feedback-fail';
        challengeFeedback.textContent = '❌ Meleset! Jatuh di ' + landingX.toFixed(1) + ' m (Target: ' + targetDistance + ' m).';
    }
}

function drawScene(ballX, ballY) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Grid & Tanah
    ctx.strokeStyle = '#e2e8f0'; ctx.fillStyle = '#64748b'; ctx.lineWidth = 1; ctx.font = '10px Segoe UI';
    for (let m = 0; m <= 130; m += 10) {
        const x = originX + m * scale;
        if (x > canvas.width) break;
        ctx.beginPath(); ctx.moveTo(x, 10); ctx.lineTo(x, originY); ctx.stroke();
        if (m > 0) ctx.fillText(m + 'm', x - 10, originY + 15);
    }
    for (let m = 10; m <= 80; m += 10) {
        const y = originY - m * scale;
        if (y < 10) break;
        ctx.beginPath(); ctx.moveTo(originX, y); ctx.lineTo(canvas.width - 10, y); ctx.stroke();
        ctx.fillText(m + 'm', 12, y + 3);
    }
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(10, originY); ctx.lineTo(canvas.width - 10, originY); ctx.stroke();

    // Target Misi
    if (targetDistance !== null) {
        const tx = originX + targetDistance * scale;
        ctx.fillStyle = '#dc2626'; ctx.fillRect(tx - 10, originY - 5, 20, 10);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(tx - 4, originY - 5, 8, 10);
        ctx.font = 'bold 11px Segoe UI'; ctx.fillStyle = '#dc2626';
        ctx.fillText('Target (' + targetDistance + 'm)', tx - 30, originY - 12);
    }

    // Jejak Lintasan
    for (let i = 0; i < trajectories.length; i++) {
        drawTrail(trajectories[i].points, trajectories[i].color);
    }
    if (currentTrail.length > 0) drawTrail(currentTrail, colors[(shotCount - 1) % colors.length]);

    // Meriam & Bola
    ctx.save(); ctx.translate(originX, originY); ctx.rotate(-angle * Math.PI / 180);
    ctx.fillStyle = '#334155'; ctx.fillRect(0, -6, 32, 12); ctx.restore();
    ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(originX, originY, 10, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#ef4444'; ctx.beginPath();
    ctx.arc(originX + ballX * scale, originY - ballY * scale, 7, 0, Math.PI * 2); ctx.fill();
}

function drawTrail(points, color) {
    if (points.length < 2) return;
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
        const sx = originX + points[i].x * scale, sy = originY - points[i].y * scale;
        if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    }
    ctx.stroke(); ctx.setLineDash([]);
}

inputAngle.addEventListener('input', updatePreview);
inputV0.addEventListener('input', updatePreview);
inputG.addEventListener('change', updatePreview);

if (btnNewMission) btnNewMission.addEventListener('click', () => {
    targetDistance = Math.floor(Math.random() * 91) + 25;
    missionSolved = false;
    challengeDesc.innerHTML = 'Sasaran muncul di jarak <strong>' + targetDistance + '.0 meter</strong>! Tembak tepat sasaran (+100 Poin).';
    challengeFeedback.style.display = 'none';
    drawScene(0, 0);
});

btnFire.addEventListener('click', () => { t = 0; currentTrail = []; isRunning = true; isPaused = false; btnPause.textContent = 'Jeda'; shotCount++; animate(); });
btnPause.addEventListener('click', () => { if (!isRunning) return; isPaused = !isPaused; btnPause.textContent = isPaused ? 'Lanjut' : 'Jeda'; if (!isPaused) animate(); });
btnClear.addEventListener('click', () => { isRunning = false; t = 0; trajectories = []; currentTrail = []; outT.textContent = '0.00 s'; outPos.textContent = '0.0m, 0.0m'; drawScene(0, 0); });
if (btnClearTable) btnClearTable.addEventListener('click', () => { historyBody.innerHTML = ''; shotCount = 0; });
if (btnFormula) btnFormula.addEventListener('click', () => {
    formulaPanel.style.display = formulaPanel.style.display === 'none' ? 'block' : 'none';
    btnFormula.textContent = formulaPanel.style.display === 'none' ? 'Lihat Rumus' : 'Sembunyikan Rumus';
});

updatePreview();
