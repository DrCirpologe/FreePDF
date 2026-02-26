const watermarkInput = document.getElementById('watermarkInput');
const watermarkTextInput = document.getElementById('watermarkText');
const watermarkPagesInput = document.getElementById('watermarkPages');
const watermarkOpacityInput = document.getElementById('watermarkOpacity');
const watermarkBtn = document.getElementById('watermarkBtn');
const watermarkMeta = document.getElementById('watermarkMeta');

let watermarkFiles = [];
let sourceEditIds = [];

async function preloadFromSavedSelection() {
    if (!window.PDFResultsManager) {
        return;
    }

    const selected = await window.PDFResultsManager.consumeToolSelectionAsFiles();
    if (!selected.length) {
        return;
    }

    watermarkFiles = selected;
    sourceEditIds = window.PDFResultsManager.getActiveEditIds();

    const dt = new DataTransfer();
    selected.forEach((file) => dt.items.add(file));
    watermarkInput.files = dt.files;

    watermarkMeta.textContent = `${selected.length} PDF(s) aus Weiter bearbeiten geladen.`;
}

function parsePages(value, maxPages, allowOverflow = false) {
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

            if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
                throw new Error('Ungültiger Seitenbereich.');
            }

            if (!allowOverflow && end > maxPages) {
                throw new Error('Ungültiger Seitenbereich.');
            }

            const from = Math.max(1, start);
            const to = allowOverflow ? Math.min(end, maxPages) : end;
            for (let page = from; page <= to; page += 1) {
                if (page >= 1 && page <= maxPages) {
                    result.add(page);
                }
            }
        } else {
            const page = Number(part);
            if (!Number.isInteger(page) || page < 1) {
                throw new Error('Ungültige Seitenzahl.');
            }

            if (!allowOverflow && page > maxPages) {
                throw new Error('Ungültige Seitenzahl.');
            }

            if (page <= maxPages) {
                result.add(page);
            }
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

function getWatermarkErrorMessage(error) {
    const message = String(error?.message || '').toLowerCase();
    if (message.includes('encrypted') || message.includes('password')) {
        return 'Diese PDF ist geschützt/verschlüsselt und kann ohne Entsperren nicht bearbeitet werden.';
    }
    if (message.includes('invalid') || message.includes('parse')) {
        return 'Datei ist keine gültige PDF oder beschädigt.';
    }
    return 'Eingabe prüfen: Seiten z. B. 1,3-5';
}

if (watermarkInput) {
    watermarkInput.addEventListener('change', (event) => {
        watermarkFiles = Array.from(event.target.files || []);
        watermarkMeta.textContent = watermarkFiles.length
            ? `${watermarkFiles.length} PDF(s) ausgewählt.`
            : 'Bitte eine PDF wählen.';
    });
}

if (watermarkBtn) {
    watermarkBtn.addEventListener('click', async () => {
        const pickedFiles = watermarkFiles.length ? watermarkFiles : Array.from(watermarkInput?.files || []);
        if (!pickedFiles.length) {
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
            const opacity = Math.max(0.05, Math.min(0.9, Number(watermarkOpacityInput.value || '0.25')));
            let createdCount = 0;

            for (const pickedFile of pickedFiles) {
                const srcBytes = await pickedFile.arrayBuffer();
                const pdfDoc = await PDFDocument.load(srcBytes);
                const pageCount = pdfDoc.getPageCount();
                const targetPages = parsePages(watermarkPagesInput.value, pageCount, true);
                if (!targetPages.size) {
                    continue;
                }

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
                const cleanName = pickedFile.name.replace(/\.download$/i, '').replace(/\.pdf$/i, '');
                const fileName = `${cleanName || 'dokument'}-wasserzeichen.pdf`;
                if (window.PDFResultsManager) {
                    await window.PDFResultsManager.addResult({
                        bytes: outBytes,
                        fileName,
                        sourceTool: 'watermark-pdf'
                    });
                } else {
                    downloadBytes(outBytes, fileName);
                }
                createdCount += 1;
            }

            if (!createdCount) {
                alert('Keine PDF konnte mit Wasserzeichen verarbeitet werden. Seitenangabe prüfen.');
                return;
            }

            if (window.PDFResultsManager) {
                if (sourceEditIds.length) {
                    await window.PDFResultsManager.deleteResults(sourceEditIds);
                    window.PDFResultsManager.clearActiveEditIds();
                    sourceEditIds = [];
                }
                watermarkMeta.textContent = `${createdCount} PDF(s) mit Wasserzeichen erstellt. Aktionen unten verfügbar.`;
            } else {
                watermarkMeta.textContent = `${createdCount} PDF(s) mit Wasserzeichen erstellt und heruntergeladen.`;
            }
        } catch (error) {
            alert(getWatermarkErrorMessage(error));
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
