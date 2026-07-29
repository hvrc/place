import { useEffect, useRef, useState } from "react";
import { MazeCanvas, PrimsOrganism, Worm } from "@/lib/prim/organism";
import { useEscapeTo } from "@/hooks/useEscapeTo";
import styles from "./Prim.module.css";

export default function Prim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHelpMinimized, setIsHelpMinimized] = useState(false);
  const [isRefsMinimized, setIsRefsMinimized] = useState(true);
  useEscapeTo("/");

  useEffect(() => {
    document.title = "Prim's Organism";
    if (!canvasRef.current) return;

    const width = 1920;
    const height = 1080;
    const scale = 5;
    const mazeWidth = width / scale;
    const mazeHeight = height / scale;
    const poisonCells = 1000;
    const speed = 15;
    const birthSize = 100;
    const growthSize = 20;
    const scanRadius = 10;
    const poisonRadius = 20;
    const birthRadius = 16;
    const bloomRadius = 10;
    const soilColor = "#362c24";
    const foodColor = "#758f51";
    const poisonColor = "#9A2A2A";
    const organismBodyColor = "#483C32";
    const frontierCellColor = "#483C32";
    const deadColor = "#302720";
    const scannedFoodColor = "#8b8000";
    const scannedPoisonColor = "#B87333";
    const bloomCircleColor = "#484832";
    const organismBloomBodyColor = "#59593c";
    const wormBodyColor = "#fffaa0";
    const flowerColorTuples = [["#93C572", "#FFE5B4"]];
    const wormScannedPoisonColor = "#B87333";

    const mazeCanvas = new MazeCanvas(
      mazeWidth,
      mazeHeight,
      width,
      height,
      0,
      poisonCells,
      "canvas",
      soilColor,
      foodColor,
      poisonColor,
      mazeWidth / 2,
      mazeHeight / 2,
      birthRadius
    );

    const primsOrganism = new PrimsOrganism(
      mazeCanvas,
      speed,
      birthSize,
      growthSize,
      organismBodyColor,
      frontierCellColor,
      deadColor,
      scannedFoodColor,
      scannedPoisonColor,
      scanRadius,
      poisonRadius,
      birthRadius,
      bloomRadius,
      bloomCircleColor,
      organismBloomBodyColor,
      flowerColorTuples
    );

    // Worm is instantiated for parity with the original scene setup.
    new Worm(
      mazeCanvas,
      speed * 2,
      wormBodyColor,
      mazeWidth / 2,
      mazeHeight - birthRadius,
      scanRadius,
      wormScannedPoisonColor
    );

    primsOrganism.animate();
  }, []);

  return (
    <div className={styles.container}>
      <div
        className={`${styles.helpBox} ${
          isHelpMinimized ? styles.helpBoxMinimized : styles.helpBoxMaximized
        }`}
      >
        <button
          onClick={() => setIsHelpMinimized(!isHelpMinimized)}
          className={styles.toggleButton}
        >
          {isHelpMinimized ? "?" : "X"}
        </button>
        {!isHelpMinimized && (
          <ul className={styles.instructions}>
            with a mouse or trackpad, play this scene,
            <br />
            as{" "}
            <i>
              <b>the worm</b>
            </i>{" "}
            you trail, a path serene
            <br />
            <i>
              <b>the roots</b>
            </i>{" "}
            they grow and seek to spread,
            <br />
            but die of poison if met with{" "}
            <i>
              <b> red</b>
            </i>{" "}
            <br />
            left click to drop some{" "}
            <i>
              <b>green</b>
            </i>{" "}
            in flight,
            <br />
            for{" "}
            <i>
              <b>the roots</b>
            </i>{" "}
            to eat and grow in might
            <br />
            <i>
              <b>the worm</b>
            </i>{" "}
            can eat a whole lotta red,
            <br />
            and help{" "}
            <i>
              <b>the roots</b>
            </i>{" "}
            bloom a flower bed <br /> <br />
            ...and if{" "}
            <i>
              <b>the worm</b>
            </i>{" "}
            or{" "}
            <i>
              <b>the roots</b>
            </i>{" "}
            get caged, <br />
            you might have to refresh the page
          </ul>
        )}
      </div>

      <div
        className={`${styles.helpBox} ${
          isRefsMinimized ? styles.helpBoxMinimized : styles.helpBoxMaximized
        } ${styles.refsBox}`}
      >
        <button
          onClick={() => setIsRefsMinimized(!isRefsMinimized)}
          className={styles.toggleButton}
        >
          {isRefsMinimized ? "!" : "X"}
        </button>
        {!isRefsMinimized && (
          <ul className={styles.instructions}>
            <li>
              i got the flowers from{" "}
              <a target="_blank" href="https://www.instagram.com/khyatitrehan/">
                {" "}
                @khyatitrehan's
              </a>{" "}
              <a target="_blank" href="https://gemini.google.com/share/2ff8591725da">
                {" "}
                demo
              </a>
            </li>
            <li>
              the roots grow using{" "}
              <a target="_blank" href="https://en.wikipedia.org/wiki/Prim%27s_algorithm">
                {" "}
                prim's algorithm
              </a>{" "}
            </li>
          </ul>
        )}
      </div>

      <canvas id="canvas" ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
