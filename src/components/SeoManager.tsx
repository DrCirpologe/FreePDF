import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'FreePDF';
const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://freepdf.tools').replace(/\/$/, '');
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
        title: 'PDF Tools kostenlos online bearbeiten | FreePDF',
        description: 'PDF zusammenfügen, teilen, komprimieren, drehen, signieren und konvertieren – kostenlos, direkt im Browser und ohne Upload auf fremde Server.'
    },
    '/startseite': {
        title: 'PDF Tools kostenlos online bearbeiten | FreePDF',
        description: 'Alle wichtigen PDF-Werkzeuge in einer Oberfläche: schnell, kostenlos und datenschutzfreundlich.',
        canonicalPath: '/',
        noindex: true
    },
    '/merge': { title: 'PDF zusammenfügen online kostenlos | FreePDF', description: 'Mehrere PDFs in der gewünschten Reihenfolge zu einer Datei zusammenfügen – schnell und kostenlos im Browser.' },
    '/split': { title: 'PDF teilen online kostenlos | FreePDF', description: 'PDF-Dateien in einzelne Seiten oder Bereiche aufteilen und gezielt exportieren.' },
    '/delete-pages': { title: 'PDF Seiten löschen online | FreePDF', description: 'Einzelne Seiten aus PDF-Dateien entfernen und die Datei direkt neu speichern.' },
    '/rotate': { title: 'PDF drehen online kostenlos | FreePDF', description: 'PDF-Seiten um 90°, 180° oder 270° drehen und korrekt ausrichten.' },
    '/compress': { title: 'PDF komprimieren online kostenlos | FreePDF', description: 'PDF-Dateigröße reduzieren für E-Mail, Upload und schnellere Ladezeiten.' },
    '/extract-pages': { title: 'PDF Seiten extrahieren online | FreePDF', description: 'Gewünschte PDF-Seiten auswählen und als neue Datei exportieren.' },
    '/organize-pdf': { title: 'PDF organisieren online | FreePDF', description: 'PDF-Seiten sortieren, umstellen, entfernen und effizient neu strukturieren.' },
    '/page-numbers': { title: 'Seitenzahlen in PDF einfügen | FreePDF', description: 'Seitennummern in PDF-Dateien einfügen und Position frei wählen.' },
    '/watermark': { title: 'Wasserzeichen in PDF einfügen | FreePDF', description: 'Text- oder Bild-Wasserzeichen in PDF-Dokumente einfügen.' },
    '/crop-pdf': { title: 'PDF zuschneiden online | FreePDF', description: 'Ränder und Ausschnitt von PDF-Seiten präzise anpassen.' },
    '/redact-pdf': { title: 'PDF schwärzen online | FreePDF', description: 'Sensible Inhalte dauerhaft aus PDF-Dateien entfernen.' },
    '/annotate-pdf': { title: 'PDF kommentieren online | FreePDF', description: 'PDFs markieren, kommentieren und mit Notizen versehen.' },
    '/edit-pdf': { title: 'PDF bearbeiten online | FreePDF', description: 'PDF-Dokumente direkt im Browser bearbeiten und anpassen.' },
    '/pdf-form-filler': { title: 'PDF Formular ausfüllen online | FreePDF', description: 'PDF-Formulare digital ausfüllen und sofort speichern.' },
    '/pdf-reader': { title: 'PDF Reader online | FreePDF', description: 'PDFs online öffnen, lesen und schnell prüfen.' },
    '/share-pdf': { title: 'PDF teilen online | FreePDF', description: 'PDF-Dateien unkompliziert bereitstellen und weitergeben.' },
    '/jpg-to-pdf': { title: 'JPG in PDF umwandeln online | FreePDF', description: 'JPG, PNG und weitere Bilder in PDF-Dateien umwandeln.' },
    '/img-to-pdf': {
        title: 'JPG in PDF umwandeln online | FreePDF',
        description: 'Bilder in PDF umwandeln – schnell und kostenlos.',
        canonicalPath: '/jpg-to-pdf',
        noindex: true
    },
    '/pdf-to-jpg': { title: 'PDF in JPG umwandeln online | FreePDF', description: 'PDF-Seiten als JPG-Bilder exportieren – einzeln oder gesammelt.' },
    '/pdf-to-img': {
        title: 'PDF in JPG umwandeln online | FreePDF',
        description: 'PDF in Bilddateien umwandeln – direkt im Browser.',
        canonicalPath: '/pdf-to-jpg',
        noindex: true
    },
    '/pdf-converter': { title: 'PDF Konverter online kostenlos | FreePDF', description: 'Dateien in PDF und aus PDF konvertieren – einfach und schnell.' },
    '/ocr': { title: 'OCR für PDF online | FreePDF', description: 'Texterkennung für gescannte Dokumente und Bilder im Browser.' },
    '/pdf-ocr': { title: 'PDF OCR online kostenlos | FreePDF', description: 'Gescannte PDFs mit OCR durchsuchbar machen.' },
    '/sign': { title: 'PDF unterschreiben online | FreePDF', description: 'Digitale Unterschrift in PDF-Dateien einfügen und Dokumente signieren.' },
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
