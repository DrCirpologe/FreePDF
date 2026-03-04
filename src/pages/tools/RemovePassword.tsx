import { useState } from 'react';
import { Download, Loader2, LockOpen, RefreshCcw } from 'lucide-react';
import PdfUploader from '../../components/PdfUploader';

export default function RemovePassword() {
    const [file, setFile] = useState<File | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [password, setPassword] = useState('');

    const onFilesSelected = (files: File[]) => {
        if (!files[0]) return;
        setFile(files[0]);
        setResultUrl(null);
        setError(null);
        setPassword('');
    };

    const removePassword = async () => {
        if (!file) return;
        if (!password.trim()) {
            setError('Bitte gib das PDF-Passwort ein.');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const pdfBytes = new Uint8Array(await file.arrayBuffer());
            const pdfjsLib = await import('pdfjs-dist');
            const { PDFDocument } = await import('pdf-lib');

            pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

            const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
            loadingTask.onPassword = (updatePassword: (password: string) => void) => {
                updatePassword(password.trim());
            };

            const sourcePdf = await loadingTask.promise;
            const outDoc = await PDFDocument.create();

            for (let pageNumber = 1; pageNumber <= sourcePdf.numPages; pageNumber++) {
                const page = await sourcePdf.getPage(pageNumber);
                const viewport = page.getViewport({ scale: 2 });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) throw new Error('Canvas konnte nicht initialisiert werden.');

                canvas.width = Math.ceil(viewport.width);
                canvas.height = Math.ceil(viewport.height);

                await page.render({ canvasContext: context, viewport, canvas }).promise;

                const imageDataUrl = canvas.toDataURL('image/png');
                const image = await outDoc.embedPng(imageDataUrl);
                const outPage = outDoc.addPage([viewport.width, viewport.height]);
                outPage.drawImage(image, { x: 0, y: 0, width: viewport.width, height: viewport.height });
            }

            const outBytes = await outDoc.save();
            const outBlob = new Blob([outBytes as BlobPart], { type: 'application/pdf' });
            setResultUrl(URL.createObjectURL(outBlob));
        } catch (e: any) {
            const message = String(e?.message || '');
            if (message.toLowerCase().includes('password')) {
                setError('Passwort falsch oder PDF kann damit nicht geöffnet werden.');
            } else {
                setError('Passwort konnte nicht entfernt werden. Bitte prüfe Passwort und Datei.');
            }
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
                                Das Dokument wird nach Eingabe des korrekten Passworts neu aufgebaut und ohne Schutz gespeichert.
                            </p>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="PDF-Passwort eingeben"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3"
                            />

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
