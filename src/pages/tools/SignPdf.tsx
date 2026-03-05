import { useRef, useState } from 'react';
import { Download, Loader2, PenLine, RefreshCcw, Trash2 } from 'lucide-react';
import PdfUploader from '../../components/PdfUploader';

export default function SignPdf() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawingRef = useRef(false);

    const [file, setFile] = useState<File | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [x, setX] = useState(80);
    const [y, setY] = useState(80);
    const [width, setWidth] = useState(180);
    const [height, setHeight] = useState(70);

    const onFilesSelected = (files: File[]) => {
        if (!files[0]) return;
        setFile(files[0]);
        setResultUrl(null);
        setError(null);
    };

    const getCanvasContext = () => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const context = canvas.getContext('2d');
        if (!context) return null;
        context.lineWidth = 2.5;
        context.lineCap = 'round';
        context.strokeStyle = '#111827';
        return context;
    };

    const pointerPosition = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const context = getCanvasContext();
        if (!context) return;
        drawingRef.current = true;
        const pos = pointerPosition(event);
        context.beginPath();
        context.moveTo(pos.x, pos.y);
    };

    const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (!drawingRef.current) return;
        const context = getCanvasContext();
        if (!context) return;
        const pos = pointerPosition(event);
        context.lineTo(pos.x, pos.y);
        context.stroke();
    };

    const onPointerUp = () => {
        drawingRef.current = false;
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!canvas || !context) return;
        context.clearRect(0, 0, canvas.width, canvas.height);
    };

    const signPdf = async () => {
        if (!file) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        setIsProcessing(true);
        setError(null);

        try {
            const imageDataUrl = canvas.toDataURL('image/png');
            const { PDFDocument } = await import('pdf-lib');

            const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
            if (page < 1 || page > pdfDoc.getPageCount()) {
                throw new Error(`Ungültige Seite. Gültig: 1-${pdfDoc.getPageCount()}`);
            }

            const signatureImage = await pdfDoc.embedPng(imageDataUrl);
            const targetPage = pdfDoc.getPage(page - 1);
            targetPage.drawImage(signatureImage, { x, y, width, height });

            const out = await pdfDoc.save();
            const url = URL.createObjectURL(new Blob([out as BlobPart], { type: 'application/pdf' }));
            setResultUrl(url);
        } catch (e: any) {
            setError(e?.message || 'Signieren fehlgeschlagen.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-5xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Unterschreibe PDF</h1>
                <p className="text-lg text-gray-600">Zeichne deine Signatur und platziere sie auf einer PDF-Seite.</p>
            </div>

            {!resultUrl ? (
                <div className="space-y-8">
                    {!file ? (
                        <PdfUploader onFilesSelected={onFilesSelected} multiple={false} colorTheme="green" title="PDF hier ablegen" />
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
                            <div className="font-semibold text-gray-800 flex items-center gap-2"><PenLine className="w-5 h-5 text-green-600" /> {file.name}</div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Signatur zeichnen</label>
                                <canvas
                                    ref={canvasRef}
                                    width={700}
                                    height={180}
                                    className="w-full border border-gray-300 rounded-xl touch-none bg-white"
                                    onPointerDown={onPointerDown}
                                    onPointerMove={onPointerMove}
                                    onPointerUp={onPointerUp}
                                    onPointerLeave={onPointerUp}
                                />
                                <button onClick={clearSignature} className="mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-semibold inline-flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" /> Signatur löschen
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                <input type="number" min={1} value={page} onChange={(e) => setPage(Number(e.target.value) || 1)} className="rounded-xl border border-gray-300 px-3 py-2.5" placeholder="Seite" />
                                <input type="number" value={x} onChange={(e) => setX(Number(e.target.value) || 0)} className="rounded-xl border border-gray-300 px-3 py-2.5" placeholder="X" />
                                <input type="number" value={y} onChange={(e) => setY(Number(e.target.value) || 0)} className="rounded-xl border border-gray-300 px-3 py-2.5" placeholder="Y" />
                                <input type="number" min={40} value={width} onChange={(e) => setWidth(Number(e.target.value) || 180)} className="rounded-xl border border-gray-300 px-3 py-2.5" placeholder="Breite" />
                                <input type="number" min={20} value={height} onChange={(e) => setHeight(Number(e.target.value) || 70)} className="rounded-xl border border-gray-300 px-3 py-2.5" placeholder="Höhe" />
                            </div>

                            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                            <button onClick={signPdf} disabled={isProcessing} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Wird signiert...</> : 'PDF signieren'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-10 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Fertig</h2>
                    <p className="text-gray-600 mb-8">Deine Signatur wurde in das PDF eingefügt.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href={resultUrl} download={`signed-${file?.name || 'document.pdf'}`} className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
                            <Download className="w-5 h-5" /> Download
                        </a>
                        <button onClick={() => { setFile(null); setResultUrl(null); setError(null); clearSignature(); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
                            <RefreshCcw className="w-5 h-5" /> Neu starten
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
