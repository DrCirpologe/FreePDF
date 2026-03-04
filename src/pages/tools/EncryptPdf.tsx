import { useState } from 'react';
import { Download, Loader2, Lock, RefreshCcw, Shield } from 'lucide-react';
import PdfUploader from '../../components/PdfUploader';

export default function EncryptPdf() {
    const [file, setFile] = useState<File | null>(null);
    const [userPassword, setUserPassword] = useState('');
    const [ownerPassword, setOwnerPassword] = useState('');
    const [allowPrint, setAllowPrint] = useState(true);
    const [allowCopy, setAllowCopy] = useState(false);
    const [allowModify, setAllowModify] = useState(false);
    const [allowAnnotate, setAllowAnnotate] = useState(false);
    const [allowFillForms, setAllowFillForms] = useState(true);

    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);

    const onFilesSelected = (files: File[]) => {
        if (!files[0]) return;
        setFile(files[0]);
        setResultUrl(null);
        setError(null);
    };

    const encrypt = async () => {
        if (!file) return;
        if (userPassword.trim().length < 3) {
            setError('Bitte ein Benutzer-Passwort mit mindestens 3 Zeichen angeben.');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const { PDFDocument } = await import('pdf-lib-plus-encrypt');
            const source = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(source as ArrayBuffer, { ignoreEncryption: true } as any);

            await pdfDoc.encrypt({
                userPassword: userPassword.trim(),
                ownerPassword: (ownerPassword.trim() || userPassword.trim()),
                permissions: {
                    printing: allowPrint ? 'highResolution' : false,
                    copying: allowCopy,
                    modifying: allowModify,
                    annotating: allowAnnotate,
                    fillingForms: allowFillForms,
                    contentAccessibility: true,
                    documentAssembly: allowModify,
                },
            } as any);

            const bytes = await pdfDoc.save();
            const outBlob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
            setResultUrl(URL.createObjectURL(outBlob));
        } catch (e: any) {
            setError(e?.message || 'Verschlüsselung fehlgeschlagen.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-5xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">PDF verschlüsseln</h1>
                <p className="text-lg text-gray-600">Setze ein Passwort und sichere dein PDF direkt im Browser.</p>
            </div>

            {!resultUrl ? (
                <div className="space-y-8">
                    {!file ? (
                        <PdfUploader onFilesSelected={onFilesSelected} multiple={false} colorTheme="green" title="PDF hier ablegen" />
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
                            <div className="flex items-center gap-2 font-semibold text-gray-700"><Shield className="w-5 h-5 text-green-600" /> {file.name}</div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="password"
                                    value={userPassword}
                                    onChange={(e) => setUserPassword(e.target.value)}
                                    placeholder="Benutzer-Passwort (Pflicht)"
                                    className="rounded-xl border border-gray-300 px-4 py-2.5"
                                />
                                <input
                                    type="password"
                                    value={ownerPassword}
                                    onChange={(e) => setOwnerPassword(e.target.value)}
                                    placeholder="Owner-Passwort (optional)"
                                    className="rounded-xl border border-gray-300 px-4 py-2.5"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                                <label className="flex items-center gap-2"><input type="checkbox" checked={allowPrint} onChange={(e) => setAllowPrint(e.target.checked)} /> Drucken erlauben</label>
                                <label className="flex items-center gap-2"><input type="checkbox" checked={allowCopy} onChange={(e) => setAllowCopy(e.target.checked)} /> Kopieren erlauben</label>
                                <label className="flex items-center gap-2"><input type="checkbox" checked={allowModify} onChange={(e) => setAllowModify(e.target.checked)} /> Bearbeiten erlauben</label>
                                <label className="flex items-center gap-2"><input type="checkbox" checked={allowAnnotate} onChange={(e) => setAllowAnnotate(e.target.checked)} /> Kommentare erlauben</label>
                                <label className="flex items-center gap-2"><input type="checkbox" checked={allowFillForms} onChange={(e) => setAllowFillForms(e.target.checked)} /> Formulare ausfüllen</label>
                            </div>

                            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                            <button onClick={encrypt} disabled={isProcessing} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Wird verschlüsselt...</> : <><Lock className="w-5 h-5" /> PDF verschlüsseln</>}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-10 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Verschlüsselung abgeschlossen</h2>
                    <p className="text-gray-600 mb-8">Deine PDF wurde mit Passwortschutz gespeichert.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href={resultUrl} download={`encrypted-${file?.name || 'document.pdf'}`} className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
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
