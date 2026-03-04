import { useState } from 'react';
import { Download, Loader2, LockOpen, RefreshCcw } from 'lucide-react';
import PdfUploader from '../../components/PdfUploader';

export default function RemovePassword() {
    const [file, setFile] = useState<File | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onFilesSelected = (files: File[]) => {
        if (!files[0]) return;
        setFile(files[0]);
        setResultUrl(null);
        setError(null);
    };

    const removePassword = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError(null);

        try {
            const { PDFDocument } = await import('pdf-lib-plus-encrypt');
            const source = await file.arrayBuffer();

            const encryptedDoc = await PDFDocument.load(source as ArrayBuffer, { ignoreEncryption: true } as any);
            const outDoc = await PDFDocument.create();
            const pageIndices = Array.from({ length: encryptedDoc.getPageCount() }, (_, i) => i);
            const pages = await outDoc.copyPages(encryptedDoc, pageIndices);
            pages.forEach((page) => outDoc.addPage(page));

            try {
                const form = outDoc.getForm();
                form.flatten();
            } catch {
                // ignore missing form support
            }

            const outBytes = await outDoc.save();
            const outBlob = new Blob([outBytes as BlobPart], { type: 'application/pdf' });
            setResultUrl(URL.createObjectURL(outBlob));
        } catch (e: any) {
            setError(e?.message || 'Passwort konnte nicht entfernt werden. Diese Datei verwendet ggf. eine nicht unterstützte Verschlüsselung.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-4xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">PDF Passwort entfernen</h1>
                <p className="text-lg text-gray-600">MVP: Entfernt vorhandenen Schutz, sofern die Datei browserseitig verarbeitet werden kann.</p>
            </div>

            {!resultUrl ? (
                <div className="space-y-8">
                    {!file ? (
                        <PdfUploader onFilesSelected={onFilesSelected} multiple={false} colorTheme="orange" title="Verschlüsselte PDF ablegen" />
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
                            <div className="flex items-center gap-2 font-semibold text-gray-700"><LockOpen className="w-5 h-5 text-orange-600" /> {file.name}</div>

                            <p className="text-sm text-gray-600 bg-orange-50 border border-orange-200 rounded-xl p-3">
                                Hinweis: Bei stark oder proprietär verschlüsselten PDFs kann die Entsperrung fehlschlagen.
                            </p>

                            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                            <button onClick={removePassword} disabled={isProcessing} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Wird entsperrt...</> : 'Passwort entfernen'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-10 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Fertig</h2>
                    <p className="text-gray-600 mb-8">Die PDF wurde ohne Passwortschutz neu gespeichert.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href={resultUrl} download={`unlocked-${file?.name || 'document.pdf'}`} className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
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
