const canvas = document.getElementById('spring-canvas');
const ctx = canvas.getContext('2d');

const inputK = document.getElementById('input-k');
const inputM = document.getElementById('input-m');
const inputMode = document.getElementById('input-mode');

const valK = document.getElementById('val-k');
const valM = document.getElementById('val-m');

const outF = document.getElementById('out-f');
const outDx = document.getElementById('out-dx');
const outEp = document.getElementById('out-ep');
const outPeriod = document.getElementById('out-period');

const expCalc = document.getElementById('exp-calc');
const expReason = document.getElementById('exp-reason');

const btnReset = document.getElementById('btn-reset');
const btnFormula = document.getElementById('btn-formula');
const formulaPanel = document.getElementById('formula-panel');

const btnNewMission = document.getElementById('btn-new-mission');
const btnCheckMission = document.getElementById('btn-check-mission');
const challengeDesc = document.getElementById('challenge-desc');
const challengeFeedback = document.getElementById('challenge-feedback');

let k = 50, m = 2.0, mode = 'static';
const g = 9.8;
let time = 0, currentDx = 0.392, targetDx = null, missionSolved = false;

function animateSpring() {
    k = parseFloat(inputK.value);
    m = parseFloat(inputM.value);
    mode = inputMode.value;

    valK.textContent = k + ' N/m';
    valM.textContent = m.toFixed(1) + ' kg';

    const F = m * g;
    const dx = F / k;
    const ep = 0.5 * k * dx * dx;
    const omega = Math.sqrt(k / m);
    const period = (2 * Math.PI) / omega;
    currentDx = dx;

    outF.textContent = F.toFixed(2) + ' N';
    outDx.textContent = dx.toFixed(2) + ' m (' + (dx * 100).toFixed(1) + ' cm)';
    outEp.textContent = ep.toFixed(2) + ' J';
    outPeriod.textContent = period.toFixed(2) + ' s';

    if (expCalc && expReason) {
        expCalc.innerHTML =
            '1. Gaya Tarik Beban (F) = <code>m · g = ' + m.toFixed(1) + ' kg × 9,8 m/s² = ' + F.toFixed(2) + ' N</code><br>' +
            '2. Pertambahan Panjang (Δx) = <code>F / k = ' + F.toFixed(2) + ' / ' + k + ' = ' + dx.toFixed(2) + ' m (' + (dx * 100).toFixed(1) + ' cm)</code><br>' +
            '3. Energi Potensial (Ep) = <code>½ · k · Δx² = 0,5 × ' + k + ' × ' + dx.toFixed(2) + '² = ' + ep.toFixed(2) + ' Joule</code>';

        if (k >= 120) {
            expReason.textContent = 'Konstanta pegas bernilai besar (' + k + ' N/m), artinya pegas sangat kaku sehingga gaya tarik ' + F.toFixed(1) + ' N hanya mampu meregangkannya sedikit (' + (dx * 100).toFixed(1) + ' cm).';
        } else if (k <= 40) {
            expReason.textContent = 'Konstanta pegas bernilai kecil (' + k + ' N/m), artinya pegas bersifat lentur/lunak sehingga beban ' + m.toFixed(1) + ' kg mudah menariknya memanjang sejauh ' + (dx * 100).toFixed(1) + ' cm.';
        } else {
            expReason.textContent = 'Sesuai Hukum Hooke (Δx = F / k), pertambahan panjang pegas berbanding lurus dengan berat beban (' + F.toFixed(1) + ' N) dan berbanding terbalik dengan tingkat kekakuan pegas (' + k + ' N/m).';
        }
    }

    let extraOscillation = 0;
    if (mode === 'oscillate') {
        time += 0.03;
        extraOscillation = Math.sin(omega * time) * Math.min(dx * 55, 45);
    } else {
        time = 0;
    }

    drawSpringSystem(dx, extraOscillation);
    requestAnimationFrame(animateSpring);
}
function drawSpringSystem(dx, oscOffset) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const anchorX = 280, anchorY = 30;
    const baseLength = 90;
    const stretchPx = Math.min(dx * 110, 160);
    const totalLength = baseLength + stretchPx + oscOffset;

    ctx.fillStyle = '#334155';
    ctx.fillRect(anchorX - 90, anchorY - 12, 180, 12);

    const rulerX = 130;
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(rulerX, anchorY); ctx.lineTo(rulerX, canvas.height - 25); ctx.stroke();

    ctx.fillStyle = '#475569'; ctx.font = '11px Segoe UI';
    for (let cm = 0; cm <= 250; cm += 25) {
        const ry = anchorY + baseLength + (cm / 100) * 110;
        if (ry < canvas.height - 25) {
            ctx.fillRect(rulerX - 6, ry, 12, 1.5);
            ctx.fillText(cm + ' cm', rulerX - 52, ry + 4);
        }
    }

    ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(rulerX, anchorY + baseLength); ctx.lineTo(anchorX + 60, anchorY + baseLength); ctx.stroke();
    ctx.restore();

    const coils = 14;
    const stepY = totalLength / coils;
    ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(anchorX, anchorY);
    for (let i = 1; i < coils; i++) {
        const offsetX = (i % 2 === 0) ? -22 : 22;
        ctx.lineTo(anchorX + offsetX, anchorY + i * stepY);
    }
    ctx.lineTo(anchorX, anchorY + totalLength);
    ctx.stroke();

    const boxW = 54 + m * 3, boxH = 44 + m * 2;
    const boxY = anchorY + totalLength;
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(anchorX - boxW / 2, boxY, boxW, boxH);
    ctx.strokeStyle = '#9a3412'; ctx.lineWidth = 2;
    ctx.strokeRect(anchorX - boxW / 2, boxY, boxW, boxH);

    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 12px Segoe UI'; ctx.textAlign = 'center';
    ctx.fillText(m.toFixed(1) + ' kg', anchorX, boxY + boxH / 2 + 4);
    ctx.textAlign = 'left';

    ctx.save(); ctx.globalAlpha = 0.6; ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(rulerX, boxY); ctx.lineTo(anchorX - boxW / 2, boxY); ctx.stroke();
    ctx.restore();
}

