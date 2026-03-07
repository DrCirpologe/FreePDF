import { Link } from 'react-router-dom';
import {
    Combine,
    Scissors,
    Minimize2,
    Trash2,
    RotateCw,
    Layers,
    PenTool,
    Crop,
    Stamp,
    Share2,
    Lock,
    LockKeyhole,
    FilePenLine,
    FileSignature,
    FileSearch,
    TextCursorInput,
    ScanText,
    Camera,
    FileText,
    FileImage,
    Image,
    Hash,
    ShieldAlert
} from 'lucide-react';

const TOOLS = [
    {
        path: '/merge',
        title: 'PDF zusammenfügen',
        description: 'Füge mehrere PDFs in der gewünschten Reihenfolge zu einer einzigen Datei zusammen.',
        icon: <Combine className="w-8 h-8 text-blue-500" />,
        emoji: '✂️',
        color: 'bg-blue-50',
        popular: true
    },
    {
        path: '/split',
        title: 'PDF aufteilen',
        description: 'Trenne eine oder alle Seiten aus einem PDF und speichere sie als einzelne Dateien.',
        icon: <Scissors className="w-8 h-8 text-orange-500" />,
        emoji: '📄',
        color: 'bg-orange-50',
        popular: true
    },
    {
        path: '/compress',
        title: 'PDF komprimieren',
        description: 'Verkleinere deine PDF-Dateien für den E-Mail-Versand bei optimaler Qualität.',
        icon: <Minimize2 className="w-8 h-8 text-green-500" />,
        emoji: '🗜️',
        color: 'bg-green-50',
        popular: true
    },
    {
        path: '/delete-pages',
        title: 'Seiten löschen',
        description: 'Entferne ganz einfach überflüssige oder leere Seiten aus deinen Dokumenten.',
        icon: <Trash2 className="w-8 h-8 text-red-500" />,
        emoji: '🗑️',
        color: 'bg-red-50'
    },
    {
        path: '/rotate',
        title: 'PDF rotieren',
        description: 'Drehe deine PDF-Dateien oder einzelne Seiten ganz einfach so, wie du sie brauchst.',
        icon: <RotateCw className="w-8 h-8 text-purple-500" />,
        emoji: '🔄',
        color: 'bg-purple-50'
    },
    {
        path: '/sign',
        title: 'PDF unterschreiben',
        description: 'Unterschreibe PDF-Dokumente digital oder frage Unterschriften an.',
        icon: <FileSignature className="w-8 h-8 text-indigo-500" />,
        emoji: '✍️',
        color: 'bg-indigo-50'
    }
];

