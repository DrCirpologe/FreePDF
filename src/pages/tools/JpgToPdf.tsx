import { useEffect, useState } from 'react';
import { Download, ImagePlus, Loader2, RefreshCcw } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import PdfUploader from '../../components/PdfUploader';

export default function JpgToPdf() {
    const location = useLocation();
    const [images, setImages] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onFilesSelected = (files: File[]) => {
        const valid = files.filter((file) => file.type.startsWith('image/'));
        setImages(valid);
        setResultUrl(null);
        setError(valid.length ? null : 'Bitte wähle Bilddateien aus.');
    };

    useEffect(() => {
        const state = location.state as { prefillFile?: File; prefillFiles?: File[] } | null;
        const candidates = state?.prefillFiles?.length
            ? state.prefillFiles
            : state?.prefillFile
                ? [state.prefillFile]
                : [];

        const validImages = candidates.filter((candidate) => candidate.type.startsWith('image/'));
        if (!validImages.length) return;

        setImages(validImages);
        setResultUrl(null);
        setError(null);
    }, [location.state]);

    const convert = async () => {
        if (!images.length) return;
        setIsProcessing(true);
        setError(null);

        try {
            const { PDFDocument } = await import('pdf-lib');
            const pdfDoc = await PDFDocument.create();

            for (const imageFile of images) {
                const bytes = await imageFile.arrayBuffer();
                const isPng = imageFile.type.includes('png');
                const embedded = isPng ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
                const page = pdfDoc.addPage([embedded.width, embedded.height]);
                page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
            }

            const out = await pdfDoc.save();
            const url = URL.createObjectURL(new Blob([out as BlobPart], { type: 'application/pdf' }));
            setResultUrl(url);
        } catch (e: any) {
            setError(e?.message || 'Konvertierung fehlgeschlagen.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-4xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">JPG in PDF</h1>
                <p className="text-lg text-gray-600">Wandle JPG/PNG-Bilder in eine mehrseitige PDF-Datei um.</p>
            </div>

            {!resultUrl ? (
                <div className="space-y-8">
                    {images.length === 0 ? (
                        <PdfUploader
                            onFilesSelected={onFilesSelected}
                            multiple={true}
                            accept="image/*"
                            colorTheme="blue"
                            title="Bilder hier ablegen"
                            subtitle="JPG, PNG, BMP, GIF, TIFF"
                        />
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
                            <div className="flex items-center gap-2 font-semibold text-gray-700"><ImagePlus className="w-5 h-5 text-blue-600" /> {images.length} Bild(er) ausgewählt</div>
                            <ul className="text-sm text-gray-600 space-y-2 max-h-48 overflow-y-auto">
                                {images.map((img, i) => <li key={`${img.name}-${i}`}>• {img.name}</li>)}
                            </ul>
                            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button onClick={convert} disabled={isProcessing} className="flex-1 btn-primary py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                    {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Wird konvertiert...</> : 'In PDF umwandeln'}
                                </button>
                                <button onClick={() => setImages([])} className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-8 rounded-xl font-bold">Zurücksetzen</button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-10 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Fertig</h2>
                    <p className="text-gray-600 mb-8">Deine Bilder wurden zu einer PDF kombiniert.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href={resultUrl} download="bilder-zu-pdf.pdf" className="btn-primary py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
                            <Download className="w-5 h-5" /> Download
                        </a>
                        <button onClick={() => { setImages([]); setResultUrl(null); setError(null); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
                            <RefreshCcw className="w-5 h-5" /> Neu starten
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
