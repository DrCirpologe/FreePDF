(function () {
    const DB_NAME = 'freepdf-results-db';
    const STORE_NAME = 'results';
    const DB_VERSION = 1;
    const TOOL_MERGE_PATH = 'merge-pdf.html';
    const TOOL_SELECTION_KEY = 'freepdf-tool-selection';
    const RESULTS_UPDATED_EVENT = 'freepdf-results-updated';
    const EDIT_TARGETS = [
        { path: 'merge-pdf.html', label: 'Zusammenfügen' },
        { path: 'split-pdf.html', label: 'Aufteilen' },
        { path: 'compress-pdf.html', label: 'Komprimieren' },
        { path: 'rotate-pdf.html', label: 'Rotieren' },
        { path: 'watermark-pdf.html', label: 'Wasserzeichen' },
        { path: 'page-numbers.html', label: 'Seitennummern' },
        { path: 'sign-pdf.html', label: 'Unterschreiben' },
        { path: 'remove-metadata.html', label: 'Metadaten entfernen' }
    ];

    function notifyResultsUpdated() {
        window.dispatchEvent(new CustomEvent(RESULTS_UPDATED_EVENT));
    }

    function openDb() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error('IndexedDB konnte nicht geöffnet werden.'));
        });
    }

    function generateId() {
        const sequenceRaw = sessionStorage.getItem('freepdf-result-seq') || '0';
        const sequence = Number.parseInt(sequenceRaw, 10) + 1;
        sessionStorage.setItem('freepdf-result-seq', String(sequence));

        if (window.crypto && window.crypto.randomUUID) {
            return `pdf-${sequence}-${window.crypto.randomUUID()}`;
        }
        return `pdf-${Date.now()}-${sequence}-${Math.random().toString(16).slice(2)}`;
    }

    function formatBytes(bytes) {
        if (!Number.isFinite(bytes) || bytes <= 0) {
            return '0 B';
        }
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex += 1;
        }
        return `${size.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
    }

    async function addResult({ bytes, blob, fileName, sourceTool }) {
        const db = await openDb();
        const safeName = (fileName || 'dokument.pdf').trim() || 'dokument.pdf';
        const safeBlob = blob || new Blob([bytes], { type: 'application/pdf' });

        let savedId = null;
        let attempts = 0;

        while (!savedId && attempts < 5) {
            attempts += 1;
            const id = generateId();

            const item = {
                id,
                fileName: safeName,
                sourceTool: sourceTool || 'tool',
                createdAt: Date.now(),
                size: safeBlob.size,
                blob: safeBlob
            };

            const inserted = await new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const request = tx.objectStore(STORE_NAME).add(item);

                request.onsuccess = () => resolve(true);
                request.onerror = () => {
                    if (request.error && request.error.name === 'ConstraintError') {
                        resolve(false);
                        return;
                    }
                    reject(request.error || new Error('Speichern fehlgeschlagen.'));
                };
            });

            if (inserted) {
                savedId = id;
            }
        }

        if (!savedId) {
            throw new Error('PDF konnte nicht eindeutig gespeichert werden. Bitte erneut versuchen.');
        }

        notifyResultsUpdated();

        return savedId;
    }

    async function listResults() {
        const db = await openDb();

        const items = await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const request = tx.objectStore(STORE_NAME).getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error || new Error('Laden fehlgeschlagen.'));
        });

        return items.sort((left, right) => right.createdAt - left.createdAt);
    }

    async function getResult(id) {
        const db = await openDb();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const request = tx.objectStore(STORE_NAME).get(id);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error || new Error('Element konnte nicht geladen werden.'));
        });
    }

    async function deleteResult(id) {
        const db = await openDb();

        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).delete(id);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error || new Error('Löschen fehlgeschlagen.'));
        });

        notifyResultsUpdated();
    }

    async function clearAllResults() {
        const db = await openDb();

        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).clear();
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error || new Error('Bereinigen fehlgeschlagen.'));
        });

        notifyResultsUpdated();
    }

    function createFileFromItem(item) {
        return new File([item.blob], item.fileName, { type: 'application/pdf' });
    }

    function triggerDownload(item) {
        const url = URL.createObjectURL(item.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = item.fileName;
        link.click();
        URL.revokeObjectURL(url);
    }

    async function tryShare(item) {
        const file = createFileFromItem(item);

        if (!navigator.share || !navigator.canShare || !navigator.canShare({ files: [file] })) {
            throw new Error('Teilen wird auf diesem Gerät/Browser nicht unterstützt.');
        }

        await navigator.share({
            title: item.fileName,
            text: 'PDF aus Free PDF Studio',
            files: [file]
        });
    }

    function setMergeSelection(ids) {
        sessionStorage.setItem('freepdf-merge-selection', JSON.stringify(ids));
    }

    function setToolSelection(ids, targetPath) {
        sessionStorage.setItem(TOOL_SELECTION_KEY, JSON.stringify({ ids, targetPath }));
    }

    function getToolSelection() {
        const raw = sessionStorage.getItem(TOOL_SELECTION_KEY);
        if (!raw) {
            return { ids: [], targetPath: '' };
        }

        try {
            const parsed = JSON.parse(raw);
            const ids = Array.isArray(parsed?.ids) ? parsed.ids : [];
            const targetPath = typeof parsed?.targetPath === 'string' ? parsed.targetPath : '';
            return { ids, targetPath };
        } catch {
            return { ids: [], targetPath: '' };
        }
    }

    function getMergeSelection() {
        const raw = sessionStorage.getItem('freepdf-merge-selection');
        if (!raw) {
            return [];
        }

        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    function clearMergeSelection() {
        sessionStorage.removeItem('freepdf-merge-selection');
    }

    function clearToolSelection() {
        sessionStorage.removeItem(TOOL_SELECTION_KEY);
    }

    function resolveToolPath(path) {
        if (path && path.includes('/')) {
            return path;
        }
        return TOOL_MERGE_PATH;
    }

    function getCurrentToolPath() {
        const path = window.location.pathname || '';
        const parts = path.split('/').filter(Boolean);
        return parts.length ? parts[parts.length - 1] : '';
    }

    function ensureEditModal() {
        let overlay = document.querySelector('.result-edit-modal-overlay');
        if (overlay) {
            return overlay;
        }

        overlay = document.createElement('div');
        overlay.className = 'result-edit-modal-overlay hidden';
        overlay.innerHTML = `
            <div class="result-edit-modal" role="dialog" aria-modal="true" aria-label="Nächsten Schritt wählen">
                <h3>Nächsten Schritt wählen</h3>
                <p>Was möchtest du als Nächstes mit den ausgewählten PDFs machen?</p>
                <div class="result-edit-options"></div>
                <button type="button" class="btn btn-ghost result-edit-cancel">Abbrechen</button>
            </div>
        `;

        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                overlay.classList.add('hidden');
                document.body.classList.remove('result-modal-open');
            }
        });

        const cancelButton = overlay.querySelector('.result-edit-cancel');
        cancelButton.addEventListener('click', () => {
            overlay.classList.add('hidden');
            document.body.classList.remove('result-modal-open');
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !overlay.classList.contains('hidden')) {
                overlay.classList.add('hidden');
                document.body.classList.remove('result-modal-open');
            }
        });

        document.body.appendChild(overlay);
        return overlay;
    }

    function openEditTargetModal(ids) {
        const overlay = ensureEditModal();
        const optionsRoot = overlay.querySelector('.result-edit-options');
        optionsRoot.innerHTML = '';

        EDIT_TARGETS.forEach((target) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn result-edit-option';
            button.textContent = target.label;
            button.addEventListener('click', () => {
                setToolSelection(ids, target.path);
                overlay.classList.add('hidden');
                document.body.classList.remove('result-modal-open');
                window.location.href = resolveToolPath(target.path);
            });
            optionsRoot.appendChild(button);
        });

        overlay.classList.remove('hidden');
        document.body.classList.add('result-modal-open');
    }

    function buildPanelMarkup(title) {
        const panel = document.createElement('section');
        panel.className = 'panel result-panel hidden';
        panel.innerHTML = `
            <div class="result-panel-head">
                <h2>${title}</h2>
                <div class="result-panel-head-actions">
                    <button type="button" class="btn btn-ghost result-share-all-btn">Alle teilen</button>
                    <button type="button" class="btn btn-ghost result-merge-all-btn">Alle weiter bearbeiten</button>
                    <button type="button" class="btn btn-ghost result-clear-btn">Liste leeren</button>
                </div>
            </div>
            <p class="result-panel-info">Erstellte PDFs bleiben hier, bis du sie herunterlädst oder teilst.</p>
            <div class="result-list" data-result-list></div>
        `;
        return panel;
    }

    async function renderList({ panelRoot, mergePath }) {
        const listRoot = panelRoot.querySelector('[data-result-list]');
        const items = await listResults();

        if (!items.length) {
            panelRoot.classList.add('hidden');
            listRoot.innerHTML = '';
            return;
        }

        panelRoot.classList.remove('hidden');

        listRoot.innerHTML = '';

        items.forEach((item) => {
            const row = document.createElement('article');
            row.className = 'result-item';

            const createdAt = new Date(item.createdAt).toLocaleString('de-DE');
            row.innerHTML = `
                <div class="result-meta">
                    <strong>${item.fileName}</strong>
                    <span>${formatBytes(item.size)} · ${createdAt}</span>
                </div>
                <div class="result-actions">
                    <button type="button" class="btn result-action" data-action="download" data-id="${item.id}">Herunterladen</button>
                    <button type="button" class="btn result-action" data-action="share" data-id="${item.id}">Teilen</button>
                    <button type="button" class="btn btn-ghost result-action" data-action="merge" data-id="${item.id}">Weiter bearbeiten</button>
                </div>
            `;

            listRoot.appendChild(row);
        });

        listRoot.querySelectorAll('[data-action="download"]').forEach((button) => {
            button.addEventListener('click', async () => {
                const item = await getResult(button.dataset.id);
                if (!item) {
                    return;
                }
                triggerDownload(item);
                await deleteResult(item.id);
                await renderList({ panelRoot, mergePath });
            });
        });

        listRoot.querySelectorAll('[data-action="share"]').forEach((button) => {
            button.addEventListener('click', async () => {
                const item = await getResult(button.dataset.id);
                if (!item) {
                    return;
                }

                try {
                    await tryShare(item);
                    await deleteResult(item.id);
                    await renderList({ panelRoot, mergePath });
                } catch (error) {
                    alert(error?.message || 'Teilen fehlgeschlagen.');
                }
            });
        });

        listRoot.querySelectorAll('[data-action="merge"]').forEach((button) => {
            button.addEventListener('click', () => {
                openEditTargetModal([button.dataset.id]);
            });
        });
    }

    function ensurePanelContainer(mountSelector) {
        if (mountSelector) {
            const mount = document.querySelector(mountSelector);
            if (mount) {
                return mount;
            }
        }

        return document.querySelector('.tool-layout') || document.querySelector('.tool-container') || document.body;
    }

    async function initPanel({ mountSelector, title = 'Deine erzeugten PDFs', mergePath = 'merge-pdf.html' } = {}) {
        const container = ensurePanelContainer(mountSelector);
        if (!container || document.querySelector('.result-panel')) {
            return;
        }

        const panel = buildPanelMarkup(title);
        container.appendChild(panel);

        panel.querySelector('.result-clear-btn').addEventListener('click', async () => {
            await clearAllResults();
            clearMergeSelection();
            await renderList({ panelRoot: panel, mergePath });
        });

        window.addEventListener(RESULTS_UPDATED_EVENT, async () => {
            await renderList({ panelRoot: panel, mergePath });
        });

        panel.querySelector('.result-merge-all-btn').addEventListener('click', async () => {
            const items = await listResults();
            if (!items.length) {
                alert('Noch keine PDFs zum Weiterbearbeiten vorhanden.');
                return;
            }
            openEditTargetModal(items.map((item) => item.id));
        });

        panel.querySelector('.result-share-all-btn').addEventListener('click', async () => {
            const items = await listResults();
            if (!items.length) {
                alert('Noch keine PDFs zum Teilen vorhanden.');
                return;
            }

            const files = items.map((item) => createFileFromItem(item));
            if (!navigator.share || !navigator.canShare || !navigator.canShare({ files })) {
                alert('Alle teilen wird auf diesem Gerät/Browser nicht unterstützt.');
                return;
            }

            try {
                await navigator.share({
                    title: 'PDFs aus Free PDF Studio',
                    text: 'Mehrere PDFs aus Free PDF Studio',
                    files
                });

                for (const item of items) {
                    await deleteResult(item.id);
                }
                await renderList({ panelRoot: panel, mergePath });
            } catch (error) {
                if (error?.name === 'AbortError') {
                    return;
                }
                alert(error?.message || 'Teilen fehlgeschlagen.');
            }
        });

        await renderList({ panelRoot: panel, mergePath });
    }

    async function consumeMergeSelectionAsFiles() {
        const toolSelection = getToolSelection();
        if (toolSelection.ids.length && toolSelection.targetPath === TOOL_MERGE_PATH) {
            const files = [];
            for (const id of toolSelection.ids) {
                const item = await getResult(id);
                if (item) {
                    files.push(createFileFromItem(item));
                }
            }
            clearToolSelection();
            return files;
        }

        const ids = getMergeSelection();
        if (!ids.length) {
            return [];
        }

        const files = [];
        for (const id of ids) {
            const item = await getResult(id);
            if (item) {
                files.push(createFileFromItem(item));
            }
        }

        clearMergeSelection();
        return files;
    }

    async function consumeToolSelectionAsFiles() {
        const { ids, targetPath } = getToolSelection();
        const currentTool = getCurrentToolPath();

        if (!ids.length || !targetPath || targetPath !== currentTool) {
            return [];
        }

        const files = [];
        for (const id of ids) {
            const item = await getResult(id);
            if (item) {
                files.push(createFileFromItem(item));
            }
        }

        clearToolSelection();
        return files;
    }

    window.PDFResultsManager = {
        addResult,
        listResults,
        getResult,
        deleteResult,
        clearAllResults,
        initPanel,
        consumeMergeSelectionAsFiles,
        consumeToolSelectionAsFiles,
        getMergeSelection,
        setMergeSelection,
        clearMergeSelection,
        setToolSelection,
        clearToolSelection
    };
})();
