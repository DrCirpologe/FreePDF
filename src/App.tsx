import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CookieBanner from './components/CookieBanner';

const Home = lazy(() => import('./pages/Home'));
const Startseite = lazy(() => import('./pages/Startseite'));
const ToolsLayout = lazy(() => import('./pages/tools/ToolsLayout'));
const MergePdf = lazy(() => import('./pages/tools/MergePdf'));
const SplitPdf = lazy(() => import('./pages/tools/SplitPdf'));
const DeletePages = lazy(() => import('./pages/tools/DeletePages'));
const RotatePdf = lazy(() => import('./pages/tools/RotatePdf'));
const CompressPdf = lazy(() => import('./pages/tools/CompressPdf'));
const ExtractPages = lazy(() => import('./pages/tools/ExtractPages'));
const OrganizePdf = lazy(() => import('./pages/tools/OrganizePdf'));
const PageNumbers = lazy(() => import('./pages/tools/PageNumbers'));
const WatermarkPdf = lazy(() => import('./pages/tools/WatermarkPdf'));
const JpgToPdf = lazy(() => import('./pages/tools/JpgToPdf'));
const PdfReader = lazy(() => import('./pages/tools/PdfReader'));
const RemoveMetadata = lazy(() => import('./pages/tools/RemoveMetadata'));
const FlattenPdf = lazy(() => import('./pages/tools/FlattenPdf'));
const CropPdf = lazy(() => import('./pages/tools/CropPdf'));
const PdfToJpg = lazy(() => import('./pages/tools/PdfToJpg'));
const AnnotatePdf = lazy(() => import('./pages/tools/AnnotatePdf'));
const PdfFormFiller = lazy(() => import('./pages/tools/PdfFormFiller'));
const SharePdf = lazy(() => import('./pages/tools/SharePdf'));
const EditPdf = lazy(() => import('./pages/tools/EditPdf'));
const RedactPdf = lazy(() => import('./pages/tools/RedactPdf'));
const RemovePassword = lazy(() => import('./pages/tools/RemovePassword'));
const EncryptPdf = lazy(() => import('./pages/tools/EncryptPdf'));
const Ocr = lazy(() => import('./pages/tools/Ocr'));
const PdfOcr = lazy(() => import('./pages/tools/PdfOcr'));
const SignPdf = lazy(() => import('./pages/tools/SignPdf'));
const PdfScanner = lazy(() => import('./pages/tools/PdfScanner'));
const PdfConverter = lazy(() => import('./pages/tools/PdfConverter'));
const Impressum = lazy(() => import('./pages/Impressum'));
const Datenschutz = lazy(() => import('./pages/Datenschutz'));

function App() {
  const routerBase = import.meta.env.BASE_URL === '/'
    ? '/'
    : import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <BrowserRouter basename={routerBase}>
      <Suspense fallback={<div className="px-4 py-10 text-center text-gray-600">Lädt…</div>}>
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
              element={<CompressPdf />}
            />
            {/* <Route
              path="ppt-to-pdf"
              element={<ToolPlaceholder title="PPT in PDF" description="PowerPoint-Präsentationen in PDF-Dokumente konvertieren." />}
            /> */}
            <Route
              path="pdf-to-jpg"
              element={<PdfToJpg />}
            />
            <Route
              path="pdf-to-img"
              element={<PdfToJpg />}
            />
            {/* <Route
              path="word-to-pdf"
              element={<ToolPlaceholder title="Word in PDF" description="Word-Dokumente in PDF-Dateien konvertieren." />}
            /> */}
            <Route
              path="annotate-pdf"
              element={<AnnotatePdf />}
            />
            <Route
              path="pdf-converter"
              element={<PdfConverter />}
            />
            {/* <Route
              path="pdf-to-ppt"
              element={<ToolPlaceholder title="PDF in PPT" description="PDFs in bearbeitbare PowerPoint-Präsentationen konvertieren." />}
            /> */}
            <Route
              path="ocr"
              element={<Ocr />}
            />
            <Route
              path="pdf-ocr"
              element={<PdfOcr />}
            />
            {/* <Route
              path="excel-to-pdf"
              element={<ToolPlaceholder title="Excel in PDF" description="Excel-Tabellen in PDF-Dokumente konvertieren." />}
            /> */}
            {/* <Route
              path="pdf-to-word"
              element={<ToolPlaceholder title="PDF in Word" description="PDFs in bearbeitbare Word-Dokumente konvertieren." />}
            /> */}
            <Route
              path="pdf-form-filler"
              element={<PdfFormFiller />}
            />
            <Route
              path="jpg-to-pdf"
              element={<JpgToPdf />}
            />
            <Route
              path="img-to-pdf"
              element={<JpgToPdf />}
            />
            {/* <Route
              path="pdf-to-excel"
              element={<ToolPlaceholder title="PDF in Excel" description="PDFs in bearbeitbare Excel-Tabellen konvertieren." />}
            /> */}
            <Route
              path="edit-pdf"
              element={<EditPdf />}
            />
            <Route
              path="pdf-reader"
              element={<PdfReader />}
            />
            <Route
              path="share-pdf"
              element={<SharePdf />}
            />
            <Route
              path="crop-pdf"
              element={<CropPdf />}
            />
            <Route
              path="redact-pdf"
              element={<RedactPdf />}
            />
            <Route
              path="watermark"
              element={<WatermarkPdf />}
            />
            <Route
              path="page-numbers"
              element={<PageNumbers />}
            />
            {/* <Route
              path="ai-pdf-assistant"
              element={<ToolPlaceholder title="KI-PDF-Assistent" description="Nutze unseren KI-Assistenten zur Bearbeitung deiner Dokumente." />}
            /> */}
            {/* <Route
              path="chat-with-pdf"
              element={<ToolPlaceholder title="Mit PDFs chatten" description="Chatte mit deinen PDFs und stelle ihnen alle möglichen Fragen." />}
            /> */}
            {/* <Route
              path="ai-pdf-summary"
              element={<ToolPlaceholder title="KI-PDF-Zusammenfassung" description="Lass dir deine PDF von einer KI zusammenfassen, mit der du per Chat interagieren kannst." />}
            /> */}
            {/* <Route
              path="translate-pdf"
              element={<ToolPlaceholder title="PDF übersetzen" description="Lass dir eine Zusammenfassung deines PDFs übersetzen." />}
            /> */}
            {/* <Route
              path="ai-question-generator"
              element={<ToolPlaceholder title="KI-basierter Fragen-Generator" description="Multiple-Choice-, Richtig-oder-Falsch- oder offene Testfragen erstellen." />}
            /> */}
            <Route
              path="extract-pages"
              element={<ExtractPages />}
            />
            <Route
              path="organize-pdf"
              element={<OrganizePdf />}
            />
            <Route
              path="sign"
              element={<SignPdf />}
            />
            <Route
              path="remove-password"
              element={<RemovePassword />}
            />
            <Route
              path="encrypt-pdf"
              element={<EncryptPdf />}
            />
            <Route
              path="flatten-pdf"
              element={<FlattenPdf />}
            />
            <Route
              path="pdf-scanner"
              element={<PdfScanner />}
            />
            <Route
              path="remove-metadata"
              element={<RemoveMetadata />}
            />
            </Route>

            {/* Legal Routes */}
            <Route path="impressum" element={<Impressum />} />
            <Route path="datenschutz" element={<Datenschutz />} />
          </Route>
        </Routes>
      </Suspense>
      <CookieBanner />
    </BrowserRouter>
  );
}

export default App;