btnReset.addEventListener('click', () => {
    inputK.value = 50; inputM.value = 2.0; inputMode.value = 'static'; time = 0;
});

if (btnNewMission) {
    btnNewMission.addEventListener('click', () => {
        const targets = new Array(0.20, 0.35, 0.49, 0.65, 0.80, 0.98);
        targetDx = targets[Math.floor(Math.random() * targets.length)];
        missionSolved = false;
        challengeDesc.innerHTML = 'Atur konstanta pegas (k) & massa beban (m) agar pegas meregang sejauh <strong>Δx = ' + targetDx.toFixed(2) + ' m</strong> (±0.03 m).';
        btnCheckMission.style.display = 'inline-block';
        challengeFeedback.style.display = 'none';
    });
}

if (btnCheckMission) {
    btnCheckMission.addEventListener('click', () => {
        if (targetDx === null) return;
        if (Math.abs(currentDx - targetDx) <= 0.03) {
            challengeFeedback.className = 'challenge-feedback feedback-success';
            if (!missionSolved) {
                missionSolved = true;
                if (typeof updateChallengeScore === 'function') updateChallengeScore(100);
                challengeFeedback.textContent = '🎉 TEPAT! Pertambahan panjang ' + currentDx.toFixed(2) + ' m sesuai target (+100 Poin)!';
            } else challengeFeedback.textContent = '✅ Misi selesai! Klik Buat Misi Baru.';
        } else {
            challengeFeedback.className = 'challenge-feedback feedback-fail';
            challengeFeedback.textContent = '❌ Belum pas! Regangan saat ini ' + currentDx.toFixed(2) + ' m (Target: ' + targetDx.toFixed(2) + ' m).';
        }
    });
}

if (btnFormula) {
    btnFormula.addEventListener('click', () => {
        formulaPanel.style.display = formulaPanel.style.display === 'none' ? 'block' : 'none';
        btnFormula.textContent = formulaPanel.style.display === 'none' ? 'Lihat Rumus' : 'Sembunyikan Rumus';
    });
}

animateSpring();
