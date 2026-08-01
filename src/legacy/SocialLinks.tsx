import { Link } from "react-router-dom";
import { socials } from "@content/socials";

export function SocialLinks() {
  return (
    <div className="fixed top-0 right-4 md:right-8 p-4 z-20 fade-in">
      <div className="flex flex-col space-y-1 text-right text-sm md:text-base">
        {socials.map((s) =>
          s.internal ? (
            <Link key={s.id} to={s.href} target="_blank">
              {s.label}
            </Link>
          ) : (
            <a key={s.id} href={s.href} target="_blank" rel="noopener noreferrer">
              {s.label}
            </a>
          )
        )}
      </div>
    </div>
  );
}
