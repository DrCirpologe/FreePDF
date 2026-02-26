const rwInput = document.getElementById('rwInput');
const rwBtn = document.getElementById('rwBtn');
const rwStatus = document.getElementById('rwStatus');

let rwFiles = [];
let sourceEditIds = [];

async function preloadFromSavedSelection() {
    if (!window.PDFResultsManager) {
        return;
    }

    const selected = await window.PDFResultsManager.consumeToolSelectionAsFiles();
    if (!selected.length) {
        return;
    }

    rwFiles = selected;
    sourceEditIds = window.PDFResultsManager.getActiveEditIds();

    const dt = new DataTransfer();
    selected.forEach((file) => dt.items.add(file));
    rwInput.files = dt.files;

    rwStatus.textContent = `${selected.length} PDF(s) aus Weiter bearbeiten geladen.`;
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

if (rwInput) {
    rwInput.addEventListener('change', (event) => {
        rwFiles = Array.from(event.target.files || []);
        rwStatus.textContent = rwFiles.length
            ? `${rwFiles.length} PDF(s) ausgewählt.`
            : 'Bitte eine PDF wählen.';
    });
}

if (rwBtn) {
    rwBtn.addEventListener('click', async () => {
        const pickedFiles = rwFiles.length ? rwFiles : Array.from(rwInput?.files || []);
        if (!pickedFiles.length) {
            alert('Bitte zuerst eine PDF-Datei auswählen.');
            return;
        }

        if (!window.PDFLib) {
            alert('PDF-Bibliothek konnte nicht geladen werden.');
            return;
        }

        rwBtn.disabled = true;
        rwBtn.textContent = 'Verarbeite...';

        try {
            const { PDFDocument, PDFName } = window.PDFLib;
            const annotsKey = PDFName.of('Annots');
            let modifiedPagesTotal = 0;
            let createdCount = 0;

            for (const file of pickedFiles) {
                const srcBytes = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(srcBytes, { updateMetadata: false });
                const pages = pdfDoc.getPages();
                let modifiedPages = 0;

                pages.forEach((page) => {
                    if (page.node.has(annotsKey)) {
                        page.node.delete(annotsKey);
                        modifiedPages += 1;
                    }
                });

                const outBytes = await pdfDoc.save();
                const cleanName = file.name.replace(/\.download$/i, '').replace(/\.pdf$/i, '') || 'dokument';
                const fileName = `${cleanName}-wasserzeichen-entfernt.pdf`;

                if (window.PDFResultsManager) {
                    await window.PDFResultsManager.addResult({
                        bytes: outBytes,
                        fileName,
                        sourceTool: 'remove-watermark'
                    });
                } else {
                    downloadBytes(outBytes, fileName);
                }

                modifiedPagesTotal += modifiedPages;
                createdCount += 1;
            }

            if (window.PDFResultsManager) {
                if (sourceEditIds.length) {
                    await window.PDFResultsManager.deleteResults(sourceEditIds);
                    window.PDFResultsManager.clearActiveEditIds();
                    sourceEditIds = [];
                }
            }

            if (modifiedPagesTotal > 0) {
                rwStatus.textContent = `${createdCount} PDF(s) verarbeitet. Annotationen/Stempel auf ${modifiedPagesTotal} Seite(n) entfernt.`;
            } else {
                rwStatus.textContent = `${createdCount} PDF(s) verarbeitet. Keine entfernbaren Annotations-Wasserzeichen gefunden.`;
            }
        } catch {
            alert('Wasserzeichen konnten nicht entfernt werden.');
        } finally {
            rwBtn.disabled = false;
            rwBtn.textContent = 'Wasserzeichen entfernen';
        }
    });
}

if (window.PDFResultsManager) {
    window.PDFResultsManager.initPanel();
    preloadFromSavedSelection();
}
