import { useState } from 'react';
import { Download, Loader2, RefreshCcw, Scissors } from 'lucide-react';
import PdfUploader from '../../components/PdfUploader';

function parsePageSelection(input: string, totalPages: number): number[] {
    const cleaned = input.replace(/\s+/g, '');
    if (!cleaned) return [];

    const result: number[] = [];
    const tokens = cleaned.split(',').filter(Boolean);

    for (const token of tokens) {
        if (token.includes('-')) {
            const [startRaw, endRaw] = token.split('-');
            const start = Number(startRaw);
            const end = Number(endRaw);
            if (!Number.isInteger(start) || !Number.isInteger(end)) throw new Error('Ungültiger Bereich.');
            if (start < 1 || end < 1 || start > totalPages || end > totalPages) throw new Error('Seiten außerhalb des Bereichs.');

            const step = start <= end ? 1 : -1;
            for (let current = start; step === 1 ? current <= end : current >= end; current += step) {
                result.push(current - 1);
            }
        } else {
            const page = Number(token);
            if (!Number.isInteger(page) || page < 1 || page > totalPages) throw new Error('Ungültige Seitenzahl.');
            result.push(page - 1);
        }
    }

    return result;
}

export default function ExtractPages() {
    const [file, setFile] = useState<File | null>(null);
    const [numPages, setNumPages] = useState(0);
    const [selection, setSelection] = useState('1');
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onFileSelected = async (files: File[]) => {
        const selected = files[0];
        if (!selected) return;

        setFile(selected);
        setResultUrl(null);
        setError(null);

        try {
            const { PDFDocument } = await import('pdf-lib');
            const pdf = await PDFDocument.load(await selected.arrayBuffer());
            const count = pdf.getPageCount();
            setNumPages(count);
            setSelection(`1-${count}`);
        } catch {
            setError('Datei konnte nicht gelesen werden.');
        }
    };

    const extract = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);

        try {
            const { PDFDocument } = await import('pdf-lib');
            const source = await PDFDocument.load(await file.arrayBuffer());
            const selectedIndices = parsePageSelection(selection, source.getPageCount());
            if (selectedIndices.length === 0) throw new Error('Keine Seiten ausgewählt.');

            const output = await PDFDocument.create();
            const copied = await output.copyPages(source, selectedIndices);
            copied.forEach((page) => output.addPage(page));

            const bytes = await output.save();
            const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
            setResultUrl(url);
        } catch (e: any) {
            setError(e?.message || 'Seiten konnten nicht extrahiert werden.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-4xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">PDF-Seiten extrahieren</h1>
                <p className="text-lg text-gray-600">Wähle gezielt Seiten wie 1,3,5 oder 2-6 aus und lade eine neue PDF herunter.</p>
            </div>

            {!resultUrl ? (
                <div className="space-y-8">
                    {!file ? (
                        <PdfUploader onFilesSelected={onFileSelected} multiple={false} colorTheme="blue" title="PDF hier ablegen" />
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
                            <div className="flex items-center gap-3 text-gray-700 font-semibold">
                                <Scissors className="w-5 h-5 text-blue-600" />
                                {file.name} · {numPages} Seiten
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Seiten auswählen</label>
                                <input
                                    value={selection}
                                    onChange={(e) => setSelection(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    placeholder="z. B. 1,3,5-8"
                                />
                                <p className="text-xs text-gray-500 mt-2">Format: 1,3,5-8 oder 8-5</p>
                            </div>

                            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                            <button
                                onClick={extract}
                                disabled={isProcessing}
                                className="w-full btn-primary py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Wird extrahiert...</> : 'Seiten extrahieren'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-10 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Fertig</h2>
                    <p className="text-gray-600 mb-8">Deine Auswahl wurde als neue PDF erstellt.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href={resultUrl} download={`extrahiert-${file?.name || 'seiten'}.pdf`} className="btn-primary py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
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
