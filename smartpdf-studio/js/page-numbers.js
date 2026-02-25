const numberInput = document.getElementById('numberInput');
const numberStartInput = document.getElementById('numberStart');
const numberPositionInput = document.getElementById('numberPosition');
const numberPagesInput = document.getElementById('numberPages');
const numberBtn = document.getElementById('numberBtn');
const numberMeta = document.getElementById('numberMeta');

let numberFile = null;

async function preloadFromSavedSelection() {
    if (!window.PDFResultsManager) {
        return;
    }

    const selected = await window.PDFResultsManager.consumeToolSelectionAsFiles();
    if (!selected.length) {
        return;
    }

    numberFile = selected[0];
    numberMeta.textContent = `${numberFile.name} aus Weiter bearbeiten geladen.`;
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

function getPosition(position, pageWidth, pageHeight, textWidth) {
    if (position === 'top-left') return { x: 20, y: pageHeight - 24 };
    if (position === 'top-right') return { x: pageWidth - textWidth - 20, y: pageHeight - 24 };
    if (position === 'bottom-left') return { x: 20, y: 20 };
    if (position === 'bottom-right') return { x: pageWidth - textWidth - 20, y: 20 };
    return { x: (pageWidth - textWidth) / 2, y: 20 };
}

if (numberInput) {
    numberInput.addEventListener('change', (event) => {
        numberFile = event.target.files?.[0] || null;
        numberMeta.textContent = numberFile ? `${numberFile.name} ausgewählt.` : 'Bitte eine PDF wählen.';
    });
}

if (numberBtn) {
    numberBtn.addEventListener('click', async () => {
        if (!numberFile) {
            alert('Bitte zuerst eine PDF-Datei auswählen.');
            return;
        }

        if (!window.PDFLib) {
            alert('PDF-Bibliothek konnte nicht geladen werden.');
            return;
        }

        numberBtn.disabled = true;
        numberBtn.textContent = 'Verarbeite...';

        try {
            const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
            const srcBytes = await numberFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(srcBytes);
            const pageCount = pdfDoc.getPageCount();
            const targetPages = parsePages(numberPagesInput.value, pageCount);
            const pages = pdfDoc.getPages();
            const startNumber = Number.parseInt(numberStartInput.value || '1', 10);
            const safeStart = Number.isInteger(startNumber) ? startNumber : 1;
            const position = numberPositionInput.value || 'bottom-center';
            const fontSize = 11;
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

            for (let pageNo = 1; pageNo <= pageCount; pageNo += 1) {
                if (!targetPages.has(pageNo)) {
                    continue;
                }

                const page = pages[pageNo - 1];
                const { width, height } = page.getSize();
                const label = String(safeStart + (pageNo - 1));
                const textWidth = font.widthOfTextAtSize(label, fontSize);
                const pos = getPosition(position, width, height, textWidth);

                page.drawText(label, {
                    x: pos.x,
                    y: pos.y,
                    size: fontSize,
                    font,
                    color: rgb(0.2, 0.2, 0.2)
                });
            }

            const outBytes = await pdfDoc.save();
            const cleanName = numberFile.name.replace(/\.pdf$/i, '');
            const fileName = `${cleanName}-seitennummern.pdf`;
            if (window.PDFResultsManager) {
                await window.PDFResultsManager.addResult({
                    bytes: outBytes,
                    fileName,
                    sourceTool: 'page-numbers'
                });
                numberMeta.textContent = `Seitennummern gesetzt (${targetPages.size} Seite(n)). Aktionen unten verfügbar.`;
            } else {
                downloadBytes(outBytes, fileName);
                numberMeta.textContent = `Seitennummern gesetzt (${targetPages.size} Seite(n)).`;
            }
        } catch {
            alert('Eingabe prüfen: Seiten z. B. 1-5,8');
        } finally {
            numberBtn.disabled = false;
            numberBtn.textContent = 'Seitennummern hinzufügen';
        }
    });
}

if (window.PDFResultsManager) {
    window.PDFResultsManager.initPanel();
    preloadFromSavedSelection();
}
