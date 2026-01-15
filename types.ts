export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

export interface UserProfile {
  displayName: string;
  bio: string;
  discordId: string; // Representing the username/tag
  avatarUrl: string;
  bannerUrl: string;
  tagline: string;
  friendRequestsReceived: number;
  cardBackgroundUrl?: string; // Now acts as Page Background
  keepBackgroundAudio?: boolean; // New: Toggle to keep audio from video background
  enableMouseTrail?: boolean; // New: Toggle for mouse trail
  backgroundMusicUrl?: string; // New: Custom profile music
}

export interface User {
  username: string;
  passwordHash: string; // In a real app, this would be salted/hashed securely
  profile: UserProfile;
  badges: string[]; // Array of Badge IDs
  createdAt: number;
}

export const DEFAULT_AVATAR = "https://picsum.photos/200/200?grayscale";
export const LOGO_URL = "https://i.imgur.com/aaWKLXX.png";
export const SONG_URL_1 = "https://files.catbox.moe/3rccvf.mp3"; 

export const BADGE_MAP: Record<string, { label: string, color: string, icon?: string }> = {
    'owner': { label: 'SYSTEM_OWNER', color: 'bg-red-600 text-black border border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.8)] animate-pulse' },
    'init': { label: 'INITIATE', color: 'bg-neutral-800 text-neutral-400' },
    'first_contact': { label: 'FIRST CONTACT', color: 'bg-white text-black' },
    'popular': { label: 'POPULAR', color: 'bg-neutral-200 text-black border border-white' },
    'icon': { label: 'ICON', color: 'bg-neutral-900 text-white border border-white' },
};

export enum AppRoute {
  INTRO = '/',
  LOGIN = '/login',
  REGISTER = '/register',
  DASHBOARD = '/dashboard',
  PROFILE = '/u/:username'
}