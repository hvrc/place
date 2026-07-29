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
  /** Short one-line tech summary, plain text (derived from description). */
  tech: string;
  media?: Media;
  /** True when link points to a route inside this app rather than an external site. */
  internal?: boolean;
}

const V = "/videos/demos/optimized";
const IMG = "/images/demos";

export const projects: Project[] = [
  {
    id: "carrom",
    title: "Carrom",
    link: "https://carrom-461712.ue.r.appspot.com/",
    github: "https://github.com/hvrc/carrom",
    description:
      "Indian tabletop game similar to billiards<br/>Using <b>Phaser.js, Express.js, Node.js</b>",
    tech: "Phaser.js, Express.js, Node.js",
    media: { type: "video", src: `${V}/carrom_demo_optimized.mp4` },
  },
  {
    id: "hom",
    title: "hom",
    link: "/hom",
    internal: true,
    description:
      "Generative art created using flocking, dithering and other algorithms<br/>Using <b>p5.js</b>",
    tech: "p5.js",
    media: { type: "video", src: `${V}/hom_demo_optimized.mp4` },
  },
  {
    id: "game-of-life",
    title: "Game of Life",
    link: "https://generative-380518.ue.r.appspot.com/gameoflife",
    github: "https://github.com/hvrc/game-of-life",
    description:
      "Simulates Conway's Game of Life<br/>Using <b>p5.js, Flask, Google Cloud Platform</b>. Github version uses <b>Python &amp; Pygame</b>",
    tech: "p5.js, Flask, GCP",
    media: { type: "video", src: `${V}/game_of_life_demo_optimized.mp4` },
  },
  {
    id: "newsletter",
    title: "Newsletter Generator",
    link: "https://newsletter-419717.an.r.appspot.com/newsletter-app/",
    github: "https://github.com/hvrc/newsletter",
    description:
      "Web application that takes links to articles from client's news website and generates .html newsletters<br/>Using <b>Python, Flask, BeautifulSoup, Google Cloud Platform</b>",
    tech: "Python, Flask, BeautifulSoup, GCP",
    media: { type: "image", src: `${IMG}/newsletter_demo.png`, alt: "Newsletter Generator Demo" },
  },
  {
    id: "shutdowner",
    title: "Shutdown Scheduler",
    link: "https://github.com/hvrc/shutdowner",
    download:
      "https://github.com/hvrc/shutdowner/releases/download/v1.1.0/shutdowner-windows.zip",
    description: "Windows app to schedule a shutdown<br/>Using <b>Python &amp; Tkinter</b>",
    tech: "Python, Tkinter",
    media: { type: "image", src: `${IMG}/shutdowner_demo.png`, alt: "Shutdown Scheduler Demo" },
  },
  {
    id: "pngtoplt",
    title: "PNG to PLT",
    link: "https://github.com/hvrc/pngtoplt",
    description:
      "Converts a .png file of a qr code into a .plt file used by laser engravers<br/>Using <b>Python, Prolog, HP-GL</b>",
    tech: "Python, Prolog, HP-GL",
  },
  {
    id: "boteh",
    title: "Boteh",
    link: "http://boteh-461905.appspot.com/",
    github: "https://github.com/hvrc/boteh",
    description:
      "Synthesizer played with hand gestures tracked by a camera<br/>Using <b>Google MediaPipe, Web Audio API, Node.js</b>",
    tech: "Google MediaPipe, Web Audio API, Node.js",
    media: { type: "video", src: `${V}/boteh_demo_optimized.mp4`, toggleSound: true },
  },
  {
    id: "rts",
    title: "RTS",
    link: "https://rts0-462101.ue.r.appspot.com/",
    github: "https://github.com/hvrc/rts",
    description:
      "A word association game powered by WordNet and natural language processing<br/>Using <b>Python, WebNet, React, Vite</b>",
    tech: "Python, WordNet, React, Vite",
    media: { type: "video", src: `${V}/rts_demo_optimized.mp4` },
  },
  {
    id: "bunshi",
    title: "Bunshi",
    link: "https://bunshi.ue.r.appspot.com/",
    github: "https://github.com/hvrc/bunshi",
    description:
      "Displays the bond line structure of any chemical<br/>Using <b>Python, Flask, BeautifulSoup, Google Cloud Platform</b>",
    tech: "Python, Flask, BeautifulSoup, GCP",
    media: { type: "image", src: `${IMG}/bunshi_demo_1.png`, alt: "Bunshi Demo" },
  },
  {
    id: "loan-reports",
    title: "Loan Reports",
    link: "https://github.com/hvrc/reportsapi",
    description:
      "API that Generates custom loan reports and visualizes data<br/>Using <b>Python, Pandas, High charts, Django</b>",
    tech: "Python, Pandas, Highcharts, Django",
    media: { type: "image", src: `${IMG}/reports_demo.png`, alt: "Loan Reports Demo" },
  },
  {
    id: "midi-controller",
    title: "Midi Controller",
    link: "https://github.com/hvrc/midicontroller",
    description:
      "A MIDI controller with buttons and potentiometers to control a DAW<br/>Using <b>C++ and Arduino</b>",
    tech: "C++, Arduino",
    media: { type: "image", src: `${IMG}/midicontroller_demo.png`, alt: "MIDI Controller Demo" },
  },
  {
    id: "prims-organism",
    title: "Prim's Organism",
    link: "/prim",
    internal: true,
    description:
      "A game based on Prim's Maze Generation Algorithm<br/>Using <b>React with JSX</b>",
    tech: "React, Canvas",
  },
];
