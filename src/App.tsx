import { Routes, Route } from "react-router-dom";
import PspMenu from "@psp/PspMenu";
import Hom from "@/routes/Hom";
import Prim from "@/routes/Prim";
import Resume from "@/routes/Resume";

/**
 * The PSP cross-media-bar frontend. Frontends live under src/frontends/*, each
 * consuming the shared src/content data layer (the PSP one via the reusable
 * src/engine menu); mount one by pointing a route at it.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PspMenu />} />
      <Route path="/hom" element={<Hom />} />
      <Route path="/prim" element={<Prim />} />
      <Route path="/resume" element={<Resume />} />
    </Routes>
  );
}
