import { useMemo, useState } from 'react';
import { Download, Loader2, Minimize2, RefreshCcw } from 'lucide-react';
import PdfUploader from '../../components/PdfUploader';

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function CompressPdf() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [compressedSize, setCompressedSize] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const originalSize = useMemo(() => file?.size ?? 0, [file]);

    const onFilesSelected = (files: File[]) => {
        if (!files[0]) return;
        setFile(files[0]);
        setResultUrl(null);
        setCompressedSize(null);
        setError(null);
    };

    const compress = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError(null);

        try {
            const { PDFDocument } = await import('pdf-lib');
            const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
            const out = await pdfDoc.save({ useObjectStreams: true });
            setCompressedSize(out.byteLength);
            const url = URL.createObjectURL(new Blob([out as BlobPart], { type: 'application/pdf' }));
            setResultUrl(url);
        } catch (e: any) {
            setError(e?.message || 'PDF konnte nicht verarbeitet werden.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-4xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">PDF verkleinern</h1>
                <p className="text-lg text-gray-600">Optimiert die PDF-Struktur und erstellt eine kleinere Datei, wenn möglich.</p>
            </div>

            {!resultUrl ? (
                <div className="space-y-8">
                    {!file ? (
                        <PdfUploader onFilesSelected={onFilesSelected} multiple={false} colorTheme="green" title="PDF hier ablegen" />
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
                            <div className="flex items-center gap-2 font-semibold text-gray-700"><Minimize2 className="w-5 h-5 text-green-600" /> {file.name}</div>
                            <p className="text-sm text-gray-600">Originalgröße: <span className="font-semibold">{formatBytes(originalSize)}</span></p>

                            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                            <button onClick={compress} disabled={isProcessing} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Wird optimiert...</> : 'PDF optimieren'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-10 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Fertig</h2>
                    <p className="text-gray-600 mb-4">Optimierung abgeschlossen.</p>
                    <p className="text-sm text-gray-600 mb-8">Original: <span className="font-semibold">{formatBytes(originalSize)}</span> · Neu: <span className="font-semibold">{formatBytes(compressedSize || 0)}</span></p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href={resultUrl} download={`komprimiert-${file?.name || 'pdf'}.pdf`} className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
                            <Download className="w-5 h-5" /> Download
                        </a>
                        <button onClick={() => { setFile(null); setResultUrl(null); setError(null); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
                            <RefreshCcw className="w-5 h-5" /> Neu starten
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
