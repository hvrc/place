import { useState } from "react";
import type { Media } from "@/data/projects";

/** Renders a project's video or image. Videos autoplay muted+looped; a video
 *  flagged toggleSound gets an overlay sound on/off button (used by Boteh). */
export function ProjectMedia({ media }: { media: Media }) {
  const [muted, setMuted] = useState(true);

  if (media.type === "image") {
    return <img src={media.src} alt={media.alt} className="w-full block" />;
  }

  if (media.toggleSound) {
    return (
      <div className="relative">
        <video className="w-full block" autoPlay loop muted={muted} playsInline>
          <source src={media.src} type="video/mp4" />
        </video>
        <button
          onClick={() => setMuted((m) => !m)}
          className="absolute bottom-2 right-2 text-xs md:text-sm bg-black text-white bg-opacity-25 px-3 py-1.5 rounded-full hover:bg-opacity-90 transition-all z-10"
        >
          {muted ? "sound off" : "sound on"}
        </button>
      </div>
    );
  }

  return (
    <video className="w-full block" autoPlay loop muted playsInline>
      <source src={media.src} type="video/mp4" />
    </video>
  );
}
