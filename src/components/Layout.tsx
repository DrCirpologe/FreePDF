import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Layers, ChevronDown, Combine, Scissors, Trash2, RotateCw } from 'lucide-react';

export default function Layout() {
    const [isToolsOpen, setIsToolsOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 glass-panel border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-blue-600 text-white p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
                                <Layers className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
                                FreePDF
                            </span>
                        </Link>

                        <div className="h-6 w-px bg-gray-300 hidden md:block"></div>

                        <button
                            onClick={() => setIsToolsOpen(!isToolsOpen)}
                            className={`hidden md:flex items-center gap-2 font-semibold transition-colors ${isToolsOpen ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                                }`}
                        >
                            <span>Tools</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isToolsOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    <nav className="flex items-center gap-6">
                        <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                            Alle Tools anzeigen
                        </Link>
                    </nav>
                </div>

                {/* Tools Mega Menu / Sheet */}
                {isToolsOpen && (
                    <>
                        <div
                            className="fixed inset-0 top-16 bg-gray-900/20 backdrop-blur-sm z-40 transition-opacity"
                            onClick={() => setIsToolsOpen(false)}
                        ></div>
                        <div className="absolute top-16 left-0 right-0 h-[50vh] bg-white border-b border-gray-200 shadow-xl z-50 overflow-y-auto animate-slide-up">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                                <h2 className="text-2xl font-bold text-gray-900 mb-8">Beliebte PDF Tools</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <Link
                                        to="/merge"
                                        onClick={() => setIsToolsOpen(false)}
                                        className="flex items-start gap-4 p-4 rounded-xl hover:bg-blue-50 transition-colors group"
                                    >
                                        <div className="bg-blue-100 text-blue-600 p-3 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <Combine className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-700">PDF zusammenfügen</h3>
                                            <p className="text-sm text-gray-500">Mehrere PDFs zu einer Datei verbinden</p>
                                        </div>
                                    </Link>

                                    <Link
                                        to="/split"
                                        onClick={() => setIsToolsOpen(false)}
                                        className="flex items-start gap-4 p-4 rounded-xl hover:bg-orange-50 transition-colors group"
                                    >
                                        <div className="bg-orange-100 text-orange-600 p-3 rounded-lg group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                            <Scissors className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-orange-700">PDF aufteilen</h3>
                                            <p className="text-sm text-gray-500">Seiten einzeln extrahieren</p>
                                        </div>
                                    </Link>

                                    <Link
                                        to="/delete-pages"
                                        onClick={() => setIsToolsOpen(false)}
                                        className="flex items-start gap-4 p-4 rounded-xl hover:bg-red-50 transition-colors group"
                                    >
                                        <div className="bg-red-100 text-red-600 p-3 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                                            <Trash2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-red-700">Seiten löschen</h3>
                                            <p className="text-sm text-gray-500">Unerwünschte Seiten entfernen</p>
                                        </div>
                                    </Link>

                                    <Link
                                        to="/rotate"
                                        onClick={() => setIsToolsOpen(false)}
                                        className="flex items-start gap-4 p-4 rounded-xl hover:bg-purple-50 transition-colors group"
                                    >
                                        <div className="bg-purple-100 text-purple-600 p-3 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                            <RotateCw className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-purple-700">PDF rotieren</h3>
                                            <p className="text-sm text-gray-500">Seiten oder Dokument drehen</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full flex flex-col items-center">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-200 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <Link to="/" className="flex items-center gap-2 mb-4">
                                <div className="bg-blue-600 text-white p-1 rounded-md">
                                    <Layers className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-lg text-gray-900">FreePDF</span>
                            </Link>
                            <p className="text-gray-500 max-w-sm">
                                Kostenlose Online-Tools zum Bearbeiten von PDFs – schnell, sicher & ohne Installation.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Beliebte Tools</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><Link to="/merge" className="hover:text-blue-600 transition-colors">PDF zusammenfügen</Link></li>
                                <li><Link to="/split" className="hover:text-blue-600 transition-colors">PDF aufteilen</Link></li>
                                <li><Link to="/rotate" className="hover:text-blue-600 transition-colors">PDF rotieren</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Rechtliches</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><Link to="/impressum" className="hover:text-blue-600 transition-colors">Impressum</Link></li>
                                <li><Link to="/datenschutz" className="hover:text-blue-600 transition-colors">Datenschutz</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
                        <p>© {new Date().getFullYear()} CIRPAN Software Development. Alle Rechte vorbehalten.</p>
                        <p className="mt-2 md:mt-0 flex items-center gap-1">
                            Made with <span className="text-red-500">♥</span> in Austria
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
