import { Link } from "react-router-dom";
import { homImages } from "@content/generated/homManifest";
import { useEscapeTo } from "@/hooks/useEscapeTo";

export default function Hom() {
  useEscapeTo("/");
  return (
    <div className="max-w-screen-xl mx-auto relative">
      <div className="absolute left-4 top-4">
        <Link to="/" className="text-xl hover:text-gray-600 transition-colors">
          back
        </Link>
      </div>
      <br />
      <br />
      <h1 className="text-center text-4xl mb-8">hॐ</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 p-4">
        {homImages.map((name) => (
          <div key={name} className="image-item">
            <img
              src={`/images/hom/thumbs/${name}.jpeg`}
              alt={name}
              loading="lazy"
              className="w-full h-auto object-cover cursor-pointer"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
