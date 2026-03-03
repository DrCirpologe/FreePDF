import { useState } from 'react';
import { ArrowDown, ArrowUp, Download, Loader2, RefreshCcw, RotateCw, Trash2 } from 'lucide-react';
import PdfUploader from '../../components/PdfUploader';

type PageModel = {
    sourceIndex: number;
    rotation: number;
};

export default function OrganizePdf() {
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<PageModel[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onFilesSelected = async (files: File[]) => {
        const selected = files[0];
        if (!selected) return;
        setFile(selected);
        setResultUrl(null);
        setError(null);

        try {
            const { PDFDocument } = await import('pdf-lib');
            const pdf = await PDFDocument.load(await selected.arrayBuffer());
            const initial = Array.from({ length: pdf.getPageCount() }).map((_, i) => ({ sourceIndex: i, rotation: 0 }));
            setPages(initial);
        } catch {
            setError('Datei konnte nicht gelesen werden.');
        }
    };

    const move = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= pages.length) return;
        const next = [...pages];
        const [item] = next.splice(index, 1);
        next.splice(target, 0, item);
        setPages(next);
    };

    const remove = (index: number) => {
        setPages((prev) => prev.filter((_, i) => i !== index));
    };

    const rotate = (index: number) => {
        setPages((prev) => prev.map((page, i) => i === index ? { ...page, rotation: (page.rotation + 90) % 360 } : page));
    };

    const save = async () => {
        if (!file || pages.length === 0) return;
        setIsProcessing(true);
        setError(null);

        try {
            const { PDFDocument, degrees } = await import('pdf-lib');
            const source = await PDFDocument.load(await file.arrayBuffer());
            const output = await PDFDocument.create();

            for (const model of pages) {
                const [copied] = await output.copyPages(source, [model.sourceIndex]);
                copied.setRotation(degrees(model.rotation));
                output.addPage(copied);
            }

            const bytes = await output.save();
            const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
            setResultUrl(url);
        } catch (e: any) {
            setError(e?.message || 'PDF konnte nicht organisiert werden.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-5xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">PDF Organisieren</h1>
                <p className="text-lg text-gray-600">Seiten neu anordnen, löschen und drehen – danach als neue PDF speichern.</p>
            </div>

            {!resultUrl ? (
                <div className="space-y-8">
                    {!file ? (
                        <PdfUploader onFilesSelected={onFilesSelected} multiple={false} colorTheme="blue" title="PDF hier ablegen" />
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-h-[520px] overflow-y-auto p-1">
                                {pages.map((page, idx) => (
                                    <div key={`${page.sourceIndex}-${idx}`} className="border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-3">
                                        <div className="aspect-[1/1.35] rounded-lg border border-gray-200 bg-white flex items-center justify-center">
                                            <span className="text-3xl font-bold text-gray-400" style={{ transform: `rotate(${page.rotation}deg)` }}>{page.sourceIndex + 1}</span>
                                        </div>
                                        <div className="text-xs text-gray-600 text-center">Position {idx + 1}</div>
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => move(idx, -1)} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100"><ArrowUp className="w-4 h-4" /></button>
                                            <button onClick={() => move(idx, 1)} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100"><ArrowDown className="w-4 h-4" /></button>
                                            <button onClick={() => rotate(idx)} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100"><RotateCw className="w-4 h-4" /></button>
                                            <button onClick={() => remove(idx)} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                            <button onClick={save} disabled={isProcessing || pages.length === 0} className="w-full btn-primary py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Wird gespeichert...</> : 'Organisierte PDF speichern'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-10 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Fertig</h2>
                    <p className="text-gray-600 mb-8">Deine organisierte PDF wurde erstellt.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href={resultUrl} download={`organisiert-${file?.name || 'pdf'}.pdf`} className="btn-primary py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
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
