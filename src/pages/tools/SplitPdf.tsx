import { useState } from 'react';
import { Loader2, Download, RefreshCcw, FileOutput } from 'lucide-react';
import PdfUploader from '../../components/PdfUploader';

export default function SplitPdf() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number>(0);

    const handleFileSelected = async (files: File[]) => {
        if (files.length > 0) {
            const selectedFile = files[0];
            setFile(selectedFile);
            setResultUrl(null);
            setError(null);

            try {
                const { PDFDocument } = await import('pdf-lib');
                const arrayBuffer = await selectedFile.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                setNumPages(pdf.getPageCount());
            } catch (e) {
                setError('Die Datei konnte nicht gelesen werden. Ist sie verschlüsselt?');
            }
        }
    };

    const splitPdf = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError(null);

        try {
            const { PDFDocument } = await import('pdf-lib');
            const { default: JSZip } = await import('jszip');
            const arrayBuffer = await file.arrayBuffer();
            const originalPdf = await PDFDocument.load(arrayBuffer);
            const totalPages = originalPdf.getPageCount();

            const zip = new JSZip();

            for (let i = 0; i < totalPages; i++) {
                const newPdf = await PDFDocument.create();
                const [copiedPage] = await newPdf.copyPages(originalPdf, [i]);
                newPdf.addPage(copiedPage);
                const pdfBytes = await newPdf.save();
                zip.file(`${file.name.replace('.pdf', '')}-seite-${i + 1}.pdf`, pdfBytes);
            }

            const zipContent = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipContent);
            setResultUrl(url);

        } catch (err: any) {
            setError(err.message || 'Beim Aufteilen ist ein Fehler aufgetreten.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-4xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">PDF aufteilen</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Trenne jede Seite deines PDFs in eine einzelne Datei auf. Du erhältst ein ZIP-Archiv
                    mit allen Seiten. Perfekt zum Extrahieren von Inhalten.
                </p>
            </div>

            {!resultUrl ? (
                <div className="space-y-8">
                    {!file ? (
                        <PdfUploader
                            onFilesSelected={handleFileSelected}
                            multiple={false}
                            colorTheme="orange"
                            title="PDF hier ablegen"
                        />
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FileOutput className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{file.name}</h3>
                            <p className="text-gray-500 mb-6">{numPages} Seiten erkannt. Jede Seite wird in ein eigenes PDF aufgeteilt.</p>

                            {error && <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>}

                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <button
                                    onClick={splitPdf}
                                    disabled={isProcessing}
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
                                >
                                    {isProcessing ? (
                                        <><Loader2 className="animate-spin w-6 h-6" /> Wird aufgeteilt...</>
                                    ) : (
                                        <>In {numPages} PDFs aufteilen</>
                                    )}
                                </button>
                                <button
                                    onClick={() => { setFile(null); setNumPages(0); }}
                                    className="bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold py-4 px-8 rounded-xl transition-colors"
                                >
                                    Andere Datei wählen
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-10 text-center animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Download className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Erfolgreich aufgeteilt!</h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Deine {numPages} Seiten wurden als ZIP-Datei gepackt und sind bereit zum Download.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a
                            href={resultUrl}
                            download={`${file?.name.replace('.pdf', '')}-seiten.zip`}
                            className="bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            <Download className="w-5 h-5" /> ZIP herunterladen
                        </a>
                        <button
                            onClick={() => { setFile(null); setResultUrl(null); }}
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-lg font-bold py-3 px-8 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCcw className="w-5 h-5" /> Neu starten
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
