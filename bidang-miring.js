const canvas = document.getElementById('incline-canvas');
const ctx = canvas.getContext('2d');

const inputTheta = document.getElementById('input-theta');
const inputMass = document.getElementById('input-mass');
const inputMu = document.getElementById('input-mu');

const valTheta = document.getElementById('val-theta');
const valMass = document.getElementById('val-mass');
const valMu = document.getElementById('val-mu');

const statusBox = document.getElementById('status-box');
const outWx = document.getElementById('out-wx');
const outFg = document.getElementById('out-fg');
const outA = document.getElementById('out-a');
const outN = document.getElementById('out-n');

const expCalc = document.getElementById('exp-calc');
const expReason = document.getElementById('exp-reason');

const btnSlide = document.getElementById('btn-slide');
const btnReset = document.getElementById('btn-reset');
const btnFormula = document.getElementById('btn-formula');
const formulaPanel = document.getElementById('formula-panel');

const btnNewMission = document.getElementById('btn-new-mission');
const btnCheckMission = document.getElementById('btn-check-mission');
const challengeDesc = document.getElementById('challenge-desc');
const challengeFeedback = document.getElementById('challenge-feedback');

let thetaDeg = 30, mass = 5.0, mu = 0.25;
const g = 9.8;
let slideDist = 0, slideVel = 0, isSliding = false;
let currentAccel = 2.78, targetAccel = null, missionSolved = false;

function animateIncline() {
    thetaDeg = parseFloat(inputTheta.value);
    mass = parseFloat(inputMass.value);
    mu = parseFloat(inputMu.value);

    valTheta.textContent = thetaDeg + '°';
    valMass.textContent = mass.toFixed(1) + ' kg';
    valMu.textContent = mu.toFixed(2);

    const rad = thetaDeg * (Math.PI / 180);
    const weight = mass * g;
    const wx = weight * Math.sin(rad);
    const normal = weight * Math.cos(rad);
    const fMax = mu * normal;

    let fg = fMax;
    let accel = 0;

    if (wx > fMax) {
        accel = (wx - fMax) / mass;
        statusBox.className = 'status-badge status-meluncur';
        statusBox.textContent = 'Status: Balok MELUNCUR TURUN (Gaya tarik > Gaya gesek)';
    } else {
        fg = wx;
        accel = 0;
        isSliding = false;
        statusBox.className = 'status-badge status-diam';
        statusBox.textContent = 'Status: Balok DIAM TERTAHAN (Gaya gesek menahan balok)';
    }
    currentAccel = accel;

    outWx.textContent = wx.toFixed(2) + ' N';
    outFg.textContent = fg.toFixed(2) + ' N';
    outA.textContent = accel.toFixed(2) + ' m/s²';
    outN.textContent = normal.toFixed(2) + ' N';

    if (expCalc && expReason) {
        expCalc.innerHTML =
            '1. Gaya Tarik Turun (w·sin θ) = <code>' + mass.toFixed(1) + ' × 9,8 × sin ' + thetaDeg + '° = ' + wx.toFixed(2) + ' N</code><br>' +
            '2. Gaya Gesek Maks (μ·N) = <code>' + mu.toFixed(2) + ' × ' + normal.toFixed(2) + ' N = ' + fMax.toFixed(2) + ' N</code><br>' +
            '3. Percepatan (a) = <code>(w·sin θ - f_gesek) / m = ' + accel.toFixed(2) + ' m/s²</code>';

        if (accel > 0) {
            expReason.textContent = 'Komponen gaya berat yang menarik balok sejajar bidang miring (' + wx.toFixed(1) + ' N) lebih besar daripada gaya gesek maksimum permukaan (' + fMax.toFixed(1) + ' N). Sesuai Hukum II Newton, resultan gaya ke bawah menghasilkan percepatan sebesar ' + accel.toFixed(2) + ' m/s².';
        } else {
            expReason.textContent = 'Komponen gaya tarik ke bawah (' + wx.toFixed(1) + ' N) belum cukup kuat untuk mengatasi gaya gesek statis maksimum permukaan (' + fMax.toFixed(1) + ' N), sehingga balok tetap diam seimbang di atas bidang miring.';
        }
    }

    if (isSliding && accel > 0) {
        slideVel += accel * 0.08;
        slideDist += slideVel;
        if (slideDist > 260) {
            slideDist = 260;
            isSliding = false;
        }
    }

    drawInclineScene(rad, wx, fg, normal);
    requestAnimationFrame(animateIncline);
}
function drawInclineScene(rad, wx, fg, normal) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const baseX = 110, baseY = 310, rampLen = 400;
    const topX = baseX;
    const topY = baseY - rampLen * Math.sin(rad);
    const rightX = baseX + rampLen * Math.cos(rad);
    const rightY = baseY;

    // 1. Segitiga Bidang Miring
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(rightX, rightY);
    ctx.lineTo(baseX, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Label Sudut Theta
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px Segoe UI';
    ctx.fillText(thetaDeg + '°', rightX - 42, rightY - 8);

    // 2. Posisi & Gambar Balok di Atas Bidang Miring
    const startOffset = 55 + slideDist;
    const bx = topX + startOffset * Math.cos(rad);
    const by = topY + startOffset * Math.sin(rad);
    const boxW = 46, boxH = 34;

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(rad);

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(-boxW / 2, -boxH, boxW, boxH);
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2;
    ctx.strokeRect(-boxW / 2, -boxH, boxW, boxH);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(mass.toFixed(0) + 'kg', 0, -boxH / 2 + 4);
    ctx.textAlign = 'left';

    // Panah Gaya Tarik Turun (Hijau ke kanan bawah)
    drawVector(0, -boxH / 2, Math.min(25 + wx * 0.6, 85), -boxH / 2, '#16a34a', 'w·sinθ');
    // Panah Gaya Gesek (Merah ke kiri atas)
    if (fg > 0.1) {
        drawVector(0, -boxH / 2, -Math.min(25 + fg * 0.6, 85), -boxH / 2, '#dc2626', 'f_gesek');
    }
    // Panah Gaya Normal (Oranye tegak lurus ke atas)
    drawVector(0, -boxH / 2, 0, -boxH / 2 - Math.min(25 + normal * 0.5, 75), '#ea580c', 'N');

    ctx.restore();
}

