const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const generatePdfBtn = document.getElementById('generatePdfBtn');
const imageMeta = document.getElementById('imageMeta');

let selectedImages = [];

function refreshMeta() {
    if (!selectedImages.length) {
        imageMeta.textContent = 'Noch keine Bilder ausgewählt.';
        return;
    }

    imageMeta.textContent = `${selectedImages.length} Bild(er) ausgewählt.`;
}

async function renderPreviews() {
    imagePreview.innerHTML = '';

    for (let index = 0; index < selectedImages.length; index += 1) {
        const file = selectedImages[index];

        try {
            const dataUrl = await loadImageData(file);
            const card = document.createElement('div');
            card.className = 'preview-card';

            const preview = document.createElement('img');
            preview.src = dataUrl;
            preview.alt = file.name;

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'preview-remove';
            removeBtn.textContent = 'Entfernen';
            removeBtn.addEventListener('click', () => {
                selectedImages = selectedImages.filter((_, i) => i !== index);
                refreshMeta();
                renderPreviews();
            });

            card.appendChild(preview);
            card.appendChild(removeBtn);
            imagePreview.appendChild(card);
        } catch {
            imageMeta.textContent = 'Mindestens eine Datei konnte nicht gelesen werden.';
        }
    }
}

function loadImageData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve(event.target.result);
        };
        reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden.'));
        reader.readAsDataURL(file);
    });
}

function createImage(dataUrl) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Bild konnte nicht geladen werden.'));
        image.src = dataUrl;
    });
}

if (imageInput) {
    imageInput.addEventListener('change', async (event) => {
        selectedImages = Array.from(event.target.files || []);
        refreshMeta();
        await renderPreviews();
    });
}

if (generatePdfBtn) {
    generatePdfBtn.addEventListener('click', async () => {
        if (selectedImages.length === 0) {
            alert('Bitte wähle mindestens ein Bild aus.');
            return;
        }

        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert('PDF-Bibliothek konnte nicht geladen werden. Bitte Seite neu laden.');
            return;
        }

        const { jsPDF } = window.jspdf;
        let pdf;

        generatePdfBtn.disabled = true;
        generatePdfBtn.textContent = 'PDF wird erstellt...';

        try {
            for (let index = 0; index < selectedImages.length; index += 1) {
                const file = selectedImages[index];
                const dataUrl = await loadImageData(file);
                const image = await createImage(dataUrl);

                const pageWidth = image.width;
                const pageHeight = image.height;
                const orientation = pageWidth >= pageHeight ? 'landscape' : 'portrait';

                if (index === 0) {
                    pdf = new jsPDF({
                        orientation,
                        unit: 'px',
                        format: [pageWidth, pageHeight]
                    });
                } else {
                    pdf.addPage([pageWidth, pageHeight], orientation);
                }

                const format = file.type === 'image/png' ? 'PNG' : 'JPEG';
                pdf.addImage(dataUrl, format, 0, 0, pageWidth, pageHeight, undefined, 'FAST');
            }

            pdf.save('bilder-export.pdf');
            imageMeta.textContent = 'PDF erfolgreich erstellt.';
        } catch {
            alert('Beim Erstellen der PDF ist ein Fehler aufgetreten.');
        } finally {
            generatePdfBtn.disabled = false;
            generatePdfBtn.textContent = 'PDF erstellen';
        }
    });
}