const ALL_TOOLS = [
    // { path: '/ppt-to-pdf', title: 'PPT in PDF', description: 'PowerPoint-Präsentationen in PDF-Dokumente konvertieren.', icon: <FileText className="w-8 h-8 text-blue-500" />, color: 'bg-blue-50', emoji: '📊' },
    // { path: '/word-to-pdf', title: 'Word in PDF', description: 'Word-Dokumente in PDF-Dateien konvertieren.', icon: <FileText className="w-8 h-8 text-indigo-500" />, color: 'bg-indigo-50', emoji: '📝' },
    // { path: '/excel-to-pdf', title: 'Excel in PDF', description: 'Excel-Tabellen in PDF-Dokumente konvertieren.', icon: <FileText className="w-8 h-8 text-emerald-500" />, color: 'bg-emerald-50', emoji: '📈' },
    { path: '/jpg-to-pdf', title: 'JPG in PDF', description: 'JPG, PNG, BMP, GIF und TIFF in PDF umwandeln.', icon: <Image className="w-8 h-8 text-yellow-500" />, color: 'bg-yellow-50', emoji: '🖼️' },
    { path: '/pdf-to-jpg', title: 'PDF in JPG', description: 'PDF-Seiten als einzelne Bilder speichern.', icon: <FileImage className="w-8 h-8 text-orange-500" />, color: 'bg-orange-50', emoji: '📸' },
    // { path: '/pdf-to-word', title: 'PDF in Word', description: 'PDFs in bearbeitbare Word-Dokumente konvertieren.', icon: <FileText className="w-8 h-8 text-blue-500" />, color: 'bg-blue-50', emoji: '📄' },
    // { path: '/pdf-to-ppt', title: 'PDF in PPT', description: 'PDFs in bearbeitbare PowerPoint-Dateien konvertieren.', icon: <FileText className="w-8 h-8 text-red-500" />, color: 'bg-red-50', emoji: '📽️' },
    // { path: '/pdf-to-excel', title: 'PDF in Excel', description: 'PDFs in bearbeitbare Excel-Tabellen konvertieren.', icon: <FileText className="w-8 h-8 text-green-500" />, color: 'bg-green-50', emoji: '📊' },
    { path: '/pdf-converter', title: 'PDF-Konverter', description: 'Dateien in PDF und aus PDF zurück konvertieren.', icon: <FileText className="w-8 h-8 text-purple-500" />, color: 'bg-purple-50', emoji: '🔁' },
    { path: '/annotate-pdf', title: 'PDF kommentieren', description: 'In PDF schreiben, zeichnen und markieren.', icon: <PenTool className="w-8 h-8 text-pink-500" />, color: 'bg-pink-50', emoji: '✏️' },
    { path: '/edit-pdf', title: 'PDF bearbeiten', description: 'Text, Formen, Bilder und Kommentare hinzufügen.', icon: <FilePenLine className="w-8 h-8 text-cyan-500" />, color: 'bg-cyan-50', emoji: '🛠️' },
    { path: '/pdf-form-filler', title: 'PDF-Formularausfüller', description: 'PDF-Formulare online ausfüllen.', icon: <TextCursorInput className="w-8 h-8 text-teal-500" />, color: 'bg-teal-50', emoji: '✅' },
    { path: '/pdf-reader', title: 'PDF-Reader', description: 'PDFs online anzeigen, drucken und teilen.', icon: <FileSearch className="w-8 h-8 text-slate-500" />, color: 'bg-slate-50', emoji: '👁️' },
    { path: '/crop-pdf', title: 'PDF zuschneiden', description: 'Dokumente mit dem Zuschneidungstool zuschneiden.', icon: <Crop className="w-8 h-8 text-emerald-500" />, color: 'bg-emerald-50', emoji: '✂️' },
    { path: '/redact-pdf', title: 'PDF schwärzen', description: 'Vertrauliche Inhalte aus PDFs entfernen.', icon: <ShieldAlert className="w-8 h-8 text-rose-500" />, color: 'bg-rose-50', emoji: '🔒' },
    { path: '/watermark', title: 'Wasserzeichen-PDF', description: 'Ein Wasserzeichen zu PDFs hinzufügen.', icon: <Stamp className="w-8 h-8 text-cyan-500" />, color: 'bg-cyan-50', emoji: '💧' },
    { path: '/share-pdf', title: 'PDF freigeben', description: 'PDF-Dateien per Link teilen und freigeben.', icon: <Share2 className="w-8 h-8 text-cyan-500" />, color: 'bg-cyan-50', emoji: '🔗' },
    { path: '/page-numbers', title: 'Seitenzahlen einfügen', description: 'Seitenzahlen in PDF-Dateien einbauen.', icon: <Hash className="w-8 h-8 text-indigo-500" />, color: 'bg-indigo-50', emoji: '🔢' },
    { path: '/extract-pages', title: 'PDF-Seiten extrahieren', description: 'Gezielte Seiten aus einer PDF-Datei auswählen.', icon: <Scissors className="w-8 h-8 text-sky-500" />, color: 'bg-sky-50', emoji: '📑' },
    { path: '/organize-pdf', title: 'PDF organisieren', description: 'Seiten neu anordnen, löschen, drehen und ergänzen.', icon: <Combine className="w-8 h-8 text-violet-500" />, color: 'bg-violet-50', emoji: '🗂️' },
    { path: '/remove-password', title: 'PDF Passwort entfernen', description: 'Passwort, Verschlüsselung und Rechte entfernen.', icon: <LockKeyhole className="w-8 h-8 text-red-500" />, color: 'bg-red-50', emoji: '🔓' },
    { path: '/encrypt-pdf', title: 'PDF verschlüsseln', description: 'Passwort hinzufügen und PDF verschlüsseln.', icon: <Lock className="w-8 h-8 text-rose-500" />, color: 'bg-rose-50', emoji: '🛡️' },
    { path: '/flatten-pdf', title: 'Ebenen reduzieren', description: 'Bearbeitung der PDF nachträglich verhindern.', icon: <Layers className="w-8 h-8 text-amber-500" />, color: 'bg-amber-50', emoji: '📌' },
    { path: '/ocr', title: 'OCR', description: 'Gescannte Texte durchsuchbar machen.', icon: <ScanText className="w-8 h-8 text-teal-500" />, color: 'bg-teal-50', emoji: '🔍' },
    { path: '/pdf-ocr', title: 'PDF OCR', description: 'Texterkennung für gescannte PDFs nutzen.', icon: <ScanText className="w-8 h-8 text-red-500" />, color: 'bg-red-50', emoji: '🧾' },
    // { path: '/ai-pdf-assistant', title: 'KI-PDF-Assistent', description: 'Mit KI Dokumente bearbeiten.', icon: <ShieldAlert className="w-8 h-8 text-blue-500" />, color: 'bg-blue-50', emoji: '🤖' },
    // { path: '/chat-with-pdf', title: 'Mit PDFs chatten', description: 'Fragen direkt zu deinen PDFs stellen.', icon: <FileText className="w-8 h-8 text-blue-500" />, color: 'bg-blue-50', emoji: '💬' },
    // { path: '/ai-pdf-summary', title: 'KI-PDF-Zusammenfassung', description: 'PDF-Inhalte per KI zusammenfassen lassen.', icon: <FileText className="w-8 h-8 text-blue-500" />, color: 'bg-blue-50', emoji: '🧠' },
    // { path: '/translate-pdf', title: 'PDF übersetzen', description: 'PDF-Inhalte als übersetzte Zusammenfassung erhalten.', icon: <FileText className="w-8 h-8 text-blue-500" />, color: 'bg-blue-50', emoji: '🌐' },
    // { path: '/ai-question-generator', title: 'KI-Fragen-Generator', description: 'Multiple-Choice- und offene Fragen erstellen.', icon: <Hash className="w-8 h-8 text-blue-500" />, color: 'bg-blue-50', emoji: '❓' },
    { path: '/pdf-scanner', title: 'PDF-Scanner', description: 'PDFs aus Smartphone-Scans erstellen.', icon: <Camera className="w-8 h-8 text-cyan-500" />, color: 'bg-cyan-50', emoji: '📱' },
    { path: '/remove-metadata', title: 'Metadaten entfernen', description: 'Sensible Dateimetadaten aus PDFs löschen.', icon: <ShieldAlert className="w-8 h-8 text-emerald-500" />, color: 'bg-emerald-50', emoji: '🧹' }
];

