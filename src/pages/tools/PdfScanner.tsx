import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Download, Loader2, RefreshCcw, Trash2 } from 'lucide-react';

export default function PdfScanner() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [captures, setCaptures] = useState<string[]>([]);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const init = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
                if (!isMounted) return;
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }
                setIsCameraReady(true);
            } catch (e: any) {
                setError(e?.message || 'Kamera konnte nicht gestartet werden.');
            }
        };

        init();
        return () => {
            isMounted = false;
            streamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, []);

    const capture = () => {
        const video = videoRef.current;
        if (!video) return;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (!context) return;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setCaptures((prev) => [...prev, dataUrl]);
    };

    const removeCapture = (index: number) => {
        setCaptures((prev) => prev.filter((_, i) => i !== index));
    };

    const canGeneratePdf = useMemo(() => captures.length > 0 && !isProcessing, [captures.length, isProcessing]);

    const generatePdf = async () => {
        if (captures.length === 0) return;
        setIsProcessing(true);
        setError(null);

        try {
            const { PDFDocument } = await import('pdf-lib');
            const pdfDoc = await PDFDocument.create();

            for (const captureDataUrl of captures) {
                const image = await pdfDoc.embedJpg(captureDataUrl);
                const { width, height } = image.scale(1);
                const page = pdfDoc.addPage([width, height]);
                page.drawImage(image, { x: 0, y: 0, width, height });
            }

            const out = await pdfDoc.save();
            const url = URL.createObjectURL(new Blob([out as BlobPart], { type: 'application/pdf' }));
            setResultUrl(url);
        } catch (e: any) {
            setError(e?.message || 'PDF-Erstellung fehlgeschlagen.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (resultUrl) {
        return (
            <div className="w-full max-w-4xl">
                <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-10 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Scan-PDF erstellt</h2>
                    <p className="text-gray-600 mb-8">Deine aufgenommenen Seiten wurden als PDF gespeichert.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href={resultUrl} download="scan.pdf" className="btn-primary py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
                            <Download className="w-5 h-5" /> Download
                        </a>
                        <button onClick={() => { setResultUrl(null); setCaptures([]); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
                            <RefreshCcw className="w-5 h-5" /> Neu starten
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">PDF-Scanner</h1>
                <p className="text-lg text-gray-600">Fotografiere Seiten mit der Kamera und exportiere sie als PDF.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center">
                    <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                </div>

                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button onClick={capture} disabled={!isCameraReady} className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                        <Camera className="w-5 h-5" /> Seite aufnehmen
                    </button>
                    <button onClick={generatePdf} disabled={!canGeneratePdf} className="bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                        {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Erstelle PDF...</> : `PDF erstellen (${captures.length})`}
                    </button>
                </div>

                {captures.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {captures.map((image, index) => (
                            <div key={`${image}-${index}`} className="relative border border-gray-200 rounded-xl overflow-hidden">
                                <img src={image} alt={`Scan ${index + 1}`} className="w-full h-40 object-cover" />
                                <button onClick={() => removeCapture(index)} className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-600 rounded-full p-1.5 shadow">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="px-2 py-1 text-xs font-semibold text-gray-600">Seite {index + 1}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
