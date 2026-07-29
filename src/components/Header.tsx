import { useLetterScramble } from "@/hooks/useLetterScramble";

export function Header() {
  const name = useLetterScramble(true);

  return (
    <section
      id="header"
      className="flex justify-center items-center p-4 top-0 bg-opacity-50 z-10 fade-in"
    >
      <div className="w-full text-center space-y-3">
        <h1 className="text-4xl md:text-6xl font-extrabold">
          <span className="letter-transform">{name.h1}</span>
          <span className={`letter-transform ${name.a === "V" ? "mechanical-switch" : ""}`}>
            {name.a}
          </span>
          <span className="letter-transform">{name.r}</span>
          <span className={`letter-transform ${name.s === "C" ? "mechanical-switch" : ""}`}>
            {name.s}
          </span>
          <span className="letter-transform">{name.h2}</span>
          <span> RAJMACHIKAR</span>
        </h1>
      </div>
    </section>
  );
}
