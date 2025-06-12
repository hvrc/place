"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

// Updated hook with better loading logic
const useOptimizedVideo = (videoSrc: string, shouldLoad: boolean = true) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!shouldLoad || !videoRef.current) return;

    const video = videoRef.current;
    
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    // Force load the video when shouldLoad becomes true
    if (video.src === '' || video.src !== videoSrc) {
      video.src = videoSrc;
      video.load();
    }

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [shouldLoad, videoSrc]);

  return { videoRef, isLoading, hasError };
};

export default function HomePage() {
  const [resumeLink, setResumeLink] = useState('/resume');
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [isBotehMuted, setIsBotehMuted] = useState(true);

  // Add loading states for show all videos
  const [homVideoLoaded, setHomVideoLoaded] = useState(false);
  const [gameOfLifeVideoLoaded, setGameOfLifeVideoLoaded] = useState(false);

  // Add individual video loading states
  const [carromVideoLoaded, setCarromVideoLoaded] = useState(false);
  const [botehVideoLoaded, setBotehVideoLoaded] = useState(false);
  const [rtsVideoLoaded, setRtsVideoLoaded] = useState(false);

  useEffect(() => {
    setPageLoaded(true);
  }, []);

  const [titleLoaded, setTitleLoaded] = useState(false);
  const [floaterLoaded, setFloaterLoaded] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [experienceLoaded, setExperienceLoaded] = useState(false);
  const [contactLoaded, setContactLoaded] = useState(false);

  useEffect(() => {
    if (pageLoaded) {
      setTitleLoaded(true);
      setTimeout(() => setFloaterLoaded(true), 400);
      setTimeout(() => setProjectsLoaded(true), 800);
      setTimeout(() => setExperienceLoaded(true), 1200);
      setTimeout(() => setContactLoaded(true), 1600);
    }
  }, [pageLoaded]);

  // Stagger video loading to prevent all loading at once
  useEffect(() => {
    if (projectsLoaded) {
      // Load videos one by one with delays
      setTimeout(() => setCarromVideoLoaded(true), 200);
      setTimeout(() => setBotehVideoLoaded(true), 800);
      setTimeout(() => setRtsVideoLoaded(true), 1400);
    }
  }, [projectsLoaded]);

  const carromVideoRef = useRef<HTMLVideoElement>(null);
  const botehVideoRef = useRef<HTMLVideoElement>(null);
  const rtsVideoRef = useRef<HTMLVideoElement>(null);

  // Update video hooks to use individual loading states
  const homVideo = useOptimizedVideo('/videos/demos/hom_demo_optimized.mp4', homVideoLoaded);
  const gameOfLifeVideo = useOptimizedVideo('/videos/demos/game_of_life_demo_optimized.mp4', gameOfLifeVideoLoaded);

  useEffect(() => {
    if (showAllProjects) {
      // Delay loading of show all videos
      setTimeout(() => setHomVideoLoaded(true), 500);
      setTimeout(() => setGameOfLifeVideoLoaded(true), 1000);
    } else {
      // Reset when hiding
      setHomVideoLoaded(false);
      setGameOfLifeVideoLoaded(false);
    }
  }, [showAllProjects]);

  return (
    <div className="max-w-[95%] sm:max-w-[80%] md:max-w-[65%] lg:max-w-[750px] mx-auto space-y-4 px-4 pt-8">
      {/* title */}
      <section id="header" className={`flex justify-center items-center p-4 top-0 bg-opacity-50 z-10 ${titleLoaded ? 'fade-in' : 'opacity-0'}`}>
        <div className="w-full text-center space-y-3">
          <h1 className="text-4xl md:text-6xl font-extrabold">Harsh Rajmachikar</h1>
          <p className="text-lg md:text-xl">making things on a computer</p>
        </div>
      </section>

      {/* floater */}
      <div className={`fixed top-0 right-4 md:right-8 p-4 z-20 ${floaterLoaded ? 'fade-in' : 'opacity-0'}`}>
        <div className="flex flex-col space-y-1 text-right text-sm md:text-base">
          <a href="https://www.instagram.com/hvrc2000" target="_blank" rel="noopener noreferrer">instagram</a>
          <a href="https://www.youtube.com/@hvrc0" target="_blank" rel="noopener noreferrer">youtube</a>
          <a href="https://github.com/hvrc" target="_blank" rel="noopener noreferrer">github</a>
          <a href="https://www.linkedin.com/in/hvrc/" target="_blank" rel="noopener noreferrer">linkedin</a>
          <Link href="/resume" target="_blank">resume</Link>
        </div>
      </div>

      {/* projects */}
      <section id="projects" className={`p-6 space-y-6 ${projectsLoaded ? 'fade-in' : 'opacity-0'}`}>
        <div className="relative">
          {/* show all */}
          <button 
            onClick={() => setShowAllProjects(true)}
            className={`absolute left-1/2 transform -translate-x-1/2 bottom-0 translate-y-1/2 z-10 px-6 py-1 bg-[#f1ebe5] text-gray-500 hover:text-gray-700 ${showAllProjects ? 'hidden' : 'block'}`}
          >
            Show All
          </button>
          
          <div className="border border-gray-300 p-5 space-y-6">
            
            {/* Carrom - UPDATE TO OPTIMIZED */}
            <div className={`${projectsLoaded ? 'fade-in' : 'opacity-0'}`}>
              <div className="flex items-baseline gap-x-4 mb-1">
                <a href="https://carrom-461712.ue.r.appspot.com/" target="_blank" className="custom-link">
                  <h1 className="text-2xl md:text-4xl font-bold">Carrom</h1>
                </a>
                <div className="text-sm md:text-lg self-baseline space-x-2">
                  <a href='https://github.com/hvrc/carrom' target="_blank">Github</a>
                </div>
              </div>
              <p className="text-sm md:text-lg text-left">
                Indian tabletop game similar to billiards <br/>
                Using <b>Phaser.js, Express.js, Node.js</b>
              </p>
              <div className="mt-4 w-full rounded-lg overflow-hidden relative">
                {!carromVideoLoaded ? (
                  <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
                    <div className="text-gray-500">Loading...</div>
                  </div>
                ) : (
                  <video 
                    ref={carromVideoRef}
                    className="w-full"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="none"
                  >
                    <source src="/videos/demos/carrom_demo_optimized.mp4" type="video/mp4" />
                  </video>
                )}
              </div>
            </div>

            {/* Boteh - UPDATE TO OPTIMIZED */}
            <div className={`${projectsLoaded ? 'fade-in fade-in-delay-300' : 'opacity-0'}`}>
              <div className="flex items-baseline gap-x-4 mb-1">
                <a href="http://boteh-461905.appspot.com/" target="_blank" className="custom-link">
                  <h1 className="text-2xl md:text-4xl font-bold">Boteh</h1>
                </a>
                <div className="text-sm md:text-lg self-baseline space-x-2">
                  <a href='https://github.com/hvrc/boteh' target="_blank">Github</a>
                </div>
              </div>
              <p className="text-sm md:text-lg text-left">
                Synthesizer played with hand gestures tracked by a camera<br/>
                Using <b>Google MediaPipe, Web Audio API, Node.js</b>
              </p>
              <div className="mt-4 w-full rounded-lg overflow-hidden relative">
                {!botehVideoLoaded ? (
                  <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
                    <div className="text-gray-500">Loading...</div>
                  </div>
                ) : (
                  <video 
                    ref={botehVideoRef}
                    className="w-full"
                    autoPlay
                    loop
                    muted={isBotehMuted}
                    playsInline
                    preload="none"
                  >
                    <source src="/videos/demos/boteh_demo_optimized.mp4" type="video/mp4" />
                  </video>
                )}
                {botehVideoLoaded && (
                  <button
                    onClick={() => setIsBotehMuted(!isBotehMuted)}
                    className="absolute bottom-2 right-2 text-xs md:text-sm bg-black text-white bg-opacity-70 px-3 py-1.5 rounded-full hover:bg-opacity-90 transition-all z-10"
                  >
                    {isBotehMuted ? 'Sound Off' : 'Sound On'}
                  </button>
                )}
              </div>
            </div>

            {/* RTS - UPDATE TO OPTIMIZED */}
            <div className={`${projectsLoaded ? 'fade-in fade-in-delay-450' : 'opacity-0'}`}>
              <div className="flex items-baseline gap-x-4 mb-1">
                <a href="https://rts0-462101.ue.r.appspot.com/" target="_blank" className="custom-link">
                  <h1 className="text-2xl md:text-4xl font-bold">RTS</h1>
                </a>
                <div className="text-sm md:text-lg self-baseline space-x-2">
                  <a href='https://github.com/hvrc/rts' target="_blank">Github</a>
                </div>
              </div>
              <p className="text-sm md:text-lg text-left">
                A word association game powered by WordNet and natural language processing<br/>
                Using <b>Python, WebNet, React, Vite</b>
              </p>
              <div className="mt-4 w-full rounded-lg overflow-hidden">
                {!rtsVideoLoaded ? (
                  <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
                    <div className="text-gray-500">Loading...</div>
                  </div>
                ) : (
                  <video 
                    ref={rtsVideoRef}
                    className="w-full"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="none"
                  >
                    <source src="/videos/demos/rts_demo_optimized.mp4" type="video/mp4" />
                  </video>
                )}
              </div>
            </div>

            <div className={`${projectsLoaded ? 'fade-in fade-in-delay-600' : 'opacity-0'} mb-0`}>
            </div>

            {/* show less */}
            <div className={`flex justify-center transition-all duration-1000 ease-in-out ${showAllProjects ? 'opacity-100 max-h-28 py-7' : 'opacity-0 max-h-0 py-0 overflow-hidden'}`}>
              <button 
                onClick={() => setShowAllProjects(false)}
                className="px-8 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Show Less
              </button>
            </div>

            {/* all projects */}
            <div className={`transition-all duration-1000 ease-in-out ${showAllProjects ? 'opacity-100 max-h-[5000px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
              <div className="space-y-12">

                {/* 1. Place */}
                <div>
                  <div className="flex items-baseline gap-x-4 mb-2">
                    <a href="/" target="_blank" className="custom-link">
                      <h1 className="text-2xl md:text-4xl font-bold">Place</h1>
                    </a>
                  </div>
                  <p className="text-sm md:text-lg text-left">
                    Website to showcase projects <br/>
                    Using <b>React, Next.js, TypeScript, Tailwind CSS</b>
                  </p>
                  <div className="mt-4 w-full rounded-lg overflow-hidden">
                    <iframe 
                      src="/"
                      className="w-full aspect-video"
                      title="Place Demo"
                    />
                  </div>
                </div>

                {/* 2. hom - FIXED LOADING */}
                <div>
                  <div className="flex items-baseline gap-x-4 mb-2">
                    <Link href="/hom" target="_blank" className="custom-link">
                      <h1 className="text-2xl md:text-4xl font-bold">hom</h1>
                    </Link>
                  </div>
                  <p className="text-sm md:text-lg text-left">
                    Generative art created using flocking, dithering and other algorithms <br/>
                    Using <b>p5.js</b>
                  </p>
                  <div className="mt-4 w-full rounded-lg overflow-hidden">
                    {!homVideoLoaded ? (
                      <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
                        <div className="text-gray-500">Loading...</div>
                      </div>
                    ) : (
                      <video 
                        ref={homVideo.videoRef}
                        className="w-full"
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="none"
                      >
                        <source 
                          src="/videos/demos/hom_demo_optimized.mp4" 
                          type="video/mp4"
                        />
                      </video>
                    )}
                  </div>
                </div>

                {/* 3. Game of Life - FIXED LOADING */}
                <div>
                  <div className="flex items-baseline gap-x-4 mb-2">
                    <a href="https://generative-380518.ue.r.appspot.com/gameoflife" target="_blank" className="custom-link">
                      <h1 className="text-2xl md:text-4xl font-bold">Game of Life</h1>
                    </a>
                    <div className="text-sm md:text-lg self-baseline space-x-2">
                      <a href='https://github.com/hvrc/game-of-life' target="_blank">
                        Github
                      </a>
                    </div>
                  </div>
                  <p className="text-sm md:text-lg text-left">
                    Simulates Conway's Game of Life <br/>
                    Using <b>p5.js, Flask, Google Cloud Platform</b>. Github version uses <b>Python & Pygame</b>
                  </p>
                  <div className="mt-4 w-full rounded-lg overflow-hidden">
                    {!gameOfLifeVideoLoaded ? (
                      <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
                        <div className="text-gray-500">Loading...</div>
                      </div>
                    ) : (
                      <video 
                        ref={gameOfLifeVideo.videoRef}
                        className="w-full"
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="none"
                      >
                        <source 
                          src="/videos/demos/game_of_life_demo_optimized.mp4" 
                          type="video/mp4"
                        />
                      </video>
                    )}
                  </div>
                </div>

                {/* 4. Bunshi */}
                <div>
                  <div className="flex items-baseline gap-x-4 mb-2">
                    <a href="https://bunshi.ue.r.appspot.com/" target="_blank" className="custom-link">
                      <h1 className="text-2xl md:text-4xl font-bold">Bunshi</h1>
                    </a>
                    <div className="text-sm md:text-lg self-baseline space-x-2">
                      <a href='https://github.com/hvrc/bunshi' target="_blank">
                        Github
                      </a>
                    </div>
                  </div>
                  <p className="text-sm md:text-lg text-left">
                    Displays the bond line structure of any chemical <br/>
                    Using <b>Python, Flask, BeautifulSoup, Google Cloud Platform</b>
                  </p>
                  <div className="mt-4 w-full rounded-lg overflow-hidden">
                    <div className="flex flex-col gap-4">
                      <img 
                        src="/images/demos/bunshi_demo_1.png" 
                        alt="Bunshi Demo 1"
                        className="w-full rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Loan Reports */}
                <div className="transition-opacity duration-1000 ease-in-out">
                  <div className="flex items-baseline gap-x-4 mb-2">
                    <a href="https://github.com/hvrc/reportsapi" target="_blank" className="custom-link">
                      <h1 className="text-2xl md:text-4xl font-bold">Loan Reports</h1>
                    </a>
                  </div>
                  <p className="text-sm md:text-lg text-left">
                    API that Generates custom loan reports and visualizes data <br/>
                    Using <b>Python, Pandas, High charts, Django</b>
                  </p>
                  <div className="mt-4 w-full rounded-lg overflow-hidden">
                    <img 
                      src="/images/demos/reports_demo.png" 
                      alt="Loan Reports Demo"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* 6. Newsletter Generator */}
                <div className="transition-opacity duration-1000 ease-in-out">
                  <div className="flex items-baseline gap-x-4 mb-2">
                    <a href="https://newsletter-419717.an.r.appspot.com/newsletter-app/" target="_blank" className="custom-link">
                      <h1 className="text-2xl md:text-4xl font-bold">Newsletter Generator</h1>
                    </a>
                    <div className="text-sm md:text-lg self-baseline space-x-2">
                      <a href='https://github.com/hvrc/newsletter' target="_blank">
                        Github
                      </a>
                    </div>
                  </div>
                  <p className="text-sm md:text-lg text-left">
                    Web application that takes links to articles from client's news website and generates .html newsletters <br/>
                    Using <b>Python, Flask, BeautifulSoup, Google Cloud Platform</b>
                  </p>
                  <div className="mt-4 w-full rounded-lg overflow-hidden">
                    <img 
                      src="/images/demos/newsletter_demo.png" 
                      alt="Newsletter Generator Demo"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* 7. Shutdown Scheduler */}
                <div>
                  <div className="flex items-baseline gap-x-4 mb-2">
                    <a href="https://github.com/hvrc/shutdowner" target="_blank" className="custom-link">
                      <h1 className="text-2xl md:text-4xl font-bold">Shutdown Scheduler</h1>
                    </a>
                    <div className="text-sm md:text-lg self-baseline space-x-2">
                      <a href='https://github.com/hvrc/shutdowner/releases/download/v1.1.0/shutdowner-windows.zip' target="_blank">
                        Download
                      </a>
                    </div>
                  </div>
                  <p className="text-sm md:text-lg text-left">
                    Windows app to schedule a shutdown <br/>
                    Using <b>Python & Tkinter</b>
                  </p>
                  <div className="mt-4 w-full rounded-lg overflow-hidden">
                    <img 
                      src="/images/demos/shutdowner_demo.png" 
                      alt="Shutdown Scheduler Demo"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* 8. MIDI Controller */}
                <div>
                  <div className="flex items-baseline gap-x-4 mb-2">
                    <a href="https://github.com/hvrc/midicontroller" target="_blank" className="custom-link">
                      <h1 className="text-2xl md:text-4xl font-bold">Midi Controller</h1>
                    </a>
                  </div>
                  <p className="text-sm md:text-lg text-left">
                    A MIDI controller with buttons and potentiometers to control a DAW <br/>
                    Using <b>C++ and Arduino</b>
                  </p>
                  <div className="mt-4 w-full rounded-lg overflow-hidden">
                    <img 
                      src="/images/demos/midicontroller_demo.png" 
                      alt="MIDI Controller Demo"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* 9. Prim's Organism */}
                <div>
                  <div className="flex items-baseline gap-x-4 mb-2">
                    <Link href="/prim" target="_blank" className="custom-link">
                      <h1 className="text-2xl md:text-4xl font-bold">Prim's Organism</h1>
                    </Link>
                  </div>
                  <p className="text-sm md:text-lg text-left">
                    A game based on Prim's Maze Generation Algorithm <br/>
                    Using <b>React with JSX</b>
                  </p>
                  <div className="mt-4 w-full rounded-lg overflow-hidden">
                  </div>
                </div>

                {/* 10. PNG to PLT */}
                <div>
                  <div className="flex items-baseline gap-x-4 mb-2">
                    <a href="https://github.com/hvrc/pngtoplt" target="_blank" className="custom-link">
                      <h1 className="text-2xl md:text-4xl font-bold">PNG to PLT</h1>
                    </a>
                  </div>
                  <p className="text-sm md:text-lg text-left">
                    Converts a .png file of a qr code into a .plt file used by laser engravers <br/>
                    Using <b>Python, Prolog, HP-GL</b>
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* experience */}
      <section id="experience" className={`p-6 space-y-8 ${experienceLoaded ? 'fade-in' : 'opacity-0'}`}>
        <div className="border border-gray-300 p-6 space-y-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-left">Freelance Software Developer</h1> <br />
            <p className="text-sm md:text-lg text-left">Getafix Design, Independent | Sep 2020 - Present (4+ years) | Remote</p>
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-left">Software Developer  /  Integration Engineer</h1> <br />
            <p className="text-sm md:text-lg text-left">Healthy Planet | Feb 2022 - May 2025 (3 years 4 months) | Toronto, Canada</p>
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-left">Data Analyst</h1> <br />
            <p className="text-sm md:text-lg text-left">Gromor Finance | Jun 2019 - Aug 2020 (1 year 3 months) | Mumbai, India</p>
          </div>
        </div>
      </section>

      {/* footer, contact */}
      <br /><br /><br /><br /><br />
      <section id="contact" className={`p-8 text-center ${contactLoaded ? 'fade-in' : 'opacity-0'}`}>
        <h1 className="text-lg md:text-xl font-bold">harshrajmachikar@gmail.com</h1>
      </section>
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
    </div>
  );
}
