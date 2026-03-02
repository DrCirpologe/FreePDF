import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CookieBanner from './components/CookieBanner';
import Home from './pages/Home';
import Startseite from './pages/Startseite';
import ToolsLayout from './pages/tools/ToolsLayout';
import MergePdf from './pages/tools/MergePdf';
import SplitPdf from './pages/tools/SplitPdf';
import DeletePages from './pages/tools/DeletePages';
import RotatePdf from './pages/tools/RotatePdf';
import ToolPlaceholder from './pages/tools/ToolPlaceholder';
import Impressum from './pages/Impressum';
import Datenschutz from './pages/Datenschutz';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="startseite" element={<Startseite />} />

          {/* Tool Routes wrapped in a standard layout */}
          <Route element={<ToolsLayout />}>
            <Route path="merge" element={<MergePdf />} />
            <Route path="split" element={<SplitPdf />} />
            <Route path="delete-pages" element={<DeletePages />} />
            <Route path="rotate" element={<RotatePdf />} />

            {/* Placeholder Views (UI first, logic later) */}
            <Route
              path="compress"
              element={<ToolPlaceholder title="PDF verkleinern" description="Die Größe Ihres PDFs ohne Qualitätsverlust reduzieren." />}
            />
            <Route
              path="ppt-to-pdf"
              element={<ToolPlaceholder title="PPT in PDF" description="PowerPoint-Präsentationen in PDF-Dokumente konvertieren." />}
            />
            <Route
              path="pdf-to-jpg"
              element={<ToolPlaceholder title="PDF in JPG" description="Bilder aus Ihrem PDF extrahieren oder jede Seite als separates Bild speichern." />}
            />
            <Route
              path="pdf-to-img"
              element={<ToolPlaceholder title="PDF in JPG" description="Bilder aus Ihrem PDF extrahieren oder jede Seite als separates Bild speichern." />}
            />
            <Route
              path="word-to-pdf"
              element={<ToolPlaceholder title="Word in PDF" description="Word-Dokumente in PDF-Dateien konvertieren." />}
            />
            <Route
              path="annotate-pdf"
              element={<ToolPlaceholder title="PDF kommentieren" description="Schreibe, zeichne und markiere in deiner PDF-Datei." />}
            />
            <Route
              path="pdf-converter"
              element={<ToolPlaceholder title="PDF-Konverter" description="Word-, PowerPoint- und Excel-Dateien in ein PDF konvertieren und aus einem PDF wieder zurück verwandeln." />}
            />
            <Route
              path="pdf-to-ppt"
              element={<ToolPlaceholder title="PDF in PPT" description="PDFs in bearbeitbare PowerPoint-Präsentationen konvertieren." />}
            />
            <Route
              path="ocr"
              element={<ToolPlaceholder title="OCR" description="Ermögliche das Durchsuchen von gescannten Texten." />}
            />
            <Route
              path="pdf-ocr"
              element={<ToolPlaceholder title="PDF OCR" description="Ermögliche das Durchsuchen von gescannten Texten." />}
            />
            <Route
              path="excel-to-pdf"
              element={<ToolPlaceholder title="Excel in PDF" description="Excel-Tabellen in PDF-Dokumente konvertieren." />}
            />
            <Route
              path="pdf-to-word"
              element={<ToolPlaceholder title="PDF in Word" description="PDFs in bearbeitbare Word-Dokumente konvertieren." />}
            />
            <Route
              path="pdf-form-filler"
              element={<ToolPlaceholder title="PDF-Formularausfüller" description="PDF-Formulare online ausfüllen." />}
            />
            <Route
              path="jpg-to-pdf"
              element={<ToolPlaceholder title="JPG in PDF" description="Bilder in den Formaten JPG, PNG, BMP, GIF und TIFF in ein PDF umwandeln." />}
            />
            <Route
              path="img-to-pdf"
              element={<ToolPlaceholder title="JPG in PDF" description="Bilder in den Formaten JPG, PNG, BMP, GIF und TIFF in ein PDF umwandeln." />}
            />
            <Route
              path="pdf-to-excel"
              element={<ToolPlaceholder title="PDF in Excel" description="PDFs in bearbeitbare Excel-Tabellen konvertieren." />}
            />
            <Route
              path="edit-pdf"
              element={<ToolPlaceholder title="PDF bearbeiten" description="Text, Formen, Bilder und freihändige Kommentare in Ihrem PDF hinzufügen." />}
            />
            <Route
              path="pdf-reader"
              element={<ToolPlaceholder title="PDF-Reader" description="PDFs online anzeigen, drucken und teilen." />}
            />
            <Route
              path="share-pdf"
              element={<ToolPlaceholder title="PDF freigeben" description="Teile deine PDFs schnell und einfach online." />}
            />
            <Route
              path="crop-pdf"
              element={<ToolPlaceholder title="PDFs zuschneiden" description="Schneide deine Dokumente mit unserem PDF-Zuschneidungstool zu." />}
            />
            <Route
              path="redact-pdf"
              element={<ToolPlaceholder title="PDF schwärzen" description="Entferne vertrauliche Informationen aus deinen PDFs." />}
            />
            <Route
              path="watermark"
              element={<ToolPlaceholder title="Wasserzeichen-PDF" description="Füge ein Wasserzeichen zu deinen PDFs hinzu." />}
            />
            <Route
              path="page-numbers"
              element={<ToolPlaceholder title="Seitenzahlen einfügen" description="Seitenzahlen in PDF mit Leichtigkeit einbauen." />}
            />
            <Route
              path="ai-pdf-assistant"
              element={<ToolPlaceholder title="KI-PDF-Assistent" description="Nutze unseren KI-Assistenten zur Bearbeitung deiner Dokumente." />}
            />
            <Route
              path="chat-with-pdf"
              element={<ToolPlaceholder title="Mit PDFs chatten" description="Chatte mit deinen PDFs und stelle ihnen alle möglichen Fragen." />}
            />
            <Route
              path="ai-pdf-summary"
              element={<ToolPlaceholder title="KI-PDF-Zusammenfassung" description="Lass dir deine PDF von einer KI zusammenfassen, mit der du per Chat interagieren kannst." />}
            />
            <Route
              path="translate-pdf"
              element={<ToolPlaceholder title="PDF übersetzen" description="Lass dir eine Zusammenfassung deines PDFs übersetzen." />}
            />
            <Route
              path="ai-question-generator"
              element={<ToolPlaceholder title="KI-basierter Fragen-Generator" description="Multiple-Choice-, Richtig-oder-Falsch- oder offene Testfragen erstellen." />}
            />
            <Route
              path="extract-pages"
              element={<ToolPlaceholder title="PDF-Seiten extrahieren" description="Wähle gezielt Seiten aus einer PDF-Datei aus." />}
            />
            <Route
              path="organize-pdf"
              element={<ToolPlaceholder title="PDF Organisieren" description="PDFs neu anordnen, löschen, drehen und Seiten hinzufügen." />}
            />
            <Route
              path="sign"
              element={<ToolPlaceholder title="Unterschreibe PDF" description="Erstelle eine elektronische Signatur und unterschreibe deine Dokumente." />}
            />
            <Route
              path="remove-password"
              element={<ToolPlaceholder title="PDF Passwort entfernen" description="Passwort, Verschlüsselung und Genehmigung aus Ihrem PDF entfernen." />}
            />
            <Route
              path="encrypt-pdf"
              element={<ToolPlaceholder title="PDF verschlüsseln" description="Passwort hinzufügen und Ihre PDF-Datei verschlüsseln." />}
            />
            <Route
              path="flatten-pdf"
              element={<ToolPlaceholder title="Ebenen der PDF reduzieren" description="Verhindere eine Bearbeitung deiner PDFs." />}
            />
            <Route
              path="pdf-scanner"
              element={<ToolPlaceholder title="PDF-Scanner" description="Erstelle PDFs aus Scans auf deinem Smartphone." />}
            />
            <Route
              path="remove-metadata"
              element={<ToolPlaceholder title="Metadaten entfernen" description="Entferne sensible Metadaten aus deiner PDF-Datei." />}
            />
          </Route>

          {/* Legal Routes */}
          <Route path="impressum" element={<Impressum />} />
          <Route path="datenschutz" element={<Datenschutz />} />
        </Route>
      </Routes>
      <CookieBanner />
    </BrowserRouter>
  );
}

export default App;
