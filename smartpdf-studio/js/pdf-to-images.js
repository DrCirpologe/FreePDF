const p2iInput = document.getElementById('p2iInput');
const p2iFormat = document.getElementById('p2iFormat');
const p2iScale = document.getElementById('p2iScale');
const p2iBtn = document.getElementById('p2iBtn');
const p2iStatus = document.getElementById('p2iStatus');

let p2iFile = null;

if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

function triggerDownload(dataUrl, fileName) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    link.click();
}

if (p2iInput) {
    p2iInput.addEventListener('change', (event) => {
        p2iFile = event.target.files?.[0] || null;
        p2iStatus.textContent = p2iFile ? `${p2iFile.name} ausgewählt.` : 'Bitte eine PDF wählen.';
    });
}

if (p2iBtn) {
    p2iBtn.addEventListener('click', async () => {
        if (!p2iFile) {
            alert('Bitte zuerst eine PDF-Datei auswählen.');
            return;
        }

        if (!window.pdfjsLib) {
            alert('PDF.js konnte nicht geladen werden.');
            return;
        }

        p2iBtn.disabled = true;
        p2iBtn.textContent = 'Konvertiere...';

        try {
            const format = (p2iFormat.value || 'png').toLowerCase();
            const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
            const quality = format === 'jpg' ? 0.92 : undefined;
            const scale = Math.max(1, Math.min(3, Number(p2iScale.value || '1.5')));

            const bytes = await p2iFile.arrayBuffer();
            const pdf = await window.pdfjsLib.getDocument({ data: bytes }).promise;
            const baseName = p2iFile.name.replace(/\.pdf$/i, '');

            for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
                p2iStatus.textContent = `Verarbeite Seite ${pageNo}/${pdf.numPages}...`;

                const page = await pdf.getPage(pageNo);
                const viewport = page.getViewport({ scale });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d', { alpha: false });

                canvas.width = Math.floor(viewport.width);
                canvas.height = Math.floor(viewport.height);

                await page.render({ canvasContext: context, viewport }).promise;

                const dataUrl = canvas.toDataURL(mimeType, quality);
                const suffix = String(pageNo).padStart(2, '0');
                triggerDownload(dataUrl, `${baseName}-seite-${suffix}.${format}`);
            }

            p2iStatus.textContent = `${pdf.numPages} Bilddatei(en) erstellt.`;
        } catch {
            alert('Konvertierung fehlgeschlagen.');
        } finally {
            p2iBtn.disabled = false;
            p2iBtn.textContent = 'PDF zu Bildern';
        }
    });
}
