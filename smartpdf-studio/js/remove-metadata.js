const metaInput = document.getElementById('metaInput');
const metaBtn = document.getElementById('metaBtn');
const metaStatus = document.getElementById('metaStatus');

let metaFiles = [];
let sourceEditIds = [];

async function preloadFromSavedSelection() {
    if (!window.PDFResultsManager) {
        return;
    }

    const selected = await window.PDFResultsManager.consumeToolSelectionAsFiles();
    if (!selected.length) {
        return;
    }

    metaFiles = selected;
    sourceEditIds = window.PDFResultsManager.getActiveEditIds();

    const dt = new DataTransfer();
    selected.forEach((file) => dt.items.add(file));
    metaInput.files = dt.files;

    metaStatus.textContent = `${selected.length} PDF(s) aus Weiter bearbeiten geladen.`;
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

function getMetaErrorMessage(error) {
    const message = String(error?.message || '').toLowerCase();
    if (message.includes('encrypted') || message.includes('password')) {
        return 'Diese PDF ist geschützt/verschlüsselt und kann ohne Entsperren nicht bearbeitet werden.';
    }
    if (message.includes('invalid') || message.includes('parse')) {
        return 'Datei ist keine gültige PDF oder beschädigt.';
    }
    return 'Metadaten konnten nicht entfernt werden. Bitte andere PDF testen.';
}

if (metaInput) {
    metaInput.addEventListener('change', (event) => {
        metaFiles = Array.from(event.target.files || []);
        metaStatus.textContent = metaFiles.length
            ? `${metaFiles.length} PDF(s) ausgewählt.`
            : 'Bitte eine PDF wählen.';
    });
}

if (metaBtn) {
    metaBtn.addEventListener('click', async () => {
        const pickedFiles = metaFiles.length ? metaFiles : Array.from(metaInput?.files || []);
        if (!pickedFiles.length) {
            alert('Bitte zuerst eine PDF-Datei auswählen.');
            return;
        }

        if (!window.PDFLib) {
            alert('PDF-Bibliothek konnte nicht geladen werden.');
            return;
        }

        metaBtn.disabled = true;
        metaBtn.textContent = 'Verarbeite...';

        try {
            const { PDFDocument } = window.PDFLib;
            let createdCount = 0;

            for (const file of pickedFiles) {
                const srcBytes = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(srcBytes, { updateMetadata: true });

                pdfDoc.setTitle('');
                pdfDoc.setAuthor('');
                pdfDoc.setSubject('');
                pdfDoc.setKeywords([]);
                pdfDoc.setProducer('');
                pdfDoc.setCreator('');
                pdfDoc.setLanguage('');

                const now = new Date('2000-01-01T00:00:00.000Z');
                pdfDoc.setCreationDate(now);
                pdfDoc.setModificationDate(now);

                const outBytes = await pdfDoc.save();
                const cleanName = file.name.replace(/\.download$/i, '').replace(/\.pdf$/i, '') || 'dokument';
                const fileName = `${cleanName}-metadata-entfernt.pdf`;

                if (window.PDFResultsManager) {
                    await window.PDFResultsManager.addResult({
                        bytes: outBytes,
                        fileName,
                        sourceTool: 'remove-metadata'
                    });
                } else {
                    downloadBytes(outBytes, fileName);
                }

                createdCount += 1;
            }

            if (!createdCount) {
                alert('Keine PDF konnte verarbeitet werden.');
                return;
            }

            if (window.PDFResultsManager) {
                if (sourceEditIds.length) {
                    await window.PDFResultsManager.deleteResults(sourceEditIds);
                    window.PDFResultsManager.clearActiveEditIds();
                    sourceEditIds = [];
                }
                metaStatus.textContent = `${createdCount} PDF(s): Metadaten entfernt. Aktionen unten verfügbar.`;
            } else {
                metaStatus.textContent = `${createdCount} PDF(s): Metadaten wurden entfernt/neutralisiert.`;
            }
        } catch (error) {
            alert(getMetaErrorMessage(error));
        } finally {
            metaBtn.disabled = false;
            metaBtn.textContent = 'Metadaten entfernen';
        }
    });
}

if (window.PDFResultsManager) {
    window.PDFResultsManager.initPanel();
    preloadFromSavedSelection();
}
