import { useState } from 'react';
import { Loader2, Download, RefreshCcw, FileMinus, Trash } from 'lucide-react';
import PdfUploader from '../../components/PdfUploader';

export default function DeletePages() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [numPages, setNumPages] = useState<number>(0);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

    const handleFileSelected = async (files: File[]) => {
        if (files.length > 0) {
            const selectedFile = files[0];
            setFile(selectedFile);
            setResultUrl(null);
            setError(null);
            setSelectedPages(new Set());

            try {
                const { PDFDocument } = await import('pdf-lib');
                const arrayBuffer = await selectedFile.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                setNumPages(pdf.getPageCount());
            } catch {
                setError('Die Datei konnte nicht gelesen werden. Ist sie verschlüsselt?');
            }
        }
    };

    const togglePageSelection = (pageIndex: number) => {
        const newSelection = new Set(selectedPages);
        if (newSelection.has(pageIndex)) {
            newSelection.delete(pageIndex);
        } else {
            newSelection.add(pageIndex);
        }
        setSelectedPages(newSelection);
    };

    const deleteSelectedPages = async () => {
        if (!file || selectedPages.size === 0) return;

        if (selectedPages.size === numPages) {
            setError('Du kannst nicht alle Seiten löschen.');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const { PDFDocument } = await import('pdf-lib');
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            // Delete in reverse order to not mess up indices
            const sortedPagesToDelete = Array.from(selectedPages).sort((a, b) => b - a);
            for (const pageIndex of sortedPagesToDelete) {
                pdfDoc.removePage(pageIndex);
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setResultUrl(url);

        } catch (err: any) {
            setError(err.message || 'Beim Löschen der Seiten ist ein Fehler aufgetreten.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-5xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Seiten aus PDF löschen</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Wähle die Seiten aus, die du aus deinem PDF-Dokument entfernen möchtest.
                    Einfach anklicken und die neue Datei herunterladen.
                </p>
            </div>

            {!resultUrl ? (
                <div className="space-y-8">
                    {!file ? (
                        <PdfUploader
                            onFilesSelected={handleFileSelected}
                            multiple={false}
                            colorTheme="red"
                            title="PDF hier ablegen"
                        />
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 pb-6 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                                        <FileMinus className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 truncate max-w-[200px] sm:max-w-xs">{file.name}</h3>
                                        <p className="text-sm text-gray-500">{numPages} Seiten insgesamt</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => { setFile(null); setNumPages(0); setSelectedPages(new Set()); }}
                                    className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    Andere Datei wählen
                                </button>
                            </div>

                            {error && <p className="text-red-500 text-sm mb-6 font-medium text-center">{error}</p>}

                            <p className="text-center font-medium text-gray-700 mb-6">
                                Klicke auf die Seiten, die <span className="text-red-600 font-bold border-b border-red-200 pb-0.5">gelöscht</span> werden sollen:
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8 max-h-[500px] overflow-y-auto p-2">
                                {Array.from({ length: numPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => togglePageSelection(i)}
                                        className={`
                      aspect-[1/1.4] rounded-lg border-2 flex flex-col items-center justify-center transition-all relative
                      ${selectedPages.has(i)
                                                ? 'border-red-500 bg-red-50 opacity-50 scale-95'
                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'}
                    `}
                                    >
                                        <span className={`text-3xl font-bold ${selectedPages.has(i) ? 'text-red-500 line-through' : 'text-gray-400'}`}>
                                            {i + 1}
                                        </span>
                                        {selectedPages.has(i) && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Trash className="w-12 h-12 text-red-500/30" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-center">
                                <button
                                    onClick={deleteSelectedPages}
                                    disabled={selectedPages.size === 0 || isProcessing || selectedPages.size === numPages}
                                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white text-lg font-bold py-4 px-12 rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/20"
                                >
                                    {isProcessing ? (
                                        <><Loader2 className="animate-spin w-6 h-6" /> Wird bearbeitet...</>
                                    ) : (
                                        <>{selectedPages.size} {selectedPages.size === 1 ? 'Seite' : 'Seiten'} löschen</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-10 text-center animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Download className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Seiten erfolgreich gelöscht!</h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Deine neue PDF-Datei ohne die markierten Seiten ist fertig.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a
                            href={resultUrl}
                            download={`gekuerzt-${file?.name}`}
                            className="bg-red-600 hover:bg-red-700 text-white text-lg font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            <Download className="w-5 h-5" /> PDF herunterladen
                        </a>
                        <button
                            onClick={() => { setFile(null); setResultUrl(null); setSelectedPages(new Set()); }}
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
