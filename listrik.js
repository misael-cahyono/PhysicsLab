const canvas = document.getElementById('electric-canvas');
const ctx = canvas.getContext('2d');

const inputCircuit = document.getElementById('input-circuit');
const inputV = document.getElementById('input-v');
const inputR1 = document.getElementById('input-r1');
const inputR2 = document.getElementById('input-r2');
const groupR2 = document.getElementById('group-r2');

const valV = document.getElementById('val-v');
const valR1 = document.getElementById('val-r1');
const valR2 = document.getElementById('val-r2');

const statusBox = document.getElementById('status-box');
const outRtot = document.getElementById('out-rtot');
const outI = document.getElementById('out-i');
const outP = document.getElementById('out-p');
const outSafe = document.getElementById('out-safe');

const expCalc = document.getElementById('exp-calc');
const expReason = document.getElementById('exp-reason');

const btnSwitch = document.getElementById('btn-switch');
const btnReset = document.getElementById('btn-reset');
const btnFormula = document.getElementById('btn-formula');
const formulaPanel = document.getElementById('formula-panel');

const btnNewMission = document.getElementById('btn-new-mission');
const btnCheckMission = document.getElementById('btn-check-mission');
const challengeDesc = document.getElementById('challenge-desc');
const challengeFeedback = document.getElementById('challenge-feedback');

let circuitType = 'single';
let V = 9.0, R1 = 10, R2 = 10;
let isSwitchOn = true;
let flowOffset = 0;

let currentI = 0.90;
let targetI = null;
let missionSolved = false;

