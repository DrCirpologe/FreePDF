import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, FileCog, FileImage, FileText, Image, RefreshCcw, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getConverterActions } from '../../utils/converterActions';
import { addRecentFile, clearRecentFiles, getRecentFiles, type RecentFileEntry } from '../../utils/recentFiles';
import { converterAccept, detectFileKind, getFileExtension, type FileKind } from '../../utils/fileType';

type InspectorResult = {
    extension: string;
    kind: FileKind;
    sizeLabel: string;
};

export default function PdfConverter() {
    const [file, setFile] = useState<File | null>(null);
    const [analysis, setAnalysis] = useState<InspectorResult | null>(null);
    const [recentFiles, setRecentFiles] = useState<RecentFileEntry[]>(() => getRecentFiles());
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        const worker = new Worker(new URL('../../workers/fileInspector.worker.ts', import.meta.url), { type: 'module' });
        workerRef.current = worker;

        worker.onmessage = (event: MessageEvent<InspectorResult>) => {
            setAnalysis(event.data);
        };

        return () => {
            worker.terminate();
            workerRef.current = null;
        };
    }, []);

    const extension = analysis?.extension || (file ? getFileExtension(file.name) : '');
    const detectedKind = analysis?.kind || (file ? detectFileKind(file.name, file.type) : 'unknown');
    const actions = useMemo(() => getConverterActions(detectedKind), [detectedKind]);

    const icon = useMemo(() => {
        if (detectedKind === 'pdf') return <FileText className="w-5 h-5 text-blue-600" />;
        if (detectedKind === 'image') return <Image className="w-5 h-5 text-blue-600" />;
        return <FileImage className="w-5 h-5 text-blue-600" />;
    }, [detectedKind]);

    const handleFileInput = (selectedFile: File | null) => {
        if (!selectedFile) return;

        setFile(selectedFile);
        setAnalysis(null);

        workerRef.current?.postMessage({
            name: selectedFile.name,
            mimeType: selectedFile.type,
            size: selectedFile.size,
        });

        const updatedRecent = addRecentFile({
            name: selectedFile.name,
            extension: getFileExtension(selectedFile.name),
            kind: detectFileKind(selectedFile.name, selectedFile.type),
            size: selectedFile.size,
            mimeType: selectedFile.type,
        });
        setRecentFiles(updatedRecent);
    };

    const resetSelection = () => {
        setFile(null);
        setAnalysis(null);
    };

    return (
        <div className="w-full max-w-5xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">PDF-Konverter</h1>
                <p className="text-lg text-gray-600">Intelligenter Hub: erkennt Dateityp und zeigt passende Konvertierungswege.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
                <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Datei auswählen</span>
                    <input
                        type="file"
                        onChange={(e) => handleFileInput(e.target.files?.[0] || null)}
                        className="mt-2 block w-full rounded-xl border border-gray-300 px-4 py-3"
                        accept={converterAccept}
                    />
                </label>

                {file && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-2 text-blue-800 font-semibold">
                            {icon}
                            {file.name}
                            <span className="ml-auto text-xs uppercase tracking-wide">{extension || 'ohne Endung'}</span>
                        </div>

                        <div className="text-xs text-gray-500 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div><span className="font-semibold text-gray-700">Typ:</span> {detectedKind}</div>
                            <div><span className="font-semibold text-gray-700">Größe:</span> {analysis?.sizeLabel || 'wird analysiert...'}</div>
                            <div><span className="font-semibold text-gray-700">MIME:</span> {file.type || 'unbekannt'}</div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {actions.map((action, index) => (
                                <div key={`${action.label}-${index}`} className="border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                                    <div>
                                        <div className="font-semibold text-gray-800">{action.label}</div>
                                        {!action.available && action.reason && <div className="text-xs text-gray-500 mt-0.5">{action.reason}</div>}
                                    </div>
                                    {action.available ? (
                                        <Link to={action.route} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold inline-flex items-center gap-2 whitespace-nowrap">
                                            Öffnen <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    ) : (
                                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg whitespace-nowrap">Nicht verfügbar</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button onClick={resetSelection} className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
                            <RefreshCcw className="w-4 h-4" /> Auswahl zurücksetzen
                        </button>
                    </div>
                )}

                {!file && (
                    <div className="space-y-4">
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                            <FileCog className="w-4 h-4" /> Wähle eine Datei, um automatisch passende Konvertierungsmöglichkeiten zu sehen.
                        </div>

                        {recentFiles.length > 0 && (
                            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Clock3 className="w-4 h-4" /> Zuletzt verwendet</div>
                                    <button
                                        onClick={() => {
                                            clearRecentFiles();
                                            setRecentFiles([]);
                                        }}
                                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-lg inline-flex items-center gap-1"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Leeren
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {recentFiles.map((entry) => (
                                        <div key={entry.id} className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex justify-between gap-3">
                                            <span className="truncate">{entry.name}</span>
                                            <span className="uppercase text-gray-500">{entry.extension || 'n/a'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
