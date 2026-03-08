import { useEffect, useState } from 'react';
import { Download, Loader2, Pencil, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import PdfUploader from '../../components/PdfUploader';

type EditItem = {
    id: string;
    page: number;
    text: string;
    x: number;
    y: number;
    size: number;
};

export default function EditPdf() {
    const location = useLocation();
    const [file, setFile] = useState<File | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');

    const [items, setItems] = useState<EditItem[]>([]);
    const [page, setPage] = useState(1);
    const [text, setText] = useState('Neuer Text');
    const [x, setX] = useState(100);
    const [y, setY] = useState(100);
    const [size, setSize] = useState(16);

    const onFilesSelected = (files: File[]) => {
        if (!files[0]) return;
        setFile(files[0]);
        setResultUrl(null);
        setItems([]);
        setError(null);
    };

    useEffect(() => {
        const state = location.state as { prefillFile?: File } | null;
        const prefillFile = state?.prefillFile;
        if (!prefillFile || prefillFile.type !== 'application/pdf') return;
        onFilesSelected([prefillFile]);
    }, [location.state]);

    const addEditItem = () => {
        if (!text.trim()) return;
        setItems((prev) => [...prev, { id: crypto.randomUUID(), page, text: text.trim(), x, y, size }]);
    };

    const removeEditItem = (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    };

    const apply = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError(null);

        try {
            const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
            const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

            if (title.trim()) pdfDoc.setTitle(title.trim());
            if (author.trim()) pdfDoc.setAuthor(author.trim());

            for (const item of items) {
                if (item.page < 1 || item.page > pdfDoc.getPageCount()) continue;
                const pdfPage = pdfDoc.getPage(item.page - 1);
                pdfPage.drawText(item.text, {
                    x: item.x,
                    y: item.y,
                    size: item.size,
                    font,
                    color: rgb(0, 0, 0),
                });
            }

            const out = await pdfDoc.save();
            const url = URL.createObjectURL(new Blob([out as BlobPart], { type: 'application/pdf' }));
            setResultUrl(url);
        } catch (e: any) {
            setError(e?.message || 'Bearbeiten fehlgeschlagen.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-5xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">PDF bearbeiten</h1>
                <p className="text-lg text-gray-600">MVP: Metadaten ändern und neue Textelemente in die PDF schreiben.</p>
            </div>

            {!resultUrl ? (
                <div className="space-y-8">
                    {!file ? (
                        <PdfUploader onFilesSelected={onFilesSelected} multiple={false} colorTheme="blue" title="PDF hier ablegen" />
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
                            <div className="flex items-center gap-2 font-semibold text-gray-700"><Pencil className="w-5 h-5 text-blue-600" /> {file.name}</div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Dokumenttitel (optional)" className="rounded-xl border border-gray-300 px-4 py-2.5" />
                                <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Autor (optional)" className="rounded-xl border border-gray-300 px-4 py-2.5" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                                <input type="number" min={1} value={page} onChange={(e) => setPage(Number(e.target.value) || 1)} className="rounded-xl border border-gray-300 px-3 py-2.5" placeholder="Seite" />
                                <input type="number" value={x} onChange={(e) => setX(Number(e.target.value) || 0)} className="rounded-xl border border-gray-300 px-3 py-2.5" placeholder="X" />
                                <input type="number" value={y} onChange={(e) => setY(Number(e.target.value) || 0)} className="rounded-xl border border-gray-300 px-3 py-2.5" placeholder="Y" />
                                <input type="number" min={8} max={72} value={size} onChange={(e) => setSize(Number(e.target.value) || 16)} className="rounded-xl border border-gray-300 px-3 py-2.5" placeholder="Größe" />
                                <input value={text} onChange={(e) => setText(e.target.value)} className="md:col-span-2 rounded-xl border border-gray-300 px-3 py-2.5" placeholder="Text" />
                            </div>

                            <button onClick={addEditItem} className="bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-bold px-4 py-2.5 inline-flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Textelement hinzufügen
                            </button>

                            {items.length > 0 && (
                                <div className="space-y-2 max-h-56 overflow-y-auto">
                                    {items.map((item) => (
                                        <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
                                            <div className="text-sm text-gray-700">Seite {item.page} · ({item.x},{item.y}) · {item.size}px · {item.text}</div>
                                            <button onClick={() => removeEditItem(item.id)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                            <button onClick={apply} disabled={isProcessing} className="w-full btn-primary py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Wird gespeichert...</> : 'Änderungen speichern'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-10 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Fertig</h2>
                    <p className="text-gray-600 mb-8">Deine Änderungen wurden in die PDF übernommen.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href={resultUrl} download={`bearbeitet-${file?.name || 'pdf'}.pdf`} className="btn-primary py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
                            <Download className="w-5 h-5" /> Download
                        </a>
                        <button onClick={() => { setFile(null); setResultUrl(null); setItems([]); setError(null); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
                            <RefreshCcw className="w-5 h-5" /> Neu starten
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
