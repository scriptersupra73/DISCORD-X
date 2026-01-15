import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { AuthService } from '../../services/db';
import { User, LOGO_URL, BADGE_MAP } from '../../types';
import { Button } from '../../ui/button';
import {
  UserPlus,
  ShieldCheck,
  CornerDownRight,
  Zap,
  Volume2,
  VolumeX,
  Power,
  AlertTriangle,
  CloudOff
} from 'lucide-react';
import { MouseTrail } from '../../ui/MouseTrail';

export const PublicProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [isRemoteHydrated, setIsRemoteHydrated] = useState(false);
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
        if (username) {
            // 1. Try Local DB
            const localUser = await AuthService.getUserByUsername(username);
            
            if (localUser) {
                setProfileUser(localUser);
            } else {
                // 2. Try URL Hydration (Fix for 404 on shared links)
                const encodedData = searchParams.get('data');
                if (encodedData) {
                    try {
                        const parsedProfile = JSON.parse(atob(encodedData));
                        
                        // Construct transient user object
                        const hydratedUser: User = {
                            username: username,
                            passwordHash: '', // Not needed for display
                            createdAt: Date.now(),
                            badges: ['init'], // Default badge for remote view
                            profile: parsedProfile
                        };
                        
                        // Owner spoof check logic (optional, keeps consistency)
                        if (username.toLowerCase() === 'discord x') {
                             hydratedUser.badges = ['owner', 'icon', 'popular'];
                        }

                        setProfileUser(hydratedUser);
                        setIsRemoteHydrated(true);
                    } catch (e) {
                        console.error("Failed to hydrate profile from URL", e);
                    }
                }
            }
            
            // Check spam protection status
            if (AuthService.hasInteracted(username)) {
                setAdded(true);
            }
        }
        setLoading(false);
    };
    fetchUser();
  }, [username, searchParams]);

  // Handle Separate Music Playback
  useEffect(() => {
    if (profileUser?.profile.backgroundMusicUrl) {
      audioRef.current = new Audio(profileUser.profile.backgroundMusicUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [profileUser?.profile.backgroundMusicUrl]);

  const handleConnect = () => {
    setHasInteracted(true);
    setIsPlaying(true);

    // Play Music
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Music playback failed", e));
    }

    // Play Unmuted Video (if applicable)
    if (videoRef.current && profileUser?.profile.keepBackgroundAudio) {
        videoRef.current.muted = false; // Ensure unmuted
        videoRef.current.volume = 0.5;
        videoRef.current.play().catch(e => console.log("Video playback failed", e));
    }
  };

  const toggleAudio = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);

    if (audioRef.current) {
      newState ? audioRef.current.play() : audioRef.current.pause();
    }
    
    // Toggle video audio if enabled
    if (videoRef.current && profileUser?.profile.keepBackgroundAudio) {
        videoRef.current.muted = !newState;
    }
  };

  const handleAddFriend = async () => {
    if (username && !added) {
        const success = await AuthService.addFriendInteraction(username);
        if (success) {
            setAdded(true);
            // Simulate redirect to discord protocol
            setTimeout(() => {
                window.open(`https://discord.com/users/${profileUser?.profile.discordId}`, '_blank');
            }, 800);
        } else {
            // If success is false (spam detected), we force state to added
            setAdded(true); 
        }
    }
  };

  const isVideo = (url?: string) => url && (url.match(/\.(mp4|webm|mov)$/i) || url.startsWith('data:video'));
  const hasBackgroundMedia = isVideo(profileUser?.profile.cardBackgroundUrl);
  const needsInteraction = (profileUser?.profile.backgroundMusicUrl) || (hasBackgroundMedia && profileUser?.profile.keepBackgroundAudio);
  const isOwner = profileUser?.badges.includes('owner');

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-white font-mono text-xs">ESTABLISHING CONNECTION...</div>;

  if (!profileUser) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
        <h1 className="text-4xl font-bold mb-4 text-neutral-800">404</h1>
        <div className="flex flex-col items-center gap-4 mb-8">
            <CloudOff size={48} className="text-neutral-700" />
            <p className="font-mono text-neutral-500 text-xs">
                DATA_PACKET_MISSING_IN_LOCAL_REGISTRY
            </p>
            <p className="font-sans text-neutral-400 text-sm max-w-md leading-relaxed">
                The profile you are trying to access does not exist on this terminal. 
                If this is a shared link, ensure the URL contains the encrypted <code className="bg-neutral-900 px-1 border border-neutral-800">?data=</code> payload.
            </p>
        </div>
        <Link to="/" className="border border-white px-6 py-2 hover:bg-white hover:text-black transition-all font-mono text-xs">RETURN HOME</Link>
      </div>
    );
  }

  // Interaction Overlay (Required for Autoplay and Cinematic Effect)
  if (!hasInteracted && needsInteraction) {
    return (
      <div 
        onClick={handleConnect}
        className="fixed inset-0 bg-black z-50 flex items-center justify-center cursor-pointer hover:bg-neutral-950 transition-colors"
      >
        {/* Render background behind overlay for preview if it's visual */}
        {profileUser.profile.cardBackgroundUrl && (
             <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                 {isVideo(profileUser.profile.cardBackgroundUrl) ? (
                    <video 
                        src={profileUser.profile.cardBackgroundUrl} 
                        autoPlay loop muted playsInline 
                        className="w-full h-full object-cover"
                    />
                 ) : (
                    <img 
                        src={profileUser.profile.cardBackgroundUrl} 
                        alt="bg" 
                        className="w-full h-full object-cover"
                    />
                 )}
             </div>
        )}

        <div className="text-center space-y-4 animate-fade-in relative z-10">
          <Power size={48} className={`mx-auto animate-pulse ${isOwner ? 'text-red-600' : 'text-neutral-500'}`} />
          <h2 className="text-white font-sans font-bold text-xl tracking-[0.3em] uppercase">
              {isOwner ? 'AUTHENTICATION REQUIRED' : 'Establish Connection'}
          </h2>
          <p className={`text-[10px] font-mono ${isOwner ? 'text-red-500' : 'text-neutral-600'}`}>
            {isOwner ? 'WARNING: ACCESSING SYSTEM ROOT' : 'CLICK TO INITIALIZE PROFILE PROTOCOL'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden relative selection:bg-white selection:text-black">
      
      {profileUser.profile.enableMouseTrail && <MouseTrail />}

      {/* Owner Specific: Scanlines Overlay */}
      {isOwner && (
        <div className="fixed inset-0 pointer-events-none z-50 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
      )}

      {/* Audio Controls (If any audio exists) */}
      {(profileUser.profile.backgroundMusicUrl || (hasBackgroundMedia && profileUser.profile.keepBackgroundAudio)) && (
        <button 
          onClick={toggleAudio}
          className={`fixed top-4 right-4 z-50 transition-colors bg-black/50 p-2 rounded-full border ${isOwner ? 'text-red-500 border-red-900/50 hover:text-white' : 'text-neutral-500 border-white/10 hover:text-white'}`}
        >
          {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      )}

      {/* Full Page Background Layer */}
      <div className="absolute inset-0 z-0">
          {/* Custom Page Background Media */}
          {profileUser.profile.cardBackgroundUrl && (
            <div className="absolute inset-0 w-full h-full">
                {isVideo(profileUser.profile.cardBackgroundUrl) ? (
                    <video 
                        ref={videoRef}
                        src={profileUser.profile.cardBackgroundUrl} 
                        muted={!profileUser.profile.keepBackgroundAudio || !hasInteracted} 
                        autoPlay 
                        loop 
                        playsInline 
                        className="w-full h-full object-cover opacity-60"
                    />
                ) : (
                    <img 
                        src={profileUser.profile.cardBackgroundUrl} 
                        alt="bg" 
                        className="w-full h-full object-cover opacity-60"
                    />
                )}
                {/* Dimmer Overlay */}
                <div className="absolute inset-0 bg-black/70"></div>
            </div>
          )}

         {/* Fallback Ambient Background if no custom bg */}
         {!profileUser.profile.cardBackgroundUrl && (
             <>
                <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 animate-pulse-slow ${isOwner ? 'bg-red-900' : 'bg-neutral-900'}`}></div>
                <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] opacity-5 ${isOwner ? 'bg-red-800' : 'bg-white'}`}></div>
             </>
         )}
         
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6 animate-fade-in">
        <div className={`w-full max-w-md bg-black/20 backdrop-blur-xl border p-1 shadow-[0_0_50px_rgba(0,0,0,0.8)] ${isOwner ? 'border-red-900/30 shadow-[0_0_30px_rgba(220,38,38,0.1)]' : 'border-white/10'}`}>
            
            {/* Inner Border Container / Card */}
            <div className="border border-white/5 p-8 relative overflow-hidden group min-h-[500px] flex flex-col items-center transition-all duration-500 bg-black/40">
                
                {/* Decorative Elements */}
                <div className={`absolute top-4 right-4 text-[10px] font-mono z-10 flex flex-col items-end gap-1 ${isOwner ? 'text-red-500' : 'text-neutral-500'}`}>
                    <span>{isOwner ? 'ROOT_ACCESS' : 'SECURE CONN'}</span>
                    <span className={`w-2 h-2 rounded-full animate-pulse ${isOwner ? 'bg-red-600' : 'bg-green-500'}`}></span>
                </div>
                
                <div className="absolute bottom-4 left-4 z-10">
                     <img src={LOGO_URL} alt="Logo" className="w-6 h-6 opacity-30" />
                </div>

                {/* Content Wrapper */}
                <div className="relative z-10 w-full flex flex-col items-center">

                    {/* Owner Header */}
                    {isOwner && (
                        <div className="mb-6 w-full border-b border-red-900/50 pb-2 text-center">
                            <span className="text-[10px] font-mono text-red-500 tracking-[0.5em] uppercase flex items-center justify-center gap-2">
                                <AlertTriangle size={10} /> System Administrator
                            </span>
                        </div>
                    )}

                    {/* Remote Warning */}
                    {isRemoteHydrated && !isOwner && (
                        <div className="mb-4 text-[9px] font-mono text-neutral-500 border border-neutral-800 px-2 py-1 bg-black/80">
                            REMOTE_DATA_STREAM
                        </div>
                    )}

                    {/* Avatar Section */}
                    <div className="flex justify-center mb-8 relative mt-4">
                        <div className="w-32 h-32 relative group-hover:scale-105 transition-transform duration-500">
                            <div className={`absolute inset-0 border rotate-45 ${isOwner ? 'border-red-500/50' : 'border-white/20'}`}></div>
                            <div className={`absolute inset-0 border -rotate-12 ${isOwner ? 'border-red-500/50' : 'border-white/20'}`}></div>
                            
                            <div className={`w-full h-full border-2 relative z-10 overflow-hidden bg-black ${isOwner ? 'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'border-black'}`}>
                                {isVideo(profileUser.profile.avatarUrl) ? (
                                    <video 
                                        src={profileUser.profile.avatarUrl} 
                                        autoPlay loop muted playsInline 
                                        className="w-full h-full object-cover grayscale contrast-125"
                                    />
                                ) : (
                                    <img 
                                        src={profileUser.profile.avatarUrl} 
                                        alt="Avatar" 
                                        className="w-full h-full object-cover grayscale contrast-125" 
                                    />
                                )}
                            </div>

                             {/* Online Indicator */}
                             <div className="absolute bottom-1 right-1 w-4 h-4 bg-black flex items-center justify-center z-20">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${isOwner ? 'bg-red-500' : 'bg-white'}`}></div>
                            </div>
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="text-center space-y-2 mb-8">
                        <h1 className={`text-3xl font-black tracking-tighter uppercase drop-shadow-lg flex items-center justify-center gap-2 ${isOwner ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {profileUser.profile.displayName}
                            {profileUser.badges.includes('icon') && <ShieldCheck size={18} className={isOwner ? 'text-red-500' : 'text-white'} />}
                        </h1>
                        <p className="text-xs font-mono text-neutral-400 tracking-widest uppercase bg-black/50 px-2 py-1 inline-block border border-white/10">
                            {profileUser.profile.tagline}
                        </p>
                    </div>

                    {/* Bio Box */}
                    <div className={`w-full border p-4 mb-8 text-sm leading-relaxed font-light text-center relative backdrop-blur-sm ${isOwner ? 'bg-red-950/20 border-red-900/30 text-red-200' : 'bg-neutral-900/50 border-white/5 text-neutral-300'}`}>
                        <CornerDownRight size={12} className={`absolute top-2 left-2 ${isOwner ? 'text-red-600' : 'text-neutral-600'}`} />
                        {profileUser.profile.bio}
                    </div>

                    {/* Action Button */}
                    <div className="w-full space-y-6">
                        <button 
                            onClick={handleAddFriend}
                            disabled={added}
                            className={`w-full group relative overflow-hidden py-4 px-6 border transition-all duration-300 ${added ? 'bg-white border-white text-black' : (isOwner ? 'bg-black border-red-700 text-red-500 hover:border-red-400 hover:text-red-400 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'bg-black border-neutral-700 text-white hover:border-white')}`}
                        >
                            <div className={`absolute inset-0 bg-white transform transition-transform duration-300 origin-left ${added ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
                            <span className={`relative z-10 flex items-center justify-center gap-2 font-mono uppercase text-xs tracking-[0.2em] ${added ? 'text-black' : (isOwner ? 'text-red-500 group-hover:text-black' : 'group-hover:text-black')}`}>
                                {added ? 'REQUEST SENT' : 'CONNECT ON DISCORD'}
                                {!added && <UserPlus size={14} />}
                            </span>
                        </button>
                        
                        {/* Badges Display */}
                        {profileUser.badges.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-2">
                                {profileUser.badges.map(b => (
                                    <div 
                                        key={b} 
                                        className={`px-3 py-1 border text-[9px] font-mono tracking-wider uppercase flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity cursor-help ${BADGE_MAP[b]?.color || 'border-neutral-800 text-neutral-500'}`}
                                        title={BADGE_MAP[b]?.label}
                                    >
                                        <Zap size={8} />
                                        {BADGE_MAP[b]?.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                     <div className="mt-8 pt-4 border-t border-white/5 text-center w-full relative z-10">
                        <Link to="/" className="text-[10px] font-mono text-neutral-600 hover:text-white transition-colors uppercase">
                            Powered by Discord X
                        </Link>
                    </div>

                </div>
            </div>
        </div>
      </div>
    </div>
  );
};