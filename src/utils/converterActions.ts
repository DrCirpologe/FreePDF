import type { FileKind } from './fileType';

export type ConverterAction = {
    label: string;
    route: string;
    available: boolean;
    reason?: string;
};

const OFFICE_REASON = 'Benötigt Office-Konvertierungsengine';

export function getConverterActions(kind: FileKind): ConverterAction[] {
    if (kind === 'pdf') {
        return [
            { label: 'PDF in JPG', route: '/pdf-to-jpg', available: true },
            { label: 'PDF OCR', route: '/pdf-ocr', available: true },
            { label: 'PDF bearbeiten', route: '/edit-pdf', available: true },
            { label: 'PDF schwärzen', route: '/redact-pdf', available: true },
            { label: 'PDF in Word', route: '/pdf-to-word', available: false, reason: OFFICE_REASON },
            { label: 'PDF in Excel', route: '/pdf-to-excel', available: false, reason: OFFICE_REASON },
            { label: 'PDF in PPT', route: '/pdf-to-ppt', available: false, reason: OFFICE_REASON },
        ];
    }

    if (kind === 'image') {
        return [
            { label: 'Bild in PDF', route: '/jpg-to-pdf', available: true },
            { label: 'OCR (Bild)', route: '/ocr', available: true },
        ];
    }

    if (kind === 'word') {
        return [{ label: 'Word in PDF', route: '/word-to-pdf', available: false, reason: OFFICE_REASON }];
    }

    if (kind === 'powerpoint') {
        return [{ label: 'PPT in PDF', route: '/ppt-to-pdf', available: false, reason: OFFICE_REASON }];
    }

    if (kind === 'excel') {
        return [{ label: 'Excel in PDF', route: '/excel-to-pdf', available: false, reason: OFFICE_REASON }];
    }

    return [{ label: 'Dateityp derzeit nicht unterstützt', route: '#', available: false, reason: 'Nutze PDF oder Bilddateien' }];
}
