import { useEffect, useRef, useState, type ComponentType } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    Layers,
    ChevronDown,
    Menu,
    X,
    Combine,
    Scissors,
    Trash2,
    RotateCw,
    Minimize2,
    FileText,
    FileImage,
    Image,
    PenTool,
    Hash,
    ShieldAlert,
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
    Camera
} from 'lucide-react';

type ToolItem = {
    title: string;
    path?: string;
    externalHref?: string;
    icon: ComponentType<{ className?: string }>;
    tone: string;
    plainText?: boolean;
};

type ToolColumn = {
    heading: string;
    items: ToolItem[];
};

const TOOL_SHEET_COLUMNS: ToolColumn[] = [
    {
        heading: 'Komprimieren',
        items: [
            { title: 'PDF verkleinern', path: '/compress', icon: Minimize2, tone: 'bg-red-100 text-red-800 group-hover:bg-red-800 group-hover:text-white' },
            { title: 'Konvertieren', icon: FileText, tone: '', plainText: true },
            { title: 'PDF-Konverter', path: '/pdf-converter', icon: RotateCw, tone: 'bg-red-100 text-red-800 group-hover:bg-red-800 group-hover:text-white' },
            // { title: 'KI PDF', icon: ShieldAlert, tone: '', plainText: true },
            // { title: 'Mit PDFs chatten', path: '/chat-with-pdf', icon: FileText, tone: 'bg-blue-100 text-blue-800 group-hover:bg-blue-800 group-hover:text-white' },
            // { title: 'KI-PDF-Zusammenfassung', path: '/ai-pdf-summary', icon: FileText, tone: 'bg-blue-100 text-blue-800 group-hover:bg-blue-800 group-hover:text-white' },
            // { title: 'PDF übersetzen', path: '/translate-pdf', icon: FileText, tone: 'bg-blue-100 text-blue-800 group-hover:bg-blue-800 group-hover:text-white' },
            // { title: 'KI-basierter Fragen-Generator', path: '/ai-question-generator', icon: Hash, tone: 'bg-blue-100 text-blue-800 group-hover:bg-blue-800 group-hover:text-white' }
        ]
    },
    {
        heading: 'Organisieren',
        items: [
            { title: 'PDFs zusammenfügen', path: '/merge', icon: Combine, tone: 'bg-violet-100 text-violet-700 group-hover:bg-violet-700 group-hover:text-white' },
            { title: 'PDF teilen', path: '/split', icon: Scissors, tone: 'bg-violet-100 text-violet-700 group-hover:bg-violet-700 group-hover:text-white' },
            { title: 'PDF drehen', path: '/rotate', icon: RotateCw, tone: 'bg-violet-100 text-violet-700 group-hover:bg-violet-700 group-hover:text-white' },
            { title: 'PDF-Seiten löschen', path: '/delete-pages', icon: Trash2, tone: 'bg-violet-100 text-violet-700 group-hover:bg-violet-700 group-hover:text-white' },
            { title: 'PDF-Seiten extrahieren', path: '/extract-pages', icon: Scissors, tone: 'bg-violet-100 text-violet-700 group-hover:bg-violet-700 group-hover:text-white' },
            { title: 'PDF Organisieren', path: '/organize-pdf', icon: Layers, tone: 'bg-violet-100 text-violet-700 group-hover:bg-violet-700 group-hover:text-white' }
        ]
    },
    {
        heading: 'Ansehen und Bearbeiten',
        items: [
            { title: 'PDF bearbeiten', path: '/edit-pdf', icon: FilePenLine, tone: 'bg-cyan-100 text-cyan-700 group-hover:bg-cyan-700 group-hover:text-white' },
            { title: 'PDF Kommentieren', path: '/annotate-pdf', icon: PenTool, tone: 'bg-cyan-100 text-cyan-700 group-hover:bg-cyan-700 group-hover:text-white' },
            { title: 'PDF-Reader', path: '/pdf-reader', icon: FileSearch, tone: 'bg-cyan-100 text-cyan-700 group-hover:bg-cyan-700 group-hover:text-white' },
            { title: 'Seitenzahlen einfügen', path: '/page-numbers', icon: Hash, tone: 'bg-cyan-100 text-cyan-700 group-hover:bg-cyan-700 group-hover:text-white' },
            { title: 'PDFs zuschneiden', path: '/crop-pdf', icon: Crop, tone: 'bg-cyan-100 text-cyan-700 group-hover:bg-cyan-700 group-hover:text-white' },
            { title: 'PDF schwärzen', path: '/redact-pdf', icon: ShieldAlert, tone: 'bg-cyan-100 text-cyan-700 group-hover:bg-cyan-700 group-hover:text-white' },
            { title: 'Wasserzeichen-PDF', path: '/watermark', icon: Stamp, tone: 'bg-cyan-100 text-cyan-700 group-hover:bg-cyan-700 group-hover:text-white' },
            { title: 'PDF-Formularausfüller', path: '/pdf-form-filler', icon: TextCursorInput, tone: 'bg-cyan-100 text-cyan-700 group-hover:bg-cyan-700 group-hover:text-white' },
            { title: 'PDF freigeben', path: '/share-pdf', icon: Share2, tone: 'bg-cyan-100 text-cyan-700 group-hover:bg-cyan-700 group-hover:text-white' }
        ]
    },
    {
        heading: 'Aus PDF konvertieren',
        items: [
            // { title: 'PDF in Word', path: '/pdf-to-word', icon: FileText, tone: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' },
            // { title: 'PDF in Excel', path: '/pdf-to-excel', icon: FileText, tone: 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' },
            // { title: 'PDF in PPT', path: '/pdf-to-ppt', icon: FileText, tone: 'bg-orange-100 text-orange-600 group-hover:bg-orange-500 group-hover:text-white' },
            { title: 'PDF in JPG', path: '/pdf-to-jpg', icon: FileImage, tone: 'bg-yellow-100 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white' }
        ]
    },
    {
        heading: 'Zu PDF konvertieren',
        items: [
            // { title: 'Word in PDF', path: '/word-to-pdf', icon: FileText, tone: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' },
            // { title: 'Excel in PDF', path: '/excel-to-pdf', icon: FileText, tone: 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' },
            // { title: 'PPT in PDF', path: '/ppt-to-pdf', icon: FileText, tone: 'bg-orange-100 text-orange-600 group-hover:bg-orange-500 group-hover:text-white' },
            { title: 'JPG in PDF', path: '/jpg-to-pdf', icon: Image, tone: 'bg-yellow-100 text-yellow-700 group-hover:bg-yellow-600 group-hover:text-white' },
            { title: 'PDF OCR', path: '/pdf-ocr', icon: ScanText, tone: 'bg-red-100 text-red-700 group-hover:bg-red-600 group-hover:text-white' }
        ]
    },
    {
        heading: 'Unterschreiben',
        items: [
            { title: 'Unterschreibe PDF', path: '/sign', icon: FileSignature, tone: 'bg-pink-100 text-pink-700 group-hover:bg-pink-600 group-hover:text-white' },
            { title: 'Mehr', icon: ShieldAlert, tone: '', plainText: true },
            { title: 'PDF Passwort entfernen', path: '/remove-password', icon: LockKeyhole, tone: 'bg-rose-100 text-rose-600 group-hover:bg-rose-500 group-hover:text-white' },
            { title: 'PDF verschlüsseln', path: '/encrypt-pdf', icon: Lock, tone: 'bg-rose-100 text-rose-600 group-hover:bg-rose-500 group-hover:text-white' },
            { title: 'Ebenen der PDF reduzieren', path: '/flatten-pdf', icon: Layers, tone: 'bg-rose-100 text-rose-600 group-hover:bg-rose-500 group-hover:text-white' },
            { title: 'Scan', icon: FileImage, tone: '', plainText: true },
            { title: 'PDF-Scanner', path: '/pdf-scanner', icon: Camera, tone: 'bg-blue-100 text-blue-800 group-hover:bg-blue-800 group-hover:text-white' }
        ]
    }
];

