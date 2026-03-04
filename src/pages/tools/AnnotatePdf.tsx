import { useState } from 'react';
import { Download, Highlighter, Loader2, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import PdfUploader from '../../components/PdfUploader';

type AnnotationItem = {
    id: string;
    page: number;
    text: string;
    x: number;
    y: number;
    size: number;
};

export default function AnnotatePdf() {
    const [file, setFile] = useState<File | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);

    const [page, setPage] = useState(1);
    const [text, setText] = useState('Kommentar');
    const [x, setX] = useState(80);
    const [y, setY] = useState(80);
    const [size, setSize] = useState(14);

    const onFilesSelected = (files: File[]) => {
        if (!files[0]) return;
        setFile(files[0]);
        setResultUrl(null);
        setError(null);
        setAnnotations([]);
    };

    const addAnnotation = () => {
        if (!text.trim()) return;
        setAnnotations((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                page,
                text: text.trim(),
                x,
                y,
                size,
            },
        ]);
    };

    const removeAnnotation = (id: string) => {
        setAnnotations((prev) => prev.filter((item) => item.id !== id));
    };

    const apply = async () => {
        if (!file || annotations.length === 0) return;
        setIsProcessing(true);
        setError(null);

        try {
            const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
            const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

            for (const item of annotations) {
                if (item.page < 1 || item.page > pdfDoc.getPageCount()) continue;
                const pdfPage = pdfDoc.getPage(item.page - 1);
                pdfPage.drawText(item.text, {
                    x: item.x,
                    y: item.y,
                    size: item.size,
                    font,
                    color: rgb(0.1, 0.1, 0.8),
                });
            }

            const out = await pdfDoc.save();
            const url = URL.createObjectURL(new Blob([out as BlobPart], { type: 'application/pdf' }));
            setResultUrl(url);
        } catch (e: any) {
            setError(e?.message || 'Kommentieren fehlgeschlagen.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-5xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">PDF kommentieren</h1>
                <p className="text-lg text-gray-600">Füge Text-Kommentare auf beliebigen Seitenpositionen hinzu.</p>
            </div>

            {!resultUrl ? (
                <div className="space-y-8">
                    {!file ? (
                        <PdfUploader onFilesSelected={onFilesSelected} multiple={false} colorTheme="blue" title="PDF hier ablegen" />
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
                            <div className="flex items-center gap-2 font-semibold text-gray-700"><Highlighter className="w-5 h-5 text-blue-600" /> {file.name}</div>

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                <input type="number" min={1} value={page} onChange={(e) => setPage(Number(e.target.value) || 1)} className="rounded-xl border border-gray-300 px-3 py-2.5" placeholder="Seite" />
                                <input type="number" value={x} onChange={(e) => setX(Number(e.target.value) || 0)} className="rounded-xl border border-gray-300 px-3 py-2.5" placeholder="X" />
                                <input type="number" value={y} onChange={(e) => setY(Number(e.target.value) || 0)} className="rounded-xl border border-gray-300 px-3 py-2.5" placeholder="Y" />
                                <input type="number" min={8} max={64} value={size} onChange={(e) => setSize(Number(e.target.value) || 14)} className="rounded-xl border border-gray-300 px-3 py-2.5" placeholder="Größe" />
                                <button onClick={addAnnotation} className="bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-bold px-4 py-2.5 flex items-center justify-center gap-2">
                                    <Plus className="w-4 h-4" /> Hinzufügen
                                </button>
                            </div>

                            <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3" rows={3} placeholder="Kommentartext" />

                            {annotations.length > 0 && (
                                <div className="space-y-2 max-h-56 overflow-y-auto">
                                    {annotations.map((item) => (
                                        <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
                                            <div className="text-sm text-gray-700">Seite {item.page} · ({item.x}, {item.y}) · {item.size}px · {item.text}</div>
                                            <button onClick={() => removeAnnotation(item.id)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                            <button onClick={apply} disabled={isProcessing || annotations.length === 0} className="w-full btn-primary py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Wird angewendet...</> : 'Kommentare einfügen'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-10 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Fertig</h2>
                    <p className="text-gray-600 mb-8">Deine Kommentare wurden in die PDF geschrieben.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href={resultUrl} download={`kommentiert-${file?.name || 'pdf'}.pdf`} className="btn-primary py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
                            <Download className="w-5 h-5" /> Download
                        </a>
                        <button onClick={() => { setFile(null); setResultUrl(null); setAnnotations([]); setError(null); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
                            <RefreshCcw className="w-5 h-5" /> Neu starten
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
