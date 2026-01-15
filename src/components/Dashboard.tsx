import React, { useState, useEffect } from 'react';
import { AuthService } from '../../services/db';
import { User, LOGO_URL, BADGE_MAP } from '../../types';
import { Button } from '../../ui/button';
import { LogOut, Edit3, Eye, Award, Monitor, Music, Volume2, Share2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DragDropInput } from '../../ui/DragDropInput';

export const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    tagline: '',
    discordId: '',
    avatarUrl: '',
    cardBackgroundUrl: '',
    keepBackgroundAudio: false,
    enableMouseTrail: true,
    backgroundMusicUrl: '',
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
        const currentUser = await AuthService.getCurrentUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        setUser(currentUser);
        setFormData({
          displayName: currentUser.profile.displayName,
          bio: currentUser.profile.bio,
          tagline: currentUser.profile.tagline,
          discordId: currentUser.profile.discordId,
          avatarUrl: currentUser.profile.avatarUrl,
          cardBackgroundUrl: currentUser.profile.cardBackgroundUrl || '',
          keepBackgroundAudio: currentUser.profile.keepBackgroundAudio || false,
          enableMouseTrail: currentUser.profile.enableMouseTrail ?? true,
          backgroundMusicUrl: currentUser.profile.backgroundMusicUrl || '',
        });
    };
    loadUser();
  }, [navigate]);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/');
  };

  const handleCopyLink = () => {
    if (user) {
        const url = `${window.location.origin}/u/${user.username}`;
        navigator.clipboard.writeText(url);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await AuthService.updateProfile(formData);
    const updated = await AuthService.getCurrentUser();
    setUser(updated);
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  if (!user) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">LOADING_DATABASE...</div>;

  const isVideo = (url: string) => url.match(/\.(mp4|webm|mov)$/i) || url.startsWith('data:video');

  return (
    <div className="min-h-screen bg-black text-neutral-200 font-sans selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className="border-b border-neutral-900 bg-black/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                 <img src={LOGO_URL} alt="Logo" className="w-8 h-8 object-contain" />
                 <span className="font-bold tracking-widest text-white">DISCORD X // COMMAND</span>
            </div>
            <div className="flex items-center gap-4">
                <button 
                    onClick={handleCopyLink}
                    className="text-xs font-mono text-neutral-500 hover:text-white transition-colors flex items-center gap-2 mr-4 border border-transparent hover:border-neutral-800 px-2 py-1"
                >
                    {copyFeedback ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
                    {copyFeedback ? <span className="text-green-500">COPIED</span> : 'SHARE LINK'}
                </button>

                <button onClick={() => navigate(`/u/${user.username}`)} className="text-xs font-mono text-neutral-500 hover:text-white transition-colors flex items-center gap-2">
                    <Eye size={14} /> VIEW LIVE
                </button>
                <button onClick={handleLogout} className="text-xs font-mono text-red-500 hover:text-red-400 transition-colors flex items-center gap-2">
                    <LogOut size={14} /> DISCONNECT
                </button>
            </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Stats & Badges */}
        <div className="space-y-8">
            <div className="bg-neutral-950 border border-neutral-900 p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden">
                         {isVideo(user.profile.avatarUrl) ? (
                            <video src={user.profile.avatarUrl} autoPlay loop muted playsInline className="w-full h-full object-cover grayscale opacity-80" />
                         ) : (
                            <img src={user.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover grayscale opacity-80" />
                         )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase">{user.username}</h2>
                        <p className="text-xs font-mono text-neutral-500">ID: {Date.now().toString().slice(-6)}</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                        <span className="text-xs font-mono text-neutral-500 uppercase">Requests Received</span>
                        <span className="text-xl font-bold text-white">{user.profile.friendRequestsReceived}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                        <span className="text-xs font-mono text-neutral-500 uppercase">System Status</span>
                        <span className="text-xs font-mono text-green-500">ONLINE</span>
                    </div>
                </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-900 p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Award size={16} /> Badges
                </h3>
                <div className="flex flex-wrap gap-2">
                    {user.badges.map(badgeId => (
                        <span key={badgeId} className={`text-[10px] font-mono font-bold px-2 py-1 uppercase ${BADGE_MAP[badgeId]?.color || 'bg-neutral-800'}`}>
                            {BADGE_MAP[badgeId]?.label || badgeId}
                        </span>
                    ))}
                    {user.badges.length === 0 && <span className="text-xs text-neutral-600 font-mono">NO DATA</span>}
                </div>
            </div>
        </div>

        {/* Right Column: Editor */}
        <div className="lg:col-span-2">
            <div className="bg-neutral-950 border border-neutral-900 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Edit3 size={120} />
                </div>

                <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-8 border-b border-neutral-900 pb-4">
                    Profile Configuration
                </h3>

                <form onSubmit={handleSave} className="space-y-8">
                    {/* Basic Info Section */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-neutral-500 uppercase block">Display Name</label>
                                <input 
                                    type="text" 
                                    value={formData.displayName}
                                    onChange={e => setFormData({...formData, displayName: e.target.value})}
                                    className="w-full bg-black border border-neutral-800 text-white px-4 py-3 focus:border-white outline-none transition-colors text-sm font-sans"
                                    placeholder="Enter display name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-neutral-500 uppercase block">Discord ID (Username)</label>
                                <input 
                                    type="text" 
                                    value={formData.discordId}
                                    onChange={e => setFormData({...formData, discordId: e.target.value})}
                                    className="w-full bg-black border border-neutral-800 text-white px-4 py-3 focus:border-white outline-none transition-colors text-sm font-sans"
                                    placeholder="username#0000"
                                />
                            </div>
                        </div>

                         <div className="space-y-2">
                            <label className="text-xs font-mono text-neutral-500 uppercase block">Tagline</label>
                            <input 
                                type="text" 
                                value={formData.tagline}
                                onChange={e => setFormData({...formData, tagline: e.target.value})}
                                className="w-full bg-black border border-neutral-800 text-white px-4 py-3 focus:border-white outline-none transition-colors text-sm font-sans"
                                placeholder="Short status line"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono text-neutral-500 uppercase block">Bio</label>
                            <textarea 
                                value={formData.bio}
                                onChange={e => setFormData({...formData, bio: e.target.value})}
                                rows={4}
                                className="w-full bg-black border border-neutral-800 text-white px-4 py-3 focus:border-white outline-none transition-colors text-sm font-sans resize-none"
                                placeholder="Tell them who you are..."
                            />
                        </div>
                    </div>

                    <div className="border-t border-neutral-900 pt-6 space-y-6">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                             <Monitor size={14} /> Visual Media
                        </h4>
                        
                        <DragDropInput
                            label="Avatar (Image/MP4/GIF)"
                            value={formData.avatarUrl}
                            onChange={val => setFormData({...formData, avatarUrl: val})}
                            placeholder="https://example.com/pfp.mp4 or Drag & Drop"
                            helperText="Supports Images, MP4, WebM. Large files supported via secure DB."
                        />

                        <div className="space-y-4">
                            <DragDropInput
                                label="Page Background (Image/MP4)"
                                value={formData.cardBackgroundUrl}
                                onChange={val => setFormData({...formData, cardBackgroundUrl: val})}
                                placeholder="https://example.com/bg.mp4 or Drag & Drop"
                                helperText="Full screen background. Animated supported."
                            />
                            
                            {/* Video Audio Toggle */}
                            <div className="flex items-center gap-3 border border-neutral-900 bg-black p-4 ml-1">
                                <input 
                                    type="checkbox"
                                    id="keepAudio"
                                    checked={formData.keepBackgroundAudio}
                                    onChange={e => setFormData({...formData, keepBackgroundAudio: e.target.checked})}
                                    className="w-4 h-4 accent-white bg-black border-neutral-700"
                                />
                                <div className="flex items-center gap-2">
                                    <Volume2 size={14} className="text-neutral-500"/>
                                    <label htmlFor="keepAudio" className="text-xs font-mono text-white uppercase cursor-pointer select-none">
                                        Keep Video Audio (Unmute Background)
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                         <div className="flex items-center gap-3 border border-neutral-900 bg-black p-4">
                            <input 
                                type="checkbox"
                                id="mouseTrail"
                                checked={formData.enableMouseTrail}
                                onChange={e => setFormData({...formData, enableMouseTrail: e.target.checked})}
                                className="w-4 h-4 accent-white bg-black border-neutral-700"
                            />
                            <label htmlFor="mouseTrail" className="text-xs font-mono text-white uppercase cursor-pointer select-none">Enable Industrial Mouse Trail</label>
                        </div>
                    </div>

                     <div className="border-t border-neutral-900 pt-6 space-y-6">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                             <Music size={14} /> Audio Configuration
                        </h4>
                        <DragDropInput
                            label="Profile Background Music (MP3/WAV)"
                            value={formData.backgroundMusicUrl}
                            onChange={val => setFormData({...formData, backgroundMusicUrl: val})}
                            accept="audio/*"
                            placeholder="https://example.com/song.mp3 or Drag & Drop"
                            helperText="Separate music track. If used with video audio, both will play."
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? 'SAVING TO DB...' : 'SAVE CHANGES'}
                        </Button>
                        {isSaved && <span className="text-xs font-mono text-green-500 animate-pulse">CHANGES SAVED TO DATABASE</span>}
                    </div>
                </form>
            </div>
        </div>

      </main>
    </div>
  );
};