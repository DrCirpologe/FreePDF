import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'FreePDF';
const runtimeBasePath = import.meta.env.BASE_URL === '/'
    ? ''
    : import.meta.env.BASE_URL.replace(/\/$/, '');
const runtimeFallbackSiteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${runtimeBasePath}`
    : 'https://freepdf.tools';
const SITE_URL = (import.meta.env.VITE_SITE_URL || runtimeFallbackSiteUrl).replace(/\/$/, '');
const DEFAULT_IMAGE = '/logo.png';
const DEFAULT_DESCRIPTION = 'Kostenlose Online-Tools zum Bearbeiten von PDFs – schnell, sicher und ohne Installation.';

type SeoConfig = {
    title: string;
    description: string;
    canonicalPath?: string;
    noindex?: boolean;
};

const PAGE_SEO: Record<string, SeoConfig> = {
    '/': {
        title: 'PDF bearbeiten online kostenlos – 30 PDF Tools | FreePDF',
        description: 'PDF bearbeiten, zusammenfügen, teilen, komprimieren, drehen und signieren – kostenlose PDF Tools online, schnell und sicher im Browser.'
    },
    '/startseite': {
        title: 'PDF Tools kostenlos online bearbeiten | FreePDF',
        description: 'Alle wichtigen PDF-Werkzeuge in einer Oberfläche: schnell, kostenlos und datenschutzfreundlich.',
        canonicalPath: '/',
        noindex: true
    },
    '/index': {
        title: 'Alle PDF Tools im Überblick | FreePDF',
        description: 'Alle PDF-Tools auf einer Seite: PDF zusammenfügen, teilen, komprimieren, bearbeiten, unterschreiben und mehr.',
        noindex: true
    },
    '/merge': { title: 'PDF zusammenfügen kostenlos online | FreePDF', description: 'Mehrere PDF-Dateien kostenlos online zusammenfügen und in der richtigen Reihenfolge als eine PDF speichern.' },
    '/split': { title: 'PDF teilen kostenlos online | FreePDF', description: 'PDF online teilen, Seiten einzeln extrahieren und als neue Datei herunterladen – schnell und kostenlos.' },
    '/delete-pages': { title: 'PDF Seiten löschen kostenlos online | FreePDF', description: 'Seiten aus PDF löschen und die bereinigte Datei direkt speichern – ohne Installation und kostenlos.' },
    '/rotate': { title: 'PDF drehen kostenlos online | FreePDF', description: 'PDF Seiten online drehen (90°, 180°, 270°) und korrekt ausgerichtet herunterladen.' },
    '/compress': { title: 'PDF komprimieren kostenlos online | FreePDF', description: 'PDF-Datei verkleinern und Dateigröße reduzieren – kostenloses PDF Komprimieren im Browser.' },
    '/extract-pages': { title: 'PDF Seiten extrahieren online | FreePDF', description: 'Gewünschte PDF-Seiten auswählen und als neue Datei exportieren.' },
    '/organize-pdf': { title: 'PDF organisieren online | FreePDF', description: 'PDF-Seiten sortieren, umstellen, entfernen und effizient neu strukturieren.' },
    '/page-numbers': { title: 'Seitenzahlen in PDF einfügen | FreePDF', description: 'Seitennummern in PDF-Dateien einfügen und Position frei wählen.' },
    '/watermark': { title: 'Wasserzeichen in PDF einfügen | FreePDF', description: 'Text- oder Bild-Wasserzeichen in PDF-Dokumente einfügen.' },
    '/crop-pdf': { title: 'PDF zuschneiden online | FreePDF', description: 'Ränder und Ausschnitt von PDF-Seiten präzise anpassen.' },
    '/redact-pdf': { title: 'PDF schwärzen online | FreePDF', description: 'Sensible Inhalte dauerhaft aus PDF-Dateien entfernen.' },
    '/annotate-pdf': { title: 'PDF kommentieren online | FreePDF', description: 'PDFs markieren, kommentieren und mit Notizen versehen.' },
    '/edit-pdf': { title: 'PDF bearbeiten kostenlos online | FreePDF', description: 'PDF online bearbeiten: Inhalte anpassen, kommentieren und Dokumente direkt im Browser speichern.' },
    '/pdf-form-filler': { title: 'PDF Formular ausfüllen online | FreePDF', description: 'PDF-Formulare digital ausfüllen und sofort speichern.' },
    '/pdf-reader': { title: 'PDF Reader online | FreePDF', description: 'PDFs online öffnen, lesen und schnell prüfen.' },
    '/share-pdf': { title: 'PDF teilen online | FreePDF', description: 'PDF-Dateien unkompliziert bereitstellen und weitergeben.' },
    '/jpg-to-pdf': { title: 'JPG in PDF umwandeln kostenlos | FreePDF', description: 'JPG zu PDF online konvertieren – auch PNG und weitere Bildformate schnell und kostenlos umwandeln.' },
    '/img-to-pdf': {
        title: 'JPG in PDF umwandeln online | FreePDF',
        description: 'Bilder in PDF umwandeln – schnell und kostenlos.',
        canonicalPath: '/jpg-to-pdf',
        noindex: true
    },
    '/pdf-to-jpg': { title: 'PDF in JPG umwandeln kostenlos | FreePDF', description: 'PDF zu JPG online umwandeln und einzelne Seiten als Bilder exportieren – kostenlos und ohne Anmeldung.' },
    '/pdf-to-img': {
        title: 'PDF in JPG umwandeln online | FreePDF',
        description: 'PDF in Bilddateien umwandeln – direkt im Browser.',
        canonicalPath: '/pdf-to-jpg',
        noindex: true
    },
    '/pdf-converter': { title: 'PDF Konverter kostenlos online | FreePDF', description: 'Kostenloser PDF Konverter: Dateien in PDF umwandeln und PDFs in Bildformate zurück konvertieren.' },
    '/ocr': { title: 'OCR für PDF online | FreePDF', description: 'Texterkennung für gescannte Dokumente und Bilder im Browser.' },
    '/pdf-ocr': { title: 'PDF OCR online kostenlos | FreePDF', description: 'Gescannte PDFs mit OCR durchsuchbar machen.' },
    '/sign': { title: 'PDF unterschreiben online kostenlos | FreePDF', description: 'PDF digital unterschreiben und Signatur einfügen – kostenloses Online-Tool für schnelle Unterschriften.' },
    '/remove-password': { title: 'PDF Passwort entfernen online | FreePDF', description: 'Passwortschutz aus PDF-Dateien entfernen, sofern Zugriff erlaubt ist.' },
    '/encrypt-pdf': { title: 'PDF verschlüsseln online | FreePDF', description: 'PDF-Dateien mit Passwort schützen und verschlüsseln.' },
    '/flatten-pdf': { title: 'PDF reduzieren (flatten) online | FreePDF', description: 'PDF-Inhalte fixieren, um unbeabsichtigte Änderungen zu reduzieren.' },
    '/pdf-scanner': { title: 'PDF Scanner online | FreePDF', description: 'Dokumente scannen und als PDF weiterverarbeiten.' },
    '/remove-metadata': { title: 'PDF Metadaten entfernen | FreePDF', description: 'Dateimetadaten aus PDF-Dokumenten löschen für mehr Datenschutz.' },
    '/impressum': { title: 'Impressum | FreePDF', description: 'Rechtliche Angaben und Kontaktinformationen von FreePDF.' },
    '/datenschutz': { title: 'Datenschutz | FreePDF', description: 'Datenschutzhinweise zur Nutzung von FreePDF und den angebotenen PDF-Tools.' }
};

const setMetaByName = (name: string, content: string) => {
    let element = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
    }
    element.setAttribute('content', content);
};

const setMetaByProperty = (property: string, content: string) => {
    let element = document.head.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
    }
    element.setAttribute('content', content);
};

const setCanonical = (href: string) => {
    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', href);
};

const setJsonLd = (jsonLdObjects: unknown[]) => {
    let script = document.getElementById('seo-jsonld') as HTMLScriptElement | null;
    if (!script) {
        script = document.createElement('script');
        script.id = 'seo-jsonld';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLdObjects);
};

const normalizePath = (path: string) => {
    if (!path || path === '/') return '/';
    return path.endsWith('/') ? path.slice(0, -1) : path;
};

export default function SeoManager() {
    const location = useLocation();

    const normalizedPath = useMemo(() => normalizePath(location.pathname), [location.pathname]);
    const seo = PAGE_SEO[normalizedPath] ?? {
        title: `${SITE_NAME} | PDF online bearbeiten`,
        description: DEFAULT_DESCRIPTION
    };

    useEffect(() => {
        const canonicalPath = seo.canonicalPath ?? normalizedPath;
        const canonicalUrl = `${SITE_URL}${canonicalPath}`;
        const pageTitle = seo.title;
        const description = seo.description;
        const robots = seo.noindex
            ? 'noindex, follow, max-image-preview:large'
            : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

        document.documentElement.lang = 'de';
        document.title = pageTitle;

        setMetaByName('description', description);
        setMetaByName('robots', robots);
        setMetaByName('twitter:card', 'summary_large_image');
        setMetaByName('twitter:title', pageTitle);
        setMetaByName('twitter:description', description);
        setMetaByName('twitter:image', `${SITE_URL}${DEFAULT_IMAGE}`);

        setMetaByProperty('og:type', 'website');
        setMetaByProperty('og:site_name', SITE_NAME);
        setMetaByProperty('og:title', pageTitle);
        setMetaByProperty('og:description', description);
        setMetaByProperty('og:url', canonicalUrl);
        setMetaByProperty('og:image', `${SITE_URL}${DEFAULT_IMAGE}`);

        setCanonical(canonicalUrl);

        const jsonLdObjects = [
            {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: SITE_NAME,
                url: SITE_URL,
                inLanguage: 'de-DE'
            },
            {
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                name: pageTitle,
                description,
                url: canonicalUrl,
                inLanguage: 'de-DE',
                isPartOf: {
                    '@type': 'WebSite',
                    name: SITE_NAME,
                    url: SITE_URL
                }
            }
        ];

        setJsonLd(jsonLdObjects);
    }, [normalizedPath, seo]);

    return null;
}
