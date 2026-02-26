const extractInput = document.getElementById('extractInput');
const extractPagesInput = document.getElementById('extractPages');
const extractBtn = document.getElementById('extractBtn');
const extractMeta = document.getElementById('extractMeta');

let extractFile = null;
let sourceEditIds = [];

async function preloadFromSavedSelection() {
    if (!window.PDFResultsManager) {
        return;
    }

    const selected = await window.PDFResultsManager.consumeToolSelectionAsFiles();
    if (!selected.length) {
        return;
    }

    extractFile = selected[0];
    sourceEditIds = window.PDFResultsManager.getActiveEditIds();
    extractMeta.textContent = `${extractFile.name} aus Weiter bearbeiten geladen.`;
}

function parsePages(value, maxPages) {
    const cleaned = (value || '').replace(/\s/g, '');
    if (!cleaned) {
        throw new Error('Bitte Seiten angeben.');
    }

    const result = new Set();
    const parts = cleaned.split(',').filter(Boolean);

    for (const part of parts) {
        if (part.includes('-')) {
            const [startRaw, endRaw] = part.split('-');
            const start = Number(startRaw);
            const end = Number(endRaw);

            if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start || end > maxPages) {
                throw new Error('Ungültiger Seitenbereich.');
            }

            for (let page = start; page <= end; page += 1) {
                result.add(page);
            }
        } else {
            const page = Number(part);
            if (!Number.isInteger(page) || page < 1 || page > maxPages) {
                throw new Error('Ungültige Seitenzahl.');
            }
            result.add(page);
        }
    }

    return Array.from(result).sort((a, b) => a - b);
}

function downloadBytes(bytes, fileName) {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
}

if (extractInput) {
    extractInput.addEventListener('change', (event) => {
        extractFile = event.target.files?.[0] || null;
        extractMeta.textContent = extractFile ? `${extractFile.name} ausgewählt.` : 'Bitte eine PDF wählen.';
    });
}

if (extractBtn) {
    extractBtn.addEventListener('click', async () => {
        if (!extractFile) {
            alert('Bitte zuerst eine PDF-Datei auswählen.');
            return;
        }

        if (!window.PDFLib) {
            alert('PDF-Bibliothek konnte nicht geladen werden.');
            return;
        }

        extractBtn.disabled = true;
        extractBtn.textContent = 'Verarbeite...';

        try {
            const { PDFDocument } = window.PDFLib;
            const srcBytes = await extractFile.arrayBuffer();
            const srcPdf = await PDFDocument.load(srcBytes);
            const pageCount = srcPdf.getPageCount();
            const pages = parsePages(extractPagesInput.value, pageCount);

            const outPdf = await PDFDocument.create();
            const copied = await outPdf.copyPages(srcPdf, pages.map((page) => page - 1));
            copied.forEach((copiedPage) => outPdf.addPage(copiedPage));

            const outBytes = await outPdf.save();
            const cleanName = extractFile.name.replace(/\.pdf$/i, '');
            const fileName = `${cleanName}-extrahiert.pdf`;
            if (window.PDFResultsManager) {
                await window.PDFResultsManager.addResult({
                    bytes: outBytes,
                    fileName,
                    sourceTool: 'extract-pages'
                });
                if (sourceEditIds.length) {
                    await window.PDFResultsManager.deleteResults(sourceEditIds);
                    window.PDFResultsManager.clearActiveEditIds();
                    sourceEditIds = [];
                }
                extractMeta.textContent = `${pages.length} Seite(n) extrahiert. Aktionen unten verfügbar.`;
            } else {
                downloadBytes(outBytes, fileName);
                extractMeta.textContent = `${pages.length} Seite(n) extrahiert.`;
            }
        } catch {
            alert('Eingabe prüfen: z. B. 1,3,6-8');
        } finally {
            extractBtn.disabled = false;
            extractBtn.textContent = 'Seiten extrahieren';
        }
    });
}

if (window.PDFResultsManager) {
    window.PDFResultsManager.initPanel();
    preloadFromSavedSelection();
}
