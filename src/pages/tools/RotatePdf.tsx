import { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { Loader2, Download, RefreshCcw, RotateCw, RotateCcw } from 'lucide-react';
import PdfUploader from '../../components/PdfUploader';

export default function RotatePdf() {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [numPages, setNumPages] = useState<number>(0);
    const [rotations, setRotations] = useState<number[]>([]);

    const handleFileSelected = async (files: File[]) => {
        if (files.length > 0) {
            const selectedFile = files[0];
            setFile(selectedFile);
            setResultUrl(null);
            setError(null);

            try {
                const arrayBuffer = await selectedFile.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                const count = pdf.getPageCount();
                setNumPages(count);

                // Initialize all pages with 0 rotation or their existing rotation
                const initialRotations = new Array(count).fill(0);
                for (let i = 0; i < count; i++) {
                    const page = pdf.getPage(i);
                    const currentRotation = page.getRotation().angle;
                    initialRotations[i] = currentRotation;
                }
                setRotations(initialRotations);

            } catch (e) {
                setError('Die Datei konnte nicht gelesen werden. Ist sie verschlüsselt?');
            }
        }
    };

    const rotatePage = (index: number, direction: 'cw' | 'ccw') => {
        const newRotations = [...rotations];
        let newAngle = newRotations[index] + (direction === 'cw' ? 90 : -90);

        // Normalize to 0, 90, 180, 270
        if (newAngle >= 360) newAngle -= 360;
        if (newAngle < 0) newAngle += 360;

        newRotations[index] = newAngle;
        setRotations(newRotations);
    };

    const rotateAll = (direction: 'cw' | 'ccw') => {
        const newRotations = rotations.map(angle => {
            let newAngle = angle + (direction === 'cw' ? 90 : -90);
            if (newAngle >= 360) newAngle -= 360;
            if (newAngle < 0) newAngle += 360;
            return newAngle;
        });
        setRotations(newRotations);
    };

    const savePdf = async () => {
        if (!file) return;

        setIsProcessing(true);
        setError(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            for (let i = 0; i < numPages; i++) {
                const page = pdfDoc.getPage(i);
                page.setRotation(degrees(rotations[i]));
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setResultUrl(url);

        } catch (err: any) {
            setError(err.message || 'Beim Rotieren der Seiten ist ein Fehler aufgetreten.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-5xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">PDF rotieren</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Drehe einzelne Seiten oder das gesamte PDF-Dokument.
                    Richte gescannte Dokumente mit einem Klick richtig aus.
                </p>
            </div>

            {!resultUrl ? (
                <div className="space-y-8">
                    {!file ? (
                        <PdfUploader
                            onFilesSelected={handleFileSelected}
                            multiple={false}
                            colorTheme="purple"
                            title="PDF hier ablegen"
                        />
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 pb-6 border-b border-gray-100">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => rotateAll('ccw')}
                                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        <RotateCcw className="w-4 h-4" /> Alle links
                                    </button>
                                    <button
                                        onClick={() => rotateAll('cw')}
                                        className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Alle rechts <RotateCw className="w-4 h-4" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => { setFile(null); setNumPages(0); }}
                                    className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    Andere Datei wählen
                                </button>
                            </div>

                            {error && <p className="text-red-500 text-sm mb-6 font-medium text-center">{error}</p>}


                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 max-h-[500px] overflow-y-auto p-2">
                                {Array.from({ length: numPages }).map((_, i) => (
                                    <div key={i} className="flex flex-col items-center">
                                        <div
                                            className="aspect-[1/1.4] w-full bg-white border-2 border-gray-200 rounded-lg shadow-sm mb-3 flex items-center justify-center transition-transform duration-300 relative overflow-hidden"
                                            style={{ transform: `rotate(${rotations[i]}deg)` }}
                                        >
                                            <span className="text-4xl text-gray-300 font-bold" style={{ transform: `rotate(-${rotations[i]}deg)` }}>{i + 1}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => rotatePage(i, 'ccw')} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
                                                <RotateCcw className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => rotatePage(i, 'cw')} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
                                                <RotateCw className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center border-t border-gray-100 pt-8 mt-4">
                                <button
                                    onClick={savePdf}
                                    disabled={isProcessing}
                                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold py-4 px-12 rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50 shadow-lg shadow-purple-600/20"
                                >
                                    {isProcessing ? (
                                        <><Loader2 className="animate-spin w-6 h-6" /> Wird gespeichert...</>
                                    ) : (
                                        <>Änderungen anwenden & Speichern</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-purple-100 p-10 text-center animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Download className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Erfolgreich rotiert!</h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Deine PDF-Datei wurde mit der neuen Ausrichtung gespeichert.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a
                            href={resultUrl}
                            download={`rotiert-${file?.name}`}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            <Download className="w-5 h-5" /> PDF herunterladen
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
