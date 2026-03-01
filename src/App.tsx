import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CookieBanner from './components/CookieBanner';
import Home from './pages/Home';
import ToolsLayout from './pages/tools/ToolsLayout';
import MergePdf from './pages/tools/MergePdf';
import SplitPdf from './pages/tools/SplitPdf';
import DeletePages from './pages/tools/DeletePages';
import RotatePdf from './pages/tools/RotatePdf';
import Impressum from './pages/Impressum';
import Datenschutz from './pages/Datenschutz';

// Placeholder for tools not yet implemented
const PlaceholderTool = ({ title }: { title: string }) => (
  <div className="text-center py-20 px-4">
    <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
    <p className="text-gray-500 max-w-lg mx-auto">
      Dieses Tool befindet sich aktuell noch in der Entwicklung. Schau bald wieder vorbei!
    </p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />

          {/* Tool Routes wrapped in a standard layout */}
          <Route element={<ToolsLayout />}>
            <Route path="merge" element={<MergePdf />} />
            <Route path="split" element={<SplitPdf />} />
            <Route path="delete-pages" element={<DeletePages />} />
            <Route path="rotate" element={<RotatePdf />} />

            {/* Planned Tools */}
            <Route path="compress" element={<PlaceholderTool title="PDF Komprimieren" />} />
            <Route path="sign" element={<PlaceholderTool title="PDF Unterschreiben" />} />
            <Route path="watermark" element={<PlaceholderTool title="Wasserzeichen Hinzufügen" />} />
            <Route path="page-numbers" element={<PlaceholderTool title="Seitenzahlen Hinzufügen" />} />
            <Route path="remove-metadata" element={<PlaceholderTool title="Metadaten Entfernen" />} />
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
