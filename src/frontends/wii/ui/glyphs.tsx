// Every mark the Wii menu draws, as inline SVG so they inherit `currentColor`
// and scale with the em grid. No icon font, no raster assets.

type Glyph = { className?: string; style?: React.CSSProperties };

/** The Wii wordmark: a rounded W and two dotted i's. */
export function WiiMark({ className, style }: Glyph) {
  return (
    <svg viewBox="0 0 62 34" className={className} style={style} fill="none" aria-hidden>
      <g
        stroke="currentColor"
        strokeWidth="5.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 10.5 L11.5 27 L19 14.5 L26.5 27 L34 10.5" />
        <path d="M43 16.5 V27" />
        <path d="M55 16.5 V27" />
      </g>
      <circle cx="43" cy="8.6" r="3.4" fill="currentColor" />
      <circle cx="55" cy="8.6" r="3.4" fill="currentColor" />
    </svg>
  );
}

/** The SD card slot glyph sitting beside the Wii button. */
export function SdMark({ className, style }: Glyph) {
  return (
    <svg viewBox="0 0 24 30" className={className} style={style} aria-hidden>
      <path
        d="M7 1 H20 A3 3 0 0 1 23 4 V26 A3 3 0 0 1 20 29 H4 A3 3 0 0 1 1 26 V7 Z"
        fill="currentColor"
        opacity="0.16"
      />
      <path
        d="M7 1 H20 A3 3 0 0 1 23 4 V26 A3 3 0 0 1 20 29 H4 A3 3 0 0 1 1 26 V7 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M10 4.5 V8.5" />
        <path d="M14 4.5 V8.5" />
        <path d="M18 4.5 V8.5" />
      </g>
    </svg>
  );
}

/** The message-board envelope on the bar's right-hand orb. */
export function MailMark({ className, style }: Glyph) {
  return (
    <svg viewBox="0 0 34 24" className={className} style={style} fill="none" aria-hidden>
      <rect
        x="1.4"
        y="1.4"
        width="31.2"
        height="21.2"
        rx="3"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path
        d="M2.6 3.4 L17 14 L31.4 3.4"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A pinned letter's icon on the board. */
export function LetterMark({ className, style }: Glyph) {
  return (
    <svg viewBox="0 0 44 30" className={className} style={style} fill="none" aria-hidden>
      <rect x="1.5" y="1.5" width="41" height="27" rx="2.5" fill="#fff" stroke="currentColor" strokeWidth="2" />
      <path d="M2.5 3 L22 17 L41.5 3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M2.5 27 L16 15 M41.5 27 L28 15" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
    </svg>
  );
}

/** The big pale-blue navigation triangle. `dir` points it. */
export function Triangle({ dir = "right", className, style }: Glyph & { dir?: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 34 46"
      className={className}
      style={{ ...style, transform: dir === "left" ? "scaleX(-1)" : undefined }}
      aria-hidden
    >
      <path
        d="M6 4 Q6 1 8.5 2.4 L31 21.2 Q33 23 31 24.8 L8.5 43.6 Q6 45 6 42 Z"
        fill="currentColor"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CalendarMark({ className, style }: Glyph) {
  return (
    <svg viewBox="0 0 28 26" className={className} style={style} fill="none" aria-hidden>
      <rect x="1.4" y="4" width="25.2" height="20.6" rx="2.4" stroke="currentColor" strokeWidth="2.2" />
      <path d="M1.4 10 H26.6" stroke="currentColor" strokeWidth="2.2" />
      <path d="M8 1.4 V6 M20 1.4 V6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <g fill="currentColor">
        <rect x="6" y="13" width="4" height="3.4" rx="0.8" />
        <rect x="12" y="13" width="4" height="3.4" rx="0.8" />
        <rect x="18" y="13" width="4" height="3.4" rx="0.8" />
        <rect x="6" y="18.4" width="4" height="3.4" rx="0.8" />
        <rect x="12" y="18.4" width="4" height="3.4" rx="0.8" />
      </g>
    </svg>
  );
}

export function PencilMark({ className, style }: Glyph) {
  return (
    <svg viewBox="0 0 26 26" className={className} style={style} fill="none" aria-hidden>
      <path
        d="M3 23 L4.6 17.8 L17.6 4.8 A2.6 2.6 0 0 1 21.2 8.4 L8.2 21.4 Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M15.6 6.8 L19.2 10.4" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}

export function FileMark({ className, style }: Glyph) {
  return (
    <svg viewBox="0 0 22 26" className={className} style={style} fill="none" aria-hidden>
      <path
        d="M2 1.2 H13.5 L20 7.6 V24.8 H2 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M13.5 1.2 V7.6 H20" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function GearMark({ className, style }: Glyph) {
  return (
    <svg viewBox="0 0 26 26" className={className} style={style} fill="none" aria-hidden>
      <circle cx="13" cy="13" r="4" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M13 1.6 V5 M13 21 V24.4 M24.4 13 H21 M5 13 H1.6M21.1 4.9 L18.7 7.3M7.3 18.7 L4.9 21.1M21.1 21.1 L18.7 18.7M7.3 7.3 L4.9 4.9"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * The Wii-remote pointer hand: a white fist with an extended index finger and
 * the player-number tag on the cuff. Drawn from primitives rather than a traced
 * path so it stays crisp at any size.
 */
export function HandCursor({ className, style }: Glyph) {
  return (
    <svg viewBox="0 0 56 74" className={className} style={style} aria-hidden>
      <g stroke="#23282b" strokeWidth="3" strokeLinejoin="round">
        {/* index finger */}
        <rect x="14" y="3" width="13.5" height="34" rx="6.7" fill="#fff" />
        {/* thumb, folded across */}
        <rect x="4.5" y="26" width="12" height="20" rx="6" fill="#fff" />
        {/* the fist */}
        <rect x="12" y="24" width="32" height="34" rx="10" fill="#fff" />
        {/* cuff */}
        <rect x="13" y="49" width="30" height="18" rx="5" fill="#fff" />
      </g>
      {/* folded knuckles */}
      <g stroke="#c2c8cb" strokeWidth="2" strokeLinecap="round">
        <path d="M31 30 V40" />
        <path d="M37 32 V40" />
      </g>
      {/* player tag */}
      <rect x="19" y="52" width="18" height="12" rx="2.4" fill="#2f9fd6" />
      <text
        x="28"
        y="61.6"
        textAnchor="middle"
        fontSize="10.5"
        fontWeight="700"
        fill="#fff"
        fontFamily="Helvetica, Arial, sans-serif"
      >
        1
      </text>
    </svg>
  );
}
