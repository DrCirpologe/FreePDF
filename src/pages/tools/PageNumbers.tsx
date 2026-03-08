import { useEffect, useRef, useState } from 'react';
import { Download, Hash, Loader2, RefreshCcw } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import PdfUploader from '../../components/PdfUploader';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

type Position = 'bottom-right' | 'bottom-center' | 'bottom-left' | 'top-right' | 'top-center' | 'top-left' | 'custom';

export default function PageNumbers() {
    const location = useLocation();
    const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const previewContainerRef = useRef<HTMLDivElement | null>(null);

    const [file, setFile] = useState<File | null>(null);
    const [position, setPosition] = useState<Position>('bottom-right');
    const [startAt, setStartAt] = useState(1);
    const [fontSize, setFontSize] = useState(12);
    const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
    const [previewDisplaySize, setPreviewDisplaySize] = useState({ width: 0, height: 0 });
    const [customPoint, setCustomPoint] = useState({ x: 40, y: 40 });
    const [dragging, setDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const activePreviewSize = {
        width: previewDisplaySize.width || previewSize.width,
        height: previewDisplaySize.height || previewSize.height,
    };

    const onFilesSelected = (files: File[]) => {
        if (!files[0]) return;
        setFile(files[0]);
        setResultUrl(null);
        setError(null);
        setPreviewSize({ width: 0, height: 0 });
        setPreviewDisplaySize({ width: 0, height: 0 });
        setCustomPoint({ x: 40, y: 40 });
        setDragging(false);
    };

    useEffect(() => {
        const state = location.state as { prefillFile?: File } | null;
        const prefillFile = state?.prefillFile;
        if (!prefillFile || prefillFile.type !== 'application/pdf') return;
        onFilesSelected([prefillFile]);
    }, [location.state]);

    useEffect(() => {
        const renderPreview = async () => {
            if (!file || position !== 'custom') return;
            const canvas = previewCanvasRef.current;
            if (!canvas) return;

            const data = new Uint8Array(await file.arrayBuffer());
            const pdf = await pdfjsLib.getDocument({ data }).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.2 });

            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);

            const context = canvas.getContext('2d');
            if (!context) return;
            await page.render({ canvasContext: context, viewport, canvas }).promise;

            const displayWidth = canvas.clientWidth || canvas.width;
            const displayHeight = canvas.clientHeight || canvas.height;
            setPreviewSize({ width: canvas.width, height: canvas.height });
            setPreviewDisplaySize({ width: displayWidth, height: displayHeight });
            setCustomPoint((prev) => ({
                x: Math.min(Math.max(0, prev.x), Math.max(0, displayWidth - 10)),
                y: Math.min(Math.max(0, prev.y), Math.max(0, displayHeight - 10)),
            }));
        };

        renderPreview();
    }, [file, position]);

    const getCoords = (pageWidth: number, pageHeight: number, textWidth: number) => {
        const margin = 24;
        switch (position) {
            case 'bottom-left': return { x: margin, y: margin };
            case 'bottom-center': return { x: (pageWidth - textWidth) / 2, y: margin };
            case 'bottom-right': return { x: pageWidth - textWidth - margin, y: margin };
            case 'top-left': return { x: margin, y: pageHeight - margin - fontSize };
            case 'top-center': return { x: (pageWidth - textWidth) / 2, y: pageHeight - margin - fontSize };
            case 'top-right': return { x: pageWidth - textWidth - margin, y: pageHeight - margin - fontSize };
            case 'custom': {
                const widthRef = Math.max(1, activePreviewSize.width);
                const heightRef = Math.max(1, activePreviewSize.height);
                const x = (customPoint.x / widthRef) * pageWidth;
                const yFromTop = (customPoint.y / heightRef) * pageHeight;
                const y = pageHeight - yFromTop - fontSize;
                return { x, y: Math.max(0, y) };
            }
        }
    };

    const applyNumbers = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError(null);

        try {
            const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
            const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

            pdfDoc.getPages().forEach((page, index) => {
                const numberText = String(startAt + index);
                const textWidth = font.widthOfTextAtSize(numberText, fontSize);
                const { width, height } = page.getSize();
                const coords = getCoords(width, height, textWidth);

                page.drawText(numberText, {
                    x: coords.x,
                    y: coords.y,
                    size: fontSize,
                    font,
                    color: rgb(0.25, 0.25, 0.25)
                });
            });

            const bytes = await pdfDoc.save();
            const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
            setResultUrl(url);
        } catch (e: any) {
            setError(e?.message || 'Seitenzahlen konnten nicht eingefügt werden.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-4xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Seitenzahlen einfügen</h1>
                <p className="text-lg text-gray-600">Füge Seitenzahlen an gewünschter Position automatisch in alle Seiten ein.</p>
            </div>

            {!resultUrl ? (
                <div className="space-y-8">
                    {!file ? (
                        <PdfUploader onFilesSelected={onFilesSelected} multiple={false} colorTheme="blue" title="PDF hier ablegen" />
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
                            <div className="flex items-center gap-2 font-semibold text-gray-700"><Hash className="w-5 h-5 text-blue-600" /> {file.name}</div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
                                    <select value={position} onChange={(e) => setPosition(e.target.value as Position)} className="w-full rounded-xl border border-gray-300 px-3 py-2.5">
                                        <option value="bottom-right">Unten rechts</option>
                                        <option value="bottom-center">Unten mitte</option>
                                        <option value="bottom-left">Unten links</option>
                                        <option value="top-right">Oben rechts</option>
                                        <option value="top-center">Oben mitte</option>
                                        <option value="top-left">Oben links</option>
                                        <option value="custom">Eigene Position</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setPosition('custom')}
                                        className={`mt-2 w-full rounded-xl px-3 py-2.5 text-sm font-semibold border transition-colors ${position === 'custom'
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                                            }`}
                                    >
                                        Selber positionieren
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Startnummer</label>
                                    <input type="number" value={startAt} min={1} onChange={(e) => setStartAt(Number(e.target.value) || 1)} className="w-full rounded-xl border border-gray-300 px-3 py-2.5" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Schriftgröße</label>
                                    <input type="number" value={fontSize} min={8} max={40} onChange={(e) => setFontSize(Number(e.target.value) || 12)} className="w-full rounded-xl border border-gray-300 px-3 py-2.5" />
                                </div>
                            </div>

                            {position === 'custom' && (
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-600">Ziehe die Seitenzahl in der Vorschau an die gewünschte Position.</p>
                                    <div
                                        ref={previewContainerRef}
                                        className="relative inline-block border border-gray-300 rounded-xl overflow-hidden touch-none"
                                        onPointerMove={(event) => {
                                            if (!dragging || !activePreviewSize.width || !activePreviewSize.height) return;
                                            const container = previewContainerRef.current;
                                            if (!container) return;
                                            const rect = container.getBoundingClientRect();
                                            const x = Math.min(Math.max(0, event.clientX - rect.left), activePreviewSize.width - 10);
                                            const y = Math.min(Math.max(0, event.clientY - rect.top), activePreviewSize.height - 10);
                                            setCustomPoint({ x, y });
                                        }}
                                        onPointerUp={() => setDragging(false)}
                                        onPointerLeave={() => setDragging(false)}
                                    >
                                        <canvas ref={previewCanvasRef} className="max-w-full h-auto block bg-gray-50" />
                                        <div
                                            className="absolute cursor-move select-none text-gray-700 font-semibold"
                                            style={{ left: customPoint.x, top: customPoint.y, fontSize: `${fontSize}px` }}
                                            onPointerDown={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                setDragging(true);
                                            }}
                                        >
                                            {startAt}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                            <button onClick={applyNumbers} disabled={isProcessing} className="w-full btn-primary py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Wird eingefügt...</> : 'Seitenzahlen einfügen'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-10 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Fertig</h2>
                    <p className="text-gray-600 mb-8">Die Seitenzahlen wurden erfolgreich eingefügt.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href={resultUrl} download={`seitenzahlen-${file?.name || 'pdf'}.pdf`} className="btn-primary py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
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
