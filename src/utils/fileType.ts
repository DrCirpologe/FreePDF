export type FileKind = 'pdf' | 'image' | 'word' | 'excel' | 'powerpoint' | 'unknown';

const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif', 'tiff']);
const wordExtensions = new Set(['doc', 'docx']);
const excelExtensions = new Set(['xls', 'xlsx']);
const powerpointExtensions = new Set(['ppt', 'pptx']);

export function getFileExtension(fileName: string): string {
    const index = fileName.lastIndexOf('.');
    return index > -1 ? fileName.slice(index + 1).toLowerCase() : '';
}

export function detectFileKind(fileName: string, mimeType?: string): FileKind {
    const extension = getFileExtension(fileName);
    const mime = (mimeType || '').toLowerCase();

    if (extension === 'pdf' || mime === 'application/pdf') return 'pdf';
    if (imageExtensions.has(extension) || mime.startsWith('image/')) return 'image';
    if (wordExtensions.has(extension) || mime.includes('wordprocessingml')) return 'word';
    if (excelExtensions.has(extension) || mime.includes('spreadsheetml')) return 'excel';
    if (powerpointExtensions.has(extension) || mime.includes('presentationml')) return 'powerpoint';

    return 'unknown';
}

export function formatBytes(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export const converterAccept = '.pdf,.jpg,.jpeg,.png,.webp,.bmp,.gif,.tiff,.doc,.docx,.ppt,.pptx,.xls,.xlsx';
