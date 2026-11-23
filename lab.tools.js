const htmlElement = document.documentElement;
const themeToggleBtn = document.getElementById('theme-toggle');

function applyTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem('physlab-theme', theme);
    if (themeToggleBtn) {
        themeToggleBtn.textContent = theme === 'dark' ? '☀️ Mode Terang' : '🌙 Mode Gelap';
    }
}

const savedTheme = localStorage.getItem('physlab-theme') || 'light';
applyTheme(savedTheme);

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function() {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(nextTheme);
    });
}

function downloadCanvasImage(canvasId, filename) {
    const targetCanvas = document.getElementById(canvasId);
    if (!targetCanvas) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = targetCanvas.width;
    tempCanvas.height = targetCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(targetCanvas, 0, 0);

    const link = document.createElement('a');
    link.download = filename + '.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
}

function exportTableToCSV(tableSelector, filename) {
    const table = document.querySelector(tableSelector);
    if (!table) return;

    let csvContent = new Array();
    const rows = table.querySelectorAll('tr');

    rows.forEach(function(row) {
        const cols = row.querySelectorAll('th, td');
        const rowData = new Array();
        cols.forEach(function(col) {
            let text = col.innerText.replace(/"/g, '""');
            rowData.push('"' + text + '"');
        });
        csvContent.push(rowData.join(','));
    });

    const csvString = csvContent.join('\n');
    const blob = new Blob(new Array(csvString), { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename + '.csv';
    link.click();
}

function updateChallengeScore(pointsToAdd) {
    let currentScore = parseInt(localStorage.getItem('physlab-score') || '0');
    currentScore += pointsToAdd;
    localStorage.setItem('physlab-score', currentScore);
    
    const scoreDisplay = document.getElementById('total-score');
    if (scoreDisplay) {
        scoreDisplay.textContent = currentScore + ' Poin';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const savedScore = localStorage.getItem('physlab-score') || '0';
    const scoreDisplay = document.getElementById('total-score');
    if (scoreDisplay) {
        scoreDisplay.textContent = savedScore + ' Poin';
    }
});
