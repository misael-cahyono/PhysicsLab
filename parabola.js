const canvas = document.getElementById('parabola-canvas');
const ctx = canvas.getContext('2d');

const inputV0 = document.getElementById('input-v0');
const inputAngle = document.getElementById('input-angle');
const inputG = document.getElementById('input-g');

const valV0 = document.getElementById('val-v0');
const valAngle = document.getElementById('val-angle');

const outT = document.getElementById('out-t');
const outPos = document.getElementById('out-pos');
const outYmax = document.getElementById('out-ymax');
const outXmax = document.getElementById('out-xmax');

const expCalc = document.getElementById('exp-calc');
const expReason = document.getElementById('exp-reason');

const btnFire = document.getElementById('btn-fire');
const btnReset = document.getElementById('btn-reset');
const btnFormula = document.getElementById('btn-formula');
const formulaPanel = document.getElementById('formula-panel');

const historyBody = document.getElementById('history-body');
const btnClearHistory = document.getElementById('btn-clear-history');

const btnNewMission = document.getElementById('btn-new-mission');
const btnCheckMission = document.getElementById('btn-check-mission');
const challengeDesc = document.getElementById('challenge-desc');
const challengeFeedback = document.getElementById('challenge-feedback');

let v0 = 25, angleDeg = 45, g = 9.8;
let isFiring = false, t = 0, scale = 4.5;
let currentXmax = 63.78, targetDistance = null, missionSolved = false, historyCount = 0;

const originX = 45, originY = canvas.height - 35;

function updateCalculations() {
    v0 = parseFloat(inputV0.value);
    angleDeg = parseFloat(inputAngle.value);
    g = parseFloat(inputG.value);

    valV0.textContent = v0 + ' m/s';
    valAngle.textContent = angleDeg + '°';

    const rad = angleDeg * (Math.PI / 180);
    const tTotal = (2 * v0 * Math.sin(rad)) / g;
    const yMax = Math.pow(v0 * Math.sin(rad), 2) / (2 * g);
    const xMax = (Math.pow(v0, 2) * Math.sin(2 * rad)) / g;
    currentXmax = xMax;

    outT.textContent = tTotal.toFixed(2) + ' s';
    outYmax.textContent = yMax.toFixed(2) + ' m';
    outXmax.textContent = xMax.toFixed(2) + ' m';
    if (!isFiring) outPos.textContent = '0.0m, 0.0m';

    if (expCalc && expReason) {
        expCalc.innerHTML =
            '1. Tinggi Maks (Y_max) = <code>(v₀² · sin² ' + angleDeg + '°) / (2 · ' + g + ') = ' + yMax.toFixed(2) + ' m</code><br>' +
            '2. Jarak Terjauh (X_max) = <code>(v₀² · sin ' + (angleDeg * 2) + '°) / ' + g + ' = ' + xMax.toFixed(2) + ' m</code><br>' +
            '3. Waktu Udara (t_total) = <code>(2 · ' + v0 + ' · sin ' + angleDeg + '°) / ' + g + ' = ' + tTotal.toFixed(2) + ' s</code>';

        if (angleDeg === 45) {
            expReason.textContent = 'Sudut tembak 45° menghasilkan nilai sin(2θ) = sin(90°) = 1 (maksimum), sehingga keseimbangan antara kecepatan mendatar dan vertikal menghasilkan jarak jatuh terjauh.';
        } else if (angleDeg > 45) {
            expReason.textContent = 'Karena sudut elevasi (' + angleDeg + '°) lebih besar dari 45°, komponen kecepatan vertikal lebih dominan sehingga peluru melambung lebih tinggi (' + yMax.toFixed(1) + ' m) dan berada di udara lebih lama, namun jarak mendatarnya berkurang.';
        } else {
            expReason.textContent = 'Karena sudut elevasi (' + angleDeg + '°) lebih kecil dari 45°, lintasan peluru cenderung mendatar dan rendah (' + yMax.toFixed(1) + ' m) sehingga peluru lebih cepat menyentuh tanah sebelum mencapai jarak optimal.';
        }
    }

    const availW = canvas.width - 90, availH = canvas.height - 70;
    scale = Math.min(availW / Math.max(xMax, 20), availH / Math.max(yMax, 10), 6);

    return { rad: rad, tTotal: tTotal, yMax: yMax, xMax: xMax };
}
function drawScene() {
    const phys = updateCalculations();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#334155'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(20, originY); ctx.lineTo(canvas.width - 20, originY); ctx.stroke();

    ctx.fillStyle = '#64748b'; ctx.font = '10px Segoe UI';
    for (let m = 0; m <= 150; m += 20) {
        const px = originX + m * scale;
        if (px < canvas.width - 25) {
            ctx.fillRect(px, originY, 1.5, 6);
            ctx.fillText(m + 'm', px - 8, originY + 18);
        }
    }

    if (targetDistance !== null) {
        const tx = originX + targetDistance * scale;
        if (tx < canvas.width - 20) {
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(tx - 1, originY - 28, 3, 28);
            ctx.beginPath(); ctx.moveTo(tx + 2, originY - 28); ctx.lineTo(tx + 18, originY - 22); ctx.lineTo(tx + 2, originY - 16); ctx.fill();
        }
    }

    ctx.save(); ctx.globalAlpha = 0.35; ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let step = 0; step <= 40; step++) {
        const st = (step / 40) * phys.tTotal;
        const sx = originX + (v0 * Math.cos(phys.rad) * st) * scale;
        const sy = originY - (v0 * Math.sin(phys.rad) * st - 0.5 * g * st * st) * scale;
        if (step === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    }
    ctx.stroke(); ctx.restore();

    ctx.save();
    ctx.translate(originX, originY - 8);
    ctx.rotate(-phys.rad);
    ctx.fillStyle = '#1e293b'; ctx.fillRect(0, -7, 34, 14);
    ctx.restore();
    ctx.fillStyle = '#2563eb'; ctx.beginPath(); ctx.arc(originX, originY - 8, 10, 0, Math.PI * 2); ctx.fill();

    let curX = v0 * Math.cos(phys.rad) * t;
    let curY = v0 * Math.sin(phys.rad) * t - 0.5 * g * t * t;
    if (curY < 0) curY = 0;

    const ballX = originX + curX * scale;
    const ballY = originY - 8 - curY * scale;
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(ballX, ballY, 7, 0, Math.PI * 2); ctx.fill();

    if (isFiring) outPos.textContent = curX.toFixed(1) + 'm, ' + curY.toFixed(1) + 'm';
}

