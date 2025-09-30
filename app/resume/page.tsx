"use client";

import { useEffect } from 'react';

export default function Resume() {
  useEffect(() => {
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }
    
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=0.6, maximum-scale=2.0, user-scalable=yes');
    
    return () => {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
    };
  }, []);

  return (
    <div className="pdf-container w-full h-screen overflow-hidden">
      <iframe 
        src="https://drive.google.com/file/d/1b74P7LtXxCZayEgAy6uPDWAJE9Akm98E/preview"
        className="w-full h-full"
        style={{ 
          width: "100%", 
          height: "100vh", 
          border: "none",
          overflow: "hidden" 
        }}
        title="Resume PDF"
        allow="autoplay"
      />
    </div>
  );
}