export default function Home() {
    return (
        <div className="w-full">
            {/* Hero Section */}
            <section className="w-full bg-gradient-to-b from-blue-50/50 to-transparent pt-16 pb-12 text-center px-4 rounded-b-[3rem] sm:rounded-b-[4rem] mb-12">
                <div className="max-w-4xl mx-auto animate-slide-up">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
                        Wir machen <span className="text-red-600">PDFs</span> <span className="text-blue-600">einfach.</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Alle Werkzeuge, die du zum Bearbeiten brauchst – direkt im Browser. Keine Installation, absolut kostenlos und 100% sicher, da deine Dateien deinen Computer nie verlassen.
                    </p>
                </div>
            </section>

            {/* Main Tools Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Unsere beliebtesten PDF-Tools</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TOOLS.map((tool, idx) => (
                        <Link
                            key={tool.title}
                            to={tool.path}
                            className={`group flex flex-col px-6 py-5 rounded-2xl border border-gray-200 bg-white hover:border-blue-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden animate-fade-in`}
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            {tool.popular && (
                                <span className="absolute top-4 right-4 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                                    Beliebt
                                </span>
                            )}

                            <div className="flex items-center gap-4 mb-4">
                                <div className={`p-3 rounded-xl ${tool.color} group-hover:scale-110 transition-transform duration-300`}>
                                    {tool.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {tool.title}
                                </h3>
                            </div>

                            <p className="text-gray-500 text-sm leading-relaxed flex-1">
                                {tool.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* All Tools Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-32">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ALL_TOOLS.map((tool, idx) => (
                        <Link
                            key={tool.path}
                            to={tool.path}
                            className="group flex flex-col px-6 py-5 rounded-2xl border border-gray-200 bg-white hover:border-blue-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden animate-fade-in"
                            style={{ animationDelay: `${idx * 35}ms` }}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`p-3 rounded-xl ${tool.color} group-hover:scale-110 transition-transform duration-300`}>
                                    {tool.icon}
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {tool.title}
                                </h4>
                            </div>

                            <p className="text-gray-500 text-sm leading-relaxed flex-1">{tool.description}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
