import { useEffect, useRef, useState } from 'react';
import { Download, EyeOff, Loader2, RefreshCcw, Trash2 } from 'lucide-react';
import PdfUploader from '../../components/PdfUploader';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

type RedactionBox = {
    id: string;
    page: number;
    xRatio: number;
    yRatio: number;
    widthRatio: number;
    heightRatio: number;
};

type BoxPreview = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export default function RedactPdf() {
    const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const previewContainerRef = useRef<HTMLDivElement | null>(null);

    const [file, setFile] = useState<File | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const [boxes, setBoxes] = useState<RedactionBox[]>([]);
    const [pageCount, setPageCount] = useState(1);
    const [pageNumber, setPageNumber] = useState(1);
    const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
    const [previewDisplaySize, setPreviewDisplaySize] = useState({ width: 0, height: 0 });
    const [draftBox, setDraftBox] = useState<BoxPreview | null>(null);
    const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);

    const activePreviewSize = {
        width: previewDisplaySize.width || previewSize.width,
        height: previewDisplaySize.height || previewSize.height,
    };

    const minSize = 16;

    const onFilesSelected = (files: File[]) => {
        if (!files[0]) return;
        setFile(files[0]);
        setResultUrl(null);
        setBoxes([]);
        setError(null);
        setPageCount(1);
        setPageNumber(1);
        setPreviewSize({ width: 0, height: 0 });
        setPreviewDisplaySize({ width: 0, height: 0 });
        setDraftBox(null);
        setDrawStart(null);
    };

    const getRelativePoint = (clientX: number, clientY: number) => {
        const container = previewContainerRef.current;
        if (!container) return null;
        const rect = container.getBoundingClientRect();
        const x = Math.min(Math.max(0, clientX - rect.left), activePreviewSize.width);
        const y = Math.min(Math.max(0, clientY - rect.top), activePreviewSize.height);
        return { x, y };
    };

    useEffect(() => {
        const renderPreview = async () => {
            if (!file) return;
            const canvas = previewCanvasRef.current;
            if (!canvas) return;

            const data = new Uint8Array(await file.arrayBuffer());
            const pdf = await pdfjsLib.getDocument({ data }).promise;
            const safePage = Math.min(Math.max(1, pageNumber), pdf.numPages);
            const page = await pdf.getPage(safePage);
            const viewport = page.getViewport({ scale: 1.25 });

            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);

            const context = canvas.getContext('2d');
            if (!context) return;
            await page.render({ canvasContext: context, viewport, canvas }).promise;

            setPageCount(pdf.numPages);
            setPreviewSize({ width: canvas.width, height: canvas.height });
            setPreviewDisplaySize({ width: canvas.clientWidth || canvas.width, height: canvas.clientHeight || canvas.height });
        };

        renderPreview();
    }, [file, pageNumber]);

    const saveDraftBox = () => {
        if (!draftBox || !activePreviewSize.width || !activePreviewSize.height) return;
        if (draftBox.width < minSize || draftBox.height < minSize) {
            setDraftBox(null);
            return;
        }

        const xRatio = Math.min(Math.max(0, draftBox.x / activePreviewSize.width), 1);
        const yRatio = Math.min(Math.max(0, draftBox.y / activePreviewSize.height), 1);
        const widthRatio = Math.min(Math.max(0, draftBox.width / activePreviewSize.width), 1);
        const heightRatio = Math.min(Math.max(0, draftBox.height / activePreviewSize.height), 1);

        setBoxes((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                page: pageNumber,
                xRatio,
                yRatio,
                widthRatio,
                heightRatio,
            },
        ]);
        setDraftBox(null);
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
                const { width: pageWidth, height: pageHeight } = pdfPage.getSize();
                const x = box.xRatio * pageWidth;
                const yTop = box.yRatio * pageHeight;
                const width = box.widthRatio * pageWidth;
                const height = box.heightRatio * pageHeight;
                const y = pageHeight - yTop - height;

                pdfPage.drawRectangle({
                    x,
                    y,
                    width,
                    height,
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

                            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                                <p className="text-sm text-gray-600">Ziehe in der Vorschau, um Schwärzungsbereiche zu zeichnen. Du kannst beliebig viele Bereiche erstellen.</p>
                                <label className="text-sm font-semibold text-gray-700 inline-flex items-center gap-2">
                                    Seite
                                    <select
                                        value={pageNumber}
                                        onChange={(e) => {
                                            setPageNumber(Number(e.target.value) || 1);
                                            setDraftBox(null);
                                            setDrawStart(null);
                                        }}
                                        className="rounded-lg border border-gray-300 px-2.5 py-1.5"
                                    >
                                        {Array.from({ length: pageCount }, (_, index) => (
                                            <option key={index + 1} value={index + 1}>Seite {index + 1}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div
                                ref={previewContainerRef}
                                className="relative inline-block border border-gray-300 rounded-xl overflow-hidden touch-none"
                                onPointerMove={(event) => {
                                    if (!drawStart || !activePreviewSize.width || !activePreviewSize.height) return;
                                    const point = getRelativePoint(event.clientX, event.clientY);
                                    if (!point) return;

                                    const x = Math.min(drawStart.x, point.x);
                                    const y = Math.min(drawStart.y, point.y);
                                    const width = Math.max(minSize, Math.abs(point.x - drawStart.x));
                                    const height = Math.max(minSize, Math.abs(point.y - drawStart.y));
                                    setDraftBox({ x, y, width, height });
                                }}
                                onPointerUp={() => {
                                    saveDraftBox();
                                    setDrawStart(null);
                                }}
                                onPointerLeave={() => {
                                    saveDraftBox();
                                    setDrawStart(null);
                                }}
                            >
                                <canvas
                                    ref={previewCanvasRef}
                                    className="max-w-full h-auto block bg-gray-50"
                                    onPointerDown={(event) => {
                                        if (!activePreviewSize.width || !activePreviewSize.height) return;
                                        const point = getRelativePoint(event.clientX, event.clientY);
                                        if (!point) return;
                                        setDrawStart(point);
                                        setDraftBox({ x: point.x, y: point.y, width: minSize, height: minSize });
                                    }}
                                />

                                {boxes
                                    .filter((box) => box.page === pageNumber)
                                    .map((box) => {
                                        const x = box.xRatio * activePreviewSize.width;
                                        const y = box.yRatio * activePreviewSize.height;
                                        const width = box.widthRatio * activePreviewSize.width;
                                        const height = box.heightRatio * activePreviewSize.height;
                                        return (
                                            <div
                                                key={box.id}
                                                className="absolute bg-black/95 border border-white/30"
                                                style={{ left: x, top: y, width, height }}
                                            />
                                        );
                                    })}

                                {draftBox && (
                                    <div
                                        className="absolute bg-black/85 border border-red-500"
                                        style={{
                                            left: draftBox.x,
                                            top: draftBox.y,
                                            width: draftBox.width,
                                            height: draftBox.height,
                                        }}
                                    />
                                )}
                            </div>

                            {boxes.length > 0 && (
                                <div className="space-y-2 max-h-56 overflow-y-auto">
                                    {boxes.map((box) => (
                                        <div key={box.id} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
                                            <div className="text-sm text-gray-700">Seite {box.page} · Bereich #{box.id.slice(0, 6)}</div>
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
