const signInput = document.getElementById('signInput');
const signatureText = document.getElementById('signatureText');
const signatureImage = document.getElementById('signatureImage');
const signaturePage = document.getElementById('signaturePage');
const signBtn = document.getElementById('signBtn');
const signMeta = document.getElementById('signMeta');

let signFile = null;

async function preloadFromSavedSelection() {
    if (!window.PDFResultsManager) {
        return;
    }

    const selected = await window.PDFResultsManager.consumeToolSelectionAsFiles();
    if (!selected.length) {
        return;
    }

    signFile = selected[0];
    signMeta.textContent = `${signFile.name} aus Weiter bearbeiten geladen.`;
}

function readAsArrayBuffer(file) {
    return file.arrayBuffer();
}

function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden.'));
        reader.readAsDataURL(file);
    });
}

if (signInput) {
    signInput.addEventListener('change', (event) => {
        signFile = event.target.files?.[0] || null;
        signMeta.textContent = signFile ? `${signFile.name} ausgewählt.` : 'Noch keine Datei ausgewählt.';
    });
}

if (signBtn) {
    signBtn.addEventListener('click', async () => {
        if (!signFile) {
            alert('Bitte zuerst eine PDF-Datei auswählen.');
            return;
        }

        if (!window.PDFLib) {
            alert('PDF-Bibliothek konnte nicht geladen werden.');
            return;
        }

        signBtn.disabled = true;
        signBtn.textContent = 'Wird unterschrieben...';

        try {
            const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
            const bytes = await readAsArrayBuffer(signFile);
            const pdfDoc = await PDFDocument.load(bytes);
            const pages = pdfDoc.getPages();

            const requestedPage = Number(signaturePage.value || '1');
            const pageIndex = Number.isInteger(requestedPage) && requestedPage > 0 && requestedPage <= pages.length
                ? requestedPage - 1
                : 0;

            const page = pages[pageIndex];
            const { width } = page.getSize();
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            const signLabel = (signatureText.value || 'Digitale Signatur').trim();
            const timestamp = new Date().toLocaleString('de-DE');

            page.drawRectangle({
                x: width - 200,
                y: 24,
                width: 176,
                height: 58,
                color: rgb(1, 1, 1),
                opacity: 0.92,
                borderColor: rgb(0.9, 0.25, 0.25),
                borderWidth: 1
            });

            page.drawText(signLabel, {
                x: width - 192,
                y: 58,
                size: 11,
                font,
                color: rgb(0.2, 0.18, 0.18)
            });

            page.drawText(`Signiert: ${timestamp}`, {
                x: width - 192,
                y: 42,
                size: 8,
                color: rgb(0.45, 0.4, 0.4)
            });

            const imageFile = signatureImage.files?.[0];
            if (imageFile) {
                const imageData = await readAsDataUrl(imageFile);
                let embedded;

                if (imageFile.type === 'image/png') {
                    embedded = await pdfDoc.embedPng(imageData);
                } else {
                    embedded = await pdfDoc.embedJpg(imageData);
                }

                page.drawImage(embedded, {
                    x: width - 192,
                    y: 28,
                    width: 58,
                    height: 12
                });
            }

            const output = await pdfDoc.save();
            if (window.PDFResultsManager) {
                await window.PDFResultsManager.addResult({
                    bytes: output,
                    fileName: 'unterschrieben.pdf',
                    sourceTool: 'sign-pdf'
                });
                signMeta.textContent = 'PDF unterschrieben. Wähle unten: Herunterladen, Teilen oder Weiter bearbeiten.';
            } else {
                const blob = new Blob([output], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'unterschrieben.pdf';
                link.click();
                URL.revokeObjectURL(url);

                signMeta.textContent = 'PDF erfolgreich unterschrieben.';
            }
        } catch {
            alert('Signieren fehlgeschlagen.');
        } finally {
            signBtn.disabled = false;
            signBtn.textContent = 'PDF unterschreiben';
        }
    });
}

if (window.PDFResultsManager) {
    window.PDFResultsManager.initPanel();
    preloadFromSavedSelection();
}
