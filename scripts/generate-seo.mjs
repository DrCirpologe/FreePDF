import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SITE_URL = (process.env.VITE_SITE_URL || 'https://freepdf.tools').replace(/\/$/, '');

const INDEXABLE_PATHS = [
  '/',
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

const robotsContent = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;

const sitemapUrls = INDEXABLE_PATHS.map((path) => {
  const loc = `${SITE_URL}${path}`;
  const changefreq = path === '/' || path === '/merge' || path === '/split' || path === '/compress' ? 'weekly' : 'monthly';
  const priority = path === '/' ? '1.0' : path === '/impressum' || path === '/datenschutz' ? '0.3' : '0.8';

  return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}).join('\n');

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>\n`;

writeFileSync(resolve('public/robots.txt'), robotsContent, 'utf8');
writeFileSync(resolve('public/sitemap.xml'), sitemapContent, 'utf8');

console.log(`SEO files generated for ${SITE_URL}`);