function drawVector(x1, y1, x2, y2, color, label) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.fillRect(x2 - 3, y2 - 3, 6, 6);
    ctx.font = 'bold 10px Segoe UI';
    ctx.fillText(label, x2 + 4, y2 - 4);
}

btnSlide.addEventListener('click', () => {
    slideDist = 0; slideVel = 0; isSliding = true;
});

btnReset.addEventListener('click', () => {
    inputTheta.value = 30; inputMass.value = 5; inputMu.value = 0.25;
    slideDist = 0; slideVel = 0; isSliding = false;
});

inputTheta.addEventListener('input', () => { slideDist = 0; slideVel = 0; isSliding = false; });
inputMu.addEventListener('input', () => { slideDist = 0; slideVel = 0; isSliding = false; });

if (btnNewMission) {
    btnNewMission.addEventListener('click', () => {
        const targets = new Array(1.20, 2.00, 2.78, 3.50, 4.20, 5.00);
        targetAccel = targets[Math.floor(Math.random() * targets.length)];
        missionSolved = false;
        challengeDesc.innerHTML = 'Atur sudut kemiringan (θ) & koefisien gesek (μ) agar balok meluncur dengan percepatan <strong>a = ' + targetAccel.toFixed(2) + ' m/s²</strong> (±0.25 m/s²).';
        btnCheckMission.style.display = 'inline-block';
        challengeFeedback.style.display = 'none';
    });
}

if (btnCheckMission) {
    btnCheckMission.addEventListener('click', () => {
        if (targetAccel === null) return;
        if (Math.abs(currentAccel - targetAccel) <= 0.25) {
            challengeFeedback.className = 'challenge-feedback feedback-success';
            if (!missionSolved) {
                missionSolved = true;
                if (typeof updateChallengeScore === 'function') updateChallengeScore(100);
                challengeFeedback.textContent = '🎉 TEPAT! Percepatan ' + currentAccel.toFixed(2) + ' m/s² sesuai target (+100 Poin)!';
            } else challengeFeedback.textContent = '✅ Misi selesai! Klik Buat Misi Baru.';
        } else {
            challengeFeedback.className = 'challenge-feedback feedback-fail';
            challengeFeedback.textContent = '❌ Belum pas! Percepatan saat ini ' + currentAccel.toFixed(2) + ' m/s² (Target: ' + targetAccel.toFixed(2) + ' m/s²).';
        }
    });
}

if (btnFormula) {
    btnFormula.addEventListener('click', () => {
        formulaPanel.style.display = formulaPanel.style.display === 'none' ? 'block' : 'none';
        btnFormula.textContent = formulaPanel.style.display === 'none' ? 'Lihat Rumus' : 'Sembunyikan Rumus';
    });
}

animateIncline();
