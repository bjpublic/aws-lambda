import { CookieAgreement, ScrollToTop } from "./Components";
import { GalleryPage, PicturePage } from "./Pages";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <CookieAgreement />
      <Routes>
        <Route path="/picture/:id" element={<PicturePage />} />
        <Route path="/search/:keyword" element={<GalleryPage />} />
        <Route path="*" element={<GalleryPage />} />
      </Routes>
    </Router>
  );
}
