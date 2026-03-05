import { useState } from 'react';
import { Download, Droplets, Loader2, RefreshCcw } from 'lucide-react';
import PdfUploader from '../../components/PdfUploader';

export default function WatermarkPdf() {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState('FREEPDF');
    const [fontSize, setFontSize] = useState(48);
    const [textColor, setTextColor] = useState('#333333');
    const [opacity, setOpacity] = useState(0.2);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onFilesSelected = (files: File[]) => {
        if (!files[0]) return;
        setFile(files[0]);
        setResultUrl(null);
        setError(null);
    };

    const applyWatermark = async () => {
        if (!file || !text.trim()) return;
        setIsProcessing(true);
        setError(null);

        const normalized = textColor.replace('#', '').trim();
        const parsed = /^[0-9a-fA-F]{6}$/.test(normalized) ? parseInt(normalized, 16) : 0x333333;
        const color = {
            r: ((parsed >> 16) & 255) / 255,
            g: ((parsed >> 8) & 255) / 255,
            b: (parsed & 255) / 255,
        };

        try {
            const { PDFDocument, StandardFonts, rgb, degrees } = await import('pdf-lib');
            const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            for (const page of pdfDoc.getPages()) {
                const { width, height } = page.getSize();
                const textWidth = font.widthOfTextAtSize(text, fontSize);
                page.drawText(text, {
                    x: (width - textWidth) / 2,
                    y: height / 2,
                    size: fontSize,
                    font,
                    color: rgb(color.r, color.g, color.b),
                    rotate: degrees(35),
                    opacity
                });
            }

            const out = await pdfDoc.save();
            const url = URL.createObjectURL(new Blob([out as BlobPart], { type: 'application/pdf' }));
            setResultUrl(url);
        } catch (e: any) {
            setError(e?.message || 'Wasserzeichen konnte nicht hinzugefügt werden.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-4xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Wasserzeichen-PDF</h1>
                <p className="text-lg text-gray-600">Füge ein Text-Wasserzeichen auf allen Seiten deiner PDF hinzu.</p>
            </div>

            {!resultUrl ? (
                <div className="space-y-8">
                    {!file ? (
                        <PdfUploader onFilesSelected={onFilesSelected} multiple={false} colorTheme="blue" title="PDF hier ablegen" />
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
                            <div className="flex items-center gap-2 font-semibold text-gray-700"><Droplets className="w-5 h-5 text-blue-600" /> {file.name}</div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Wasserzeichen Text</label>
                                    <input value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-2.5" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Schriftgröße</label>
                                    <input type="number" min={16} max={120} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value) || 48)} className="w-full rounded-xl border border-gray-300 px-4 py-2.5" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Schriftfarbe</label>
                                <input
                                    type="color"
                                    value={textColor}
                                    onChange={(e) => setTextColor(e.target.value)}
                                    className="h-11 w-16 rounded-xl border border-gray-300 bg-white p-1 cursor-pointer"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Deckkraft ({Math.round(opacity * 100)}%)</label>
                                <input type="range" min={0.05} max={0.8} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full" />
                            </div>

                            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                            <button onClick={applyWatermark} disabled={isProcessing} className="w-full btn-primary py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Wird hinzugefügt...</> : 'Wasserzeichen hinzufügen'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-10 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Fertig</h2>
                    <p className="text-gray-600 mb-8">Dein Wasserzeichen wurde in allen Seiten eingefügt.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href={resultUrl} download={`wasserzeichen-${file?.name || 'pdf'}.pdf`} className="btn-primary py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
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
