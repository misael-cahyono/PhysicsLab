const canvas = document.getElementById('energy-canvas');
const ctx = canvas.getContext('2d');

const inputH0 = document.getElementById('input-h0');
const inputM = document.getElementById('input-m');
const inputG = document.getElementById('input-g');

const valH0 = document.getElementById('val-h0');
const valM = document.getElementById('val-m');

const outEp = document.getElementById('out-ep');
const outEk = document.getElementById('out-ek');
const outEm = document.getElementById('out-em');
const outVmax = document.getElementById('out-vmax');

const expCalc = document.getElementById('exp-calc');
const expReason = document.getElementById('exp-reason');

const btnToggle = document.getElementById('btn-toggle');
const btnReset = document.getElementById('btn-reset');
const btnFormula = document.getElementById('btn-formula');
const formulaPanel = document.getElementById('formula-panel');

const btnNewMission = document.getElementById('btn-new-mission');
const btnCheckMission = document.getElementById('btn-check-mission');
const challengeDesc = document.getElementById('challenge-desc');
const challengeFeedback = document.getElementById('challenge-feedback');

let h0 = 10.0, m = 5.0, g = 9.8;
let isRunning = true, progress = 0, dir = 1;
let currentVmax = 14.00, targetVmax = null, missionSolved = false;

function getTrackHeight(u) {
    // u dari 0 (puncak kiri h0) -> 0.5 (lembah dasar h=0) -> 1.0 (bukit kanan 0.7*h0)
    if (u <= 0.5) {
        const ratio = u / 0.5;
        return h0 * 0.5 * (1 + Math.cos(Math.PI * ratio));
    } else {
        const ratio = (u - 0.5) / 0.5;
        return (h0 * 0.75) * 0.5 * (1 - Math.cos(Math.PI * ratio));
    }
}

function animateEnergy() {
    h0 = parseFloat(inputH0.value);
    m = parseFloat(inputM.value);
    g = parseFloat(inputG.value);

    valH0.textContent = h0.toFixed(1) + ' m';
    valM.textContent = m.toFixed(1) + ' kg';

    const emTotal = m * g * h0;
    const vMax = Math.sqrt(2 * g * h0);
    currentVmax = vMax;

    const currentH = getTrackHeight(progress);
    const ep = m * g * currentH;
    const ek = Math.max(0, emTotal - ep);
    const vNow = Math.sqrt((2 * ek) / m);

    if (isRunning) {
        const speedFactor = 0.003 + (vNow / 600);
        progress += dir * speedFactor;
        if (progress >= 1.0) { progress = 1.0; dir = -1; }
        else if (progress <= 0.0) { progress = 0.0; dir = 1; }
    }

    outEp.textContent = ep.toFixed(1) + ' J';
    outEk.textContent = ek.toFixed(1) + ' J';
    outEm.textContent = emTotal.toFixed(1) + ' J';
    outVmax.textContent = vMax.toFixed(2) + ' m/s';

    if (expCalc && expReason) {
        expCalc.innerHTML =
            '1. Energi Mekanik Total (EM) = <code>m · g · h₀ = ' + m.toFixed(1) + ' × ' + g + ' × ' + h0.toFixed(1) + ' = ' + emTotal.toFixed(1) + ' Joule</code><br>' +
            '2. Kecepatan Maks di Lembah (v_max) = <code>√(2 · g · h₀) = √(2 × ' + g + ' × ' + h0.toFixed(1) + ') = ' + vMax.toFixed(2) + ' m/s</code><br>' +
            '3. Posisi Saat Ini (h = ' + currentH.toFixed(1) + ' m): <code>EP = ' + ep.toFixed(1) + ' J</code> & <code>EK = ' + ek.toFixed(1) + ' J</code>';

        expReason.textContent = 'Sesuai Hukum Kekekalan Energi Mekanik (EM = EP + EK = Konstan), saat kereta meluncur turun ke lembah, Energi Potensial berkurang dan berubah sepenuhnya menjadi Energi Kinetik sehingga kecepatan mencapai titik puncak (' + vMax.toFixed(2) + ' m/s). Perhatikan bahwa massa kereta saling meniadakan dalam rumus kecepatan sehingga tidak memengaruhi v_max.';
    }

    drawEnergyScene(currentH, ep, ek, emTotal);
    requestAnimationFrame(animateEnergy);
}
function drawEnergyScene(currentH, ep, ek, emTotal) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const startX = 160, trackW = 440, groundY = 315;
    const scaleY = 220 / 15; // Skala tinggi maksimum 15 meter

    // 1. Garis Dasar Tanah
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(140, groundY); ctx.lineTo(620, groundY); ctx.stroke();

    // 2. Kurva Lintasan Roller Coaster
    ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 5;
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
        const u = i / 60;
        const px = startX + u * trackW;
        const py = groundY - getTrackHeight(u) * scaleY;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // 3. Kereta di Atas Lintasan
    const cartX = startX + progress * trackW;
    const cartY = groundY - currentH * scaleY;

    ctx.fillStyle = '#ea580c';
    ctx.beginPath(); ctx.arc(cartX, cartY - 10, 12, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#9a3412'; ctx.lineWidth = 2; ctx.stroke();

    // 4. Grafik Batang Energi (EP, EK, EM) di Sisi Kiri
    const maxBarH = 210;
    const maxPossibleEm = 20 * 9.8 * 15; // 2940 J
    const epH = (ep / maxPossibleEm) * maxBarH;
    const ekH = (ek / maxPossibleEm) * maxBarH;
    const emH = (emTotal / maxPossibleEm) * maxBarH;

    drawBar(30, groundY, 26, epH, '#0284c7', 'EP');
    drawBar(66, groundY, 26, ekH, '#dc2626', 'EK');
    drawBar(102, groundY, 26, emH, '#16a34a', 'EM');
}