function updateSimulation() {
    circuitType = inputCircuit.value;
    V = parseFloat(inputV.value);
    R1 = parseFloat(inputR1.value);
    R2 = parseFloat(inputR2.value);

    valV.textContent = V.toFixed(1) + ' V';
    valR1.textContent = R1 + ' Ω';
    valR2.textContent = R2 + ' Ω';

    groupR2.style.display = circuitType === 'single' ? 'none' : 'block';

    let rTot = R1;
    let calcSteps = '';

    if (circuitType === 'single') {
        rTot = R1;
        calcSteps = '1. Hambatan Total (R_tot) = R₁ = ' + R1 + ' Ω<br>';
    } else if (circuitType === 'series') {
        rTot = R1 + R2;
        calcSteps = '1. Hambatan Seri (R_tot) = R₁ + R₂ = ' + R1 + ' + ' + R2 + ' = ' + rTot.toFixed(1) + ' Ω<br>';
    } else {
        rTot = (R1 * R2) / (R1 + R2);
        calcSteps = '1. Hambatan Paralel (R_tot) = (R₁ × R₂) / (R₁ + R₂) = (' + R1 + ' × ' + R2 + ') / (' + R1 + ' + ' + R2 + ') = ' + rTot.toFixed(2) + ' Ω<br>';
    }

    let I = isSwitchOn ? (V / rTot) : 0;
    const isOverload = isSwitchOn && (I > 2.5);
    if (isOverload) I = 0; // Lampu putus memutus aliran arus

    const P = isSwitchOn && !isOverload ? (V * I) : 0;
    currentI = I;

    outRtot.textContent = rTot.toFixed(2) + ' Ω';
    outI.textContent = I.toFixed(2) + ' A';
    outP.textContent = P.toFixed(2) + ' W';

    if (!isSwitchOn) {
        statusBox.className = 'status-badge status-off';
        statusBox.textContent = 'Status: Saklar Terbuka (OFF) — Tidak Ada Arus Mengalir';
        outSafe.textContent = 'Terputus (OFF)';
        outSafe.style.color = '#94a3b8';
    } else if (isOverload) {
        statusBox.className = 'status-badge status-overload';
        statusBox.textContent = '⚠️ OVERLOAD! Arus > 2.5 A — Filamen Lampu Putus!';
        outSafe.textContent = 'BAHAYA (Putus!)';
        outSafe.style.color = '#f87171';
    } else {
        statusBox.className = 'status-badge status-normal';
        statusBox.textContent = 'Status: Rangkaian Tertutup — Lampu Menyala Normal';
        outSafe.textContent = 'Aman (< 2.5 A)';
        outSafe.style.color = '#4ade80';
    }

    // Perbarui Kotak Penjelasan Otomatis
    if (!isSwitchOn) {
        expCalc.innerHTML = calcSteps + '2. Karena saklar dalam keadaan <strong>OFF (terbuka)</strong>, rangkaian terputus sehingga <strong>I = 0.00 A</strong>.';
        expReason.textContent = 'Arus listrik hanya dapat mengalir pada rangkaian tertutup (closed loop). Saat saklar dibuka, muatan elektron tidak memiliki jalur kembali ke kutub baterai sehingga lampu padam.';
    } else if (isOverload) {
        const rawI = V / rTot;
        expCalc.innerHTML = calcSteps + '2. Kuat Arus Teoritis: <code>I = V / R_tot = ' + V + ' / ' + rTot.toFixed(2) + ' = ' + rawI.toFixed(2) + ' A</code> (Melebihi batas aman 2.50 A!).';
        expReason.textContent = 'Tegangan terlalu besar dibandingkan hambatan total yang kecil menyebabkan lonjakan arus listrik melebihi kapasitas filamen bohlam (2.5 A). Panas berlebih melelehkan kawat filamen sehingga lampu putus dan arus berhenti.';
    } else {
        expCalc.innerHTML = calcSteps +
            '2. Kuat Arus (I) = <code>V / R_tot = ' + V + ' / ' + rTot.toFixed(2) + ' = ' + I.toFixed(2) + ' A</code><br>' +
            '3. Daya Listrik (P) = <code>V × I = ' + V + ' × ' + I.toFixed(2) + ' = ' + P.toFixed(2) + ' Watt</code>';

        if (circuitType === 'series') {
            expReason.textContent = 'Pada rangkaian SERI, hambatan total merupakan penjumlahan kedua lampu (' + rTot.toFixed(1) + ' Ω) sehingga hambatan makin besar dan arus mengecil. Tegangan terbagi ke dua lampu membuat nyala lampu lebih redup dibandingkan rangkaian tunggal.';
        } else if (circuitType === 'parallel') {
            expReason.textContent = 'Pada rangkaian PARALEL, hambatan total menjadi lebih kecil (' + rTot.toFixed(2) + ' Ω) daripada masing-masing hambatan lampu karena arus memiliki dua jalur cabang. Setiap lampu menerima tegangan penuh (' + V + ' V) sehingga menyala jauh lebih terang.';
        } else {
            expReason.textContent = 'Sesuai Hukum Ohm (I = V / R), kuat arus listrik berbanding lurus dengan tegangan baterai (' + V + ' V) dan berbanding terbalik dengan hambatan lampu (' + R1 + ' Ω). Makin besar daya listrik (' + P.toFixed(1) + ' W), makin terang cahaya bohlam.';
        }
    }

    if (isSwitchOn && !isOverload && I > 0) {
        flowOffset = (flowOffset + I * 1.8) % 24;
    }

    drawCircuit(I, P, isOverload);
    requestAnimationFrame(updateSimulation);
}

function drawCircuit(I, P, isOverload) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bingkai Kabel Utama
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;

    if (circuitType === 'parallel') {
        // Jalur Paralel (2 Cabang Atas & Bawah)
        ctx.beginPath();
        ctx.moveTo(110, 180); ctx.lineTo(110, 70); ctx.lineTo(250, 70);
        ctx.moveTo(250, 70); ctx.lineTo(520, 70); ctx.lineTo(520, 180);
        ctx.moveTo(250, 70); ctx.lineTo(250, 160); ctx.lineTo(520, 160);
        ctx.moveTo(110, 220); ctx.lineTo(110, 300); ctx.lineTo(520, 300); ctx.lineTo(520, 180);
        ctx.stroke();

        drawBulb(385, 70, R1, isSwitchOn && !isOverload ? (V * V / R1) : 0, isOverload);
        drawBulb(385, 160, R2, isSwitchOn && !isOverload ? (V * V / R2) : 0, isOverload);
    } else {
        // Jalur Tunggal atau Seri
        ctx.beginPath();
        ctx.moveTo(110, 160); ctx.lineTo(110, 80); ctx.lineTo(520, 80);
        ctx.lineTo(520, 290); ctx.lineTo(110, 290); ctx.lineTo(110, 220);
        ctx.stroke();

        if (circuitType === 'single') {
            drawBulb(315, 80, R1, P, isOverload);
        } else {
            const p1 = I * I * R1;
            const p2 = I * I * R2;
            drawBulb(245, 80, R1, p1, isOverload);
            drawBulb(405, 80, R2, p2, isOverload);
        }
    }

    // Gambar Baterai di Sisi Kiri
    drawBattery(110, 190);

    // Gambar Saklar di Sisi Bawah
    drawSwitch(315, circuitType === 'parallel' ? 300 : 290);

    // Gambar Titik Aliran Muatan Listrik (Elektron)
    if (isSwitchOn && !isOverload && I > 0) {
        ctx.fillStyle = '#2563eb';
        const topY = circuitType === 'parallel' ? 70 : 80;
        const botY = circuitType === 'parallel' ? 300 : 290;
        for (let x = 130 + flowOffset; x < 510; x += 24) {
            ctx.beginPath(); ctx.arc(x, topY, 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(640 - x, botY, 3.5, 0, Math.PI * 2); ctx.fill();
        }
    }
}

