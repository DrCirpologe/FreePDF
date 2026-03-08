import { useEffect, useRef, useState } from 'react';
import { Download, Highlighter, Loader2, Pipette, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import PdfUploader from '../../components/PdfUploader';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

type AnnotationItem = {
    id: string;
    page: number;
    text: string;
    xRatio: number;
    yRatio: number;
    size: number;
    color: string;
};

type Placement = {
    x: number;
    y: number;
};

type DragState = {
    startX: number;
    startY: number;
    startPlacement: Placement;
};

export default function AnnotatePdf() {
    const location = useLocation();
    const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const previewContainerRef = useRef<HTMLDivElement | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);

    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(1);
    const [text, setText] = useState('Kommentar');
    const [size, setSize] = useState(14);
    const [textColor, setTextColor] = useState('#1d4ed8');
    const [isPickingFromPreview, setIsPickingFromPreview] = useState(false);
    const [placement, setPlacement] = useState<Placement>({ x: 80, y: 80 });
    const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
    const [previewDisplaySize, setPreviewDisplaySize] = useState({ width: 0, height: 0 });
    const [dragState, setDragState] = useState<DragState | null>(null);

    const activePreviewSize = {
        width: previewDisplaySize.width || previewSize.width,
        height: previewDisplaySize.height || previewSize.height,
    };

    const onFilesSelected = (files: File[]) => {
        if (!files[0]) return;
        setFile(files[0]);
        setResultUrl(null);
        setError(null);
        setAnnotations([]);
        setPage(1);
        setPageCount(1);
        setPlacement({ x: 80, y: 80 });
        setPreviewSize({ width: 0, height: 0 });
        setPreviewDisplaySize({ width: 0, height: 0 });
        setDragState(null);
        setIsPickingFromPreview(false);
    };

    useEffect(() => {
        const state = location.state as { prefillFile?: File } | null;
        const prefillFile = state?.prefillFile;
        if (!prefillFile || prefillFile.type !== 'application/pdf') return;
        onFilesSelected([prefillFile]);
    }, [location.state]);

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

    useEffect(() => {
        const renderPage = async () => {
            if (!file) return;
            const previewCanvas = previewCanvasRef.current;
            if (!previewCanvas) return;

            const data = new Uint8Array(await file.arrayBuffer());
            const pdf = await pdfjsLib.getDocument({ data }).promise;
            const safePage = Math.min(Math.max(1, page), pdf.numPages);
            const pdfPage = await pdf.getPage(safePage);
            const viewport = pdfPage.getViewport({ scale: 1.35 });

            previewCanvas.width = Math.ceil(viewport.width);
            previewCanvas.height = Math.ceil(viewport.height);

            const context = previewCanvas.getContext('2d');
            if (!context) return;

            await pdfPage.render({ canvasContext: context, viewport, canvas: previewCanvas }).promise;

            const displayWidth = previewCanvas.clientWidth || previewCanvas.width;
            const displayHeight = previewCanvas.clientHeight || previewCanvas.height;
            setPageCount(pdf.numPages);
            setPreviewSize({ width: previewCanvas.width, height: previewCanvas.height });
            setPreviewDisplaySize({ width: displayWidth, height: displayHeight });
            setPlacement((prev) => {
                const maxX = Math.max(0, displayWidth - 10);
                const maxY = Math.max(0, displayHeight - 10);
                return {
                    x: Math.min(Math.max(0, prev.x), maxX),
                    y: Math.min(Math.max(0, prev.y), maxY),
                };
            });
        };

        renderPage();
    }, [file, page]);

    const addAnnotation = () => {
        if (!text.trim()) return;
        if (!activePreviewSize.width || !activePreviewSize.height) return;

        const xRatio = Math.min(Math.max(0, placement.x / activePreviewSize.width), 1);
        const yRatio = Math.min(Math.max(0, placement.y / activePreviewSize.height), 1);

        setAnnotations((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                page,
                text: text.trim(),
                xRatio,
                yRatio,
                size,
                color: textColor,
            },
        ]);
    };

    const hexToRgb = (hex: string) => {
        const normalized = hex.replace('#', '').trim();
        if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
            return { r: 0.1, g: 0.1, b: 0.8 };
        }
        const numeric = parseInt(normalized, 16);
        return {
            r: ((numeric >> 16) & 255) / 255,
            g: ((numeric >> 8) & 255) / 255,
            b: (numeric & 255) / 255,
        };
    };

    const pickColorFromScreen = async () => {
        try {
            const eyeDropperApi = (window as Window & { EyeDropper?: { new (): { open: () => Promise<{ sRGBHex: string }> } } }).EyeDropper;
            if (!eyeDropperApi) {
                setIsPickingFromPreview(true);
                setError('Pipette im Browser nicht verfügbar: Klicke in die PDF-Vorschau, um Farbe aufzunehmen.');
                return;
            }

            const eyeDropper = new eyeDropperApi();
            const result = await eyeDropper.open();
            if (result?.sRGBHex) {
                setTextColor(result.sRGBHex);
                setError(null);
                setIsPickingFromPreview(false);
            }
        } catch {
            // User cancelled or API failed
        }
    };

    const sampleColorFromPreview = (clientX: number, clientY: number) => {
        const canvas = previewCanvasRef.current;
        const container = previewContainerRef.current;
        if (!canvas || !container) return null;

        const rect = container.getBoundingClientRect();
        const xDisplay = clientX - rect.left;
        const yDisplay = clientY - rect.top;

        if (xDisplay < 0 || yDisplay < 0 || xDisplay > rect.width || yDisplay > rect.height) return null;

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const xCanvas = Math.max(0, Math.min(canvas.width - 1, Math.round(xDisplay * scaleX)));
        const yCanvas = Math.max(0, Math.min(canvas.height - 1, Math.round(yDisplay * scaleY)));

        const context = canvas.getContext('2d');
        if (!context) return null;
        const pixel = context.getImageData(xCanvas, yCanvas, 1, 1).data;
        const hex = `#${[pixel[0], pixel[1], pixel[2]].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
        return hex;
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
                const { width: pageWidth, height: pageHeight } = pdfPage.getSize();
                const pdfX = item.xRatio * pageWidth;
                const pdfTop = item.yRatio * pageHeight;
                const pdfY = Math.max(0, pageHeight - pdfTop - item.size);
                const color = hexToRgb(item.color);
                pdfPage.drawText(item.text, {
                    x: pdfX,
                    y: pdfY,
                    size: item.size,
                    font,
                    color: rgb(color.r, color.g, color.b),
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

                            <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3" rows={3} placeholder="Kommentartext" />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Seite
                                    <select
                                        value={page}
                                        onChange={(e) => setPage(Number(e.target.value) || 1)}
                                        className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5"
                                    >
                                        {Array.from({ length: pageCount }, (_, index) => (
                                            <option key={index + 1} value={index + 1}>Seite {index + 1}</option>
                                        ))}
                                    </select>
                                </label>
                                <label className="block text-sm font-semibold text-gray-700">
                                    Schriftgröße
                                    <input
                                        type="number"
                                        min={8}
                                        max={64}
                                        value={size}
                                        onChange={(e) => setSize(Number(e.target.value) || 14)}
                                        className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5"
                                    />
                                </label>
                                <label className="block text-sm font-semibold text-gray-700">
                                    Schriftfarbe
                                    <div className="mt-1 flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={textColor}
                                            onChange={(e) => setTextColor(e.target.value)}
                                            className="h-11 w-16 rounded-xl border border-gray-300 bg-white p-1 cursor-pointer"
                                        />
                                        <button
                                            type="button"
                                            onClick={pickColorFromScreen}
                                            className="h-11 px-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 inline-flex items-center gap-2"
                                            title="Farbe mit Pipette aufnehmen"
                                        >
                                            <Pipette className="w-4 h-4" /> Pipette
                                        </button>
                                    </div>
                                </label>
                                <button onClick={addAnnotation} className="md:mt-6 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-bold px-4 py-2.5 flex items-center justify-center gap-2">
                                    <Plus className="w-4 h-4" /> Kommentar hinzufügen
                                </button>
                            </div>

                            <p className="text-sm text-gray-600">
                                {isPickingFromPreview
                                    ? 'Pipette aktiv: Klicke in die PDF-Vorschau, um eine Farbe zu übernehmen.'
                                    : 'Klicke in die PDF-Vorschau, um die Position zu setzen. Den Text kannst du anschließend ziehen.'}
                            </p>

                            <div
                                ref={previewContainerRef}
                                className="relative inline-block border border-gray-300 rounded-xl overflow-hidden touch-none"
                                onPointerMove={(event) => {
                                    if (!dragState || !activePreviewSize.width || !activePreviewSize.height) return;
                                    const deltaX = event.clientX - dragState.startX;
                                    const deltaY = event.clientY - dragState.startY;
                                    const maxX = Math.max(0, activePreviewSize.width - 10);
                                    const maxY = Math.max(0, activePreviewSize.height - 10);
                                    setPlacement({
                                        x: Math.min(Math.max(0, dragState.startPlacement.x + deltaX), maxX),
                                        y: Math.min(Math.max(0, dragState.startPlacement.y + deltaY), maxY),
                                    });
                                }}
                                onPointerUp={() => setDragState(null)}
                                onPointerLeave={() => setDragState(null)}
                            >
                                <canvas
                                    ref={previewCanvasRef}
                                    className="max-w-full h-auto block bg-gray-50"
                                    onPointerDown={(event) => {
                                        const container = previewContainerRef.current;
                                        if (!container || !activePreviewSize.width || !activePreviewSize.height) return;

                                        if (isPickingFromPreview) {
                                            const picked = sampleColorFromPreview(event.clientX, event.clientY);
                                            if (picked) {
                                                setTextColor(picked);
                                                setIsPickingFromPreview(false);
                                                setError(null);
                                            }
                                            return;
                                        }

                                        const rect = container.getBoundingClientRect();
                                        const nextX = Math.min(Math.max(0, event.clientX - rect.left), activePreviewSize.width - 10);
                                        const nextY = Math.min(Math.max(0, event.clientY - rect.top), activePreviewSize.height - 10);
                                        setPlacement({ x: nextX, y: nextY });
                                    }}
                                />

                                <div
                                    className="absolute font-semibold cursor-move select-none"
                                    style={{
                                        left: placement.x,
                                        top: placement.y,
                                        fontSize: `${size}px`,
                                        color: textColor,
                                        transform: 'translateY(-10%)',
                                    }}
                                    onPointerDown={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        setDragState({
                                            startX: event.clientX,
                                            startY: event.clientY,
                                            startPlacement: placement,
                                        });
                                    }}
                                >
                                    {text || 'Kommentar'}
                                </div>
                            </div>

                            {annotations.length > 0 && (
                                <div className="space-y-2 max-h-56 overflow-y-auto">
                                    {annotations.map((item) => (
                                        <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
                                            <div className="text-sm text-gray-700 inline-flex items-center gap-2">
                                                <span className="inline-block w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: item.color }} />
                                                Seite {item.page} · {item.size}px · {item.text}
                                            </div>
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
