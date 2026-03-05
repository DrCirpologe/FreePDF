import { useEffect, useState } from 'react';
import { Download, FileImage, Loader2, RefreshCcw } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import PdfUploader from '../../components/PdfUploader';

import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

type PagePreview = {
    page: number;
    url: string;
};

export default function PdfToJpg() {
    const location = useLocation();
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultZipUrl, setResultZipUrl] = useState<string | null>(null);
    const [previews, setPreviews] = useState<PagePreview[]>([]);

    const onFilesSelected = (files: File[]) => {
        if (!files[0]) return;
        setFile(files[0]);
        setError(null);
        setResultZipUrl(null);
        setPreviews([]);
    };

    useEffect(() => {
        const state = location.state as { prefillFile?: File } | null;
        const prefillFile = state?.prefillFile;
        if (!prefillFile || prefillFile.type !== 'application/pdf') return;

        setFile(prefillFile);
        setError(null);
        setResultZipUrl(null);
        setPreviews([]);
    }, [location.state]);

    const convert = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError(null);

        try {
            const { default: JSZip } = await import('jszip');
            const data = new Uint8Array(await file.arrayBuffer());
            const pdf = await pdfjsLib.getDocument({ data }).promise;

            const zip = new JSZip();
            const pagePreviews: PagePreview[] = [];

            for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
                const page = await pdf.getPage(pageNumber);
                const viewport = page.getViewport({ scale: 2 });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) throw new Error('Canvas Kontext konnte nicht erzeugt werden.');

                canvas.width = Math.ceil(viewport.width);
                canvas.height = Math.ceil(viewport.height);

                await page.render({ canvasContext: context, viewport, canvas }).promise;

                const blob = await new Promise<Blob>((resolve, reject) => {
                    canvas.toBlob((output) => {
                        if (output) resolve(output);
                        else reject(new Error('JPG-Export fehlgeschlagen.'));
                    }, 'image/jpeg', 0.92);
                });

                zip.file(`seite-${pageNumber}.jpg`, blob);
                pagePreviews.push({ page: pageNumber, url: URL.createObjectURL(blob) });
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            setResultZipUrl(URL.createObjectURL(zipBlob));
            setPreviews(pagePreviews);
        } catch (e: any) {
            setError(e?.message || 'Konvertierung fehlgeschlagen.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-5xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">PDF in JPG</h1>
                <p className="text-lg text-gray-600">Jede PDF-Seite wird als JPG exportiert und als ZIP bereitgestellt.</p>
            </div>

            {!resultZipUrl ? (
                <div className="space-y-8">
                    {!file ? (
                        <PdfUploader onFilesSelected={onFilesSelected} multiple={false} colorTheme="orange" title="PDF hier ablegen" />
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
                            <div className="flex items-center gap-2 font-semibold text-gray-700">
                                <FileImage className="w-5 h-5 text-orange-600" /> {file.name}
                            </div>

                            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button onClick={convert} disabled={isProcessing} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                    {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Wird konvertiert...</> : 'In JPG umwandeln'}
                                </button>
                                <button onClick={() => setFile(null)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-8 rounded-xl font-bold">Zurücksetzen</button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-8 space-y-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Fertig</h2>
                        <p className="text-gray-600">Deine Seiten wurden in JPG konvertiert.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href={resultZipUrl} download={`${file?.name?.replace(/\.pdf$/i, '') || 'pdf'}-jpg.zip`} className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
                            <Download className="w-5 h-5" /> ZIP herunterladen
                        </a>
                        <button onClick={() => { setFile(null); setResultZipUrl(null); setPreviews([]); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
                            <RefreshCcw className="w-5 h-5" /> Neu starten
                        </button>
                    </div>

                    {previews.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            {previews.slice(0, 8).map((preview) => (
                                <div key={preview.page} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                                    <img src={preview.url} alt={`Seite ${preview.page}`} className="w-full h-44 object-cover" />
                                    <div className="px-3 py-2 text-xs font-semibold text-gray-600">Seite {preview.page}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
