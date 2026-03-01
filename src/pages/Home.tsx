import { Link } from 'react-router-dom';
import {
    Combine,
    Scissors,
    Minimize2,
    Trash2,
    RotateCw,
    PenTool
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
        icon: <PenTool className="w-8 h-8 text-indigo-500" />,
        emoji: '✍️',
        color: 'bg-indigo-50'
    }
];

const ALL_TOOLS = [
    { path: '/ppt-to-pdf', title: 'PPT in PDF', description: 'PowerPoint-Präsentationen in PDF-Dokumente konvertieren.' },
    { path: '/word-to-pdf', title: 'Word in PDF', description: 'Word-Dokumente in PDF-Dateien konvertieren.' },
    { path: '/excel-to-pdf', title: 'Excel in PDF', description: 'Excel-Tabellen in PDF-Dokumente konvertieren.' },
    { path: '/jpg-to-pdf', title: 'JPG in PDF', description: 'JPG, PNG, BMP, GIF und TIFF in PDF umwandeln.' },
    { path: '/pdf-to-jpg', title: 'PDF in JPG', description: 'PDF-Seiten als einzelne Bilder speichern.' },
    { path: '/pdf-to-word', title: 'PDF in Word', description: 'PDFs in bearbeitbare Word-Dokumente konvertieren.' },
    { path: '/pdf-to-ppt', title: 'PDF in PPT', description: 'PDFs in bearbeitbare PowerPoint-Dateien konvertieren.' },
    { path: '/pdf-to-excel', title: 'PDF in Excel', description: 'PDFs in bearbeitbare Excel-Tabellen konvertieren.' },
    { path: '/pdf-converter', title: 'PDF-Konverter', description: 'Dateien in PDF und aus PDF zurück konvertieren.' },
    { path: '/annotate-pdf', title: 'PDF kommentieren', description: 'In PDF schreiben, zeichnen und markieren.' },
    { path: '/edit-pdf', title: 'PDF bearbeiten', description: 'Text, Formen, Bilder und Kommentare hinzufügen.' },
    { path: '/pdf-form-filler', title: 'PDF-Formularausfüller', description: 'PDF-Formulare online ausfüllen.' },
    { path: '/pdf-reader', title: 'PDF-Reader', description: 'PDFs online anzeigen, drucken und teilen.' },
    { path: '/crop-pdf', title: 'PDF zuschneiden', description: 'Dokumente mit dem Zuschneidungstool zuschneiden.' },
    { path: '/redact-pdf', title: 'PDF schwärzen', description: 'Vertrauliche Inhalte aus PDFs entfernen.' },
    { path: '/watermark', title: 'Wasserzeichen-PDF', description: 'Ein Wasserzeichen zu PDFs hinzufügen.' },
    { path: '/page-numbers', title: 'Seitenzahlen einfügen', description: 'Seitenzahlen in PDF-Dateien einbauen.' },
    { path: '/extract-pages', title: 'PDF-Seiten extrahieren', description: 'Gezielte Seiten aus einer PDF-Datei auswählen.' },
    { path: '/organize-pdf', title: 'PDF organisieren', description: 'Seiten neu anordnen, löschen, drehen und ergänzen.' },
    { path: '/remove-password', title: 'PDF Passwort entfernen', description: 'Passwort, Verschlüsselung und Rechte entfernen.' },
    { path: '/encrypt-pdf', title: 'PDF verschlüsseln', description: 'Passwort hinzufügen und PDF verschlüsseln.' },
    { path: '/flatten-pdf', title: 'Ebenen reduzieren', description: 'Bearbeitung der PDF nachträglich verhindern.' },
    { path: '/ocr', title: 'OCR', description: 'Gescannte Texte durchsuchbar machen.' },
    { path: '/pdf-ocr', title: 'PDF OCR', description: 'Texterkennung für gescannte PDFs nutzen.' },
    { path: '/ai-pdf-assistant', title: 'KI-PDF-Assistent', description: 'Mit KI Dokumente bearbeiten.' },
    { path: '/chat-with-pdf', title: 'Mit PDFs chatten', description: 'Fragen direkt zu deinen PDFs stellen.' },
    { path: '/ai-pdf-summary', title: 'KI-PDF-Zusammenfassung', description: 'PDF-Inhalte per KI zusammenfassen lassen.' },
    { path: '/translate-pdf', title: 'PDF übersetzen', description: 'PDF-Inhalte als übersetzte Zusammenfassung erhalten.' },
    { path: '/ai-question-generator', title: 'KI-Fragen-Generator', description: 'Multiple-Choice- und offene Fragen erstellen.' },
    { path: '/pdf-scanner', title: 'PDF-Scanner', description: 'PDFs aus Smartphone-Scans erstellen.' },
    { path: '/remove-metadata', title: 'Metadaten entfernen', description: 'Sensible Dateimetadaten aus PDFs löschen.' }
];

export default function Home() {
    return (
        <div className="w-full">
            {/* Hero Section */}
            <section className="w-full bg-gradient-to-b from-blue-50/50 to-transparent pt-16 pb-12 text-center px-4 rounded-b-[3rem] sm:rounded-b-[4rem] mb-12">
                <div className="max-w-4xl mx-auto animate-slide-up">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
                        Wir machen PDFs <span className="text-blue-600">einfach.</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Alle Werkzeuge, die du zum Bearbeiten brauchst – direkt im Browser. Keine Installation, absolut kostenlos und 100% sicher, da deine Dateien deinen Computer nie verlassen.
                    </p>
                </div>
            </section>

            {/* Main Tools Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Unsere beliebtesten PDF-Tools</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TOOLS.map((tool, idx) => (
                        <Link
                            key={tool.title}
                            to={tool.path}
                            className={`group flex flex-col p-6 rounded-2xl border border-gray-200 bg-white hover:border-blue-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden animate-fade-in`}
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

                            <div className="mt-6 flex justify-between items-center text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span>Jetzt {tool.title.toLowerCase()}</span>
                                <span className="text-2xl">{tool.emoji}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* All Tools Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Alle PDF-Tools</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {ALL_TOOLS.map((tool) => (
                        <Link
                            key={tool.path}
                            to={tool.path}
                            className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {tool.title}
                                </h4>
                                <span className="text-blue-500 text-xl leading-none">→</span>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{tool.description}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