function animate() {
    if (!isFiring) return;
    const phys = updateCalculations();
    t += 0.04;
    if (t >= phys.tTotal) {
        t = phys.tTotal;
        isFiring = false;
        outPos.textContent = phys.xMax.toFixed(1) + 'm, 0.0m';
        addHistoryRow(v0, angleDeg, phys.yMax, phys.xMax);
        drawScene();
        return;
    }
    drawScene();
    requestAnimationFrame(animate);
}

function addHistoryRow(v, ang, ym, xm) {
    if (!historyBody) return;
    historyCount++;
    const row = document.createElement('tr');
    row.innerHTML = '<td>' + historyCount + '</td><td>' + v + '</td><td>' + ang + '°</td><td>' + ym.toFixed(2) + '</td><td>' + xm.toFixed(2) + '</td>';
    historyBody.prepend(row);
}

btnFire.addEventListener('click', () => { t = 0; isFiring = true; animate(); });
btnReset.addEventListener('click', () => { isFiring = false; t = 0; drawScene(); });
inputV0.addEventListener('input', () => { isFiring = false; t = 0; drawScene(); });
inputAngle.addEventListener('input', () => { isFiring = false; t = 0; drawScene(); });
inputG.addEventListener('change', () => { isFiring = false; t = 0; drawScene(); });

if (btnClearHistory) btnClearHistory.addEventListener('click', () => { historyBody.innerHTML = ''; historyCount = 0; });

if (btnNewMission) {
    btnNewMission.addEventListener('click', () => {
        targetDistance = Math.floor(Math.random() * 80) + 20;
        missionSolved = false;
        challengeDesc.innerHTML = 'Atur kecepatan & sudut agar peluru jatuh tepat di jarak <strong>X_max = ' + targetDistance + ' meter</strong> (±2.0 m).';
        btnCheckMission.style.display = 'inline-block';
        challengeFeedback.style.display = 'none';
        drawScene();
    });
}

if (btnCheckMission) {
    btnCheckMission.addEventListener('click', () => {
        if (targetDistance === null) return;
        if (Math.abs(currentXmax - targetDistance) <= 2.0) {
            challengeFeedback.className = 'challenge-feedback feedback-success';
            if (!missionSolved) {
                missionSolved = true;
                if (typeof updateChallengeScore === 'function') updateChallengeScore(100);
                challengeFeedback.textContent = '🎉 TEPAT SASARAN! Jarak ' + currentXmax.toFixed(1) + ' m (+100 Poin)!';
            } else challengeFeedback.textContent = '✅ Misi selesai! Klik Buat Misi Baru.';
        } else {
            challengeFeedback.className = 'challenge-feedback feedback-fail';
            challengeFeedback.textContent = '❌ Meleset! Jarak saat ini ' + currentXmax.toFixed(1) + ' m (Target: ' + targetDistance + ' m).';
        }
    });
}

if (btnFormula) {
    btnFormula.addEventListener('click', () => {
        formulaPanel.style.display = formulaPanel.style.display === 'none' ? 'block' : 'none';
        btnFormula.textContent = formulaPanel.style.display === 'none' ? 'Lihat Rumus' : 'Sembunyikan Rumus';
    });
}

drawScene();
