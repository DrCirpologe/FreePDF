import { useState } from 'react';
import { Download, Hash, Loader2, RefreshCcw } from 'lucide-react';
import PdfUploader from '../../components/PdfUploader';

type Position = 'bottom-right' | 'bottom-center' | 'bottom-left' | 'top-right' | 'top-center' | 'top-left';

export default function PageNumbers() {
    const [file, setFile] = useState<File | null>(null);
    const [position, setPosition] = useState<Position>('bottom-right');
    const [startAt, setStartAt] = useState(1);
    const [fontSize, setFontSize] = useState(12);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onFilesSelected = (files: File[]) => {
        if (!files[0]) return;
        setFile(files[0]);
        setResultUrl(null);
        setError(null);
    };

    const getCoords = (pageWidth: number, pageHeight: number, textWidth: number) => {
        const margin = 24;
        switch (position) {
            case 'bottom-left': return { x: margin, y: margin };
            case 'bottom-center': return { x: (pageWidth - textWidth) / 2, y: margin };
            case 'bottom-right': return { x: pageWidth - textWidth - margin, y: margin };
            case 'top-left': return { x: margin, y: pageHeight - margin - fontSize };
            case 'top-center': return { x: (pageWidth - textWidth) / 2, y: pageHeight - margin - fontSize };
            case 'top-right': return { x: pageWidth - textWidth - margin, y: pageHeight - margin - fontSize };
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
                                    </select>
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
