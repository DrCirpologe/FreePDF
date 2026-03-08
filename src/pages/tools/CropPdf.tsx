import { useEffect, useRef, useState } from 'react';
import { Crop, Download, Loader2, RefreshCcw } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import PdfUploader from '../../components/PdfUploader';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type InteractionMode =
    | 'draw'
    | 'move'
    | 'resize-nw'
    | 'resize-ne'
    | 'resize-sw'
    | 'resize-se';

type InteractionState = {
    mode: InteractionMode;
    startX: number;
    startY: number;
    startRect: Rect;
};

export default function CropPdf() {
    const location = useLocation();
    const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const previewContainerRef = useRef<HTMLDivElement | null>(null);

    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState(1);
    const [pageNumber, setPageNumber] = useState(1);
    const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
    const [previewDisplaySize, setPreviewDisplaySize] = useState({ width: 0, height: 0 });
    const [cropRect, setCropRect] = useState<Rect | null>(null);
    const [interaction, setInteraction] = useState<InteractionState | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const minCropSize = 40;

    const activePreviewSize = {
        width: previewDisplaySize.width || previewSize.width,
        height: previewDisplaySize.height || previewSize.height,
    };

    const onFilesSelected = (files: File[]) => {
        if (!files[0]) return;
        setFile(files[0]);
        setResultUrl(null);
        setError(null);
        setPageCount(1);
        setPageNumber(1);
        setPreviewSize({ width: 0, height: 0 });
        setPreviewDisplaySize({ width: 0, height: 0 });
        setCropRect(null);
        setInteraction(null);
    };

    useEffect(() => {
        const state = location.state as { prefillFile?: File } | null;
        const prefillFile = state?.prefillFile;
        if (!prefillFile || prefillFile.type !== 'application/pdf') return;
        onFilesSelected([prefillFile]);
    }, [location.state]);

    const getRelativePoint = (clientX: number, clientY: number) => {
        const container = previewContainerRef.current;
        if (!container) return null;
        const rect = container.getBoundingClientRect();
        const x = Math.min(Math.max(0, clientX - rect.left), activePreviewSize.width);
        const y = Math.min(Math.max(0, clientY - rect.top), activePreviewSize.height);
        return { x, y };
    };

    const clampRect = (rect: Rect): Rect => {
        const maxWidth = activePreviewSize.width;
        const maxHeight = activePreviewSize.height;
        const width = Math.min(Math.max(minCropSize, rect.width), maxWidth);
        const height = Math.min(Math.max(minCropSize, rect.height), maxHeight);
        const x = Math.min(Math.max(0, rect.x), Math.max(0, maxWidth - width));
        const y = Math.min(Math.max(0, rect.y), Math.max(0, maxHeight - height));
        return { x, y, width, height };
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
            const viewport = page.getViewport({ scale: 1.2 });

            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);

            const context = canvas.getContext('2d');
            if (!context) return;
            await page.render({ canvasContext: context, viewport, canvas }).promise;

            const displayWidth = canvas.clientWidth || canvas.width;
            const displayHeight = canvas.clientHeight || canvas.height;
            setPageCount(pdf.numPages);
            setPreviewSize({ width: canvas.width, height: canvas.height });
            setPreviewDisplaySize({ width: displayWidth, height: displayHeight });
            setCropRect((prev) => {
                if (prev) return prev;
                const marginX = Math.round(displayWidth * 0.08);
                const marginY = Math.round(displayHeight * 0.08);
                return {
                    x: marginX,
                    y: marginY,
                    width: Math.max(80, displayWidth - marginX * 2),
                    height: Math.max(80, displayHeight - marginY * 2),
                };
            });
        };

        renderPreview();
    }, [file, pageNumber]);

    const applyCrop = async () => {
        if (!file || !cropRect || !activePreviewSize.width || !activePreviewSize.height) return;
        setIsProcessing(true);
        setError(null);

        try {
            const { PDFDocument } = await import('pdf-lib');
            const pdf = await PDFDocument.load(await file.arrayBuffer());

            const leftRatio = cropRect.x / activePreviewSize.width;
            const rightRatio = (activePreviewSize.width - (cropRect.x + cropRect.width)) / activePreviewSize.width;
            const topRatio = cropRect.y / activePreviewSize.height;
            const bottomRatio = (activePreviewSize.height - (cropRect.y + cropRect.height)) / activePreviewSize.height;

            for (const page of pdf.getPages()) {
                const { width, height } = page.getSize();
                const left = Math.max(0, leftRatio * width);
                const right = Math.max(0, rightRatio * width);
                const top = Math.max(0, topRatio * height);
                const bottom = Math.max(0, bottomRatio * height);
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

                            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                                <p className="text-sm text-gray-600">Ziehe den grünen Bereich auf die gewünschte Zuschneidefläche. Das Zuschneiden wird auf alle Seiten angewendet.</p>
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
                                ref={previewContainerRef}
                                className="relative inline-block border border-gray-300 rounded-xl overflow-hidden touch-none"
                                onPointerMove={(event) => {
                                    if (!interaction || !activePreviewSize.width || !activePreviewSize.height) return;
                                    const point = getRelativePoint(event.clientX, event.clientY);
                                    if (!point) return;

                                    const deltaX = point.x - interaction.startX;
                                    const deltaY = point.y - interaction.startY;
                                    const start = interaction.startRect;

                                    if (interaction.mode === 'move') {
                                        setCropRect(
                                            clampRect({
                                                x: start.x + deltaX,
                                                y: start.y + deltaY,
                                                width: start.width,
                                                height: start.height,
                                            })
                                        );
                                        return;
                                    }

                                    if (interaction.mode === 'draw') {
                                        const nextRect = {
                                            x: Math.min(interaction.startX, point.x),
                                            y: Math.min(interaction.startY, point.y),
                                            width: Math.max(minCropSize, Math.abs(point.x - interaction.startX)),
                                            height: Math.max(minCropSize, Math.abs(point.y - interaction.startY)),
                                        };
                                        setCropRect(clampRect(nextRect));
                                        return;
                                    }

                                    const right = start.x + start.width;
                                    const bottom = start.y + start.height;
                                    let x = start.x;
                                    let y = start.y;
                                    let width = start.width;
                                    let height = start.height;

                                    if (interaction.mode === 'resize-nw') {
                                        x = Math.min(point.x, right - minCropSize);
                                        y = Math.min(point.y, bottom - minCropSize);
                                        width = right - x;
                                        height = bottom - y;
                                    }
                                    if (interaction.mode === 'resize-ne') {
                                        y = Math.min(point.y, bottom - minCropSize);
                                        width = Math.max(minCropSize, point.x - start.x);
                                        height = bottom - y;
                                    }
                                    if (interaction.mode === 'resize-sw') {
                                        x = Math.min(point.x, right - minCropSize);
                                        width = right - x;
                                        height = Math.max(minCropSize, point.y - start.y);
                                    }
                                    if (interaction.mode === 'resize-se') {
                                        width = Math.max(minCropSize, point.x - start.x);
                                        height = Math.max(minCropSize, point.y - start.y);
                                    }

                                    setCropRect(clampRect({ x, y, width, height }));
                                }}
                                onPointerUp={() => setInteraction(null)}
                                onPointerLeave={() => setInteraction(null)}
                            >
                                <canvas
                                    ref={previewCanvasRef}
                                    className="max-w-full h-auto block bg-gray-50"
                                    onPointerDown={(event) => {
                                        if (!activePreviewSize.width || !activePreviewSize.height) return;
                                        const point = getRelativePoint(event.clientX, event.clientY);
                                        if (!point) return;

                                        setInteraction({
                                            mode: 'draw',
                                            startX: point.x,
                                            startY: point.y,
                                            startRect: { x: point.x, y: point.y, width: minCropSize, height: minCropSize },
                                        });
                                        setCropRect({ x: point.x, y: point.y, width: minCropSize, height: minCropSize });
                                    }}
                                />
                                {cropRect && (
                                    <>
                                        <div className="absolute bg-black/40 pointer-events-none" style={{ left: 0, top: 0, width: '100%', height: cropRect.y }} />
                                        <div className="absolute bg-black/40 pointer-events-none" style={{ left: 0, top: cropRect.y, width: cropRect.x, height: cropRect.height }} />
                                        <div className="absolute bg-black/40 pointer-events-none" style={{ left: cropRect.x + cropRect.width, top: cropRect.y, width: Math.max(0, activePreviewSize.width - (cropRect.x + cropRect.width)), height: cropRect.height }} />
                                        <div className="absolute bg-black/40 pointer-events-none" style={{ left: 0, top: cropRect.y + cropRect.height, width: '100%', height: Math.max(0, activePreviewSize.height - (cropRect.y + cropRect.height)) }} />

                                        <div
                                            className="absolute border-2 border-green-500 bg-green-500/10 cursor-move"
                                            style={{
                                                left: cropRect.x,
                                                top: cropRect.y,
                                                width: cropRect.width,
                                                height: cropRect.height,
                                            }}
                                            onPointerDown={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                const point = getRelativePoint(event.clientX, event.clientY);
                                                if (!point) return;
                                                setInteraction({
                                                    mode: 'move',
                                                    startX: point.x,
                                                    startY: point.y,
                                                    startRect: cropRect,
                                                });
                                            }}
                                        >
                                            {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => {
                                                const isN = corner.includes('n');
                                                const isW = corner.includes('w');
                                                return (
                                                    <button
                                                        key={corner}
                                                        type="button"
                                                        className="absolute w-4 h-4 rounded-full bg-green-600 border-2 border-white"
                                                        style={{
                                                            top: isN ? -8 : 'auto',
                                                            bottom: isN ? 'auto' : -8,
                                                            left: isW ? -8 : 'auto',
                                                            right: isW ? 'auto' : -8,
                                                            cursor: `${corner}-resize`,
                                                        }}
                                                        onPointerDown={(event) => {
                                                            event.preventDefault();
                                                            event.stopPropagation();
                                                            const point = getRelativePoint(event.clientX, event.clientY);
                                                            if (!point) return;
                                                            const mode = (`resize-${corner}`) as InteractionMode;
                                                            setInteraction({
                                                                mode,
                                                                startX: point.x,
                                                                startY: point.y,
                                                                startRect: cropRect,
                                                            });
                                                        }}
                                                        aria-label="Zuschneidebereich anpassen"
                                                    />
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
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
