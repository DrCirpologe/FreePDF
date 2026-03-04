import { useState } from 'react';
import { Copy, Download, Loader2, Send, Share2 } from 'lucide-react';
import PdfUploader from '../../components/PdfUploader';

export default function SharePdf() {
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const onFilesSelected = (files: File[]) => {
        const selected = files[0];
        if (!selected) return;
        setFile(selected);
        setFileUrl(URL.createObjectURL(selected));
        setMessage(null);
    };

    const copyLink = async () => {
        if (!fileUrl) return;
        await navigator.clipboard.writeText(fileUrl);
        setMessage('Lokaler Link kopiert.');
    };

    const shareFile = async () => {
        if (!file) return;
        setIsSharing(true);
        setMessage(null);

        try {
            if (navigator.share && navigator.canShare?.({ files: [file] })) {
                await navigator.share({
                    title: file.name,
                    text: 'PDF-Datei teilen',
                    files: [file],
                });
                setMessage('Datei erfolgreich geteilt.');
            } else {
                setMessage('Direktes Teilen wird auf diesem Gerät nicht unterstützt. Nutze Download oder Link kopieren.');
            }
        } catch {
            setMessage('Teilen abgebrochen oder fehlgeschlagen.');
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className="w-full max-w-4xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">PDF freigeben</h1>
                <p className="text-lg text-gray-600">Teile deine PDF schnell über den nativen Share-Dialog oder per Download.</p>
            </div>

            {!file ? (
                <PdfUploader onFilesSelected={onFilesSelected} multiple={false} colorTheme="purple" title="PDF hier ablegen" />
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
                    <div className="font-semibold text-gray-800">{file.name}</div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button onClick={shareFile} disabled={isSharing} className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                            {isSharing ? <><Loader2 className="w-4 h-4 animate-spin" /> Teilen...</> : <><Share2 className="w-4 h-4" /> Teilen</>}
                        </button>
                        <button onClick={copyLink} className="bg-purple-100 hover:bg-purple-200 text-purple-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                            <Copy className="w-4 h-4" /> Link kopieren
                        </button>
                        <a href={fileUrl || '#'} download={file.name} className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                            <Download className="w-4 h-4" /> Download
                        </a>
                    </div>

                    <p className="text-xs text-gray-500">Hinweis: Der kopierte Link ist lokal im Browser gültig. Für dauerhafte Online-Freigabe wäre ein Server-Upload nötig.</p>
                    {message && <p className="text-sm font-medium text-gray-700 flex items-center gap-2"><Send className="w-4 h-4" /> {message}</p>}
                </div>
            )}
        </div>
    );
}
