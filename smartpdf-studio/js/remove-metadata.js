const metaInput = document.getElementById('metaInput');
const metaBtn = document.getElementById('metaBtn');
const metaStatus = document.getElementById('metaStatus');

let metaFile = null;

function downloadBytes(bytes, fileName) {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
}

if (metaInput) {
    metaInput.addEventListener('change', (event) => {
        metaFile = event.target.files?.[0] || null;
        metaStatus.textContent = metaFile ? `${metaFile.name} ausgewählt.` : 'Bitte eine PDF wählen.';
    });
}

if (metaBtn) {
    metaBtn.addEventListener('click', async () => {
        if (!metaFile) {
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
            const srcBytes = await metaFile.arrayBuffer();
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
            const cleanName = metaFile.name.replace(/\.pdf$/i, '');
            downloadBytes(outBytes, `${cleanName}-metadata-entfernt.pdf`);
            metaStatus.textContent = 'Metadaten wurden entfernt/neutralisiert.';
        } catch {
            alert('Metadaten konnten nicht entfernt werden.');
        } finally {
            metaBtn.disabled = false;
            metaBtn.textContent = 'Metadaten entfernen';
        }
    });
}
