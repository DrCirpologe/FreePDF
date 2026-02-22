const mergeInput = document.getElementById('mergeInput');
const mergeBtn = document.getElementById('mergeBtn');
const mergeMeta = document.getElementById('mergeMeta');
const mergeList = document.getElementById('mergeList');

let mergeFiles = [];

function updateMergeList() {
    if (!mergeFiles.length) {
        mergeMeta.textContent = 'Noch keine Dateien ausgewählt.';
        mergeList.textContent = '';
        return;
    }

    mergeMeta.textContent = `${mergeFiles.length} PDF-Datei(en) ausgewählt.`;
    mergeList.textContent = mergeFiles.map((file, index) => `${index + 1}. ${file.name}`).join('\n');
}

if (mergeInput) {
    mergeInput.addEventListener('change', (event) => {
        mergeFiles = Array.from(event.target.files || []);
        updateMergeList();
    });
}

if (mergeBtn) {
    mergeBtn.addEventListener('click', async () => {
        if (!mergeFiles.length) {
            alert('Bitte mindestens zwei PDFs auswählen.');
            return;
        }

        if (!window.PDFLib) {
            alert('PDF-Bibliothek konnte nicht geladen werden.');
            return;
        }

        mergeBtn.disabled = true;
        mergeBtn.textContent = 'Wird zusammengefügt...';

        try {
            const { PDFDocument } = window.PDFLib;
            const mergedPdf = await PDFDocument.create();

            for (const file of mergeFiles) {
                const bytes = await file.arrayBuffer();
                const src = await PDFDocument.load(bytes);
                const pages = await mergedPdf.copyPages(src, src.getPageIndices());
                pages.forEach((page) => mergedPdf.addPage(page));
            }

            const result = await mergedPdf.save();
            const blob = new Blob([result], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'zusammengefuegt.pdf';
            link.click();
            URL.revokeObjectURL(url);

            mergeMeta.textContent = 'PDF erfolgreich zusammengefügt.';
        } catch {
            alert('Beim Zusammenfügen ist ein Fehler aufgetreten.');
        } finally {
            mergeBtn.disabled = false;
            mergeBtn.textContent = 'PDF zusammenfügen';
        }
    });
}
