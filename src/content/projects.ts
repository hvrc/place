export type Media =
  | { type: "video"; src: string; poster?: string; toggleSound?: boolean }
  | { type: "image"; src: string; alt: string };

export interface Project {
  id: string;
  title: string;
  /** Primary link opened when the title is clicked (may be internal or external). */
  link?: string;
  github?: string;
  download?: string;
  /** HTML string (uses <br/>, <b>). Rendered via dangerouslySetInnerHTML. */
  description: string;
  /** One-line summary shown under the title in the PSP menu. */
  blurb?: string;
  media?: Media;
  /** True when link points to a route inside this app rather than an external site. */
  internal?: boolean;
  /** Suppress the live/media backdrop for this project (still used for thumbnails). */
  noBackdrop?: boolean;
}

const V = "/videos/demos/optimized";
const IMG = "/images/demos";

export const projects: Project[] = [
  {
    id: "carrom",
    title: "Carrom",
    blurb: "Indian tabletop game, a lot like billiards",
    link: "https://carrom-461712.ue.r.appspot.com/",
    github: "https://github.com/hvrc/carrom",
    description:
      "Indian tabletop game similar to billiards<br/>Using <b>Phaser.js, Express.js, Node.js</b>",
    media: { type: "video", src: `${V}/carrom_demo_optimized.mp4` },
  },
  {
    id: "hom",
    title: "hom",
    blurb: "Generative art from flocking and dithering",
    link: "/hom",
    internal: true,
    description:
      "Generative art created using flocking, dithering and other algorithms<br/>Using <b>p5.js</b>",
    media: { type: "video", src: `${V}/hom_demo_optimized.mp4` },
  },
  {
    id: "game-of-life",
    title: "Game of Life",
    blurb: "Conway's Game of Life, simulated",
    link: "https://generative-380518.ue.r.appspot.com/gameoflife",
    github: "https://github.com/hvrc/game-of-life",
    description:
      "Simulates Conway's Game of Life<br/>Using <b>p5.js, Flask, Google Cloud Platform</b>. Github version uses <b>Python &amp; Pygame</b>",
    media: { type: "video", src: `${V}/game_of_life_demo_optimized.mp4` },
  },
  {
    id: "newsletter",
    title: "Newsletter Generator",
    blurb: "Turns article links into .html newsletters",
    link: "https://newsletter-419717.an.r.appspot.com/newsletter-app/",
    github: "https://github.com/hvrc/newsletter",
    description:
      "Web application that takes links to articles from client's news website and generates .html newsletters<br/>Using <b>Python, Flask, BeautifulSoup, Google Cloud Platform</b>",
    media: { type: "image", src: `${IMG}/newsletter_demo.png`, alt: "Newsletter Generator Demo" },
  },
  {
    id: "shutdowner",
    title: "Shutdown Scheduler",
    blurb: "Windows app to schedule a shutdown",
    link: "https://github.com/hvrc/shutdowner",
    github: "https://github.com/hvrc/shutdowner",
    download:
      "https://github.com/hvrc/shutdowner/releases/download/v1.1.0/shutdowner-windows.zip",
    description: "Windows app to schedule a shutdown<br/>Using <b>Python &amp; Tkinter</b>",
    media: { type: "image", src: `${IMG}/shutdowner_demo.png`, alt: "Shutdown Scheduler Demo" },
  },
  {
    id: "pngtoplt",
    title: "PNG to PLT",
    blurb: "Converts QR code PNGs for laser engravers",
    link: "https://github.com/hvrc/pngtoplt",
    github: "https://github.com/hvrc/pngtoplt",
    description:
      "Converts a .png file of a qr code into a .plt file used by laser engravers<br/>Using <b>Python, Prolog, HP-GL</b>",
  },
  {
    id: "boteh",
    title: "Boteh",
    blurb: "Synthesizer played with hand gestures",
    link: "http://boteh-461905.appspot.com/",
    github: "https://github.com/hvrc/boteh",
    description:
      "Synthesizer played with hand gestures tracked by a camera<br/>Using <b>Google MediaPipe, Web Audio API, Node.js</b>",
    media: { type: "video", src: `${V}/boteh_demo_optimized.mp4`, toggleSound: true },
  },
  {
    id: "rts",
    title: "RTS",
    blurb: "Word association game",
    link: "https://rts0-462101.ue.r.appspot.com/",
    github: "https://github.com/hvrc/rts",
    description:
      "A word association game powered by WordNet and natural language processing<br/>Using <b>Python, WebNet, React, Vite</b>",
    media: { type: "video", src: `${V}/rts_demo_optimized.mp4` },
  },
  {
    id: "bunshi",
    title: "Bunshi",
    blurb: "Bond line structure of any chemical",
    link: "https://bunshi.ue.r.appspot.com/",
    github: "https://github.com/hvrc/bunshi",
    description:
      "Displays the bond line structure of any chemical<br/>Using <b>Python, Flask, BeautifulSoup, Google Cloud Platform</b>",
    media: { type: "image", src: `${IMG}/bunshi_demo_1.png`, alt: "Bunshi Demo" },
  },
  {
    id: "loan-reports",
    title: "Loan Reports",
    blurb: "Generates and visualizes custom loan reports",
    link: "https://github.com/hvrc/reportsapi",
    github: "https://github.com/hvrc/reportsapi",
    description:
      "API that Generates custom loan reports and visualizes data<br/>Using <b>Python, Pandas, High charts, Django</b>",
    media: { type: "image", src: `${IMG}/reports_demo.png`, alt: "Loan Reports Demo" },
    noBackdrop: true,
  },
  {
    id: "midi-controller",
    title: "Midi Controller",
    blurb: "Hardware MIDI controller for a DAW",
    link: "https://github.com/hvrc/midicontroller",
    github: "https://github.com/hvrc/midicontroller",
    description:
      "A MIDI controller with buttons and potentiometers to control a DAW<br/>Using <b>C++ and Arduino</b>",
    media: { type: "image", src: `${IMG}/midicontroller_demo.png`, alt: "MIDI Controller Demo" },
    noBackdrop: true,
  },
  {
    id: "prims-organism",
    title: "Prim's Organism",
    blurb: "A game built on Prim's maze generation",
    link: "/prim",
    github: "https://github.com/hvrc/place",
    internal: true,
    description:
      "A game based on Prim's Maze Generation Algorithm<br/>Using <b>React with JSX</b>",
  },
];
