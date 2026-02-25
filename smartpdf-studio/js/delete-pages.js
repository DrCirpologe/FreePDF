const deleteInput = document.getElementById('deleteInput');
const deletePagesInput = document.getElementById('deletePages');
const deleteBtn = document.getElementById('deleteBtn');
const deleteMeta = document.getElementById('deleteMeta');

let deleteFile = null;

function parsePages(value, maxPages, allowEmptyAll = false) {
    const cleaned = (value || '').replace(/\s/g, '');

    if (!cleaned) {
        if (!allowEmptyAll) {
            throw new Error('Bitte Seiten angeben.');
        }
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

if (deleteInput) {
    deleteInput.addEventListener('change', (event) => {
        deleteFile = event.target.files?.[0] || null;
        deleteMeta.textContent = deleteFile ? `${deleteFile.name} ausgewählt.` : 'Bitte eine PDF wählen.';
    });
}

if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
        if (!deleteFile) {
            alert('Bitte zuerst eine PDF-Datei auswählen.');
            return;
        }

        if (!window.PDFLib) {
            alert('PDF-Bibliothek konnte nicht geladen werden.');
            return;
        }

        deleteBtn.disabled = true;
        deleteBtn.textContent = 'Verarbeite...';

        try {
            const { PDFDocument } = window.PDFLib;
            const srcBytes = await deleteFile.arrayBuffer();
            const srcPdf = await PDFDocument.load(srcBytes);
            const pageCount = srcPdf.getPageCount();

            const toDelete = parsePages(deletePagesInput.value, pageCount, false);
            const keepIndices = [];

            for (let page = 1; page <= pageCount; page += 1) {
                if (!toDelete.has(page)) {
                    keepIndices.push(page - 1);
                }
            }

            if (keepIndices.length === 0) {
                alert('Du kannst nicht alle Seiten löschen.');
                return;
            }

            const outPdf = await PDFDocument.create();
            const copied = await outPdf.copyPages(srcPdf, keepIndices);
            copied.forEach((copiedPage) => outPdf.addPage(copiedPage));

            const outBytes = await outPdf.save();
            const cleanName = deleteFile.name.replace(/\.pdf$/i, '');
            downloadBytes(outBytes, `${cleanName}-seiten-geloescht.pdf`);
            deleteMeta.textContent = `${toDelete.size} Seite(n) entfernt.`;
        } catch {
            alert('Eingabe prüfen: z. B. 2,4-6');
        } finally {
            deleteBtn.disabled = false;
            deleteBtn.textContent = 'Seiten löschen';
        }
    });
}
