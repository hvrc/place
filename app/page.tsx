"use client";

import { useEffect, useState, MouseEvent, TouchEvent, JSX } from 'react';
import Link from 'next/link';

// Define Project interface to type the projects array
interface Project {
  id: string;
  title: string;
  link?: string;
  github?: string;
  download?: string;
  description: string;
  media?: JSX.Element;
  delay: string;
}

export default function HomePage() {
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [isBotehMuted, setIsBotehMuted] = useState(true);
  const [titleLoaded, setTitleLoaded] = useState(false);
  const [floaterLoaded, setFloaterLoaded] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [experienceLoaded, setExperienceLoaded] = useState(false);
  const [contactLoaded, setContactLoaded] = useState(false);
  const [nameTransform, setNameTransform] = useState({
    h1: 'H',
    a: 'A',
    r: 'R',
    s: 'S',
    h2: 'H'
  });
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [touchStartTime, setTouchStartTime] = useState<number | null>(null);
  const [touchMoved, setTouchMoved] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!titleLoaded) return;

    const transformLetters = () => {
      const randomLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
      
      let aChangeCount = 0;
      const aInterval = setInterval(() => {
        const randomLetter = randomLetters[Math.floor(Math.random() * randomLetters.length)];
        setNameTransform(prev => ({ ...prev, a: randomLetter }));
        aChangeCount++;
        if (aChangeCount >= 40) {
          clearInterval(aInterval);
          setTimeout(() => {
            setNameTransform(prev => ({ ...prev, a: 'V' }));
          }, 100);
        }
      }, 80);

      setTimeout(() => {
        let sChangeCount = 0;
        const sInterval = setInterval(() => {
          const randomLetter = randomLetters[Math.floor(Math.random() * randomLetters.length)];
          setNameTransform(prev => ({ ...prev, s: randomLetter }));
          sChangeCount++;
          if (sChangeCount >= 40) {
            clearInterval(sInterval);
            setTimeout(() => {
              setNameTransform(prev => ({ ...prev, s: 'C' }));
            }, 100);
          }
        }, 80);
      }, 800);

      setTimeout(() => {
        setNameTransform(prev => ({ ...prev, s: 'S' }));
      }, 6000);

      setTimeout(() => {
        setNameTransform(prev => ({ ...prev, a: 'A' }));
      }, 6500);
    };

    const initialTimer = setTimeout(transformLetters, 3000);
    const interval = setInterval(transformLetters, 12000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [titleLoaded]);

  useEffect(() => {
    setPageLoaded(true);
  }, []);

  useEffect(() => {
    if (pageLoaded) {
      setTitleLoaded(true);
      setFloaterLoaded(true);
      setProjectsLoaded(true);
      setExperienceLoaded(true);
      setContactLoaded(true);
    }
  }, [pageLoaded]);

  const handleTouchStart = (projectId: string, e: TouchEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && (e.target.tagName === 'A' || e.target.tagName === 'VIDEO' || e.target.tagName === 'IMG' || e.target.tagName === 'BUTTON')) return;
    setTouchStartTime(Date.now());
    setTouchMoved(false);
  };

  const handleTouchMove = () => {
    setTouchMoved(true);
  };

  const handleTouchEnd = (projectId: string, e: TouchEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && (e.target.tagName === 'A' || e.target.tagName === 'VIDEO' || e.target.tagName === 'IMG' || e.target.tagName === 'BUTTON')) return;
    
    const touchDuration = touchStartTime ? Date.now() - touchStartTime : 0;
    const isTap = touchDuration < 250 && !touchMoved; // Consider tap if duration < 250ms and no movement

    if (isTap) {
      // Single tap and release: toggle overlay on/off
      setHoveredProject(prev => (prev === projectId ? null : projectId));
    } else if (touchMoved) {
      // Tap and drag: turn overlay on and keep it on
      setHoveredProject(projectId);
    }

    setTouchStartTime(null);
    setTouchMoved(false);
  };

  const handleMouseEnter = (projectId: string) => {
    setHoveredProject(projectId);
  };

  const handleMouseLeave = () => {
    setHoveredProject(null);
  };

  const projects: Project[] = [
    {
      id: 'carrom',
      title: 'Carrom',
      link: 'https://carrom-461712.ue.r.appspot.com/',
      github: 'https://github.com/hvrc/carrom',
      description: 'Indian tabletop game similar to billiards<br/>Using <b>Phaser.js, Express.js, Node.js</b>',
      media: (
        <video className="w-full" autoPlay loop muted playsInline>
          <source src="/videos/demos/optimized/carrom_demo_optimized.mp4" type="video/mp4" />
        </video>
      ),
      delay: 'fade-in'
    },
    {
      id: 'hom',
      title: 'hom',
      link: '/hom',
      description: 'Generative art created using flocking, dithering and other algorithms<br/>Using <b>p5.js</b>',
      media: (
        <video className="w-full" autoPlay loop muted playsInline>
          <source src="/videos/demos/optimized/hom_demo_optimized.mp4" type="video/mp4" />
        </video>
      ),
      delay: 'fade-in fade-in-delay-400'
    },
    {
      id: 'game-of-life',
      title: 'Game of Life',
      link: 'https://generative-380518.ue.r.appspot.com/gameoflife',
      github: 'https://github.com/hvrc/game-of-life',
      description: 'Simulates Conway\'s Game of Life<br/>Using <b>p5.js, Flask, Google Cloud Platform</b>. Github version uses <b>Python & Pygame</b>',
      media: (
        <video className="w-full" autoPlay loop muted playsInline>
          <source src="/videos/demos/optimized/game_of_life_demo_optimized.mp4" type="video/mp4" />
        </video>
      ),
      delay: 'fade-in fade-in-delay-800'
    },
    {
      id: 'newsletter',
      title: 'Newsletter Generator',
      link: 'https://newsletter-419717.an.r.appspot.com/newsletter-app/',
      github: 'https://github.com/hvrc/newsletter',
      description: 'Web application that takes links to articles from client\'s news website and generates .html newsletters<br/>Using <b>Python, Flask, BeautifulSoup, Google Cloud Platform</b>',
      media: <img src="/images/demos/newsletter_demo.png" alt="Newsletter Generator Demo" className="w-full" />,
      delay: 'fade-in fade-in-delay-1200'
    },
    {
      id: 'shutdowner',
      title: 'Shutdown Scheduler',
      link: 'https://github.com/hvrc/shutdowner',
      download: 'https://github.com/hvrc/shutdowner/releases/download/v1.1.0/shutdowner-windows.zip',
      description: 'Windows app to schedule a shutdown<br/>Using <b>Python & Tkinter</b>',
      media: <img src="/images/demos/shutdowner_demo.png" alt="Shutdown Scheduler Demo" className="w-full" />,
      delay: 'fade-in fade-in-delay-1600'
    },
    {
      id: 'pngtoplt',
      title: 'PNG to PLT',
      link: 'https://github.com/hvrc/pngtoplt',
      description: 'Converts a .png file of a qr code into a .plt file used by laser engravers<br/>Using <b>Python, Prolog, HP-GL</b>',
      delay: 'fade-in fade-in-delay-2000'
    },
    {
      id: 'boteh',
      title: 'Boteh',
      link: 'http://boteh-461905.appspot.com/',
      github: 'https://github.com/hvrc/boteh',
      description: 'Synthesizer played with hand gestures tracked by a camera<br/>Using <b>Google MediaPipe, Web Audio API, Node.js</b>',
      media: (
        <div className="relative">
          <video className="w-full" autoPlay loop muted={isBotehMuted} playsInline>
            <source src="/videos/demos/optimized/boteh_demo_optimized.mp4" type="video/mp4" />
          </video>
          <button
            onClick={() => setIsBotehMuted(!isBotehMuted)}
            className="absolute bottom-2 right-2 text-xs md:text-sm bg-black text-white bg-opacity-25 px-3 py-1.5 rounded-full hover:bg-opacity-90 transition-all z-10"
          >
            {isBotehMuted ? 'sound off' : 'sound on'}
          </button>
        </div>
      ),
      delay: 'fade-in fade-in-delay-200'
    },
    {
      id: 'rts',
      title: 'RTS',
      link: 'https://rts0-462101.ue.r.appspot.com/',
      github: 'https://github.com/hvrc/rts',
      description: 'A word association game powered by WordNet and natural language processing<br/>Using <b>Python, WebNet, React, Vite</b>',
      media: (
        <video className="w-full" autoPlay loop muted playsInline>
          <source src="/videos/demos/optimized/rts_demo_optimized.mp4" type="video/mp4" />
        </video>
      ),
      delay: 'fade-in fade-in-delay-600'
    },
    {
      id: 'bunshi',
      title: 'Bunshi',
      link: 'https://bunshi.ue.r.appspot.com/',
      github: 'https://github.com/hvrc/bunshi',
      description: 'Displays the bond line structure of any chemical<br/>Using <b>Python, Flask, BeautifulSoup, Google Cloud Platform</b>',
      media: <img src="/images/demos/bunshi_demo_1.png" alt="Bunshi Demo 1" className="w-full" />,
      delay: 'fade-in fade-in-delay-1000'
    },
    {
      id: 'loan-reports',
      title: 'Loan Reports',
      link: 'https://github.com/hvrc/reportsapi',
      description: 'API that Generates custom loan reports and visualizes data<br/>Using <b>Python, Pandas, High charts, Django</b>',
      media: <img src="/images/demos/reports_demo.png" alt="Loan Reports Demo" className="w-full" />,
      delay: 'fade-in fade-in-delay-1400'
    },
    {
      id: 'midi-controller',
      title: 'Midi Controller',
      link: 'https://github.com/hvrc/midicontroller',
      description: 'A MIDI controller with buttons and potentiometers to control a DAW<br/>Using <b>C++ and Arduino</b>',
      media: <img src="/images/demos/midicontroller_demo.png" alt="MIDI Controller Demo" className="w-full" />,
      delay: 'fade-in fade-in-delay-1800'
    },
    {
      id: 'prims-organism',
      title: 'Prim\'s Organism',
      link: '/prim',
      description: 'A game based on Prim\'s Maze Generation Algorithm<br/>Using <b>React with JSX</b>',
      delay: 'fade-in fade-in-delay-2200'
    }
  ];

  return (
    <div className="w-full sm:max-w-[95%] md:max-w-[80%] lg:max-w-[1500px] mx-auto space-y-4 px-4 sm:px-4 pt-8">
      <style jsx>{`
        .project-container {
          position: relative;
          overflow: hidden;
          border: 2px solid black;
          width: 100%;
          max-width: 700px;
          touch-action: manipulation; /* Prevent default touch behaviors like zoom */
        }
        .project-container img, .project-container video {
          width: 100%;
          height: auto;
          display: block;
          pointer-events: none; /* Prevent media from capturing touch events */
        }
        .project-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          color: black;
          opacity: 0;
          transition: opacity 0.3s ease;
          padding: 2rem;
        }
        .project-container:hover .project-overlay {
          opacity: 1;
        }
        @media (max-width: 1024px) {
          .project-container:hover .project-overlay {
            opacity: 0;
          }
          .project-overlay.active {
            opacity: 1;
          }
        }
        .project-overlay a, .project-overlay p {
          color: black !important;
        }
        .project-overlay a:hover {
          color: #f28c38 !important;
        }
        /* Hide vsc-controller elements */
        .vsc-controller {
          display: none !important;
        }
      `}</style>

      <section id="header" className={`flex justify-center items-center p-4 top-0 bg-opacity-50 z-10 ${titleLoaded ? 'fade-in' : 'opacity-0'}`}>
        <div className="w-full text-center space-y-3">
          <h1 className="text-4xl md:text-6xl font-extrabold">
            <span className="letter-transform">{nameTransform.h1}</span>
            <span className={`letter-transform ${nameTransform.a === 'V' ? 'mechanical-switch' : ''}`}>{nameTransform.a}</span>
            <span className="letter-transform">{nameTransform.r}</span>
            <span className={`letter-transform ${nameTransform.s === 'C' ? 'mechanical-switch' : ''}`}>{nameTransform.s}</span>
            <span className="letter-transform">{nameTransform.h2}</span>
            <span> RAJMACHIKAR</span>
          </h1>
        </div>
      </section>

      <div className={`fixed top-0 right-4 md:right-8 p-4 z-20 ${floaterLoaded ? 'fade-in' : 'opacity-0'}`}>
        <div className="flex flex-col space-y-1 text-right text-sm md:text-base">
          <a href="https://www.instagram.com/hvrc2000" target="_blank" rel="noopener noreferrer">instagram</a>
          <a href="https://www.youtube.com/@hvrc0" target="_blank" rel="noopener noreferrer">youtube</a>
          <a href="https://github.com/hvrc" target="_blank" rel="noopener noreferrer">github</a>
          <a href="https://www.linkedin.com/in/hvrc/" target="_blank" rel="noopener noreferrer">linkedin</a>
          <Link href="/resume" target="_blank">resume</Link>
        </div>
      </div>

      <section id="projects" className={`p-2 sm:p-6 space-y-6 ${projectsLoaded ? 'fade-in' : 'opacity-0'}`}>
        <div className="relative">
          <div className="p-1 sm:p-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-10">
              <div className="space-y-6 lg:space-y-12">
                {/* On mobile: show all media projects first, then text projects. On desktop: split in half */}
                {(isMobile ? 
                  projects.filter(p => p.media) : 
                  projects.slice(0, 6)
                ).map(project => (
                  project.media ? (
                    <div 
                      key={project.id} 
                      className={`project-container ${projectsLoaded ? project.delay : 'opacity-0'}`} 
                      onMouseEnter={() => handleMouseEnter(project.id)}
                      onMouseLeave={() => handleMouseLeave()}
                      onTouchStart={(e) => handleTouchStart(project.id, e)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={(e) => handleTouchEnd(project.id, e)}
                    >
                      {project.media}
                      <div className={`project-overlay ${hoveredProject === project.id ? 'active' : ''}`}>
                        <div className="flex items-baseline gap-x-4 mb-1">
                          {project.link && (
                            <a href={project.link} target="_blank" className="custom-link">
                              <h1 className="text-2xl md:text-4xl font-bold">{project.title}</h1>
                            </a>
                          )}
                          {(project.github || project.download) && (
                            <div className="text-sm md:text-lg self-baseline space-x-2">
                              {project.github && <a href={project.github} target="_blank">Github</a>}
                              {project.download && <a href={project.download} target="_blank">Download</a>}
                            </div>
                          )}
                        </div>
                        <p className="text-sm md:text-lg text-center" dangerouslySetInnerHTML={{ __html: project.description }} />
                      </div>
                    </div>
                  ) : (
                    <div key={project.id} className={`${projectsLoaded ? project.delay : 'opacity-0'}`}>
                      <div className="flex items-baseline gap-x-4 mb-1">
                        {project.link && (
                          <a href={project.link} target="_blank" className="custom-link">
                            <h1 className="text-2xl md:text-4xl font-bold">{project.title}</h1>
                          </a>
                        )}
                        {(project.github || project.download) && (
                          <div className="text-sm md:text-lg self-baseline space-x-2">
                            {project.github && <a href={project.github} target="_blank">Github</a>}
                            {project.download && <a href={project.download} target="_blank">Download</a>}
                          </div>
                        )}
                      </div>
                      <p className="text-sm md:text-lg text-left" dangerouslySetInnerHTML={{ __html: project.description }} />
                    </div>
                  )
                ))}
              </div>
              <div className="space-y-6 lg:space-y-12">
                {(isMobile ? 
                  projects.filter(p => !p.media) : 
                  projects.slice(6)
                ).map(project => (
                  project.media ? (
                    <div 
                      key={project.id} 
                      className={`project-container ${projectsLoaded ? project.delay : 'opacity-0'}`} 
                      onMouseEnter={() => handleMouseEnter(project.id)}
                      onMouseLeave={() => handleMouseLeave()}
                      onTouchStart={(e) => handleTouchStart(project.id, e)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={(e) => handleTouchEnd(project.id, e)}
                    >
                      {project.media}
                      <div className={`project-overlay ${hoveredProject === project.id ? 'active' : ''}`}>
                        <div className="flex items-baseline gap-x-4 mb-1">
                          {project.link && (
                            <a href={project.link} target="_blank" className="custom-link">
                              <h1 className="text-2xl md:text-4xl font-bold">{project.title}</h1>
                            </a>
                          )}
                          {(project.github || project.download) && (
                            <div className="text-sm md:text-lg self-baseline space-x-2">
                              {project.github && <a href={project.github} target="_blank">Github</a>}
                              {project.download && <a href={project.download} target="_blank">Download</a>}
                            </div>
                          )}
                        </div>
                        <p className="text-sm md:text-lg text-center" dangerouslySetInnerHTML={{ __html: project.description }} />
                      </div>
                    </div>
                  ) : (
                    <div key={project.id} className={`${projectsLoaded ? project.delay : 'opacity-0'}`}>
                      <div className="flex items-baseline gap-x-4 mb-1">
                        {project.link && (
                          <a href={project.link} target="_blank" className="custom-link">
                            <h1 className="text-2xl md:text-4xl font-bold">{project.title}</h1>
                          </a>
                        )}
                        {(project.github || project.download) && (
                          <div className="text-sm md:text-lg self-baseline space-x-2">
                            {project.github && <a href={project.github} target="_blank">Github</a>}
                            {project.download && <a href={project.download} target="_blank">Download</a>}
                          </div>
                        )}
                      </div>
                      <p className="text-sm md:text-lg text-left" dangerouslySetInnerHTML={{ __html: project.description }} />
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-24 lg:mt-0"></div>
      <br />
      <section id="experience" className={`p-2 sm:p-6 space-y-4 ${experienceLoaded ? 'fade-in' : 'opacity-0'}`}>
        <div className="p-1 sm:p-5 space-y-4 max-w-[700px] mx-auto">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-left">Freelance Software Developer</h1> <br />
            <p className="text-sm md:text-lg text-left">Getafix Design, Independent | Sep 2020 - Present (4+ years) | Remote</p>
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-left">Software Developer / Integration Engineer</h1> <br />
            <p className="text-sm md:text-lg text-left">Healthy Planet | Feb 2022 - May 2025 (3 years 4 months) | Toronto, Canada</p>
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-left">Data Analyst</h1> <br />
            <p className="text-sm md:text-lg text-left">Gromor Finance | Jun 2019 - Aug 2020 (1 year 3 months) | Mumbai, India</p>
          </div>
        </div>
      </section>

      <br /><br /><br /><br /><br />
      <section id="contact" className={`p-8 text-center ${contactLoaded ? 'fade-in' : 'opacity-0'}`}>
        <h1 className="text-lg md:text-xl font-bold">harshrajmachikar@gmail.com</h1>
      </section>
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
    </div>
  );
}