function drawBar(x, baseY, w, h, color, label) {
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x, baseY - 210, w, 210);
    ctx.fillStyle = color;
    ctx.fillRect(x, baseY - h, w, h);
    ctx.fillStyle = '#1e293b'; ctx.font = 'bold 11px Segoe UI'; ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, baseY + 18);
    ctx.textAlign = 'left';
}

btnToggle.addEventListener('click', () => {
    isRunning = !isRunning;
    btnToggle.textContent = isRunning ? '⏸ Jeda Kereta' : '▶ Lanjutkan Kereta';
});

btnReset.addEventListener('click', () => {
    inputH0.value = 10.0; inputM.value = 5.0; inputG.value = 9.8;
    progress = 0; dir = 1; isRunning = true; btnToggle.textContent = '⏸ Jeda Kereta';
});

if (btnNewMission) {
    btnNewMission.addEventListener('click', () => {
        const targets = new Array(8.85, 10.84, 12.52, 14.00, 15.34, 16.57);
        targetVmax = targets[Math.floor(Math.random() * targets.length)];
        missionSolved = false;
        challengeDesc.innerHTML = 'Atur tinggi awal (h₀) & gravitasi planet agar kecepatan maksimum kereta di dasar lembah mencapai <strong>v_max = ' + targetVmax.toFixed(2) + ' m/s</strong> (±0.35 m/s).';
        btnCheckMission.style.display = 'inline-block';
        challengeFeedback.style.display = 'none';
    });
}

if (btnCheckMission) {
    btnCheckMission.addEventListener('click', () => {
        if (targetVmax === null) return;
        if (Math.abs(currentVmax - targetVmax) <= 0.35) {
            challengeFeedback.className = 'challenge-feedback feedback-success';
            if (!missionSolved) {
                missionSolved = true;
                if (typeof updateChallengeScore === 'function') updateChallengeScore(100);
                challengeFeedback.textContent = '🎉 TEPAT! Kecepatan maksimum lembah ' + currentVmax.toFixed(2) + ' m/s sesuai target (+100 Poin)!';
            } else challengeFeedback.textContent = '✅ Misi selesai! Klik Buat Misi Baru.';
        } else {
            challengeFeedback.className = 'challenge-feedback feedback-fail';
            challengeFeedback.textContent = '❌ Belum pas! Kecepatan lembah saat ini ' + currentVmax.toFixed(2) + ' m/s (Target: ' + targetVmax.toFixed(2) + ' m/s).';
        }
    });
}

if (btnFormula) {
    btnFormula.addEventListener('click', () => {
        formulaPanel.style.display = formulaPanel.style.display === 'none' ? 'block' : 'none';
        btnFormula.textContent = formulaPanel.style.display === 'none' ? 'Lihat Rumus' : 'Sembunyikan Rumus';
    });
}

animateEnergy();
