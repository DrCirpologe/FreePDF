import { useState } from 'react';
import { Download, FileCheck2, Loader2, RefreshCcw } from 'lucide-react';
import PdfUploader from '../../components/PdfUploader';

type FieldType = 'text' | 'checkbox' | 'dropdown' | 'radio' | 'optionlist' | 'unknown';

type FormFieldModel = {
    name: string;
    type: FieldType;
    options?: string[];
};

export default function PdfFormFiller() {
    const [file, setFile] = useState<File | null>(null);
    const [fields, setFields] = useState<FormFieldModel[]>([]);
    const [values, setValues] = useState<Record<string, string | boolean>>({});
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const detectType = (field: any): FieldType => {
        const constructorName = field?.constructor?.name || '';
        if (constructorName.includes('TextField')) return 'text';
        if (constructorName.includes('CheckBox')) return 'checkbox';
        if (constructorName.includes('Dropdown')) return 'dropdown';
        if (constructorName.includes('RadioGroup')) return 'radio';
        if (constructorName.includes('OptionList')) return 'optionlist';
        return 'unknown';
    };

    const onFilesSelected = async (files: File[]) => {
        if (!files[0]) return;
        setFile(files[0]);
        setError(null);
        setResultUrl(null);
        setFields([]);
        setValues({});

        try {
            const { PDFDocument } = await import('pdf-lib');
            const pdfDoc = await PDFDocument.load(await files[0].arrayBuffer());
            const form = pdfDoc.getForm();
            const allFields = form.getFields();

            const mapped: FormFieldModel[] = allFields.map((field: any) => {
                const type = detectType(field);
                const model: FormFieldModel = { name: field.getName(), type };
                if ((type === 'dropdown' || type === 'optionlist' || type === 'radio') && typeof field.getOptions === 'function') {
                    model.options = field.getOptions();
                }
                return model;
            });

            const initialValues: Record<string, string | boolean> = {};
            mapped.forEach((field) => {
                initialValues[field.name] = field.type === 'checkbox' ? false : '';
            });

            setFields(mapped);
            setValues(initialValues);
        } catch (e: any) {
            setError(e?.message || 'Formularfelder konnten nicht gelesen werden.');
        }
    };

    const apply = async () => {
        if (!file || fields.length === 0) return;
        setIsProcessing(true);
        setError(null);

        try {
            const { PDFDocument } = await import('pdf-lib');
            const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
            const form = pdfDoc.getForm();

            for (const field of fields) {
                try {
                    const f: any = form.getField(field.name);
                    const value = values[field.name];

                    if (field.type === 'text' && typeof f.setText === 'function') {
                        f.setText(String(value || ''));
                    } else if (field.type === 'checkbox') {
                        if (value === true && typeof f.check === 'function') f.check();
                        if (value !== true && typeof f.uncheck === 'function') f.uncheck();
                    } else if ((field.type === 'dropdown' || field.type === 'radio' || field.type === 'optionlist') && typeof f.select === 'function' && value) {
                        f.select(String(value));
                    }
                } catch {
                    // Skip unsupported field safely
                }
            }

            const out = await pdfDoc.save();
            const url = URL.createObjectURL(new Blob([out as BlobPart], { type: 'application/pdf' }));
            setResultUrl(url);
        } catch (e: any) {
            setError(e?.message || 'Formular konnte nicht ausgefüllt werden.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-5xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">PDF-Formularausfüller</h1>
                <p className="text-lg text-gray-600">Erkannte Formularfelder direkt im Browser ausfüllen und speichern.</p>
            </div>

            {!resultUrl ? (
                <div className="space-y-8">
                    {!file ? (
                        <PdfUploader onFilesSelected={onFilesSelected} multiple={false} colorTheme="green" title="Formular-PDF hier ablegen" />
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
                            <div className="flex items-center gap-2 font-semibold text-gray-700"><FileCheck2 className="w-5 h-5 text-green-600" /> {file.name}</div>

                            {fields.length === 0 && !error && (
                                <p className="text-sm text-gray-600">Keine editierbaren Felder gefunden oder Datei enthält keine AcroForm-Felder.</p>
                            )}

                            {fields.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                                    {fields.map((field) => (
                                        <div key={field.name} className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-2">
                                            <div className="text-sm font-semibold text-gray-800">{field.name}</div>
                                            {field.type === 'checkbox' ? (
                                                <label className="inline-flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={values[field.name] === true}
                                                        onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.checked }))}
                                                    />
                                                    Aktiv
                                                </label>
                                            ) : field.options && field.options.length > 0 ? (
                                                <select
                                                    value={String(values[field.name] || '')}
                                                    onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                                >
                                                    <option value="">Bitte wählen</option>
                                                    {field.options.map((option) => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    value={String(values[field.name] || '')}
                                                    onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                                    placeholder="Wert eingeben"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                            <button onClick={apply} disabled={isProcessing || fields.length === 0} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Wird gespeichert...</> : 'Formular ausfüllen & speichern'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-10 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Fertig</h2>
                    <p className="text-gray-600 mb-8">Das ausgefüllte Formular wurde gespeichert.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href={resultUrl} download={`formular-${file?.name || 'pdf'}.pdf`} className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
                            <Download className="w-5 h-5" /> Download
                        </a>
                        <button onClick={() => { setFile(null); setResultUrl(null); setFields([]); setValues({}); setError(null); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-8 rounded-xl text-lg font-bold flex items-center justify-center gap-2">
                            <RefreshCcw className="w-5 h-5" /> Neu starten
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
