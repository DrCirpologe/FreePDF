import { useState } from 'react';
import { Download, Eye, RefreshCcw } from 'lucide-react';
import PdfUploader from '../../components/PdfUploader';

export default function PdfReader() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const onFilesSelected = (files: File[]) => {
        const selected = files[0];
        if (!selected) return;
        setFile(selected);
        setPreviewUrl(URL.createObjectURL(selected));
    };

    return (
        <div className="w-full max-w-6xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">PDF-Reader</h1>
                <p className="text-lg text-gray-600">PDFs online ansehen, prüfen und herunterladen.</p>
            </div>

            {!previewUrl ? (
                <PdfUploader onFilesSelected={onFilesSelected} multiple={false} colorTheme="blue" title="PDF hier ablegen" />
            ) : (
                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 font-semibold text-gray-700"><Eye className="w-5 h-5 text-blue-600" /> {file?.name}</div>
                        <div className="flex flex-wrap gap-3">
                            <a href={previewUrl} download={file?.name || 'dokument.pdf'} className="btn-primary rounded-xl px-5 py-2.5 font-bold inline-flex items-center gap-2">
                                <Download className="w-4 h-4" /> Download
                            </a>
                            <button onClick={() => { setFile(null); setPreviewUrl(null); }} className="bg-gray-100 hover:bg-gray-200 rounded-xl px-5 py-2.5 font-bold text-gray-700 inline-flex items-center gap-2">
                                <RefreshCcw className="w-4 h-4" /> Neu laden
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden h-[75vh]">
                        <iframe title="PDF Vorschau" src={previewUrl} className="w-full h-full" />
                    </div>
                </div>
            )}
        </div>
    );
}
