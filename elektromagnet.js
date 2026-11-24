const canvas = document.getElementById('magnet-canvas');
const ctx = canvas.getContext('2d');

const inputN = document.getElementById('input-n');
const inputI = document.getElementById('input-i');
const inputCore = document.getElementById('input-core');

const valN = document.getElementById('val-n');
const valI = document.getElementById('val-i');

const statusBox = document.getElementById('status-box');
const outB = document.getElementById('out-b');
const outForce = document.getElementById('out-force');
const outClips = document.getElementById('out-clips');
const outPole = document.getElementById('out-pole');

const expCalc = document.getElementById('exp-calc');
const expReason = document.getElementById('exp-reason');

const btnReverse = document.getElementById('btn-reverse');
const btnReset = document.getElementById('btn-reset');
const btnFormula = document.getElementById('btn-formula');
const formulaPanel = document.getElementById('formula-panel');

const btnNewMission = document.getElementById('btn-new-mission');
const btnCheckMission = document.getElementById('btn-check-mission');
const challengeDesc = document.getElementById('challenge-desc');
const challengeFeedback = document.getElementById('challenge-feedback');

let N = 50, I = 2.0, muR = 4;
let isReversed = false;
let currentLiftedClips = 8;
let targetClips = null;
let missionSolved = false;
let pulsePhase = 0;

const clipsData = new Array();
for (let c = 0; c < 20; c++) {
    clipsData.push({
        baseX: 160 + (c % 10) * 35 + ((c * 7) % 10),
        baseY: 305 + Math.floor(c / 10) * 18,
        angle: ((c * 37) % 60 - 30) * (Math.PI / 180)
    });
}

function updateElectromagnet() {
    N = parseInt(inputN.value);
    I = parseFloat(inputI.value);
    muR = parseFloat(inputCore.value);

    valN.textContent = N + ' Lilitan';
    valI.textContent = I.toFixed(1) + ' A';

    const L = 0.10;
    const mu0 = 4 * Math.PI * 1e-7;
    const B_tesla = muR * mu0 * (N * I) / L;
    const B_mT = B_tesla * 1000;

    const relativeForce = Math.round(muR * N * I);
    const liftedClips = I === 0 ? 0 : Math.min(20, Math.round((relativeForce / 1000) * 20));
    currentLiftedClips = liftedClips;

    const leftPole = isReversed ? 'Selatan (S)' : 'Utara (U)';

    outB.textContent = B_mT.toFixed(2) + ' mT';
    outForce.textContent = relativeForce + ' Satuan';
    outClips.textContent = liftedClips + ' / 20 Klip';
    outPole.textContent = I === 0 ? 'Netral (Mati)' : (isReversed ? 'Kiri: S | Kanan: U' : 'Kiri: U | Kanan: S');

    if (I === 0) {
        statusBox.className = 'status-badge status-mati';
        statusBox.textContent = 'Status: Tidak Ada Arus Listrik (I = 0 A) — Sifat Magnet Hilang';
    } else {
        statusBox.className = 'status-badge status-aktif';
        statusBox.textContent = 'Status: Elektromagnet Aktif — Mengangkat ' + liftedClips + ' Klip Logam';
    }

    const coreName = muR === 1 ? 'Udara/Plastik (μ_r = 1)' : (muR === 4 ? 'Paku Besi Lunak (μ_r = 4)' : 'Baja Silikon (μ_r = 6)');
    expCalc.innerHTML =
        '1. Induksi Magnet (B) = <code>μ_r · μ₀ · (N · I) / L</code><br>' +
        '2. Substitusi: <code>B = ' + muR + ' × (4π×10⁻⁷) × (' + N + ' × ' + I.toFixed(1) + ') / 0.10 m = ' + B_mT.toFixed(2) + ' mT</code><br>' +
        '3. Gaya Tarik Relatif = <code>μ_r × N × I = ' + relativeForce + '</code> (Mengangkat <strong>' + liftedClips + ' klip</strong>).';

    if (I === 0) {
        expReason.textContent = 'Ketika kuat arus baterai bernilai 0 A, tidak ada muatan listrik yang mengalir melalui lilitan kawat sehingga medan magnet lenyap dan seluruh klip logam jatuh kembali ke meja.';
    } else {
        expReason.textContent = 'Arus listrik (' + I.toFixed(1) + ' A) yang mengalir melingkari ' + N + ' lilitan menghasilkan medan magnet di pusat kumparan. Penggunaan inti ' + coreName + ' memperkuat garis medan magnet berkali-kali lipat sehingga ujung paku menarik ' + liftedClips + ' klip besi. Dengan Kaidah Tangan Kanan, ujung kiri menjadi kutub ' + leftPole + '.';
    }

    if (I > 0) pulsePhase = (pulsePhase + I * 0.04) % (Math.PI * 2);

    drawScene(liftedClips, B_mT);
    requestAnimationFrame(updateElectromagnet);
}

