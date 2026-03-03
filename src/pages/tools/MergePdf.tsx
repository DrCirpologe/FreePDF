import { useState } from 'react';
import { Loader2, Download, Trash, GripVertical, FileText } from 'lucide-react';
import PdfUploader from '../../components/PdfUploader';

export default function MergePdf() {
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFilesSelected = (selectedFiles: File[]) => {
        setFiles(prev => [...prev, ...selectedFiles]);
        setMergedPdfUrl(null);
        setError(null);
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const mergePdfs = async () => {
        if (files.length < 2) {
            setError('Bitte wähle mindestens 2 PDF-Dateien zum Zusammenfügen aus.');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const { PDFDocument } = await import('pdf-lib');
            const mergedPdf = await PDFDocument.create();

            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setMergedPdfUrl(url);
        } catch (err: any) {
            setError(err.message || 'Beim Zusammenfügen der PDFs ist ein Fehler aufgetreten.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-4xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">PDF zusammenfügen</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Füge mehrere PDF-Dateien in der gewünschten Reihenfolge zu einer einzigen Datei zusammen.
                    Einfach, schnell und sicher direkt in deinem Browser.
                </p>
            </div>

            {!mergedPdfUrl ? (
                <div className="space-y-8">
                    <PdfUploader
                        onFilesSelected={handleFilesSelected}
                        multiple={true}
                        colorTheme="blue"
                        title="PDFs hier ablegen"
                    />

                    {files.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-500" /> Ausgewählte Dateien ({files.length})
                            </h3>

                            <ul className="space-y-3 mb-6">
                                {files.map((file, idx) => (
                                    <li key={`${file.name}-${idx}`} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                                        <span className="flex-1 font-medium text-sm text-gray-700 truncate">{file.name}</span>
                                        <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-500 p-1 transition-colors">
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            {error && <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>}

                            <button
                                onClick={mergePdfs}
                                disabled={files.length < 2 || isProcessing}
                                className="w-full btn-primary text-lg font-bold py-4 rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <><Loader2 className="animate-spin w-6 h-6" /> PDFs werden zusammengefügt...</>
                                ) : (
                                    'PDFs zusammenfügen'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-10 text-center animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Download className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Erfolgreich zusammengefügt!</h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Deine neue PDF-Datei ist fertig und bereit zum Download.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a
                            href={mergedPdfUrl}
                            download="zusammengefunden-freepdf.pdf"
                            className="btn-primary text-lg font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2"
                        >
                            <Download className="w-5 h-5" /> Datei herunterladen
                        </a>
                        <button
                            onClick={() => { setFiles([]); setMergedPdfUrl(null); }}
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-lg font-bold py-3 px-8 rounded-xl transition-colors"
                        >
                            Neu starten
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
