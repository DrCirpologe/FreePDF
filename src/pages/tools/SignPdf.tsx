import { useEffect, useRef, useState } from 'react';
import { Download, Loader2, PenLine, RefreshCcw, Trash2 } from 'lucide-react';
import PdfUploader from '../../components/PdfUploader';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

type Placement = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type Interaction = {
    type: 'drag' | 'resize';
    startX: number;
    startY: number;
    startPlacement: Placement;
};

export default function SignPdf() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawingRef = useRef(false);

    const [file, setFile] = useState<File | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [pageCount, setPageCount] = useState(1);
    const [pageNumber, setPageNumber] = useState(1);
    const [isPlacing, setIsPlacing] = useState(false);
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
    const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
    const [previewDisplaySize, setPreviewDisplaySize] = useState({ width: 0, height: 0 });
    const [placement, setPlacement] = useState<Placement>({ x: 80, y: 80, width: 180, height: 70 });
    const [interaction, setInteraction] = useState<Interaction | null>(null);

    const onFilesSelected = (files: File[]) => {
        if (!files[0]) return;
        setFile(files[0]);
        setResultUrl(null);
        setError(null);
        setPageCount(1);
        setPageNumber(1);
        setIsPlacing(false);
        setSignatureUrl(null);
        setPreviewSize({ width: 0, height: 0 });
        setPreviewDisplaySize({ width: 0, height: 0 });
        setPlacement({ x: 80, y: 80, width: 180, height: 70 });
    };

    const activePreviewSize = {
        width: previewDisplaySize.width || previewSize.width,
        height: previewDisplaySize.height || previewSize.height,
    };

    useEffect(() => {
        const loadPageCount = async () => {
            if (!file) return;
            try {
                const data = new Uint8Array(await file.arrayBuffer());
                const pdf = await pdfjsLib.getDocument({ data }).promise;
                setPageCount(pdf.numPages);
            } catch {
                setPageCount(1);
            }
        };

        loadPageCount();
    }, [file]);

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

    const beginPlacement = () => {
        if (!file) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        setSignatureUrl(canvas.toDataURL('image/png'));
        setPlacement({ x: 80, y: 80, width: 180, height: 70 });
        setIsPlacing(true);
        setError(null);
    };

    useEffect(() => {
        const renderPage = async () => {
            if (!file || !isPlacing) return;
            const previewCanvas = previewCanvasRef.current;
            if (!previewCanvas) return;

            const data = new Uint8Array(await file.arrayBuffer());
            const pdf = await pdfjsLib.getDocument({ data }).promise;
            const safePage = Math.min(Math.max(1, pageNumber), pdf.numPages);
            const page = await pdf.getPage(safePage);
            const viewport = page.getViewport({ scale: 1.35 });

            previewCanvas.width = Math.ceil(viewport.width);
            previewCanvas.height = Math.ceil(viewport.height);

            const context = previewCanvas.getContext('2d');
            if (!context) return;

            await page.render({ canvasContext: context, viewport, canvas: previewCanvas }).promise;

            setPageCount(pdf.numPages);
            setPreviewSize({ width: previewCanvas.width, height: previewCanvas.height });
            setPreviewDisplaySize({ width: previewCanvas.clientWidth || previewCanvas.width, height: previewCanvas.clientHeight || previewCanvas.height });
            setPlacement((prev) => {
                const displayWidth = previewCanvas.clientWidth || previewCanvas.width;
                const displayHeight = previewCanvas.clientHeight || previewCanvas.height;
                const nextWidth = Math.min(prev.width, displayWidth);
                const nextHeight = Math.min(prev.height, displayHeight);
                const maxX = Math.max(0, displayWidth - nextWidth);
                const maxY = Math.max(0, displayHeight - nextHeight);
                return {
                    x: Math.min(Math.max(0, prev.x), maxX),
                    y: Math.min(Math.max(0, prev.y), maxY),
                    width: nextWidth,
                    height: nextHeight,
                };
            });
        };

        renderPage();
    }, [file, isPlacing, pageNumber]);

    const onOverlayPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!interaction || !activePreviewSize.width || !activePreviewSize.height) return;

        const deltaX = event.clientX - interaction.startX;
        const deltaY = event.clientY - interaction.startY;

        if (interaction.type === 'drag') {
            const maxX = Math.max(0, activePreviewSize.width - interaction.startPlacement.width);
            const maxY = Math.max(0, activePreviewSize.height - interaction.startPlacement.height);
            const nextX = Math.min(Math.max(0, interaction.startPlacement.x + deltaX), maxX);
            const nextY = Math.min(Math.max(0, interaction.startPlacement.y + deltaY), maxY);
            setPlacement((prev) => ({ ...prev, x: nextX, y: nextY }));
            return;
        }

        const minWidth = 60;
        const minHeight = 24;
        const maxWidth = activePreviewSize.width - interaction.startPlacement.x;
        const maxHeight = activePreviewSize.height - interaction.startPlacement.y;
        const nextWidth = Math.min(Math.max(minWidth, interaction.startPlacement.width + deltaX), maxWidth);
        const nextHeight = Math.min(Math.max(minHeight, interaction.startPlacement.height + deltaY), maxHeight);
        setPlacement((prev) => ({ ...prev, width: nextWidth, height: nextHeight }));
    };

    const onOverlayPointerUp = () => {
        setInteraction(null);
    };

    const signPdf = async () => {
        if (!file) return;
        if (!signatureUrl) return;
        if (!activePreviewSize.width || !activePreviewSize.height) return;

        setIsProcessing(true);
        setError(null);

        try {
            const { PDFDocument } = await import('pdf-lib');

            const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
            if (pageNumber < 1 || pageNumber > pdfDoc.getPageCount()) {
                throw new Error(`Ungültige Seite. Gültig: 1-${pdfDoc.getPageCount()}`);
            }

            const signatureImage = await pdfDoc.embedPng(signatureUrl);
            const targetPage = pdfDoc.getPage(pageNumber - 1);
            const { width: pageWidth, height: pageHeight } = targetPage.getSize();

            const pdfX = (placement.x / activePreviewSize.width) * pageWidth;
            const pdfWidth = (placement.width / activePreviewSize.width) * pageWidth;
            const pdfHeight = (placement.height / activePreviewSize.height) * pageHeight;
            const pdfTop = (placement.y / activePreviewSize.height) * pageHeight;
            const pdfY = pageHeight - pdfTop - pdfHeight;

            targetPage.drawImage(signatureImage, { x: pdfX, y: pdfY, width: pdfWidth, height: pdfHeight });

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

                            {isPlacing && (
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                                        <p className="text-sm text-gray-600">Ziehe die Signatur in der Vorschau an die gewünschte Position und ändere die Größe am Eckgriff.</p>
                                        <label className="text-sm font-semibold text-gray-700 inline-flex items-center gap-2">
                                            Seite
                                            <select
                                                value={pageNumber}
                                                onChange={(e) => setPageNumber(Number(e.target.value) || 1)}
                                                className="rounded-lg border border-gray-300 px-2.5 py-1.5"
                                            >
                                                {Array.from({ length: pageCount }, (_, index) => (
                                                    <option key={index + 1} value={index + 1}>Seite {index + 1}</option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>

                                    <div
                                        className="relative inline-block border border-gray-300 rounded-xl overflow-hidden touch-none"
                                        onPointerMove={onOverlayPointerMove}
                                        onPointerUp={onOverlayPointerUp}
                                        onPointerLeave={onOverlayPointerUp}
                                    >
                                        <canvas ref={previewCanvasRef} className="max-w-full h-auto block bg-gray-50" />
                                        {signatureUrl && activePreviewSize.width > 0 && activePreviewSize.height > 0 && (
                                            <div
                                                onPointerDown={(event) => {
                                                    event.preventDefault();
                                                    setInteraction({
                                                        type: 'drag',
                                                        startX: event.clientX,
                                                        startY: event.clientY,
                                                        startPlacement: placement,
                                                    });
                                                }}
                                                className="absolute border-2 border-green-500 cursor-move bg-white/20"
                                                style={{
                                                    left: placement.x,
                                                    top: placement.y,
                                                    width: placement.width,
                                                    height: placement.height,
                                                }}
                                            >
                                                <img src={signatureUrl} alt="Signatur-Vorschau" className="w-full h-full object-fill pointer-events-none" />
                                                <button
                                                    type="button"
                                                    onPointerDown={(event) => {
                                                        event.preventDefault();
                                                        event.stopPropagation();
                                                        setInteraction({
                                                            type: 'resize',
                                                            startX: event.clientX,
                                                            startY: event.clientY,
                                                            startPlacement: placement,
                                                        });
                                                    }}
                                                    className="absolute -right-2 -bottom-2 w-4 h-4 rounded-full bg-green-600 border-2 border-white cursor-se-resize"
                                                    aria-label="Signaturgröße ändern"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                            {!isPlacing ? (
                                <button onClick={beginPlacement} disabled={isProcessing} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                    PDF signieren
                                </button>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button onClick={signPdf} disabled={isProcessing} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                        {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Wird signiert...</> : 'PDF speichern'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsPlacing(false);
                                            setInteraction(null);
                                        }}
                                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl text-lg font-bold"
                                    >
                                        Platzierung abbrechen
                                    </button>
                                </div>
                            )}
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
