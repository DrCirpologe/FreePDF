import { useState } from 'react';
import { Download, EyeOff, Loader2, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import PdfUploader from '../../components/PdfUploader';

type RedactionBox = {
    id: string;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
};

export default function RedactPdf() {
    const [file, setFile] = useState<File | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const [boxes, setBoxes] = useState<RedactionBox[]>([]);
    const [page, setPage] = useState(1);
    const [x, setX] = useState(100);
    const [y, setY] = useState(100);
    const [width, setWidth] = useState(120);
    const [height, setHeight] = useState(30);

    const onFilesSelected = (files: File[]) => {
        if (!files[0]) return;
        setFile(files[0]);
        setResultUrl(null);
        setBoxes([]);
        setError(null);
    };

    const addBox = () => {
        if (width <= 0 || height <= 0) return;
        setBoxes((prev) => [...prev, { id: crypto.randomUUID(), page, x, y, width, height }]);
    };

    const removeBox = (id: string) => {
        setBoxes((prev) => prev.filter((box) => box.id !== id));
    };

    const apply = async () => {
        if (!file || boxes.length === 0) return;
        setIsProcessing(true);
        setError(null);

        try {
            const { PDFDocument, rgb } = await import('pdf-lib');
            const pdfDoc = await PDFDocument.load(await file.arrayBuffer());

            for (const box of boxes) {
                if (box.page < 1 || box.page > pdfDoc.getPageCount()) continue;
                const pdfPage = pdfDoc.getPage(box.page - 1);
                pdfPage.drawRectangle({
                    x: box.x,
                    y: box.y,
                    width: box.width,
                    height: box.height,
                    color: rgb(0, 0, 0),
                    borderColor: rgb(0, 0, 0),
                    borderWidth: 0,
                });
            }

            try {
                pdfDoc.getForm().flatten();
            } catch {
                // No form fields
            }

            const out = await pdfDoc.save();
            const url = URL.createObjectURL(new Blob([out as BlobPart], { type: 'application/pdf' }));
            setResultUrl(url);
        } catch (e: any) {
            setError(e?.message || 'Schwärzen fehlgeschlagen.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-5xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">PDF schwärzen</h1>
                <p className="text-lg text-gray-600">Lege visuelle Schwärzungsbereiche fest und speichere die geschwärzte PDF.</p>
            </div>

            {!resultUrl ? (
                <div className="space-y-8">
                    {!file ? (
                        <PdfUploader onFilesSelected={onFilesSelected} multiple={false} colorTheme="red" title="PDF hier ablegen" />
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
                            <div className="flex items-center gap-2 font-semibold text-gray-700"><EyeOff className="w-5 h-5 text-red-600" /> {file.name}</div>

                            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                                <input type="number" min={1} value={page} onChange={(e) => setPage(Number(e.target.value) || 1)} className="rounded-xl border border-gray-300 px-3 py-2.5" placeholder="Seite" />
                                <input type="number" value={x} onChange={(e) => setX(Number(e.target.value) || 0)} className="rounded-xl border border-gray-300 px-3 py-2.5" placeholder="X" />
                                <input type="number" value={y} onChange={(e) => setY(Number(e.target.value) || 0)} className="rounded-xl border border-gray-300 px-3 py-2.5" placeholder="Y" />
                                <input type="number" min={1} value={width} onChange={(e) => setWidth(Number(e.target.value) || 1)} className="rounded-xl border border-gray-300 px-3 py-2.5" placeholder="Breite" />
                                <input type="number" min={1} value={height} onChange={(e) => setHeight(Number(e.target.value) || 1)} className="rounded-xl border border-gray-300 px-3 py-2.5" placeholder="Höhe" />
                                <button onClick={addBox} className="bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-bold px-4 py-2.5 flex items-center justify-center gap-2">
                                    <Plus className="w-4 h-4" /> Bereich
                                </button>
                            </div>

                            {boxes.length > 0 && (
                                <div className="space-y-2 max-h-56 overflow-y-auto">
                                    {boxes.map((box) => (
                                        <div key={box.id} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
                                            <div className="text-sm text-gray-700">Seite {box.page} · x:{box.x} y:{box.y} · {box.width}×{box.height}</div>
                                            <button onClick={() => removeBox(box.id)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                            <button onClick={apply} disabled={isProcessing || boxes.length === 0} className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Wird geschwärzt...</> : 'Schwärzungen anwenden'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-10 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Fertig</h2>
                    <p className="text-gray-600 mb-8">Die PDF wurde mit den festgelegten Bereichen geschwärzt.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href={resultUrl} download={`geschwaerzt-${file?.name || 'pdf'}.pdf`} className="bg-red-600 hover:bg-red-700 text-white py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
                            <Download className="w-5 h-5" /> Download
                        </a>
                        <button onClick={() => { setFile(null); setResultUrl(null); setBoxes([]); setError(null); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
                            <RefreshCcw className="w-5 h-5" /> Neu starten
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