function drawBattery(x, y) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 22, y - 30, 44, 60);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x - 22, y - 30, 44, 15);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('+', x, y - 18);
    ctx.fillText(V + 'V', x, y + 12);
    ctx.textAlign = 'left';
}

function drawSwitch(x, y) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 30, y - 15, 60, 30);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(x - 25, y, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 25, y, 4, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = isSwitchOn ? '#16a34a' : '#dc2626';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(x - 25, y);
    if (isSwitchOn) ctx.lineTo(x + 25, y);
    else ctx.lineTo(x + 18, y - 22);
    ctx.stroke();
}

function drawBulb(x, y, resistance, power, isOverload) {
    // Efek Cahaya Kuning Bohlam
    if (power > 0 && !isOverload) {
        const glowRadius = Math.min(22 + power * 1.8, 65);
        const grad = ctx.createRadialGradient(x, y - 18, 5, x, y - 18, glowRadius);
        grad.addColorStop(0, 'rgba(250, 204, 21, 0.95)');
        grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y - 18, glowRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Kaca Bohlam
    ctx.fillStyle = isOverload ? '#475569' : (power > 0 ? '#fef08a' : '#f1f5f9');
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y - 18, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tanda Silang Jika Lampu Putus
    if (isOverload) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x - 8, y - 26); ctx.lineTo(x + 8, y - 10);

        if (btnNewMission) {
    btnNewMission.addEventListener('click', () => {
        const choices = new Array(0.60, 0.90, 1.20, 1.50, 1.80, 2.00);
        targetI = choices[Math.floor(Math.random() * choices.length)];
        missionSolved = false;
        challengeDesc.innerHTML = 'Rakit rangkaian dan atur tegangan baterai agar menghasilkan kuat arus <strong>I = ' + targetI.toFixed(2) + ' Ampere</strong> tanpa membuat lampu putus (toleransi ±0.05 A).';
        btnCheckMission.style.display = 'inline-block';
        challengeFeedback.style.display = 'none';
    });
}

if (btnCheckMission) {
    btnCheckMission.addEventListener('click', () => {
        if (targetI === null) return;
        const selisih = Math.abs(currentI - targetI);
        if (selisih <= 0.05 && currentI > 0) {
            challengeFeedback.className = 'challenge-feedback feedback-success';
            if (!missionSolved) {
                missionSolved = true;
                if (typeof updateChallengeScore === 'function') updateChallengeScore(100);
                challengeFeedback.textContent = '🎉 TEPAT! Kuat arus rangkaian ' + currentI.toFixed(2) + ' A sesuai target (+100 Poin)!';
            } else {
                challengeFeedback.textContent = '✅ Misi selesai! Klik Buat Misi Baru untuk soal berikutnya.';
            }
        } else {
            challengeFeedback.className = 'challenge-feedback feedback-fail';
            challengeFeedback.textContent = '❌ Belum pas! Kuat arus saat ini ' + currentI.toFixed(2) + ' A (Target: ' + targetI.toFixed(2) + ' A).';
        }
    });
}

if (btnFormula) {
    btnFormula.addEventListener('click', () => {
        formulaPanel.style.display = formulaPanel.style.display === 'none' ? 'block' : 'none';
        btnFormula.textContent = formulaPanel.style.display === 'none' ? 'Lihat Rumus' : 'Sembunyikan Rumus';
    });
}

updateSimulation();

