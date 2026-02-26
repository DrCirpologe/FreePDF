const numberInput = document.getElementById('numberInput');
const numberStartInput = document.getElementById('numberStart');
const numberExcludeInput = document.getElementById('numberExclude');
const numberSkipFirstInput = document.getElementById('numberSkipFirst');
const numberPageMap = document.getElementById('numberPageMap');
const numberBtn = document.getElementById('numberBtn');
const numberMeta = document.getElementById('numberMeta');

let numberFiles = [];
let sourceEditIds = [];
let previewPageCount = 0;
let excludedPages = new Set();

function parsePageSelection(value, maxPages, allowOverflow = false) {
    const cleaned = (value || '').replace(/\s/g, '');
    if (!cleaned) {
        return new Set();
    }

    const result = new Set();
    const parts = cleaned.split(',').filter(Boolean);

    for (const part of parts) {
        if (part.includes('-')) {
            const [startRaw, endRaw] = part.split('-');
            const start = Number(startRaw);
            const end = Number(endRaw);

            if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
                throw new Error('Ungültiger Seitenbereich.');
            }

            if (!allowOverflow && end > maxPages) {
                throw new Error('Ungültiger Seitenbereich.');
            }

            const from = Math.max(1, start);
            const to = allowOverflow ? Math.min(end, maxPages) : end;
            for (let page = from; page <= to; page += 1) {
                if (page >= 1 && page <= maxPages) {
                    result.add(page);
                }
            }
        } else {
            const page = Number(part);
            if (!Number.isInteger(page) || page < 1) {
                throw new Error('Ungültige Seitenzahl.');
            }

            if (!allowOverflow && page > maxPages) {
                throw new Error('Ungültige Seitenzahl.');
            }

            if (page <= maxPages) {
                result.add(page);
            }
        }
    }

    return result;
}

function formatExcludedPages(values) {
    return Array.from(values).sort((a, b) => a - b).join(',');
}

function renderPageMap() {
    if (!numberPageMap) {
        return;
    }

    if (!previewPageCount) {
        numberPageMap.innerHTML = '<div class="page-map-empty">PDF laden, um Seiten 1, 2, 3 ... zu sehen.</div>';
        return;
    }

    excludedPages = new Set(Array.from(excludedPages).filter((page) => page >= 1 && page <= previewPageCount));
    if (numberExcludeInput) {
        numberExcludeInput.value = formatExcludedPages(excludedPages);
    }

    const chips = [];
    for (let page = 1; page <= previewPageCount; page += 1) {
        const isExcluded = excludedPages.has(page);
        chips.push(`<button type="button" class="page-chip ${isExcluded ? 'is-excluded' : ''}" data-page="${page}" aria-pressed="${isExcluded}">${page}</button>`);
    }

    numberPageMap.innerHTML = chips.join('');
}

async function readPageCount(file) {
    if (!file || !window.PDFLib) {
        return 0;
    }
    const { PDFDocument } = window.PDFLib;
    const bytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(bytes);
    return pdfDoc.getPageCount();
}

async function refreshSelectedFileState(files) {
    const selected = Array.isArray(files) ? files.filter(Boolean) : [];
    if (!selected.length) {
        numberFiles = [];
        previewPageCount = 0;
        excludedPages = new Set();
        if (numberExcludeInput) {
            numberExcludeInput.value = '';
        }
        if (numberSkipFirstInput) {
            numberSkipFirstInput.checked = false;
        }
        renderPageMap();
        numberMeta.textContent = 'Bitte eine PDF wählen.';
        return;
    }

    numberFiles = selected;
    previewPageCount = await readPageCount(numberFiles[0]);
    excludedPages = new Set();
    if (numberExcludeInput) {
        numberExcludeInput.value = '';
    }
    if (numberSkipFirstInput) {
        numberSkipFirstInput.checked = false;
    }
    renderPageMap();
    numberMeta.textContent = `${numberFiles.length} PDF(s) ausgewählt. Vorschau zeigt Datei 1 (${previewPageCount} Seite(n)).`;
}

