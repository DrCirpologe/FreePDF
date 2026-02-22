const generateCVBtn = document.getElementById('generateCVBtn');
const cvPreview = document.getElementById('cvPreview');
const cvMeta = document.getElementById('cvMeta');

function sanitizeValue(value) {
    return (value || '').trim();
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden.'));
        reader.readAsDataURL(file);
    });
}

function drawSection(pdf, title, text, y, maxWidth) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(title, 20, y);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    const lines = pdf.splitTextToSize(text || '-', maxWidth);
    pdf.text(lines, 20, y + 6);
    return y + 10 + lines.length * 5;
}

async function createCVPDF(formData) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('PDF-Bibliothek konnte nicht geladen werden. Bitte Seite neu laden.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const maxWidth = 170;

    pdf.setDrawColor(229, 57, 53);
    pdf.setLineWidth(0.8);
    pdf.line(20, 18, 190, 18);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.text(formData.name || 'Unbenannt', 20, 30);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(16);
    pdf.text(formData.jobTitle || '-', 20, 39);

    if (formData.photo) {
        const imageFormat = formData.photoFormat === 'png' ? 'PNG' : 'JPEG';
        pdf.addImage(formData.photo, imageFormat, 150, 22, 36, 36, undefined, 'FAST');
    }

    let cursorY = 52;
    cursorY = drawSection(pdf, 'Profil', formData.summary, cursorY, maxWidth);
    cursorY = drawSection(pdf, 'Berufserfahrung', formData.experience, cursorY, maxWidth);
    cursorY = drawSection(pdf, 'Ausbildung', formData.education, cursorY, maxWidth);
    drawSection(pdf, 'Fähigkeiten', formData.skills, cursorY, maxWidth);

    pdf.save('lebenslauf.pdf');
}

async function readFormData() {
    const name = sanitizeValue(document.getElementById('name').value);
    const jobTitle = sanitizeValue(document.getElementById('jobTitle').value);
    const summary = sanitizeValue(document.getElementById('summary').value);
    const experience = sanitizeValue(document.getElementById('experience').value);
    const education = sanitizeValue(document.getElementById('education').value);
    const skills = sanitizeValue(document.getElementById('skills').value);
    const template = document.getElementById('templateSelect').value;

    if (!name || !jobTitle) {
        alert('Bitte mindestens Name und Berufsbezeichnung ausfüllen.');
        return;
    }

    const formData = { name, jobTitle, summary, experience, education, skills, template };
    const photoInput = document.getElementById('photo');
    if (photoInput.files.length > 0) {
        const file = photoInput.files[0];
        formData.photo = await readFileAsDataUrl(file);
        formData.photoFormat = file.type === 'image/png' ? 'png' : 'jpg';
    }

    cvPreview.textContent = `${name} · ${jobTitle} · ${template} ausgewählt.`;
    cvMeta.textContent = 'PDF wurde erstellt und heruntergeladen.';

    await createCVPDF(formData);
}

if (generateCVBtn) {
    generateCVBtn.addEventListener('click', async () => {
        generateCVBtn.disabled = true;
        generateCVBtn.textContent = 'PDF wird erstellt...';
        try {
            await readFormData();
        } catch {
            alert('Beim Erstellen des Lebenslaufs ist ein Fehler aufgetreten.');
        } finally {
            generateCVBtn.disabled = false;
            generateCVBtn.textContent = 'Lebenslauf als PDF erstellen';
        }
    });
}