# Edgecase-Testmatrix (Logik-Tools)

## Ziel
Diese Matrix deckt die aktuell implementierten Logik-Tools ab und fokussiert auf reale Problemfälle: große Dateien, ungültige Eingaben, Sonderfälle pro Tool.

## Allgemeine Testdaten
- Gültige PDF klein: 2-5 Seiten
- Gültige PDF groß: 100+ Seiten
- Sehr große PDF: > 30 MB
- Beschädigte PDF
- Passwortgeschützte PDF
- Leere/abgebrochene Datei
- Bilder: JPG + PNG gemischt (klein + groß)

## Globaler Smoke-Check (für jedes Tool)
1. Seite lädt ohne Fehler.
2. Datei-Upload funktioniert.
3. Ungültige Datei zeigt verständliche Fehlermeldung.
4. Verarbeitung startet und endet ohne UI-Blocker.
5. Download erzeugt öffnende Datei.

---

## 1) Merge PDF (/merge)
- Fall A: 2 gültige PDFs -> Ergebnis-Seitenzahl = Summe beider Dateien.
- Fall B: Nur 1 Datei -> klare Validierung (mindestens 2).
- Fall C: 1 gültige + 1 beschädigte PDF -> Abbruch mit Fehlermeldung.

Erwartung:
- Reihenfolge bleibt wie in Liste.
- Ergebnis öffnet ohne Fehler.

## 2) Split PDF (/split)
- Fall A: 1 PDF mit N Seiten -> ZIP enthält N PDFs.
- Fall B: 1-seitige PDF -> ZIP enthält genau 1 Datei.
- Fall C: beschädigte/verschlüsselte PDF -> Fehler statt kaputtem ZIP.

Erwartung:
- Jede Ausgabe-PDF hat genau 1 Seite.

## 3) Delete Pages (/delete-pages)
- Fall A: einzelne Seite löschen.
- Fall B: mehrere Seiten löschen (inkl. erste/letzte).
- Fall C: alle Seiten markieren -> blockieren mit Hinweis.

Erwartung:
- Ergebnis-Seitenzahl = Original minus Auswahl.
- Nicht gelöschte Seiten bleiben in korrekter Reihenfolge.

## 4) Rotate PDF (/rotate)
- Fall A: einzelne Seiten links/rechts drehen.
- Fall B: Alle Seiten drehen.
- Fall C: mehrfaches Drehen (0/90/180/270).

Erwartung:
- Rotation pro Seite korrekt im Output übernommen.

## 5) Compress PDF (/compress)
- Fall A: normale PDF -> Ausgabe erzeugt.
- Fall B: sehr große PDF -> keine Hänger/Crash.
- Fall C: bereits optimierte PDF -> Größe kann ähnlich bleiben.

Erwartung:
- Immer gültige PDF; Größe darf gleich bleiben, sollte nicht fehlschlagen.

## 6) Extract Pages (/extract-pages)
- Fall A: Eingabe "1,3,5".
- Fall B: Bereich "2-6" und rückwärts "6-2".
- Fall C: ungültig (z. B. 0, 999, Text) -> klare Fehlermeldung.

Erwartung:
- Ergebnis enthält exakt ausgewählte Seiten in angegebener Reihenfolge.

## 7) Organize PDF (/organize-pdf)
- Fall A: Seiten verschieben.
- Fall B: Seiten löschen.
- Fall C: Seiten drehen + verschieben kombiniert.

Erwartung:
- Enddatei entspricht genau der sichtbaren Reihenfolge/Rotation in UI.

## 8) Page Numbers (/page-numbers)
- Fall A: Positionen testen (oben/unten, links/mitte/rechts).
- Fall B: Startnummer != 1 (z. B. 10).
- Fall C: verschiedene Schriftgrößen.

Erwartung:
- Nummern auf allen Seiten sichtbar und konsistent positioniert.

## 9) Watermark (/watermark)
- Fall A: kurzer Text.
- Fall B: langer Text + große Schrift.
- Fall C: Opacity-Min/Max.

Erwartung:
- Wasserzeichen auf allen Seiten vorhanden, keine kaputte Ausgabe.

## 10) JPG to PDF (/jpg-to-pdf)
- Fall A: mehrere JPG.
- Fall B: JPG + PNG gemischt.
- Fall C: sehr große Bilder.

Erwartung:
- Jede Bilddatei wird eine PDF-Seite.
- Reihenfolge entspricht Upload-Reihenfolge.

## 11) Remove Metadata (/remove-metadata)
- Fall A: PDF mit gesetzten Metadaten.
- Fall B: PDF ohne Metadaten.

Erwartung:
- Tool läuft in beiden Fällen, Ausgabe bleibt öffnbar.

## 12) Flatten PDF (/flatten-pdf)
- Fall A: PDF mit Formularfeldern.
- Fall B: PDF ohne Formulare.

Erwartung:
- Mit Formularen: Felder sind im Ergebnis nicht mehr editierbar.
- Ohne Formulare: kein Fehler, gültige Ausgabe.

## 13) Crop PDF (/crop-pdf)
- Fall A: kleine Crop-Werte.
- Fall B: große Crop-Werte knapp vor Grenzwert.
- Fall C: zu große Werte -> blockieren/Fehler.

Erwartung:
- Seiten sichtbar beschnitten, Datei weiterhin gültig.

---

## Abnahme-Kriterium (Go)
- Kein Tool produziert Laufzeitfehler bei gültigen Inputs.
- Ungültige Inputs liefern verständliche Fehlermeldungen.
- Jede erzeugte Datei ist herunterladbar und in Standard-PDF-Viewer öffnbar.
- Bei 100+ Seiten bleibt die App benutzbar (kein harter Freeze/Crash).
