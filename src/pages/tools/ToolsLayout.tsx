import { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { type ComponentType } from 'react';
import { PenTool, Stamp, Hash, Crop, FileImage, ScanText, Scissors, RotateCw, FileText, ShieldAlert, FileSignature } from 'lucide-react';

type ToolLinkItem = {
    path: string;
    title: string;
    icon: ComponentType<{ className?: string }>;
    tone: string;
};

const TOOL_ITEMS: ToolLinkItem[] = [
    { path: '/annotate-pdf', title: 'PDF kommentieren', icon: PenTool, tone: 'bg-cyan-100 text-cyan-700 group-hover:bg-cyan-700 group-hover:text-white' },
    { path: '/watermark', title: 'Wasserzeichen-PDF', icon: Stamp, tone: 'bg-cyan-100 text-cyan-700 group-hover:bg-cyan-700 group-hover:text-white' },
    { path: '/page-numbers', title: 'Seitenzahlen einfügen', icon: Hash, tone: 'bg-cyan-100 text-cyan-700 group-hover:bg-cyan-700 group-hover:text-white' },
    { path: '/crop-pdf', title: 'PDF zuschneiden', icon: Crop, tone: 'bg-cyan-100 text-cyan-700 group-hover:bg-cyan-700 group-hover:text-white' },
    { path: '/redact-pdf', title: 'PDF schwärzen', icon: ShieldAlert, tone: 'bg-cyan-100 text-cyan-700 group-hover:bg-cyan-700 group-hover:text-white' },
    { path: '/sign', title: 'Unterschreibe PDF', icon: FileSignature, tone: 'bg-pink-100 text-pink-700 group-hover:bg-pink-600 group-hover:text-white' },
    { path: '/split', title: 'PDF aufteilen', icon: Scissors, tone: 'bg-violet-100 text-violet-700 group-hover:bg-violet-700 group-hover:text-white' },
    { path: '/rotate', title: 'PDF drehen', icon: RotateCw, tone: 'bg-violet-100 text-violet-700 group-hover:bg-violet-700 group-hover:text-white' },
    { path: '/extract-pages', title: 'PDF-Seiten extrahieren', icon: Scissors, tone: 'bg-violet-100 text-violet-700 group-hover:bg-violet-700 group-hover:text-white' },
    { path: '/organize-pdf', title: 'PDF organisieren', icon: FileText, tone: 'bg-violet-100 text-violet-700 group-hover:bg-violet-700 group-hover:text-white' },
    { path: '/flatten-pdf', title: 'Ebenen reduzieren', icon: FileText, tone: 'bg-rose-100 text-rose-600 group-hover:bg-rose-500 group-hover:text-white' },
    { path: '/remove-metadata', title: 'Metadaten entfernen', icon: ShieldAlert, tone: 'bg-rose-100 text-rose-600 group-hover:bg-rose-500 group-hover:text-white' },
    { path: '/pdf-to-jpg', title: 'PDF in JPG', icon: FileImage, tone: 'bg-yellow-100 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white' },
    { path: '/pdf-ocr', title: 'PDF OCR', icon: ScanText, tone: 'bg-red-100 text-red-700 group-hover:bg-red-600 group-hover:text-white' }
];

const RELATED_GROUPS: Record<string, string[]> = {
    organize: ['/split', '/rotate', '/extract-pages', '/organize-pdf', '/crop-pdf', '/page-numbers', '/watermark', '/redact-pdf', '/sign'],
    convert: ['/pdf-to-jpg', '/pdf-ocr', '/annotate-pdf', '/watermark', '/page-numbers', '/crop-pdf'],
    edit: ['/annotate-pdf', '/watermark', '/page-numbers', '/crop-pdf', '/redact-pdf', '/sign', '/split', '/rotate', '/pdf-to-jpg'],
    security: ['/redact-pdf', '/sign', '/flatten-pdf', '/remove-metadata', '/watermark', '/page-numbers'],
    optimize: ['/crop-pdf', '/page-numbers', '/watermark', '/annotate-pdf', '/split', '/rotate']
};

const ROUTE_TO_GROUP: Record<string, keyof typeof RELATED_GROUPS> = {
    merge: 'organize',
    split: 'organize',
    'delete-pages': 'organize',
    rotate: 'organize',
    'extract-pages': 'organize',
    'organize-pdf': 'organize',
    'crop-pdf': 'organize',
    'page-numbers': 'organize',
    'pdf-converter': 'convert',
    'jpg-to-pdf': 'convert',
    'img-to-pdf': 'convert',
    'pdf-to-jpg': 'convert',
    'pdf-to-img': 'convert',
    ocr: 'convert',
    'pdf-ocr': 'convert',
    'pdf-scanner': 'convert',
    'edit-pdf': 'edit',
    'annotate-pdf': 'edit',
    'pdf-reader': 'edit',
    'pdf-form-filler': 'edit',
    'share-pdf': 'edit',
    watermark: 'edit',
    sign: 'edit',
    'redact-pdf': 'security',
    'remove-password': 'security',
    'encrypt-pdf': 'security',
    'flatten-pdf': 'security',
    'remove-metadata': 'security',
    compress: 'optimize'
};

const ALIAS_TO_MAIN_ROUTE: Record<string, string> = {
    'img-to-pdf': 'jpg-to-pdf',
    'pdf-to-img': 'pdf-to-jpg'
};

export default function ToolsLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const outletRef = useRef<HTMLDivElement | null>(null);
    const [showAll, setShowAll] = useState(false);
    const [processedOutput, setProcessedOutput] = useState<{ href: string; filename: string } | null>(null);

    const currentSlug = useMemo(() => {
        const slug = location.pathname.split('/').filter(Boolean).at(-1) ?? '';
        return ALIAS_TO_MAIN_ROUTE[slug] ?? slug;
    }, [location.pathname]);

    useEffect(() => {
        setShowAll(false);
        setProcessedOutput(null);
    }, [currentSlug]);

    useEffect(() => {
        const root = outletRef.current;
        if (!root) return;

        const updateProcessedOutput = () => {
            const links = Array.from(root.querySelectorAll('a[download]')) as HTMLAnchorElement[];
            const blobPdfDownload = links.find((link) => {
                const href = link.getAttribute('href') ?? '';
                const downloadName = (link.getAttribute('download') ?? '').toLowerCase();
                return href.startsWith('blob:') && downloadName.endsWith('.pdf');
            });

            const blobAnyDownload = links.find((link) => {
                const href = link.getAttribute('href') ?? '';
                return href.startsWith('blob:');
            });

            const selectedDownload = blobPdfDownload ?? blobAnyDownload;

            const hasRestartButton = Array.from(root.querySelectorAll('button')).some((button) => {
                const label = (button.textContent ?? '').toLowerCase();
                return label.includes('neu starten');
            });

            const hasDoneState = root.textContent?.toLowerCase().includes('fertig') ?? false;

            if (!selectedDownload || (!hasRestartButton && !hasDoneState)) {
                setProcessedOutput(null);
                return;
            }

            const href = selectedDownload.getAttribute('href') ?? '';
            const filename = selectedDownload.getAttribute('download') ?? 'bearbeitet.pdf';
            setProcessedOutput((prev) => {
                if (prev?.href === href && prev.filename === filename) return prev;
                return { href, filename };
            });
        };

        updateProcessedOutput();

        const observer = new MutationObserver(updateProcessedOutput);
        observer.observe(root, { childList: true, subtree: true, attributes: true });

        return () => observer.disconnect();
    }, [location.pathname]);

    const relatedTools = useMemo(() => {
        const groupKey = ROUTE_TO_GROUP[currentSlug] ?? 'edit';
        const currentPath = `/${currentSlug}`;
        const pathSet = new Set(RELATED_GROUPS[groupKey]);

        return TOOL_ITEMS.filter((item) => pathSet.has(item.path) && item.path !== currentPath);
    }, [currentSlug]);

    const initialTools = relatedTools.slice(0, 3);
    const hiddenCount = Math.max(0, relatedTools.length - 3);
    const visibleTools = showAll ? relatedTools : initialTools;

    const navigateWithProcessedFile = async (path: string) => {
        if (!processedOutput) {
            navigate(path);
            return;
        }

        try {
            const response = await fetch(processedOutput.href);
            const blob = await response.blob();
            const fileType = blob.type || 'application/pdf';
            const fileName = processedOutput.filename || 'bearbeitet.pdf';
            const carryFile = new File([blob], fileName, { type: fileType });
            navigate(path, { state: { prefillFile: carryFile } });
        } catch {
            navigate(path);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-12 md:py-20 animate-fade-in flex flex-col items-center">
            <div ref={outletRef} className="w-full tools-outlet-wrap">
                <Outlet />
            </div>

            {processedOutput && (
                <section className="w-full mt-10 rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Passende Tools</h3>
                    <p className="text-gray-600 mb-5">Diese Tools passen zu deinem bearbeiteten Dokument.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {visibleTools.map((tool) => (
                            <button
                                key={tool.path}
                                type="button"
                                onClick={() => navigateWithProcessedFile(tool.path)}
                                className="group flex items-center gap-2 p-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                            >
                                <div className={`p-2 rounded-lg transition-colors ${tool.tone}`}>
                                    <tool.icon className="w-[27px] h-[27px]" />
                                </div>
                                <span className="font-semibold text-[18px] text-gray-900 leading-tight">
                                    {tool.title}
                                </span>
                            </button>
                        ))}
                    </div>

                    {hiddenCount > 0 && (
                        <div className="mt-5">
                            <button
                                type="button"
                                onClick={() => setShowAll((prev) => !prev)}
                                className="w-full sm:w-auto rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                            >
                                {showAll ? 'Weniger anzeigen' : `Mehr anzeigen (${hiddenCount})`}
                            </button>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
