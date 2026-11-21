// =========================================
// 1. MENGAMBIL ELEMEN DARI HTML
// =========================================
const canvas = document.getElementById('parabola-canvas');
const ctx = canvas.getContext('2d');

// Input kontrol
const inputAngle = document.getElementById('input-angle');
const inputV0 = document.getElementById('input-v0');
const inputG = document.getElementById('input-g');

// Label nilai slider
const valAngle = document.getElementById('val-angle');
const valV0 = document.getElementById('val-v0');

// Output kartu hasil
const outT = document.getElementById('out-t');
const outPos = document.getElementById('out-pos');
const outYmax = document.getElementById('out-ymax');
const outXmax = document.getElementById('out-xmax');

// Tombol & Tabel
const btnFire = document.getElementById('btn-fire');
const btnPause = document.getElementById('btn-pause');
const btnClear = document.getElementById('btn-clear');
const btnFormula = document.getElementById('btn-formula');
const formulaPanel = document.getElementById('formula-panel');
const historyBody = document.getElementById('history-body');
const btnClearTable = document.getElementById('btn-clear-table');
const themeToggle = document.getElementById('theme-toggle');

// =========================================
// 2. VARIABEL FISIKA & STATUS SIMULASI
// =========================================
let angle = 45;
let v0 = 25;
let g = 9.8;

let isRunning = false;
let isPaused = false;
let t = 0;

// Pengaturan koordinat kanvas (1 meter = 4.5 pixel)
const scale = 4.5;
const originX = 45;               // Posisi X meriam (kiri)
const originY = canvas.height - 35; // Posisi Y tanah (bawah)

// Menyimpan jejak lintasan tembakan sebelumnya
let trajectories = []; 
let currentTrail = [];
let shotCount = 0;
const colors = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea'];

// =========================================
// 3. MENGHITUNG & MEMPERBARUI TAMPILAN AWAL
// =========================================
function updatePreview() {
    angle = parseFloat(inputAngle.value);
    v0 = parseFloat(inputV0.value);
    g = parseFloat(inputG.value);

    valAngle.textContent = `${angle}°`;
    valV0.textContent = `${v0} m/s`;

    // Hitung prediksi hasil maksimum menggunakan rumus fisika
    const rad = angle * (Math.PI / 180);
    const yMax = (Math.pow(v0, 2) * Math.pow(Math.sin(rad), 2)) / (2 * g);
    const xMax = (Math.pow(v0, 2) * Math.sin(2 * rad)) / g;

    outYmax.textContent = `${yMax.toFixed(2)} m`;
    outXmax.textContent = `${xMax.toFixed(2)} m`;

    if (!isRunning) {
        drawScene(0, 0);
    }
}

// =========================================
// 4. LOGIKA ANIMASI GERAK PARABOLA
// =========================================
function animate() {
    if (!isRunning || isPaused) return;

    const rad = angle * (Math.PI / 180);
    const vx = v0 * Math.cos(rad);
    const vy = v0 * Math.sin(rad);

    // Rumus posisi pada waktu t
    const x = vx * t;
    const y = (vy * t) - (0.5 * g * Math.pow(t, 2));

    // Perbarui output real-time
    outT.textContent = `${t.toFixed(2)} s`;
    outPos.textContent = `${x.toFixed(1)}m, ${Math.max(0, y).toFixed(1)}m`;

    // Simpan titik ke jejak lintasan saat ini
    currentTrail.push({ x: x, y: Math.max(0, y) });

    // Gambar kondisi terbaru di kanvas
    drawScene(x, Math.max(0, y));

    // Cek apakah bola sudah menyentuh tanah (y <= 0 setelah melayang)
    if (t > 0.05 && y <= 0) {
        isRunning = false;
        
        // Hitung nilai eksak akhir untuk dicatat ke riwayat
        const totalTime = (2 * vy) / g;
        const finalX = vx * totalTime;
        const maxY = Math.pow(vy, 2) / (2 * g);

        outT.textContent = `${totalTime.toFixed(2)} s`;
        outPos.textContent = `${finalX.toFixed(1)}m, 0.0m`;

        // Simpan lintasan lengkap beserta titik puncaknya
        const color = colors[(shotCount - 1) % colors.length];
        trajectories.push({
            points: [...currentTrail],
            color: color,
            peakX: finalX / 2,
            peakY: maxY
        });

        // Tambahkan baris data ke tabel HTML
        addHistoryRow(shotCount, angle, v0, g, maxY, finalX);
        drawScene(finalX, 0);
        return;
    }

    t += 0.04; // Tambah langkah waktu
    requestAnimationFrame(animate);
}

