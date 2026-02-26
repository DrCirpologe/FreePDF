const watermarkInput = document.getElementById('watermarkInput');
const watermarkTextInput = document.getElementById('watermarkText');
const watermarkPagesInput = document.getElementById('watermarkPages');
const watermarkOpacityInput = document.getElementById('watermarkOpacity');
const watermarkBtn = document.getElementById('watermarkBtn');
const watermarkMeta = document.getElementById('watermarkMeta');

let watermarkFile = null;
let sourceEditIds = [];

async function preloadFromSavedSelection() {
    if (!window.PDFResultsManager) {
        return;
    }

    const selected = await window.PDFResultsManager.consumeToolSelectionAsFiles();
    if (!selected.length) {
        return;
    }

    watermarkFile = selected[0];
    sourceEditIds = window.PDFResultsManager.getActiveEditIds();
    watermarkMeta.textContent = `${watermarkFile.name} aus Weiter bearbeiten geladen.`;
}

function parsePages(value, maxPages) {
    const cleaned = (value || '').replace(/\s/g, '');
    if (!cleaned) {
        return new Set(Array.from({ length: maxPages }, (_, index) => index + 1));
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

    return result;
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

if (watermarkInput) {
    watermarkInput.addEventListener('change', (event) => {
        watermarkFile = event.target.files?.[0] || null;
        watermarkMeta.textContent = watermarkFile ? `${watermarkFile.name} ausgewählt.` : 'Bitte eine PDF wählen.';
    });
}

if (watermarkBtn) {
    watermarkBtn.addEventListener('click', async () => {
        if (!watermarkFile) {
            alert('Bitte zuerst eine PDF-Datei auswählen.');
            return;
        }

        const text = (watermarkTextInput.value || '').trim();
        if (!text) {
            alert('Bitte Wasserzeichen-Text eingeben.');
            return;
        }

        if (!window.PDFLib) {
            alert('PDF-Bibliothek konnte nicht geladen werden.');
            return;
        }

        watermarkBtn.disabled = true;
        watermarkBtn.textContent = 'Verarbeite...';

        try {
            const { PDFDocument, StandardFonts, rgb, degrees } = window.PDFLib;
            const srcBytes = await watermarkFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(srcBytes);
            const pageCount = pdfDoc.getPageCount();
            const targetPages = parsePages(watermarkPagesInput.value, pageCount);
            const opacity = Math.max(0.05, Math.min(0.9, Number(watermarkOpacityInput.value || '0.25')));
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const pages = pdfDoc.getPages();

            targetPages.forEach((pageNo) => {
                const page = pages[pageNo - 1];
                const { width, height } = page.getSize();
                const fontSize = Math.max(20, Math.min(56, Math.floor(width / 12)));
                const textWidth = font.widthOfTextAtSize(text, fontSize);

                page.drawText(text, {
                    x: Math.max(20, (width - textWidth) / 2),
                    y: height / 2,
                    size: fontSize,
                    font,
                    color: rgb(0.8, 0.1, 0.1),
                    rotate: degrees(-30),
                    opacity
                });
            });

            const outBytes = await pdfDoc.save();
            const cleanName = watermarkFile.name.replace(/\.pdf$/i, '');
            const fileName = `${cleanName}-wasserzeichen.pdf`;
            if (window.PDFResultsManager) {
                await window.PDFResultsManager.addResult({
                    bytes: outBytes,
                    fileName,
                    sourceTool: 'watermark-pdf'
                });
                if (sourceEditIds.length) {
                    await window.PDFResultsManager.deleteResults(sourceEditIds);
                    window.PDFResultsManager.clearActiveEditIds();
                    sourceEditIds = [];
                }
                watermarkMeta.textContent = `Wasserzeichen auf ${targetPages.size} Seite(n) gesetzt. Aktionen unten verfügbar.`;
            } else {
                downloadBytes(outBytes, fileName);
                watermarkMeta.textContent = `Wasserzeichen auf ${targetPages.size} Seite(n) gesetzt.`;
            }
        } catch {
            alert('Eingabe prüfen: Seiten z. B. 1,3-5');
        } finally {
            watermarkBtn.disabled = false;
            watermarkBtn.textContent = 'Wasserzeichen hinzufügen';
        }
    });
}

if (window.PDFResultsManager) {
    window.PDFResultsManager.initPanel();
    preloadFromSavedSelection();
}
