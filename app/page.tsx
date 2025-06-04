"use client";

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [resumeLink, setResumeLink] = useState('/resume');
  const [showAllProjects, setShowAllProjects] = useState(false);

  // useEffect(() => {
  //   const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  //   if (isIOS) {
  //     setResumeLink('https://drive.google.com/file/d/12fquEKoM93U2SjwHcsw_CwyCZnZh7viF/view?usp=sharing');
  //   }
  // }, []);

  return (
    <div className="max-w-[95%] sm:max-w-[80%] md:max-w-[65%] lg:max-w-[50%] mx-auto space-y-8 px-4">
      {/* title */}
      <section id="header" className="flex justify-center items-center p-8 top-0 bg-opacity-50 z-10">
        <div className="w-full text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold">Harsh Rajmachikar</h1>
          <p className="text-lg md:text-xl">making things on a computer</p>
        </div>
      </section>

      {/* floater */}
      <div className="fixed top-0 right-4 md:right-8 p-4 z-20">
        <div className="flex flex-col space-y-1 text-right text-sm md:text-base">
          <a href="https://www.instagram.com/hvrc2000" target="_blank" rel="noopener noreferrer">instagram</a>
          <a href="https://www.youtube.com/@hvrc0" target="_blank" rel="noopener noreferrer">youtube</a>
          <a href="https://github.com/hvrc" target="_blank" rel="noopener noreferrer">github</a>
          <a href="https://www.linkedin.com/in/hvrc/" target="_blank" rel="noopener noreferrer">linkedin</a>
          <a href={resumeLink} target="_blank" rel="noopener noreferrer">resume</a>
        </div>
      </div>

      {/* projects */}
      <section id="projects" className="p-6 space-y-6">
        <div className="relative">
          {/* This button is positioned at the bottom border - only shows when collapsed */}
          <button 
            onClick={() => setShowAllProjects(true)}
            className={`absolute left-1/2 transform -translate-x-1/2 bottom-0 translate-y-1/2 z-10 px-6 py-1 bg-[#f1ebe5] text-gray-500 hover:text-gray-700 transition-colors ${showAllProjects ? 'hidden' : 'block'}`}
          >
            Show All
          </button>
          
          <div className="border border-gray-300 p-5 space-y-6">
            {/* highlighted projects */}
            <div className="transition-opacity duration-1000 ease-in-out">
              <div className="flex items-baseline gap-x-4 mb-1">
                <a href="https://carrom-461712.ue.r.appspot.com/" target="_blank" className="custom-link">
                  <h1 className="text-2xl md:text-4xl font-bold">Carrom</h1>
                </a>
                <div className="text-sm md:text-lg self-baseline space-x-2">
                  <a href='https://github.com/hvrc/carrom' target="_blank">
                    Github
                  </a>
                </div>
              </div>
              <p className="text-sm md:text-lg text-left">
                Indian tabletop game similar to billiards <br/>
                Using <b>Phaser.js, Express.js, Node.js</b>
              </p>
            </div>

            <div className="transition-opacity duration-1000 ease-in-out">
              <div className="flex items-baseline gap-x-4 mb-1">
                <a href="http://boteh-461905.appspot.com/" target="_blank" className="custom-link">
                  <h1 className="text-2xl md:text-4xl font-bold">Boteh</h1>
                </a>
                <div className="text-sm md:text-lg self-baseline space-x-2">
                  <a href='https://github.com/hvrc/boteh' target="_blank">
                    Github
                  </a>
                </div>
              </div>
              <p className="text-sm md:text-lg text-left">
                Synthesizer that plays with hand gestures through webcam tracking<br/>
                Using <b>Google MediaPipe, Web Audio API, Node.js</b>
              </p>
            </div>

            <div className="transition-opacity duration-1000 ease-in-out mb-0">
              <div className="flex items-baseline gap-x-4 mb-1">
                <a href="https://carrom-461712.ue.r.appspot.com/" target="_blank" className="custom-link">
                  <h1 className="text-2xl md:text-4xl font-bold">Place</h1>
                </a>
              </div>
              <p className="text-sm md:text-lg text-left">
                Portfolio page showcasing projects<br/>
                Using <b>Typescript, React, Tailwind CSS, Next.js</b>
              </p>
            </div>

            {/* Show Less button that appears between highlighted and hidden projects */}
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
                </div>

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
                </div>

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
                </div>

                <div>
                  <div className="flex items-baseline gap-x-4 mb-2">
                    <a href="/hom" target="_blank" className="custom-link">
                      <h1 className="text-2xl md:text-4xl font-bold">hom</h1>
                    </a>
                  </div>
                  <p className="text-sm md:text-lg text-left">
                    Generative art created using flocking, dithering and other algorithms <br/>
                    Using <b>p5.js</b>
                  </p>
                </div>

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
                </div>

                <div>
                  <div className="flex items-baseline gap-x-4 mb-2">
                    <a href="https://carrom-461712.ue.r.appspot.com/" target="_blank" className="custom-link">
                      <h1 className="text-2xl md:text-4xl font-bold">Prim's Organism</h1>
                    </a>
                  </div>
                  <p className="text-sm md:text-lg text-left">
                    A game based on Prim's Maze Generation Algorithm <br/>
                    Using <b>React with JSX</b>
                  </p>
                </div>

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
                </div>

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
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* experience */}
      <section id="experience" className="p-6 space-y-8">
        <div className="border border-gray-300 p-6 space-y-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-left">Software Developer</h1> <br />
            <p className="text-sm md:text-lg text-left">Healthy Planet | Feb 2022 - Present | Toronto, Canada</p>
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-left">Freelance Software Developer</h1> <br />
            <p className="text-sm md:text-lg text-left">Getafix Design, Independent | Sep 2020 - Jan 2022 | Remote</p>
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-left">Data Analyst</h1> <br />
            <p className="text-sm md:text-lg text-left">Gromor Finance | Jun 2019 - Aug 2020 | Mumbai, India</p>
          </div>
        </div>
      </section>

      {/* footer, contact */}
      <br /><br /><br /><br /><br />
      <section id="contact" className="p-8 text-center">
        <h1 className="text-lg md:text-xl font-bold">harshrajmachikar@gmail.com</h1>
      </section>
      <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
    </div>
  );
}