// =========================================
// 5. FUNGSI MENGGAMBAR DI KANVAS
// =========================================
function drawScene(ballX, ballY) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Gambar Grid Kertas Milimeter Blok & Skala Meter
    drawGrid();

    // 2. Gambar Semua Jejak Lintasan Sebelumnya
    trajectories.forEach(traj => {
        drawTrail(traj.points, traj.color);
        // Gambar titik puncak (Y_max)
        if (traj.peakY > 0.5) {
            const px = originX + traj.peakX * scale;
            const py = originY - traj.peakY * scale;
            ctx.fillStyle = traj.color;
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.font = '11px Segoe UI';
            ctx.fillText(`Puncak (${traj.peakY.toFixed(1)}m)`, px - 30, py - 8);
        }
    });

    // 3. Gambar Jejak Lintasan yang Sedang Berjalan
    if (currentTrail.length > 0) {
        const activeColor = colors[(shotCount - 1) % colors.length];
        drawTrail(currentTrail, activeColor);
    }

    // 4. Gambar Meriam Peluncur
    drawCannon();

    // 5. Gambar Proyektil (Bola)
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

function drawGrid() {
    ctx.strokeStyle = '#e2e8f0';
    ctx.fillStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.font = '10px Segoe UI';

    // Garis vertikal setiap 10 meter
    for (let m = 0; m <= 130; m += 10) {
        const x = originX + m * scale;
        if (x > canvas.width) break;
        ctx.beginPath();
        ctx.moveTo(x, 10);
        ctx.lineTo(x, originY);
        ctx.stroke();
        if (m > 0) ctx.fillText(`${m}m`, x - 10, originY + 15);
    }

    // Garis horizontal setiap 10 meter
    for (let m = 10; m <= 80; m += 10) {
        const y = originY - m * scale;
        if (y < 10) break;
        ctx.beginPath();
        ctx.moveTo(originX, y);
        ctx.lineTo(canvas.width - 10, y);
        ctx.stroke();
        ctx.fillText(`${m}m`, 12, y + 3);
    }

    // Garis Tanah Utama
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
    ctx.setLineDash([5, 4]); // Garis putus-putus
    ctx.beginPath();
    points.forEach((pt, index) => {
        const sx = originX + pt.x * scale;
        const sy = originY - pt.y * scale;
        if (index === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
    });
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawCannon() {
    const rad = -angle * (Math.PI / 180); // Negatif karena sumbu Y kanvas ke bawah
    ctx.save();
    ctx.translate(originX, originY);
    ctx.rotate(rad);

    // Laras meriam
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, -6, 32, 12);
    ctx.restore();

    // Roda/Dudukkan meriam
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(originX, originY, 10, 0, Math.PI * 2);
    ctx.fill();
}

function addHistoryRow(no, ang, vel, grav, ymax, xmax) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${no}</td>
        <td>${ang}°</td>
        <td>${vel} m/s</td>
        <td>${grav} m/s²</td>
        <td>${ymax.toFixed(2)} m</td>
        <td>${xmax.toFixed(2)} m</td>
    `;
    historyBody.prepend(row); // Data terbaru muncul paling atas
}

// =========================================
// 6. EVENT LISTENER (TOMBOL & SLIDER)
// =========================================
inputAngle.addEventListener('input', updatePreview);
inputV0.addEventListener('input', updatePreview);
inputG.addEventListener('change', updatePreview);

btnFire.addEventListener('click', () => {
    t = 0;
    currentTrail = [];
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
    trajectories = [];
    currentTrail = [];
    outT.textContent = '0.00 s';
    outPos.textContent = '0.0m, 0.0m';
    drawScene(0, 0);
});

btnClearTable.addEventListener('click', () => {
    historyBody.innerHTML = '';
    shotCount = 0;
});

btnFormula.addEventListener('click', () => {
    if (formulaPanel.style.display === 'none') {
        formulaPanel.style.display = 'block';
        btnFormula.textContent = 'Sembunyikan Rumus';
    } else {
        formulaPanel.style.display = 'none';
        btnFormula.textContent = 'Lihat Rumus';
    }
});

themeToggle.addEventListener('click', () => {
    const htmlElement = document.documentElement;
    if (htmlElement.getAttribute('data-theme') === 'light') {
        htmlElement.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️ Mode Terang';
    } else {
        htmlElement.setAttribute('data-theme', 'light');
        themeToggle.textContent = '🌙 Mode Gelap';
    }
});

// Tampilkan kondisi awal saat halaman dibuka
updatePreview();
