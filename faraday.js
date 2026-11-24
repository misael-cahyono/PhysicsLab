const canvas = document.getElementById('faraday-canvas');
const ctx = canvas.getContext('2d');

const inputN = document.getElementById('input-n');
const inputSpeed = document.getElementById('input-speed');
const inputB = document.getElementById('input-b');

const valN = document.getElementById('val-n');
const valSpeed = document.getElementById('val-speed');
const valB = document.getElementById('val-b');

const statusBox = document.getElementById('status-box');
const outEmf = document.getElementById('out-emf');
const outI = document.getElementById('out-i');
const outDir = document.getElementById('out-dir');
const outGalv = document.getElementById('out-galv');

const expCalc = document.getElementById('exp-calc');
const expReason = document.getElementById('exp-reason');

const btnAuto = document.getElementById('btn-auto');
const btnFlip = document.getElementById('btn-flip');
const btnFormula = document.getElementById('btn-formula');
const formulaPanel = document.getElementById('formula-panel');

const btnNewMission = document.getElementById('btn-new-mission');
const btnCheckMission = document.getElementById('btn-check-mission');
const challengeDesc = document.getElementById('challenge-desc');
const challengeFeedback = document.getElementById('challenge-feedback');

let N = 100, speed = 3.0, B = 1.0;
let isMoving = true;
let isNorthRight = true; // Kutub Utara menghadap kumparan
let magnetX = 110;
let direction = 1; // 1 = bergerak ke kanan (masuk), -1 = ke kiri (keluar)

let currentMaxEmf = 6.00;
let targetEmf = null;
let missionSolved = false;

const coilCenterX = 420;
const coilY = 190;
const R_lamp = 10; // Hambatan lampu 10 Ohm

function animateFaraday() {
    N = parseInt(inputN.value);
    speed = parseFloat(inputSpeed.value);
    B = parseFloat(inputB.value);

    valN.textContent = N + ' Lilitan';
    valSpeed.textContent = speed.toFixed(1) + ' m/s';
    valB.textContent = B.toFixed(1) + ' Tesla';

    // Rumus GGL Puncak: emf_max = N * B * L_eff * v (dengan faktor skala edukasi 0.02)
    const maxEmf = N * B * speed * 0.02;
    currentMaxEmf = maxEmf;

    let instantEmf = 0;
    let statusDirText = 'Diam (Berhenti)';
    let galvText = '0 (Tengah / Netral)';

    if (isMoving) {
        magnetX += direction * speed * 1.1;
        if (magnetX >= 360) {
            magnetX = 360;
            direction = -1;
        } else if (magnetX <= 90) {
            magnetX = 90;
            direction = 1;
        }

        // Kedekatan magnet ke kumparan menentukan besar fluks sesaat
        const dist = Math.abs(coilCenterX - (magnetX + 60));
        const proximity = Math.max(0, 1 - (dist / 260));
        const polarity = (isNorthRight ? 1 : -1) * direction;
        instantEmf = maxEmf * proximity * polarity;

        statusBox.className = 'status-badge status-induksi';
        statusBox.textContent = 'Status: Magnet Bergerak — Fluks Berubah & Arus Induksi Mengalir!';
        statusDirText = direction === 1 ? 'Masuk ke Kumparan →' : '← Keluar dari Kumparan';

        if (Math.abs(instantEmf) < 0.15) {
            galvText = '0 (Mendekati Netral)';
        } else if (instantEmf > 0) {
            galvText = 'Menyimpang Kanan (+)';
        } else {
            galvText = 'Menyimpang Kiri (-)';
        }
    } else {
        statusBox.className = 'status-badge status-diam';
        statusBox.textContent = 'Status: Magnet Diam (v = 0) — Tidak Ada Perubahan Fluks (ε = 0 V)';
    }

    const maxCurrent = maxEmf / R_lamp;

    outEmf.textContent = maxEmf.toFixed(2) + ' Volt';
    outI.textContent = (isMoving ? maxCurrent : 0).toFixed(2) + ' A';
    outDir.textContent = statusDirText;
    outGalv.textContent = galvText;

    // Perbarui Kotak Penjelasan Otomatis
    expCalc.innerHTML =
        '1. GGL Induksi Puncak (ε_max) = <code>N · B · l · v</code><br>' +
        '2. Substitusi: <code>ε_max = ' + N + ' lilitan × ' + B.toFixed(1) + ' T × 0,02 m × ' + speed.toFixed(1) + ' m/s = ' + maxEmf.toFixed(2) + ' Volt</code><br>' +
        '3. Arus Induksi Puncak (R = 10 Ω): <code>I = ε / R = ' + maxEmf.toFixed(2) + ' / 10 = ' + maxCurrent.toFixed(2) + ' A</code>.';

    if (!isMoving) {
        expReason.textContent = 'Menurut Hukum Faraday, GGL induksi hanya muncul jika terjadi PERUBAHAN fluks magnetik (ΔΦ/Δt ≠ 0). Saat magnet diam di dalam maupun di luar kumparan, jumlah garis gaya magnet tidak berubah sehingga lampu padam dan jarum Galvanometer kembali ke angka nol.';
    } else {
        expReason.textContent = 'Gerakan magnet batang (' + speed.toFixed(1) + ' m/s) mengubah kerapatan garis medan magnet yang menembus ' + N + ' lilitan kumparan secara terus-menerus sehingga membangkitkan tegangan induksi hingga ' + maxEmf.toFixed(2) + ' V. Sesuai Hukum Lenz, arah simpangan jarum Galvanometer berbalik saat magnet bergerak masuk dibandingkan saat keluar.';
    }

    drawFaradayScene(instantEmf, maxEmf);
    requestAnimationFrame(animateFaraday);
}

