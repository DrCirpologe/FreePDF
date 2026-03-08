# FreePDF

Kostenlose Online-Tools zum Bearbeiten von PDF-Dateien (React + TypeScript + Vite).

## Entwicklung

1. Abhängigkeiten installieren: `npm install`
2. Lokale Entwicklungsumgebung starten: `npm run dev`
3. Produktions-Build erzeugen: `npm run build`

## SEO-Konfiguration

- Primäre Domain wird über `VITE_SITE_URL` gesetzt.
- Der Deploy-Pfad wird über `VITE_BASE_PATH` gesetzt (z. B. `/FreePDF/` für GitHub Pages-Projektseiten).
- Lege lokal eine `.env` oder für Deployment eine `.env.production` an (siehe `.env.example`).
- Beispiel: `VITE_SITE_URL=https://deine-domain.de`

Beim Build werden `public/robots.txt` und `public/sitemap.xml` automatisch mit der gesetzten Domain erstellt.

## Search Console Go-Live Checkliste

1. Domain mit HTTPS live schalten und Weiterleitungen auf genau eine kanonische Variante setzen (`https://deine-domain.de`).
2. `VITE_SITE_URL` auf die Live-Domain setzen.
3. Build ausführen (`npm run build`) und deployen.
4. Prüfen, dass folgende URLs öffentlich erreichbar sind:
   - `/robots.txt`
   - `/sitemap.xml`
5. Property in Google Search Console hinzufügen (Domain-Property oder URL-Präfix).
6. Sitemap in Search Console einreichen: `https://deine-domain.de/sitemap.xml`.
7. Indexierung für Startseite und 2-3 wichtige Tool-Seiten über URL-Prüfung anstoßen.
8. Core Web Vitals in Search Console beobachten und problematische URLs priorisieren.
9. Nach Deployment 1x Social Preview testen (OpenGraph/Twitter), damit Titel/Bild korrekt gezogen werden.

## Wichtige SEO-Dateien

- `src/components/SeoManager.tsx` – route-basierte Meta-Tags, Canonical, JSON-LD
- `scripts/generate-seo.mjs` – Build-Generator für `robots.txt` und `sitemap.xml`
- `.env.example` – Beispiel für `VITE_SITE_URL`
