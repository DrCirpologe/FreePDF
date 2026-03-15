import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DIST_DIR = resolve('dist');
const DIST_INDEX = resolve(DIST_DIR, 'index.html');

const INDEXABLE_PATHS = [
  '/merge',
  '/split',
  '/delete-pages',
  '/rotate',
  '/compress',
  '/extract-pages',
  '/organize-pdf',
  '/page-numbers',
  '/watermark',
  '/crop-pdf',
  '/redact-pdf',
  '/annotate-pdf',
  '/edit-pdf',
  '/pdf-form-filler',
  '/pdf-reader',
  '/share-pdf',
  '/jpg-to-pdf',
  '/pdf-to-jpg',
  '/pdf-converter',
  '/ocr',
  '/pdf-ocr',
  '/sign',
  '/remove-password',
  '/encrypt-pdf',
  '/flatten-pdf',
  '/pdf-scanner',
  '/remove-metadata',
  '/impressum',
  '/datenschutz'
];

if (!existsSync(DIST_INDEX)) {
  console.error('dist/index.html wurde nicht gefunden. Bitte zuerst "npm run build" ausführen.');
  process.exit(1);
}

const indexHtmlTemplate = readFileSync(DIST_INDEX, 'utf8');
const canonicalMatch = indexHtmlTemplate.match(/<link rel="canonical" href="([^"]+)"\s*\/>/);

if (!canonicalMatch?.[1]) {
  console.error('Canonical-Tag in dist/index.html konnte nicht erkannt werden.');
  process.exit(1);
}

const siteUrl = canonicalMatch[1].replace(/\/$/, '');

const withRouteCanonical = (html, routePath) => {
  const canonicalUrl = `${siteUrl}${routePath}`;

  return html
    .replace(/<link rel="canonical" href="[^"]+"\s*\/>/, `<link rel="canonical" href="${canonicalUrl}" />`)
    .replace(/<meta property="og:url" content="[^"]+"\s*\/>/, `<meta property="og:url" content="${canonicalUrl}" />`);
};

for (const routePath of INDEXABLE_PATHS) {
  const routeDir = resolve(DIST_DIR, routePath.replace(/^\//, ''));
  mkdirSync(routeDir, { recursive: true });

  const routeHtml = withRouteCanonical(indexHtmlTemplate, routePath);
  writeFileSync(resolve(routeDir, 'index.html'), routeHtml, 'utf8');
}

writeFileSync(resolve(DIST_DIR, '404.html'), indexHtmlTemplate, 'utf8');

console.log(`Statische Route-Seiten erzeugt: ${INDEXABLE_PATHS.length}`);
