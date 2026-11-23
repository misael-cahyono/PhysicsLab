// =========================================
// 1. SISTEM PENGINGAT TEMA (PERSISTENT DARK MODE)
// =========================================
const htmlElement = document.documentElement;
const themeToggleBtn = document.getElementById('theme-toggle');

// Fungsi menerapkan tema dan menyimpannya ke memori browser (localStorage)
function applyTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem('physlab-theme', theme);
    if (themeToggleBtn) {
        themeToggleBtn.textContent = theme === 'dark' ? '☀️ Mode Terang' : '🌙 Mode Gelap';
    }
}

// Langsung terapkan tema yang tersimpan saat halaman baru dibuka
const savedTheme = localStorage.getItem('physlab-theme') || 'light';
applyTheme(savedTheme);

// Ubah dan simpan tema saat tombol diklik
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(nextTheme);
    });
}

// =========================================
// 2. FITUR SIMPAN GAMBAR KANVAS (.PNG)
// =========================================
function downloadCanvasImage(canvasId, filename) {
    const targetCanvas = document.getElementById(canvasId);
    if (!targetCanvas) return;

    // Buat kanvas sementara dengan latar belakang putih agar gambar tidak transparan
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = targetCanvas.width;
    tempCanvas.height = targetCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(targetCanvas, 0, 0);

    // Unduh file gambar PNG
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
}

// =========================================
// 3. FITUR EKSPOR TABEL DATA KE EXCEL (.CSV)
// =========================================
function exportTableToCSV(tableSelector, filename) {
    const table = document.querySelector(tableSelector);
    if (!table) return;

    let csvContent = [];
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
        const cols = row.querySelectorAll('th, td');
        const rowData = [];
        cols.forEach(col => {
            let text = col.innerText.replace(/"/g, '""');
            rowData.push(`"${text}"`);
        });
        csvContent.push(rowData.join(','));
    });

    const csvString = csvContent.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
}

// =========================================
// 4. SISTEM SKOR & NOTIFIKASI MISI TANTANGAN
// =========================================
function updateChallengeScore(pointsToAdd) {
    let currentScore = parseInt(localStorage.getItem('physlab-score') || '0');
    currentScore += pointsToAdd;
    localStorage.setItem('physlab-score', currentScore);
    
    const scoreDisplay = document.getElementById('total-score');
    if (scoreDisplay) {
        scoreDisplay.textContent = `${currentScore} Poin`;
    }
}

// Tampilkan skor tersimpan saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    const savedScore = localStorage.getItem('physlab-score') || '0';
    const scoreDisplay = document.getElementById('total-score');
    if (scoreDisplay) {
        scoreDisplay.textContent = `${savedScore} Poin`;
    }
});