function drawScene(liftedClips, B_mT) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const nailX = 185, nailY = 135, nailW = 280, nailH = 26;

    if (I > 0) {
        const ringCount = Math.min(6, Math.ceil(B_mT / 2.5));
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.28)';
        ctx.lineWidth = 1.8;
        for (let r = 1; r <= ringCount; r++) {
            const rx = (nailW / 2) + r * 26;
            const ry = 22 + r * 16 + Math.sin(pulsePhase) * 2;
            ctx.beginPath();
            ctx.ellipse(nailX + nailW / 2, nailY + nailH / 2, rx, ry, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(nailX + 35, nailY);
    ctx.lineTo(nailX + 35, 48);
    ctx.lineTo(270, 48);
    ctx.moveTo(380, 48);
    ctx.lineTo(nailX + nailW - 35, 48);
    ctx.lineTo(nailX + nailW - 35, nailY);
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(270, 32, 110, 32);
    ctx.fillStyle = '#f59e0b';
    if (!isReversed) ctx.fillRect(270, 32, 22, 32);
    else ctx.fillRect(358, 32, 22, 32);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText(isReversed ? '-   ' + I.toFixed(1) + ' A   +' : '+   ' + I.toFixed(1) + ' A   -', 325, 52);
    ctx.textAlign = 'left';

    ctx.fillStyle = muR === 1 ? '#bae6fd' : (muR === 4 ? '#64748b' : '#334155');
    ctx.fillRect(nailX, nailY, nailW, nailH);
    ctx.fillRect(nailX - 10, nailY - 8, 10, nailH + 16);
    ctx.beginPath();
    ctx.moveTo(nailX + nailW, nailY);
    ctx.lineTo(nailX + nailW + 24, nailY + nailH / 2);
    ctx.lineTo(nailX + nailW, nailY + nailH);
    ctx.closePath();
    ctx.fill();

    if (I > 0) {
        ctx.fillStyle = isReversed ? '#2563eb' : '#dc2626';
        ctx.font = 'bold 15px Segoe UI';
        ctx.fillText(isReversed ? 'S' : 'U', nailX - 32, nailY + 18);

        ctx.fillStyle = isReversed ? '#dc2626' : '#2563eb';
        ctx.fillText(isReversed ? 'U' : 'S', nailX + nailW + 30, nailY + 18);
    }

    const visualCoils = Math.min(36, Math.max(6, Math.floor(N / 4)));
    const coilAreaW = nailW - 60;
    const step = coilAreaW / visualCoils;
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3.5;
    for (let i = 0; i < visualCoils; i++) {
        const cx = nailX + 30 + i * step;
        ctx.beginPath();
        ctx.moveTo(cx, nailY - 4);
        ctx.lineTo(cx + step * 0.5, nailY + nailH + 4);
        ctx.stroke();
    }

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 332);
    ctx.lineTo(590, 332);
    ctx.stroke();

    for (let c = 0; c < 20; c++) {
        const isLifted = c < liftedClips;
        let drawX = clipsData[c].baseX;
        let drawY = clipsData[c].baseY;
        let rot = clipsData[c].angle;

        if (isLifted) {
            drawX = nailX + 35 + (c % 10) * 22;
            drawY = nailY + nailH + 10 + Math.floor(c / 10) * 14;
            rot = Math.PI / 2;
        }

        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.rotate(rot);
        ctx.strokeStyle = isLifted ? '#2563eb' : '#475569';
        ctx.lineWidth = 2;
        ctx.strokeRect(-10, -4, 20, 8);
        ctx.restore();
    }
}

btnReverse.addEventListener('click', () => { isReversed = !isReversed; });

btnReset.addEventListener('click', () => {
    inputN.value = 50; inputI.value = 2.0; inputCore.value = 4; isReversed = false;
});

if (btnNewMission) {
    btnNewMission.addEventListener('click', () => {
        targetClips = Math.floor(Math.random() * 16) + 3;
        missionSolved = false;
        challengeDesc.innerHTML = 'Atur jumlah lilitan (N), kuat arus (I), dan jenis inti agar elektromagnet mengangkat tepat <strong>' + targetClips + ' klip logam</strong>!';
        btnCheckMission.style.display = 'inline-block';
        challengeFeedback.style.display = 'none';
    });
}

if (btnCheckMission) {
    btnCheckMission.addEventListener('click', () => {
        if (targetClips === null) return;
        if (currentLiftedClips === targetClips) {
            challengeFeedback.className = 'challenge-feedback feedback-success';
            if (!missionSolved) {
                missionSolved = true;
                if (typeof updateChallengeScore === 'function') updateChallengeScore(100);
                challengeFeedback.textContent = '🎉 TEPAT! Elektromagnet berhasil mengangkat tepat ' + currentLiftedClips + ' klip (+100 Poin)!';
            } else {
                challengeFeedback.textContent = '✅ Misi selesai! Klik Buat Misi Baru untuk tantangan berikutnya.';
            }
        } else {
            challengeFeedback.className = 'challenge-feedback feedback-fail';
            challengeFeedback.textContent = '❌ Belum pas! Saat ini terangkat ' + currentLiftedClips + ' klip (Target: ' + targetClips + ' klip).';
        }
    });
}

if (btnFormula) {
    btnFormula.addEventListener('click', () => {
        formulaPanel.style.display = formulaPanel.style.display === 'none' ? 'block' : 'none';
        btnFormula.textContent = formulaPanel.style.display === 'none' ? 'Lihat Rumus' : 'Sembunyikan Rumus';
    });
}

updateElectromagnet();