export default function Layout() {
    const location = useLocation();
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const [isMobileToolsSheetOpen, setIsMobileToolsSheetOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [sheetTop, setSheetTop] = useState(64);
    const toolsSheetRef = useRef<HTMLDivElement | null>(null);
    const toolsButtonRef = useRef<HTMLButtonElement | null>(null);
    const mobileMenuRef = useRef<HTMLDivElement | null>(null);
    const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
    const mobileToolsSheetRef = useRef<HTMLDivElement | null>(null);
    const mobileToolsButtonRef = useRef<HTMLButtonElement | null>(null);

    const handleToolsToggle = () => {
        if (!isToolsOpen) {
            const buttonBottom = toolsButtonRef.current?.getBoundingClientRect().bottom ?? 64;
            const viewportSafeTop = Math.min(Math.max(buttonBottom + 10, 74), window.innerHeight - 220);
            setSheetTop(Math.round(viewportSafeTop));
        }

        setIsToolsOpen(prev => !prev);
    };

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (!isToolsOpen) {
                return;
            }

            const target = event.target as Node;
            const clickedInsideSheet = toolsSheetRef.current?.contains(target);
            const clickedToolsButton = toolsButtonRef.current?.contains(target);

            if (!clickedInsideSheet && !clickedToolsButton) {
                setIsToolsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        const originalBodyOverflow = document.body.style.overflow;
        const originalHtmlOverflow = document.documentElement.style.overflow;

        if (isToolsOpen || isMobileMenuOpen || isMobileToolsSheetOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.body.style.overflow = originalBodyOverflow;
            document.documentElement.style.overflow = originalHtmlOverflow;
        };
    }, [isToolsOpen, isMobileMenuOpen, isMobileToolsSheetOpen]);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        setIsMobileMenuOpen(false);
        setIsMobileToolsSheetOpen(false);
        setIsToolsOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleMobileOutsideClick = (event: MouseEvent) => {
            const target = event.target as Node;

            if (isMobileMenuOpen) {
                const clickedInsideMenu = mobileMenuRef.current?.contains(target);
                const clickedMenuButton = mobileMenuButtonRef.current?.contains(target);

                if (!clickedInsideMenu && !clickedMenuButton) {
                    setIsMobileMenuOpen(false);
                }
            }

            if (isMobileToolsSheetOpen) {
                const clickedInsideToolsSheet = mobileToolsSheetRef.current?.contains(target);
                const clickedToolsButton = mobileToolsButtonRef.current?.contains(target);

                if (!clickedInsideToolsSheet && !clickedToolsButton) {
                    setIsMobileToolsSheetOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleMobileOutsideClick);
        return () => document.removeEventListener('mousedown', handleMobileOutsideClick);
    }, [isMobileMenuOpen, isMobileToolsSheetOpen]);

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 glass-panel border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/startseite" className="flex items-center gap-2 group">
                            <div className="bg-blue-600 text-white p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
                                <Layers className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
                                FreePDF
                            </span>
                        </Link>

                        <div className="h-6 w-px bg-gray-300 hidden md:block"></div>

                        <button
                            ref={toolsButtonRef}
                            onClick={handleToolsToggle}
                            className={`hidden md:flex items-center gap-2 font-semibold transition-colors ${isToolsOpen ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                                }`}
                        >
                            <span>Tools</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isToolsOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <nav className="hidden lg:flex items-center gap-4">
                            <Link to="/compress" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Komprimieren</Link>
                            <Link to="/pdf-converter" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Umwandeln</Link>
                            <Link to="/merge" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Zusammenführen</Link>
                            <Link to="/edit-pdf" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Bearbeiten</Link>
                            <Link to="/sign" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Unterschreiben</Link>
                            {/* <Link to="/ai-pdf-assistant" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">KI PDF</Link> */}
                        </nav>
                    </div>

                    <div className="md:hidden flex items-center gap-2">
                        <button
                            ref={mobileToolsButtonRef}
                            type="button"
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                setIsMobileToolsSheetOpen((prev) => !prev);
                            }}
                            className={`inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${isMobileToolsSheetOpen
                                ? 'border-blue-200 bg-blue-50 text-blue-700'
                                : 'border-gray-200 bg-white text-gray-700 hover:text-blue-600 hover:border-blue-200'}`}
                        >
                            Tools
                        </button>

                        <button
                            ref={mobileMenuButtonRef}
                            type="button"
                            onClick={() => {
                                setIsMobileToolsSheetOpen(false);
                                setIsMobileMenuOpen((prev) => !prev);
                            }}
                            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-700 hover:text-blue-600 hover:border-blue-200 transition-colors"
                            aria-label={isMobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>

                </div>

                {isMobileMenuOpen && (
                    <>
                        <div
                            className="md:hidden fixed inset-0 top-16 bg-gray-500/55 backdrop-blur-md backdrop-grayscale backdrop-brightness-75 z-40 transition-opacity"
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                            }}
                        ></div>
                        <div ref={mobileMenuRef} className="md:hidden fixed left-0 right-0 top-16 z-50 border-t border-gray-200 bg-white px-4 py-4 space-y-3 animate-fade-in max-h-[calc(100vh-5rem)] overflow-y-auto">
                            <div className="grid grid-cols-1 gap-2">
                                <Link to="/compress" className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 transition-colors">Komprimieren</Link>
                                <Link to="/pdf-converter" className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 transition-colors">Umwandeln</Link>
                                <Link to="/merge" className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 transition-colors">Zusammenführen</Link>
                                <Link to="/edit-pdf" className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 transition-colors">Bearbeiten</Link>
                                <Link to="/sign" className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 transition-colors">Unterschreiben</Link>
                            </div>
                        </div>
                    </>
                )}

                {isMobileToolsSheetOpen && (
                    <>
                        <div
                            className="md:hidden fixed inset-0 top-16 bg-gray-500/55 backdrop-blur-md backdrop-grayscale backdrop-brightness-75 z-40 transition-opacity"
                            onClick={() => setIsMobileToolsSheetOpen(false)}
                        ></div>
                        <div ref={mobileToolsSheetRef} className="md:hidden fixed left-0 right-0 top-16 max-h-[calc(100vh-5rem)] bg-white border-t border-b border-gray-200 shadow-xl z-50 overflow-y-auto animate-slide-up">
                            <div className="px-4 py-4 space-y-3">
                                {TOOL_SHEET_COLUMNS.map((column) => (
                                    <div key={`mobile-sheet-${column.heading}`} className="rounded-xl border border-gray-200 p-2.5">
                                        <h3 className="text-[11px] font-bold uppercase tracking-wide text-gray-700 mb-2 px-1">
                                            {column.heading}
                                        </h3>
                                        <div className="space-y-1.5">
                                            {column.items.map((tool) => {
                                                const Icon = tool.icon;

                                                if (tool.plainText) {
                                                    return (
                                                        <div key={`mobile-sheet-${column.heading}-${tool.title}`} className="px-1 py-0.5">
                                                            <span className="font-bold text-[12px] text-gray-700 leading-tight">
                                                                {tool.title}
                                                            </span>
                                                        </div>
                                                    );
                                                }

                                                if (tool.externalHref) {
                                                    return (
                                                        <a
                                                            key={`mobile-sheet-${column.heading}-${tool.title}`}
                                                            href={tool.externalHref}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="group flex items-center gap-1.5 p-1.5 rounded-md hover:bg-gray-50 transition-colors"
                                                        >
                                                            <div className={`p-1.5 rounded-md transition-colors ${tool.tone}`}>
                                                                <Icon className="w-[18px] h-[18px]" />
                                                            </div>
                                                            <span className="font-semibold text-[12px] text-gray-900 leading-tight">
                                                                {tool.title}
                                                            </span>
                                                        </a>
                                                    );
                                                }

                                                return (
                                                    <Link
                                                        key={`mobile-sheet-${column.heading}-${tool.title}`}
                                                        to={tool.path ?? '/'}
                                                        className="group flex items-center gap-1.5 p-1.5 rounded-md hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className={`p-1.5 rounded-md transition-colors ${tool.tone}`}>
                                                            <Icon className="w-[18px] h-[18px]" />
                                                        </div>
                                                        <span className="font-semibold text-[12px] text-gray-900 leading-tight">
                                                            {tool.title}
                                                        </span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Tools Mega Menu / Sheet */}
                {isToolsOpen && (
                    <>
                        <div
                            className="fixed inset-0 top-16 bg-gray-500/55 backdrop-blur-md backdrop-grayscale backdrop-brightness-75 z-40 transition-opacity"
                            onClick={() => setIsToolsOpen(false)}
                        ></div>
                        <div
                            ref={toolsSheetRef}
                            style={{ top: `${sheetTop}px`, maxHeight: `calc(100vh - ${sheetTop + 16}px)` }}
                            className="fixed left-0 right-0 bg-white border-t border-b border-gray-200 shadow-xl z-50 overflow-y-auto animate-slide-up"
                        >
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                                    {TOOL_SHEET_COLUMNS.map((column) => (
                                        <div key={column.heading} className="rounded-lg p-2">
                                            <h3 className="text-[10px] font-bold uppercase tracking-wide text-gray-700 mb-2 px-1">
                                                {column.heading}
                                            </h3>

                                            <div className="space-y-1.5">
                                                {column.items.map((tool) => {
                                                    const Icon = tool.icon;

                                                    if (tool.plainText) {
                                                        return (
                                                            <div
                                                                key={`${column.heading}-${tool.title}`}
                                                                className="px-1 py-0.5"
                                                            >
                                                                <span className="font-bold text-[12px] text-gray-700 leading-tight">
                                                                    {tool.title}
                                                                </span>
                                                            </div>
                                                        );
                                                    }

                                                    if (tool.externalHref) {
                                                        return (
                                                            <a
                                                                key={`${column.heading}-${tool.title}`}
                                                                href={tool.externalHref}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                onClick={() => setIsToolsOpen(false)}
                                                                className="group flex items-center gap-1.5 p-1.5 rounded-md hover:bg-gray-50 transition-colors"
                                                            >
                                                                <div className={`p-1.5 rounded-md transition-colors ${tool.tone}`}>
                                                                    <Icon className="w-[18px] h-[18px]" />
                                                                </div>
                                                                <span className="font-semibold text-[12px] text-gray-900 leading-tight">
                                                                    {tool.title}
                                                                </span>
                                                            </a>
                                                        );
                                                    }

                                                    return (
                                                        <Link
                                                            key={`${column.heading}-${tool.title}`}
                                                            to={tool.path ?? '/'}
                                                            onClick={() => setIsToolsOpen(false)}
                                                            className="group flex items-center gap-1.5 p-1.5 rounded-md hover:bg-gray-50 transition-colors"
                                                        >
                                                            <div className={`p-1.5 rounded-md transition-colors ${tool.tone}`}>
                                                                <Icon className="w-[18px] h-[18px]" />
                                                            </div>
                                                            <span className="font-semibold text-[12px] text-gray-900 leading-tight">
                                                                {tool.title}
                                                            </span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </header>

            {/* Main Content */}
            <main className={`flex-1 w-full flex flex-col items-center transition-all duration-200 ${isToolsOpen || isMobileMenuOpen || isMobileToolsSheetOpen ? 'blur-[3px]' : 'blur-0'}`}>
                <Outlet />
            </main>

            {/* Footer */}
            <footer className={`bg-gray-50 border-t border-gray-200 mt-20 transition-all duration-200 ${isToolsOpen || isMobileMenuOpen || isMobileToolsSheetOpen ? 'blur-[3px]' : 'blur-0'}`}>
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
