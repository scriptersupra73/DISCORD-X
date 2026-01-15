import React, { useState, useEffect, useRef } from 'react';
import { LOGO_URL, SONG_URL_1 } from '../../types';

interface IntroProps {
  onComplete: () => void;
}

export const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  const [entered, setEntered] = useState(false);
  const [fading, setFading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      // Pick random song
      const songs = [SONG_URL_1]; 
      const randomSong = songs[Math.floor(Math.random() * songs.length)];
      
      audioRef.current = new Audio(randomSong);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    } catch (e) {
      console.warn("Audio initialization failed", e);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleEnter = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio play failed (Autoplay blocked)", e));
    }
    setEntered(true);
    
    // Auto transition after logo animation
    setTimeout(() => {
        setFading(true);
        setTimeout(onComplete, 1000); // Wait for fade out
    }, 4000);
  };

  if (fading) {
    return (
      <div className="fixed inset-0 bg-black z-50 transition-opacity duration-1000 opacity-0 pointer-events-none" />
    );
  }

  if (entered) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center flex-col">
        <div className="animate-fade-in flex flex-col items-center">
             <div className="relative w-48 h-48 md:w-64 md:h-64 mb-8">
                <img 
                    src={LOGO_URL} 
                    alt="Logo" 
                    className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-pulse-slow" 
                />
            </div>
            <h1 className="text-4xl font-sans font-black tracking-[0.5em] text-white animate-fade-in mt-4">
                DISCORD <span className="text-neutral-500">X</span>
            </h1>
            <div className="mt-8 h-1 w-24 bg-neutral-800 overflow-hidden">
                <div className="h-full bg-white w-full animate-[shimmer_2s_infinite]"></div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div 
        onClick={handleEnter}
        className="fixed inset-0 bg-black z-50 flex items-center justify-center cursor-pointer hover:bg-neutral-950 transition-colors duration-500"
    >
      <div className="text-center">
        <p className="font-mono text-neutral-500 text-xs tracking-[0.3em] mb-4 uppercase animate-pulse">
            System Ready
        </p>
        <h2 className="text-white font-sans font-bold text-xl tracking-widest border border-white/20 px-8 py-4 backdrop-blur-sm hover:bg-white hover:text-black transition-all duration-300">
            CLICK TO ENTER
        </h2>
      </div>
    </div>
  );
};