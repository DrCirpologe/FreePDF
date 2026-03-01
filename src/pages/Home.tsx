import { Link } from 'react-router-dom';
import {
    Combine,
    Scissors,
    Minimize2,
    Trash2,
    RotateCw,
    PenTool,
    FileImage,
    Image,
    ShieldAlert,
    Hash,
    FileText
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

const MORE_TOOLS = [
    {
        icon: <Image className="w-6 h-6 text-pink-500" />,
        title: 'JPG zu PDF',
        path: '/img-to-pdf'
    },
    {
        icon: <FileImage className="w-6 h-6 text-yellow-500" />,
        title: 'PDF zu Bilder',
        path: '/pdf-to-img'
    },
    {
        icon: <ShieldAlert className="w-6 h-6 text-emerald-500" />,
        title: 'Metadaten entfernen',
        path: '/remove-metadata'
    },
    {
        icon: <Hash className="w-6 h-6 text-cyan-500" />,
        title: 'Seitenzahlen',
        path: '/page-numbers'
    },
    {
        icon: <FileText className="w-6 h-6 text-slate-500" />,
        title: 'Wasserzeichen',
        path: '/watermark'
    }
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

            {/* More Tools List */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Weitere nützliche Helfer</h3>
                <div className="flex flex-wrap justify-center gap-4">
                    {MORE_TOOLS.map((tool) => (
                        <Link
                            key={tool.title}
                            to={tool.path}
                            className="flex items-center gap-3 bg-white border border-gray-200 px-5 py-3 rounded-full hover:border-blue-300 hover:shadow-md transition-all group"
                        >
                            <div className="group-hover:scale-110 transition-transform">
                                {tool.icon}
                            </div>
                            <span className="font-semibold text-gray-700 group-hover:text-gray-900">{tool.title}</span>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
