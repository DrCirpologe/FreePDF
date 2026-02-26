(function () {
    const DB_NAME = 'freepdf-results-db';
    const STORE_NAME = 'results';
    const DB_VERSION = 1;
    const TOOL_MERGE_PATH = 'merge-pdf.html';
    const TOOL_SELECTION_KEY = 'freepdf-tool-selection';
    const ACTIVE_EDIT_IDS_KEY = 'freepdf-active-edit-ids';
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

    async function hashBlob(blob) {
        try {
            if (!window.crypto || !window.crypto.subtle) {
                return '';
            }
            const buffer = await blob.arrayBuffer();
            const digest = await window.crypto.subtle.digest('SHA-256', buffer);
            const hex = Array.from(new Uint8Array(digest))
                .map((byte) => byte.toString(16).padStart(2, '0'))
                .join('');
            return hex;
        } catch {
            return '';
        }
    }

    function normalizePdfFileName(fileName) {
        const raw = String(fileName || '').trim();
        let safe = raw || 'dokument.pdf';

        safe = safe.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim();
        safe = safe.replace(/\.download$/i, '');
        safe = safe.replace(/\.(pdf)+$/i, '.pdf');

        if (!/\.pdf$/i.test(safe)) {
            safe = `${safe}.pdf`;
        }

        if (!safe || safe === '.pdf') {
            return 'dokument.pdf';
        }

        return safe;
    }

    async function addResult({ bytes, blob, fileName, sourceTool }) {
        const db = await openDb();
        const safeName = normalizePdfFileName(fileName);
        const safeBlob = blob || new Blob([bytes], { type: 'application/pdf' });
        const safeSourceTool = sourceTool || 'tool';
        const hash = await hashBlob(safeBlob);
        const dedupeId = hash
            ? `${safeSourceTool}::${safeName.toLowerCase()}::${hash}`
            : generateId();

        const item = {
            id: dedupeId,
            fileName: safeName,
            sourceTool: safeSourceTool,
            createdAt: Date.now(),
            size: safeBlob.size,
            blob: safeBlob
        };

        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const request = tx.objectStore(STORE_NAME).put(item);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error || new Error('Speichern fehlgeschlagen.'));
        });

        notifyResultsUpdated();

        return dedupeId;
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

    async function deleteResults(ids) {
        const targetIds = Array.isArray(ids) ? ids.filter(Boolean) : [];
        if (!targetIds.length) {
            return;
        }

        const db = await openDb();

        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            targetIds.forEach((id) => store.delete(id));
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error || new Error('Batch-Löschen fehlgeschlagen.'));
        });

        notifyResultsUpdated();
    }

    function createFileFromItem(item) {
        return new File([item.blob], normalizePdfFileName(item.fileName), { type: 'application/pdf' });
    }

    function triggerDownload(item) {
        const url = URL.createObjectURL(item.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = normalizePdfFileName(item.fileName);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            URL.revokeObjectURL(url);
            link.remove();
        }, 30000);
    }

    function downloadBlob(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            URL.revokeObjectURL(url);
            link.remove();
        }, 30000);
    }

    async function ensureJsZip() {
        if (window.JSZip) {
            return window.JSZip;
        }

        await new Promise((resolve, reject) => {
            const existing = document.querySelector('script[data-freepdf-jszip="1"]');
            if (existing) {
                existing.addEventListener('load', resolve, { once: true });
                existing.addEventListener('error', () => reject(new Error('JSZip konnte nicht geladen werden.')), { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.async = true;
            script.dataset.freepdfJszip = '1';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('JSZip konnte nicht geladen werden.'));
            document.head.appendChild(script);
        });

        if (!window.JSZip) {
            throw new Error('ZIP-Funktion steht nicht zur Verfügung.');
        }

        return window.JSZip;
    }

    async function downloadAllAsZip(items) {
        const JSZip = await ensureJsZip();
        const zip = new JSZip();
        const usedNames = new Map();

        for (const item of items) {
            const originalName = normalizePdfFileName(item.fileName);
            const dotIndex = originalName.toLowerCase().lastIndexOf('.pdf');
            const baseName = dotIndex > 0 ? originalName.slice(0, dotIndex) : originalName;

            const nextIndex = (usedNames.get(originalName) || 0) + 1;
            usedNames.set(originalName, nextIndex);

            const finalName = nextIndex === 1
                ? originalName
                : `${baseName}-${nextIndex}.pdf`;

            zip.file(finalName, item.blob);
        }

        const zipBlob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });

        const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
        downloadBlob(zipBlob, `freepdf-download-${stamp}.zip`);
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

    function setActiveEditIds(ids) {
        sessionStorage.setItem(ACTIVE_EDIT_IDS_KEY, JSON.stringify(Array.isArray(ids) ? ids : []));
    }

    function getActiveEditIds() {
        const raw = sessionStorage.getItem(ACTIVE_EDIT_IDS_KEY);
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

    function clearActiveEditIds() {
        sessionStorage.removeItem(ACTIVE_EDIT_IDS_KEY);
    }

    function resolveToolPath(path) {
        if (typeof path === 'string' && path.trim()) {
            return path.trim();
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
                    <button type="button" class="btn btn-ghost result-download-all-btn">Alle herunterladen</button>
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
        const itemsById = new Map(items.map((item) => [item.id, item]));

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
            button.addEventListener('click', () => {
                const item = itemsById.get(button.dataset.id);
                if (!item) {
                    return;
                }
                triggerDownload(item);

                Promise.resolve()
                    .then(() => deleteResult(item.id))
                    .then(() => renderList({ panelRoot, mergePath }))
                    .catch(() => {
                    });
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

        panel.querySelector('.result-download-all-btn').addEventListener('click', async () => {
            const items = await listResults();
            if (!items.length) {
                alert('Noch keine PDFs zum Herunterladen vorhanden.');
                return;
            }

            if (items.length === 1) {
                triggerDownload(items[0]);
                return;
            }

            try {
                await downloadAllAsZip(items);
            } catch (error) {
                alert(error?.message || 'ZIP-Download fehlgeschlagen.');
            }
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
            setActiveEditIds(toolSelection.ids);
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

        setActiveEditIds(ids);
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
        deleteResults,
        clearAllResults,
        initPanel,
        consumeMergeSelectionAsFiles,
        consumeToolSelectionAsFiles,
        getMergeSelection,
        setMergeSelection,
        clearMergeSelection,
        setToolSelection,
        clearToolSelection,
        setActiveEditIds,
        getActiveEditIds,
        clearActiveEditIds
    };
})();
