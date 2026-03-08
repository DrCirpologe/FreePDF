import { Link } from 'react-router-dom';
import { Combine, Image, FileSignature, FilePenLine, Minimize2, Scissors } from 'lucide-react';

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
        path: '/split',
        title: 'PDF aufteilen',
        description: 'Seiten aus einer PDF trennen und als neue Datei speichern.',
        icon: <Scissors className="w-8 h-8 text-violet-500" />,
        color: 'bg-violet-50',
        emoji: '✂️'
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
        icon: <FileSignature className="w-8 h-8 text-pink-500" />,
        color: 'bg-pink-50',
        emoji: '✍️'
    },
    {
        path: '/edit-pdf',
        title: 'PDF bearbeiten',
        description: 'Text und Elemente in PDFs direkt anpassen.',
        icon: <FilePenLine className="w-8 h-8 text-cyan-500" />,
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
    const adTargetUrl = 'https://cirpan-software-development.at';
    const heroImageSrc = `${import.meta.env.BASE_URL}bild1.png?v=20260302-2`;

    const openAdTarget = () => {
        window.open(adTargetUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div className="text-left">
                    <h1 className="text-[2.75rem] md:text-[3.25rem] font-bold text-gray-900 tracking-tight mb-6">
                        Wir machen <span className="text-red-600">PDFs</span> <span className="text-blue-600">einfach.</span>
                    </h1>
                    <p className="text-gray-600 text-[1.2rem] max-w-2xl mb-8 leading-relaxed">
                        Alle Werkzeuge, die du zum Bearbeiten brauchst – direkt im Browser. Keine Installation, absolut kostenlos und 100% sicher, da deine Dateien deinen Computer nie verlassen.
                    </p>
                </div>

                <div className="w-full flex justify-start lg:justify-end">
                    <img
                        src={heroImageSrc}
                        alt="Startseiten Bild"
                        className="w-full max-w-xl h-auto object-contain"
                    />
                </div>
            </section>

            <section className="w-full mt-20 text-center">
                <div className="w-full mb-12">
                    <div
                        onClick={openAdTarget}
                        className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-indigo-800/70 px-5 py-7 md:px-8 md:py-9 shadow-2xl relative ad-motion-bg cursor-pointer"
                    >
                        <div className="ad-lava-field" aria-hidden="true">
                            <div className="ad-lava-blob ad-lava-a -top-8 -left-10 w-[134px] h-[134px] bg-indigo-500/55"></div>
                            <div className="ad-lava-blob ad-lava-b top-1/3 left-1/4 w-[125px] h-[125px] bg-violet-500/60"></div>
                            <div className="ad-lava-blob ad-lava-c top-1/4 left-[46%] w-[106px] h-[106px] bg-sky-500/55"></div>
                            <div className="ad-lava-blob ad-lava-c -bottom-8 left-1/2 w-[154px] h-[154px] bg-blue-500/55"></div>
                            <div className="ad-lava-blob ad-lava-b top-1 right-8 w-[106px] h-[106px] bg-fuchsia-500/55"></div>
                            <div className="ad-lava-blob ad-lava-a bottom-0 right-0 w-[134px] h-[134px] bg-cyan-500/55"></div>
                        </div>

                        <div className="relative z-10">
                            <div className="relative mb-7">
                                <div className="pointer-events-none absolute inset-x-0 -top-1 mx-auto h-16 md:h-20 w-72 md:w-[28rem] rounded-full bg-indigo-300/30 blur-3xl"></div>
                                <div className="pointer-events-none absolute inset-x-0 top-3 mx-auto h-10 md:h-12 w-56 md:w-80 rounded-full bg-sky-300/20 blur-2xl"></div>
                                <h3 className="relative text-center text-3xl md:text-5xl font-extrabold leading-tight ad-heading-glow">
                                    Moderne Software<br />
                                    Entwicklung
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <article
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        openAdTarget();
                                    }}
                                    className="group cursor-pointer rounded-2xl border border-indigo-200/30 bg-white/10 px-5 py-5 text-center backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300/70 hover:bg-white/15 hover:shadow-lg active:translate-y-0 active:scale-[0.99]"
                                >
                                    <div className="w-7 h-7 rounded-md bg-blue-500 mx-auto mb-3"></div>
                                    <h4 className="text-white text-xl md:text-2xl font-black tracking-wide mb-1.5 group-hover:text-indigo-100">ONE-PAGE WEBSITE</h4>
                                    <p className="text-yellow-300 text-3xl font-extrabold leading-none mb-2 group-hover:text-yellow-200">29,90 €<span className="text-white/75 text-base font-medium">/Monat</span></p>
                                    <p className="text-white/85 text-lg group-hover:text-white">Perfekt für Kleinunternehmer</p>
                                </article>

                                <article
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        openAdTarget();
                                    }}
                                    className="group cursor-pointer relative rounded-2xl border border-indigo-400 bg-indigo-900/45 px-5 py-5 text-center backdrop-blur-sm shadow-xl ring-1 ring-indigo-400/40 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:bg-indigo-800/55 hover:shadow-2xl hover:ring-indigo-300/60 active:translate-y-0 active:scale-[0.99]"
                                >
                                    <span className="absolute top-0 right-0 rounded-bl-xl rounded-tr-2xl bg-indigo-400 px-3 py-1 text-sm font-bold text-white">Beliebt</span>
                                    <div className="w-7 h-7 rounded-md bg-orange-400 mx-auto mb-3"></div>
                                    <h4 className="text-white text-xl md:text-2xl font-black tracking-wide mb-1.5 group-hover:text-indigo-100">BUSINESS WEBSITE</h4>
                                    <p className="text-yellow-300 text-3xl font-extrabold leading-none mb-2 group-hover:text-yellow-200">59,90 €<span className="text-white/75 text-base font-medium">/Monat</span></p>
                                    <p className="text-white/85 text-lg group-hover:text-white">Komplette Online-Präsenz</p>
                                </article>

                                <article
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        openAdTarget();
                                    }}
                                    className="group cursor-pointer rounded-2xl border border-indigo-200/30 bg-white/10 px-5 py-5 text-center backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300/70 hover:bg-white/15 hover:shadow-lg active:translate-y-0 active:scale-[0.99]"
                                >
                                    <div className="w-7 h-7 rounded-md bg-red-500 mx-auto mb-3"></div>
                                    <h4 className="text-white text-xl md:text-2xl font-black tracking-wide mb-1.5 group-hover:text-indigo-100">PREMIUM + SHOP</h4>
                                    <p className="text-yellow-300 text-3xl font-extrabold leading-none mb-2 group-hover:text-yellow-200">119,90 €<span className="text-white/75 text-base font-medium">/Monat</span></p>
                                    <p className="text-white/85 text-lg group-hover:text-white">Website + Online-Shop</p>
                                </article>
                            </div>
                        </div>
                    </div>
                </div>

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
