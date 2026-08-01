import { Routes, Route } from "react-router-dom";
import Home from "@/frontends/classic/Home";
import PspMenu from "@psp/PspMenu";
import Hom from "@/routes/Hom";
import Prim from "@/routes/Prim";
import Resume from "@/routes/Resume";

/**
 * Frontends live under src/frontends/*, each consuming the shared src/content
 * data layer (and optionally the reusable src/engine menu). Mount a frontend by
 * pointing a route at it — the classic white-grid portfolio is the default
 * here; the PSP cross-media-bar is one alternate frontend.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/psp" element={<PspMenu />} />
      <Route path="/hom" element={<Hom />} />
      <Route path="/prim" element={<Prim />} />
      <Route path="/resume" element={<Resume />} />
    </Routes>
  );
}
