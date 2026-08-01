import { Routes, Route } from "react-router-dom";
import PspMenu from "@psp/PspMenu";
import Home from "@/frontends/classic/Home";
import Hom from "@/routes/Hom";
import Prim from "@/routes/Prim";
import Resume from "@/routes/Resume";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PspMenu />} />
      <Route path="/classic" element={<Home />} />
      <Route path="/hom" element={<Hom />} />
      <Route path="/prim" element={<Prim />} />
      <Route path="/resume" element={<Resume />} />
    </Routes>
  );
}
