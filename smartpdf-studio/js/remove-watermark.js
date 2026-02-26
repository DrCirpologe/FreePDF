const rwInput = document.getElementById('rwInput');
const rwBtn = document.getElementById('rwBtn');
const rwStatus = document.getElementById('rwStatus');

let rwFile = null;
let sourceEditIds = [];

async function preloadFromSavedSelection() {
    if (!window.PDFResultsManager) {
        return;
    }

    const selected = await window.PDFResultsManager.consumeToolSelectionAsFiles();
    if (!selected.length) {
        return;
    }

    rwFile = selected[0];
    sourceEditIds = window.PDFResultsManager.getActiveEditIds();
    rwStatus.textContent = `${rwFile.name} aus Weiter bearbeiten geladen.`;
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
        rwFile = event.target.files?.[0] || null;
        rwStatus.textContent = rwFile ? `${rwFile.name} ausgewählt.` : 'Bitte eine PDF wählen.';
    });
}

if (rwBtn) {
    rwBtn.addEventListener('click', async () => {
        if (!rwFile) {
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
            const srcBytes = await rwFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(srcBytes, { updateMetadata: false });
            const pages = pdfDoc.getPages();
            const annotsKey = PDFName.of('Annots');
            let modifiedPages = 0;

            pages.forEach((page) => {
                if (page.node.has(annotsKey)) {
                    page.node.delete(annotsKey);
                    modifiedPages += 1;
                }
            });

            const outBytes = await pdfDoc.save();
            const cleanName = rwFile.name.replace(/\.pdf$/i, '');
            const fileName = `${cleanName}-wasserzeichen-entfernt.pdf`;
            if (window.PDFResultsManager) {
                await window.PDFResultsManager.addResult({
                    bytes: outBytes,
                    fileName,
                    sourceTool: 'remove-watermark'
                });
                if (sourceEditIds.length) {
                    await window.PDFResultsManager.deleteResults(sourceEditIds);
                    window.PDFResultsManager.clearActiveEditIds();
                    sourceEditIds = [];
                }
            } else {
                downloadBytes(outBytes, fileName);
            }

            if (modifiedPages > 0) {
                rwStatus.textContent = `Annotationen/Stempel auf ${modifiedPages} Seite(n) entfernt.`;
            } else {
                rwStatus.textContent = 'Keine entfernbaren Annotations-Wasserzeichen gefunden.';
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