function drawFaradayScene(instantEmf, maxEmf) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Kabel Penghubung Kumparan ke Lampu & Galvanometer Atas
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(coilCenterX - 45, coilY - 40);
    ctx.lineTo(coilCenterX - 45, 65);
    ctx.lineTo(310, 65);
    ctx.moveTo(530, 65);
    ctx.lineTo(coilCenterX + 45, 65);
    ctx.lineTo(coilCenterX + 45, coilY - 40);
    ctx.stroke();

    // 2. Bohlam Lampu Indikator (Kiri Atas)
    const brightness = Math.min(1, Math.abs(instantEmf) / 8);
    if (brightness > 0.05) {
        const glow = ctx.createRadialGradient(355, 65, 4, 355, 65, 20 + brightness * 35);
        glow.addColorStop(0, 'rgba(250, 204, 21, ' + brightness + ')');
        glow.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(355, 65, 20 + brightness * 35, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = brightness > 0.05 ? '#fef08a' : '#f1f5f9';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(355, 65, 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // 3. Meteran Galvanometer (Kanan Atas)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(485, 65, 28, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 10px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('G', 485, 84);
    ctx.fillText('-   0   +', 485, 50);

    // Jarum Galvanometer
    const needleAngle = Math.max(-0.9, Math.min(0.9, instantEmf / 10));
    ctx.save();
    ctx.translate(485, 72);
    ctx.rotate(needleAngle);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -22); ctx.stroke();
    ctx.restore();
    ctx.textAlign = 'left';

    // 4. Kumparan Kawat Tembaga (Silinder)
    const visualLoops = Math.min(24, Math.max(8, Math.floor(N / 8)));
    const coilW = 110;
    const startCoilX = coilCenterX - coilW / 2;
    const step = coilW / visualLoops;

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4;
    for (let i = 0; i < visualLoops; i++) {
        const lx = startCoilX + i * step;
        ctx.beginPath();
        ctx.ellipse(lx, coilY, 8, 42, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    // 5. Magnet Batang (Utara Merah, Selatan Biru)
    const magW = 120, magH = 34;
    const magY = coilY - magH / 2;

    // Garis Medan Magnet Halus di Sekitar Magnet
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(magnetX + magW / 2, coilY, 85, 45, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Separuh Kiri Magnet
    ctx.fillStyle = isNorthRight ? '#2563eb' : '#dc2626';
    ctx.fillRect(magnetX, magY, magW / 2, magH);

    // Separuh Kanan Magnet
    ctx.fillStyle = isNorthRight ? '#dc2626' : '#2563eb';
    ctx.fillRect(magnetX + magW / 2, magY, magW / 2, magH);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.strokeRect(magnetX, magY, magW, magH);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(isNorthRight ? 'S' : 'U', magnetX + magW * 0.25, coilY + 5);
    ctx.fillText(isNorthRight ? 'U' : 'S', magnetX + magW * 0.75, coilY + 5);
    ctx.textAlign = 'left';
}

btnAuto.addEventListener('click', () => {
    isMoving = !isMoving;
    btnAuto.textContent = isMoving ? '⏸ Hentikan Magnet' : '▶ Gerakkan Magnet';
});

btnFlip.addEventListener('click', () => {
    isNorthRight = !isNorthRight;
});

if (btnNewMission) {
    btnNewMission.addEventListener('click', () => {
        const choices = new Array(4.00, 6.00, 9.00, 12.00, 15.00, 18.00);
        targetEmf = choices[Math.floor(Math.random() * choices.length)];
        missionSolved = false;
        challengeDesc.innerHTML = 'Atur jumlah lilitan (N), kecepatan magnet (v), dan kekuatan magnet (B) untuk menghasilkan GGL Induksi Puncak <strong>ε_max = ' + targetEmf.toFixed(2) + ' Volt</strong> (toleransi ±0.40 V).';
        btnCheckMission.style.display = 'inline-block';
        challengeFeedback.style.display = 'none';
    });
}

if (btnCheckMission) {
    btnCheckMission.addEventListener('click', () => {
        if (targetEmf === null) return;
        const selisih = Math.abs(currentMaxEmf - targetEmf);
        if (selisih <= 0.40) {
            challengeFeedback.className = 'challenge-feedback feedback-success';
            if (!missionSolved) {
                missionSolved = true;
                if (typeof updateChallengeScore === 'function') updateChallengeScore(100);
                challengeFeedback.textContent = '🎉 TEPAT! GGL Induksi puncak ' + currentMaxEmf.toFixed(2) + ' V sesuai target (+100 Poin)!';
            } else {
                challengeFeedback.textContent = '✅ Misi selesai! Klik Buat Misi Baru untuk tantangan berikutnya.';
            }
        } else {
challengeFeedback.className = 'challenge-feedback feedback-fail';
challengeFeedback.textContent = '❌ Belum pas! GGL Induksi saat ini ' + currentMaxEmf.toFixed(2) + ' V (Target: ' + targetEmf.toFixed(2) + ' V).';
}
});
}
if (btnFormula) {
btnFormula.addEventListener('click', () => {
formulaPanel.style.display = formulaPanel.style.display === 'none' ? 'block' : 'none';
btnFormula.textContent = formulaPanel.style.display === 'none' ? 'Lihat Rumus' : 'Sembunyikan Rumus';
});
}
animateFaraday();
