import { Link } from 'react-router-dom';
import { Combine, Image, PenTool, Scissors, Minimize2 } from 'lucide-react';

const POPULAR_TOOLS = [
    // {
    //     path: '/pdf-to-word',
    //     title: 'PDF in Word',
    //     description: 'PDF-Dateien in bearbeitbare Word-Dokumente umwandeln.',
    //     icon: <FileText className="w-8 h-8 text-blue-500" />,
    //     color: 'bg-blue-50',
    //     emoji: '📄'
    // },
    {
        path: '/merge',
        title: 'PDFs zusammenfügen',
        description: 'Mehrere PDFs zu einer einzigen Datei kombinieren.',
        icon: <Combine className="w-8 h-8 text-indigo-500" />,
        color: 'bg-indigo-50',
        emoji: '🧩'
    },
    {
        path: '/jpg-to-pdf',
        title: 'JPG in PDF',
        description: 'Bilder schnell in eine PDF-Datei umwandeln.',
        icon: <Image className="w-8 h-8 text-yellow-500" />,
        color: 'bg-yellow-50',
        emoji: '🖼️'
    },
    {
        path: '/sign',
        title: 'Unterschreibe PDF',
        description: 'Dokumente digital unterschreiben und weitergeben.',
        icon: <PenTool className="w-8 h-8 text-pink-500" />,
        color: 'bg-pink-50',
        emoji: '✍️'
    },
    {
        path: '/edit-pdf',
        title: 'PDF bearbeiten',
        description: 'Text und Elemente in PDFs direkt anpassen.',
        icon: <Scissors className="w-8 h-8 text-cyan-500" />,
        color: 'bg-cyan-50',
        emoji: '🛠️'
    },
    {
        path: '/compress',
        title: 'PDF verkleinern',
        description: 'Dateigröße reduzieren bei guter Qualität.',
        icon: <Minimize2 className="w-8 h-8 text-green-500" />,
        color: 'bg-green-50',
        emoji: '🗜️'
    }
];

export default function Startseite() {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div className="text-left">
                    <h1 className="text-[2.75rem] md:text-[3.25rem] font-bold text-gray-900 tracking-tight mb-6">
                        Wir machen PDF <br /> einfach.
                    </h1>
                    <p className="text-gray-600 text-[1.2rem] max-w-2xl mb-8 leading-relaxed">
                        die du brauchst, um produktiver und smarter mit <br />
                        Dokumenten zu arbeiten.
                    </p>
                </div>

                <div className="w-full flex justify-start lg:justify-end">
                    <img
                        src="/bild1.png?v=20260302-2"
                        alt="Startseiten Bild"
                        className="w-full max-w-xl h-auto object-contain"
                    />
                </div>
            </section>

            <section className="w-full mt-20 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
                    Die beliebtesten PDF-Tools
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                    30 Tools, um PDFs kostenlos zu konvertieren, komprimieren und zu bearbeiten. <br />
                    Probiere es noch heute aus!
                </p>

                <div className="w-full mb-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {POPULAR_TOOLS.map((tool, idx) => (
                            <Link
                                key={tool.title}
                                to={tool.path}
                                className="group flex flex-col px-6 py-5 rounded-2xl border border-gray-200 bg-white hover:border-blue-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden animate-fade-in"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
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
                </div>

                <Link
                    to="/"
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
                >
                    Alle PDF-Tools ansehen
                </Link>
            </section>
        </div>
    );
}
