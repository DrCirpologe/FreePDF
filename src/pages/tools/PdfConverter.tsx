import { Link } from 'react-router-dom';
import { ArrowRight, FileCog, FileImage, FileText, Image } from 'lucide-react';
import { useMemo, useState } from 'react';

type Action = {
    label: string;
    route: string;
    available: boolean;
    reason?: string;
};

export default function PdfConverter() {
    const [file, setFile] = useState<File | null>(null);

    const extension = useMemo(() => {
        if (!file) return '';
        const idx = file.name.lastIndexOf('.');
        return idx > -1 ? file.name.slice(idx + 1).toLowerCase() : '';
    }, [file]);

    const actions = useMemo<Action[]>(() => {
        if (!file) return [];

        if (extension === 'pdf') {
            return [
                { label: 'PDF in JPG', route: '/pdf-to-jpg', available: true },
                { label: 'PDF OCR', route: '/pdf-ocr', available: true },
                { label: 'PDF bearbeiten', route: '/edit-pdf', available: true },
                { label: 'PDF schwärzen', route: '/redact-pdf', available: true },
                { label: 'PDF in Word', route: '/pdf-to-word', available: false, reason: 'Benötigt Office-Konvertierungsengine' },
                { label: 'PDF in Excel', route: '/pdf-to-excel', available: false, reason: 'Benötigt Office-Konvertierungsengine' },
                { label: 'PDF in PPT', route: '/pdf-to-ppt', available: false, reason: 'Benötigt Office-Konvertierungsengine' },
            ];
        }

        if (['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
            return [
                { label: 'JPG/Bild in PDF', route: '/jpg-to-pdf', available: true },
                { label: 'OCR (Bild)', route: '/ocr', available: true },
            ];
        }

        if (['doc', 'docx'].includes(extension)) {
            return [
                { label: 'Word in PDF', route: '/word-to-pdf', available: false, reason: 'Ohne lokale Office-Engine nicht browserseitig umsetzbar' },
            ];
        }

        if (['ppt', 'pptx'].includes(extension)) {
            return [
                { label: 'PPT in PDF', route: '/ppt-to-pdf', available: false, reason: 'Ohne lokale Office-Engine nicht browserseitig umsetzbar' },
            ];
        }

        if (['xls', 'xlsx'].includes(extension)) {
            return [
                { label: 'Excel in PDF', route: '/excel-to-pdf', available: false, reason: 'Ohne lokale Office-Engine nicht browserseitig umsetzbar' },
            ];
        }

        return [
            { label: 'Dateityp derzeit nicht unterstützt', route: '#', available: false, reason: 'Nutze PDF oder Bilddateien' },
        ];
    }, [file, extension]);

    const icon = useMemo(() => {
        if (extension === 'pdf') return <FileText className="w-5 h-5 text-blue-600" />;
        if (['jpg', 'jpeg', 'png', 'webp'].includes(extension)) return <Image className="w-5 h-5 text-blue-600" />;
        return <FileImage className="w-5 h-5 text-blue-600" />;
    }, [extension]);

    return (
        <div className="w-full max-w-5xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">PDF-Konverter</h1>
                <p className="text-lg text-gray-600">Intelligenter Hub: erkennt Dateityp und zeigt passende Konvertierungswege.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
                <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Datei auswählen</span>
                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="mt-2 block w-full rounded-xl border border-gray-300 px-4 py-3"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                    />
                </label>

                {file && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-2 text-blue-800 font-semibold">
                            {icon}
                            {file.name}
                            <span className="ml-auto text-xs uppercase tracking-wide">{extension || 'ohne Endung'}</span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {actions.map((action, index) => (
                                <div key={`${action.label}-${index}`} className="border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                                    <div>
                                        <div className="font-semibold text-gray-800">{action.label}</div>
                                        {!action.available && action.reason && <div className="text-xs text-gray-500 mt-0.5">{action.reason}</div>}
                                    </div>
                                    {action.available ? (
                                        <Link to={action.route} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold inline-flex items-center gap-2 whitespace-nowrap">
                                            Öffnen <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    ) : (
                                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg whitespace-nowrap">Nicht verfügbar</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!file && (
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <FileCog className="w-4 h-4" /> Wähle eine Datei, um automatisch passende Konvertierungsmöglichkeiten zu sehen.
                    </div>
                )}
            </div>
        </div>
    );
}
