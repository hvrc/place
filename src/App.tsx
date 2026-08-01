import { Routes, Route } from "react-router-dom";
import Home from "@/frontends/classic/Home";
import Hom from "@/routes/Hom";
import Prim from "@/routes/Prim";
import Resume from "@/routes/Resume";

/**
 * The classic white-grid portfolio frontend. Frontends live under
 * src/frontends/*, each consuming the shared src/content data layer (and
 * optionally the reusable src/engine menu); mount one by pointing a route at it.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/hom" element={<Hom />} />
      <Route path="/prim" element={<Prim />} />
      <Route path="/resume" element={<Resume />} />
    </Routes>
  );
}
