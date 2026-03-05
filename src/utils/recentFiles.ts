import type { FileKind } from './fileType';

export type RecentFileEntry = {
    id: string;
    name: string;
    extension: string;
    kind: FileKind;
    size: number;
    mimeType: string;
    selectedAt: string;
};

const RECENT_FILES_KEY = 'freepdf.recent.converter.files';
const MAX_RECENT = 8;

export function getRecentFiles(): RecentFileEntry[] {
    try {
        const raw = localStorage.getItem(RECENT_FILES_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as RecentFileEntry[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function addRecentFile(entry: Omit<RecentFileEntry, 'id' | 'selectedAt'>): RecentFileEntry[] {
    const now = new Date().toISOString();
    const existing = getRecentFiles().filter((item) => item.name !== entry.name || item.size !== entry.size);

    const next: RecentFileEntry[] = [
        {
            ...entry,
            id: `${entry.name}-${entry.size}-${now}`,
            selectedAt: now,
        },
        ...existing,
    ].slice(0, MAX_RECENT);

    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(next));
    return next;
}

export function clearRecentFiles(): void {
    localStorage.removeItem(RECENT_FILES_KEY);
}
