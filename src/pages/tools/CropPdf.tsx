import { useState } from 'react';
import { Crop, Download, Loader2, RefreshCcw } from 'lucide-react';
import PdfUploader from '../../components/PdfUploader';

export default function CropPdf() {
    const [file, setFile] = useState<File | null>(null);
    const [top, setTop] = useState(20);
    const [right, setRight] = useState(20);
    const [bottom, setBottom] = useState(20);
    const [left, setLeft] = useState(20);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onFilesSelected = (files: File[]) => {
        if (!files[0]) return;
        setFile(files[0]);
        setResultUrl(null);
        setError(null);
    };

    const applyCrop = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError(null);

        try {
            const { PDFDocument } = await import('pdf-lib');
            const pdf = await PDFDocument.load(await file.arrayBuffer());
            for (const page of pdf.getPages()) {
                const { width, height } = page.getSize();
                const croppedWidth = width - left - right;
                const croppedHeight = height - top - bottom;
                if (croppedWidth <= 20 || croppedHeight <= 20) throw new Error('Crop-Werte sind zu groß.');
                page.setCropBox(left, bottom, croppedWidth, croppedHeight);
            }
            const out = await pdf.save();
            const url = URL.createObjectURL(new Blob([out as BlobPart], { type: 'application/pdf' }));
            setResultUrl(url);
        } catch (e: any) {
            setError(e?.message || 'PDF konnte nicht zugeschnitten werden.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-4xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">PDFs zuschneiden</h1>
                <p className="text-lg text-gray-600">Schneidet alle Seiten um gleiche Ränder zu.</p>
            </div>

            {!resultUrl ? (
                <div className="space-y-8">
                    {!file ? (
                        <PdfUploader onFilesSelected={onFilesSelected} multiple={false} colorTheme="green" title="PDF hier ablegen" />
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
                            <div className="flex items-center gap-2 font-semibold text-gray-700"><Crop className="w-5 h-5 text-green-600" /> {file.name}</div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div><label className="block text-sm font-semibold mb-2">Oben</label><input type="number" value={top} onChange={(e) => setTop(Number(e.target.value) || 0)} className="w-full rounded-xl border px-3 py-2.5" /></div>
                                <div><label className="block text-sm font-semibold mb-2">Rechts</label><input type="number" value={right} onChange={(e) => setRight(Number(e.target.value) || 0)} className="w-full rounded-xl border px-3 py-2.5" /></div>
                                <div><label className="block text-sm font-semibold mb-2">Unten</label><input type="number" value={bottom} onChange={(e) => setBottom(Number(e.target.value) || 0)} className="w-full rounded-xl border px-3 py-2.5" /></div>
                                <div><label className="block text-sm font-semibold mb-2">Links</label><input type="number" value={left} onChange={(e) => setLeft(Number(e.target.value) || 0)} className="w-full rounded-xl border px-3 py-2.5" /></div>
                            </div>

                            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                            <button onClick={applyCrop} disabled={isProcessing} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Wird zugeschnitten...</> : 'Zuschneiden anwenden'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-10 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Fertig</h2>
                    <p className="text-gray-600 mb-8">Die PDF wurde zugeschnitten.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href={resultUrl} download={`zugeschnitten-${file?.name || 'pdf'}.pdf`} className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
                            <Download className="w-5 h-5" /> Download
                        </a>
                        <button onClick={() => { setFile(null); setResultUrl(null); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
                            <RefreshCcw className="w-5 h-5" /> Neu starten
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
