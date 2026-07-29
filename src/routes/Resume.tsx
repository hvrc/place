import { useEffect } from "react";

export default function Resume() {
  useEffect(() => {
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    const created = !viewportMeta;
    if (!viewportMeta) {
      viewportMeta = document.createElement("meta");
      viewportMeta.setAttribute("name", "viewport");
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.setAttribute(
      "content",
      "width=device-width, initial-scale=0.6, maximum-scale=2.0, user-scalable=yes"
    );
    return () => {
      if (created) viewportMeta?.remove();
      else viewportMeta?.setAttribute("content", "width=device-width, initial-scale=1.0");
    };
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden">
      <iframe
        src="https://drive.google.com/file/d/1FHG0hwYmL9afZTrSivViFjktDqKQRXJ-/preview"
        className="w-full h-full"
        style={{ width: "100%", height: "100vh", border: "none", overflow: "hidden" }}
        title="Resume PDF"
        allow="autoplay"
      />
    </div>
  );
}
