const rotateInput = document.getElementById('rotateInput');
const rotatePagesInput = document.getElementById('rotatePages');
const rotateDegreesInput = document.getElementById('rotateDegrees');
const rotateBtn = document.getElementById('rotateBtn');
const rotateMeta = document.getElementById('rotateMeta');

let rotateFile = null;

function parsePages(value, maxPages) {
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

if (rotateInput) {
    rotateInput.addEventListener('change', (event) => {
        rotateFile = event.target.files?.[0] || null;
        rotateMeta.textContent = rotateFile ? `${rotateFile.name} ausgewählt.` : 'Bitte eine PDF wählen.';
    });
}

if (rotateBtn) {
    rotateBtn.addEventListener('click', async () => {
        if (!rotateFile) {
            alert('Bitte zuerst eine PDF-Datei auswählen.');
            return;
        }

        if (!window.PDFLib) {
            alert('PDF-Bibliothek konnte nicht geladen werden.');
            return;
        }

        rotateBtn.disabled = true;
        rotateBtn.textContent = 'Verarbeite...';

        try {
            const { PDFDocument, degrees } = window.PDFLib;
            const srcBytes = await rotateFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(srcBytes);
            const pageCount = pdfDoc.getPageCount();
            const targetPages = parsePages(rotatePagesInput.value, pageCount);
            const angle = Number(rotateDegreesInput.value || '90');
            const pages = pdfDoc.getPages();

            targetPages.forEach((pageNo) => {
                const page = pages[pageNo - 1];
                const current = page.getRotation()?.angle || 0;
                page.setRotation(degrees((current + angle + 360) % 360));
            });

            const outBytes = await pdfDoc.save();
            const cleanName = rotateFile.name.replace(/\.pdf$/i, '');
            downloadBytes(outBytes, `${cleanName}-rotiert.pdf`);
            rotateMeta.textContent = `${targetPages.size} Seite(n) rotiert.`;
        } catch {
            alert('Eingabe prüfen: z. B. 1,2,4-7');
        } finally {
            rotateBtn.disabled = false;
            rotateBtn.textContent = 'PDF rotieren';
        }
    });
}
