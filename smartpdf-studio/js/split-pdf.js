const splitInput = document.getElementById('splitInput');
const splitRanges = document.getElementById('splitRanges');
const splitBtn = document.getElementById('splitBtn');
const splitMeta = document.getElementById('splitMeta');

let splitFile = null;

async function preloadFromSavedSelection() {
    if (!window.PDFResultsManager) {
        return;
    }

    const selected = await window.PDFResultsManager.consumeToolSelectionAsFiles();
    if (!selected.length) {
        return;
    }

    splitFile = selected[0];
    splitMeta.textContent = `${splitFile.name} aus Weiter bearbeiten geladen.`;
}

function parseRanges(value, maxPages) {
    const cleaned = (value || '').replace(/\s/g, '');
    if (!cleaned) {
        return Array.from({ length: maxPages }, (_, index) => [index + 1, index + 1]);
    }

    const parts = cleaned.split(',').filter(Boolean);
    const ranges = [];

    for (const part of parts) {
        if (part.includes('-')) {
            const [startRaw, endRaw] = part.split('-');
            const start = Number(startRaw);
            const end = Number(endRaw);
            if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start || end > maxPages) {
                throw new Error('Ungültiger Bereich');
            }
            ranges.push([start, end]);
        } else {
            const page = Number(part);
            if (!Number.isInteger(page) || page < 1 || page > maxPages) {
                throw new Error('Ungültige Seite');
            }
            ranges.push([page, page]);
        }
    }

    return ranges;
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

if (splitInput) {
    splitInput.addEventListener('change', (event) => {
        splitFile = event.target.files?.[0] || null;
        splitMeta.textContent = splitFile ? `${splitFile.name} ausgewählt.` : 'Bitte eine PDF wählen.';
    });
}

if (splitBtn) {
    splitBtn.addEventListener('click', async () => {
        if (!splitFile) {
            alert('Bitte eine PDF-Datei auswählen.');
            return;
        }

        if (!window.PDFLib) {
            alert('PDF-Bibliothek konnte nicht geladen werden.');
            return;
        }

        splitBtn.disabled = true;
        splitBtn.textContent = 'Wird aufgeteilt...';

        try {
            const { PDFDocument } = window.PDFLib;
            const sourceBytes = await splitFile.arrayBuffer();
            const sourcePdf = await PDFDocument.load(sourceBytes);
            const totalPages = sourcePdf.getPageCount();

            const ranges = parseRanges(splitRanges.value, totalPages);

            for (let index = 0; index < ranges.length; index += 1) {
                const [start, end] = ranges[index];
                const outputPdf = await PDFDocument.create();
                const pageIndices = [];

                for (let page = start; page <= end; page += 1) {
                    pageIndices.push(page - 1);
                }

                const copiedPages = await outputPdf.copyPages(sourcePdf, pageIndices);
                copiedPages.forEach((page) => outputPdf.addPage(page));

                const outputBytes = await outputPdf.save();
                const fileName = `split-${index + 1}-${start}-${end}.pdf`;

                if (window.PDFResultsManager) {
                    await window.PDFResultsManager.addResult({
                        bytes: outputBytes,
                        fileName,
                        sourceTool: 'split-pdf'
                    });
                } else {
                    downloadBytes(outputBytes, fileName);
                }
            }

            splitMeta.textContent = `${ranges.length} PDF-Datei(en) erstellt. Wähle unten: Herunterladen, Teilen oder Weiter bearbeiten.`;
        } catch {
            alert('Ungültige Eingabe oder Fehler bei der Verarbeitung.');
        } finally {
            splitBtn.disabled = false;
            splitBtn.textContent = 'PDF aufteilen';
        }
    });
}

if (window.PDFResultsManager) {
    window.PDFResultsManager.initPanel();
    preloadFromSavedSelection();
}
