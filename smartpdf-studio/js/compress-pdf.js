const compressInput = document.getElementById('compressInput');
const compressBtn = document.getElementById('compressBtn');
const compressMeta = document.getElementById('compressMeta');
const compressQuality = document.getElementById('compressQuality');

let compressFiles = [];

async function preloadFromSavedSelection() {
    if (!window.PDFResultsManager) {
        return;
    }

    const selected = await window.PDFResultsManager.consumeToolSelectionAsFiles();
    if (!selected.length) {
        return;
    }

    compressFiles = selected;
    const totalSize = compressFiles.reduce((sum, file) => sum + file.size, 0);
    compressMeta.textContent = `${compressFiles.length} PDF(s) aus Weiter bearbeiten geladen · Gesamtgröße: ${formatMb(totalSize)}`;
}

if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

function formatMb(bytes) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function qualityPreset(level) {
    if (level === 'high') {
        return { scale: 2, jpegQuality: 0.92 };
    }
    if (level === 'low') {
        return { scale: 1.2, jpegQuality: 0.55 };
    }
    return { scale: 1.5, jpegQuality: 0.74 };
}

function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
}

async function compressSinglePdf(file, preset) {
    if (!window.pdfjsLib || !window.jspdf?.jsPDF) {
        throw new Error('PDF Bibliotheken fehlen');
    }

    const inputBytes = await file.arrayBuffer();
    const loadingTask = window.pdfjsLib.getDocument({ data: inputBytes });
    const sourcePdf = await loadingTask.promise;
    const { jsPDF } = window.jspdf;

    let outputPdf = null;

    for (let pageNo = 1; pageNo <= sourcePdf.numPages; pageNo += 1) {
        const page = await sourcePdf.getPage(pageNo);
        const viewport = page.getViewport({ scale: preset.scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { alpha: false });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        await page.render({ canvasContext: context, viewport }).promise;

        const imageData = canvas.toDataURL('image/jpeg', preset.jpegQuality);
        const width = viewport.width;
        const height = viewport.height;
        const orientation = width >= height ? 'landscape' : 'portrait';

        if (!outputPdf) {
            outputPdf = new jsPDF({
                orientation,
                unit: 'px',
                format: [width, height],
                compress: true
            });
        } else {
            outputPdf.addPage([width, height], orientation);
        }

        outputPdf.addImage(imageData, 'JPEG', 0, 0, width, height, undefined, 'FAST');
    }

    return outputPdf.output('arraybuffer');
}

if (compressInput) {
    compressInput.addEventListener('change', (event) => {
        compressFiles = Array.from(event.target.files || []);

        if (!compressFiles.length) {
            compressMeta.textContent = 'Noch keine Datei ausgewählt.';
            return;
        }

        const totalSize = compressFiles.reduce((sum, file) => sum + file.size, 0);
        compressMeta.textContent = `${compressFiles.length} PDF(s) ausgewählt · Gesamtgröße: ${formatMb(totalSize)}`;
    });
}

if (compressBtn) {
    compressBtn.addEventListener('click', async () => {
        if (!compressFiles.length) {
            alert('Bitte mindestens eine PDF-Datei auswählen.');
            return;
        }

        if (!window.pdfjsLib || !window.jspdf?.jsPDF) {
            alert('Benötigte Bibliotheken konnten nicht geladen werden.');
            return;
        }

        const preset = qualityPreset(compressQuality.value);

        compressBtn.disabled = true;
        compressBtn.textContent = 'Wird komprimiert...';

        try {
            let beforeBytes = 0;
            let afterBytes = 0;

            for (let index = 0; index < compressFiles.length; index += 1) {
                const file = compressFiles[index];
                beforeBytes += file.size;

                compressMeta.textContent = `Verarbeite ${index + 1}/${compressFiles.length}: ${file.name}`;

                const resultBytes = await compressSinglePdf(file, preset);
                afterBytes += resultBytes.byteLength;

                const outBlob = new Blob([resultBytes], { type: 'application/pdf' });
                const cleanName = file.name.replace(/\.pdf$/i, '');
                const fileName = `${cleanName}-komprimiert.pdf`;

                if (window.PDFResultsManager) {
                    await window.PDFResultsManager.addResult({
                        blob: outBlob,
                        fileName,
                        sourceTool: 'compress-pdf'
                    });
                } else {
                    downloadBlob(outBlob, fileName);
                }
            }

            compressMeta.textContent = `Fertig · Vorher: ${formatMb(beforeBytes)} · Nachher: ${formatMb(afterBytes)} · Aktionen unten verfügbar.`;
        } catch {
            alert('Komprimierung fehlgeschlagen. Bitte Datei/Qualität prüfen.');
        } finally {
            compressBtn.disabled = false;
            compressBtn.textContent = 'PDF komprimieren';
        }
    });
}

if (window.PDFResultsManager) {
    window.PDFResultsManager.initPanel();
    preloadFromSavedSelection();
}