async function preloadFromSavedSelection() {
    if (!window.PDFResultsManager) {
        return;
    }

    const selected = await window.PDFResultsManager.consumeToolSelectionAsFiles();
    if (!selected.length) {
        return;
    }

    sourceEditIds = window.PDFResultsManager.getActiveEditIds();

    const dt = new DataTransfer();
    selected.forEach((file) => dt.items.add(file));
    numberInput.files = dt.files;

    await refreshSelectedFileState(selected);
    numberMeta.textContent = `${selected.length} PDF(s) aus Weiter bearbeiten geladen. Vorschau zeigt Datei 1 (${previewPageCount} Seite(n)).`;
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

function getPdfBaseName(fileName) {
    const safe = String(fileName || 'dokument')
        .replace(/\.download$/i, '')
        .replace(/\.pdf$/i, '')
        .trim();
    return safe || 'dokument';
}

function getPosition(pageWidth, pageHeight, textWidth) {
    return { x: pageWidth - textWidth - 20, y: pageHeight - 24 };
}

if (numberInput) {
    numberInput.addEventListener('change', async (event) => {
        try {
            await refreshSelectedFileState(Array.from(event.target.files || []));
        } catch {
            numberMeta.textContent = 'PDF konnte nicht gelesen werden.';
        }
    });
}

if (numberExcludeInput) {
    numberExcludeInput.addEventListener('blur', () => {
        if (!previewPageCount) {
            return;
        }
        try {
            excludedPages = parsePageSelection(numberExcludeInput.value, previewPageCount, false);
            renderPageMap();
        } catch {
            numberMeta.textContent = 'Ausschluss prüfen: z. B. 1,3 oder 5-8';
        }
    });
}

if (numberPageMap) {
    numberPageMap.addEventListener('click', (event) => {
        const chip = event.target.closest('.page-chip');
        if (!chip || !previewPageCount) {
            return;
        }

        const page = Number(chip.dataset.page);
        if (!page) {
            return;
        }

        if (excludedPages.has(page)) {
            excludedPages.delete(page);
        } else {
            excludedPages.add(page);
        }

        renderPageMap();
    });
}

if (numberBtn) {
    numberBtn.addEventListener('click', async () => {
        const pickedFiles = numberFiles.length ? numberFiles : Array.from(numberInput?.files || []);
        if (!pickedFiles.length) {
            alert('Bitte zuerst eine PDF-Datei auswählen.');
            return;
        }

        if (!window.PDFLib) {
            alert('PDF-Bibliothek konnte nicht geladen werden.');
            return;
        }

        numberBtn.disabled = true;
        numberBtn.textContent = 'Verarbeite...';

        try {
            const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
            const startNumber = Number.parseInt(numberStartInput.value || '1', 10);
            const safeStart = Number.isInteger(startNumber) ? startNumber : 1;
            const fontSize = 11;
            let createdCount = 0;
            let batchCurrentNumber = safeStart;

            for (const pickedFile of pickedFiles) {
                const srcBytes = await pickedFile.arrayBuffer();
                const pdfDoc = await PDFDocument.load(srcBytes);
                const pages = pdfDoc.getPages();
                const totalPages = pdfDoc.getPageCount();
                const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

                const excludedForFile = parsePageSelection(numberExcludeInput?.value || '', totalPages, true);
                if (numberSkipFirstInput?.checked && totalPages > 0) {
                    excludedForFile.add(1);
                }

                const targetPages = new Set(Array.from({ length: totalPages }, (_, index) => index + 1));
                excludedForFile.forEach((page) => targetPages.delete(page));
                if (!targetPages.size) {
                    continue;
                }

                for (let pageNo = 1; pageNo <= totalPages; pageNo += 1) {
                    if (!targetPages.has(pageNo)) {
                        continue;
                    }

                    const page = pages[pageNo - 1];
                    const { width, height } = page.getSize();
                    const label = String(batchCurrentNumber);
                    const textWidth = font.widthOfTextAtSize(label, fontSize);
                    const pos = getPosition(width, height, textWidth);

                    page.drawText(label, {
                        x: pos.x,
                        y: pos.y,
                        size: fontSize,
                        font,
                        color: rgb(0.2, 0.2, 0.2)
                    });

                    batchCurrentNumber += 1;
                }

                const outBytes = await pdfDoc.save();
                const cleanName = getPdfBaseName(pickedFile.name);
                const fileName = `${cleanName}-seitennummern.pdf`;

                if (window.PDFResultsManager) {
                    await window.PDFResultsManager.addResult({
                        bytes: outBytes,
                        fileName,
                        sourceTool: 'page-numbers'
                    });
                } else {
                    downloadBytes(outBytes, fileName);
                }

                createdCount += 1;
            }

            if (!createdCount) {
                alert('Keine PDF konnte nummeriert werden. Prüfe die Ausschluss-Seiten.');
                return;
            }

            if (window.PDFResultsManager) {
                if (sourceEditIds.length) {
                    await window.PDFResultsManager.deleteResults(sourceEditIds);
                    window.PDFResultsManager.clearActiveEditIds();
                    sourceEditIds = [];
                }
                numberMeta.textContent = `${createdCount} PDF(s) nummeriert. Aktionen unten verfügbar.`;
            } else {
                numberMeta.textContent = `${createdCount} PDF(s) nummeriert und heruntergeladen.`;
            }
        } catch {
            alert('Eingabe prüfen: Ausschluss z. B. 1,3 oder 5-8');
        } finally {
            numberBtn.disabled = false;
            numberBtn.textContent = 'Seitennummern hinzufügen';
        }
    });
}

if (window.PDFResultsManager) {
    window.PDFResultsManager.initPanel();
    preloadFromSavedSelection();
}

renderPageMap();
