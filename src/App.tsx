import { Routes, Route } from "react-router-dom";
import PspMenu from "@psp/PspMenu";
import Home from "@/frontends/classic/Home";
import Hom from "@/routes/Hom";
import Prim from "@/routes/Prim";
import Resume from "@/routes/Resume";

/**
 * Production routing. Frontends live under src/frontends/*, each consuming the
 * shared src/content data layer (the PSP one via the reusable src/engine menu).
 * The PSP cross-media-bar is the default "/"; the classic grid is at "/legacy".
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PspMenu />} />
      <Route path="/legacy" element={<Home />} />
      <Route path="/hom" element={<Hom />} />
      <Route path="/prim" element={<Prim />} />
      <Route path="/resume" element={<Resume />} />
    </Routes>
  );
}
