import { useState } from 'react';
import { Download, Loader2, ScanSearch, RefreshCcw } from 'lucide-react';
import PdfUploader from '../../components/PdfUploader';

export default function PdfOcr() {
    const [file, setFile] = useState<File | null>(null);
    const [language, setLanguage] = useState('eng');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [resultText, setResultText] = useState('');
    const [error, setError] = useState<string | null>(null);

    const onFilesSelected = (files: File[]) => {
        if (!files[0]) return;
        setFile(files[0]);
        setResultText('');
        setError(null);
        setProgress(0);
    };

    const runPdfOcr = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError(null);
        setResultText('');

        try {
            const { createWorker } = await import('tesseract.js');
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

            const worker = await createWorker(language as any, 1);

            try {
                const data = new Uint8Array(await file.arrayBuffer());
                const pdf = await pdfjsLib.getDocument({ data }).promise;

                const chunks: string[] = [];
                for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
                    const page = await pdf.getPage(pageNumber);
                    const viewport = page.getViewport({ scale: 2 });

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    if (!context) throw new Error('Canvas Kontext konnte nicht erstellt werden.');

                    canvas.width = Math.ceil(viewport.width);
                    canvas.height = Math.ceil(viewport.height);

                    await page.render({ canvasContext: context, viewport, canvas }).promise;
                    const image = canvas.toDataURL('image/png');
                    const result = await worker.recognize(image);

                    chunks.push(`--- Seite ${pageNumber} ---\n${result.data?.text || ''}`);
                    setProgress(Math.round((pageNumber / pdf.numPages) * 100));
                }

                setResultText(chunks.join('\n\n'));
            } finally {
                await worker.terminate();
            }
        } catch (e: any) {
            setError(e?.message || 'PDF OCR fehlgeschlagen.');
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadTxt = () => {
        const blob = new Blob([resultText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${file?.name?.replace(/\.pdf$/i, '') || 'pdf-ocr'}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full max-w-5xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">PDF OCR</h1>
                <p className="text-lg text-gray-600">Extrahiere Text aus gescannten PDFs seitenweise.</p>
            </div>

            {!file ? (
                <PdfUploader onFilesSelected={onFilesSelected} multiple={false} colorTheme="purple" title="PDF hier ablegen" />
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
                    <div className="flex items-center gap-2 font-semibold text-gray-800">
                        <ScanSearch className="w-5 h-5 text-purple-600" /> {file.name}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="rounded-xl border border-gray-300 px-4 py-3"
                            disabled={isProcessing}
                        >
                            <option value="eng">Englisch</option>
                            <option value="deu">Deutsch</option>
                            <option value="fra">Französisch</option>
                            <option value="spa">Spanisch</option>
                        </select>
                        <button
                            onClick={runPdfOcr}
                            disabled={isProcessing}
                            className="sm:col-span-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> OCR läuft...</> : 'PDF OCR starten'}
                        </button>
                    </div>

                    {isProcessing && (
                        <div className="space-y-2">
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="text-xs text-gray-500">Fortschritt: {progress}%</p>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                    {resultText && (
                        <div className="space-y-3">
                            <textarea
                                value={resultText}
                                onChange={(e) => setResultText(e.target.value)}
                                rows={14}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button onClick={downloadTxt} className="bg-purple-100 hover:bg-purple-200 text-purple-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                                    <Download className="w-4 h-4" /> TXT Download
                                </button>
                                <button onClick={() => navigator.clipboard.writeText(resultText)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold">Kopieren</button>
                                <button onClick={() => { setFile(null); setResultText(''); setError(null); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                                    <RefreshCcw className="w-4 h-4" /> Neu
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
