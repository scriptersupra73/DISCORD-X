import { User, UserProfile, DEFAULT_AVATAR } from '../types';

const DB_NAME = 'discord_x_db';
const DB_VERSION = 2; // Incremented for schema changes
const STORE_USERS = 'users';
const STORE_LOGS = 'audit_logs';
const SESSION_KEY = 'discord_x_session';
const INTERACTION_KEY = 'dx_interaction_history';

// --- IndexedDB Helpers ---

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Store 1: Users
      if (!db.objectStoreNames.contains(STORE_USERS)) {
        db.createObjectStore(STORE_USERS, { keyPath: 'username' });
      }

      // Store 2: Audit Logs (New for V2)
      if (!db.objectStoreNames.contains(STORE_LOGS)) {
        const logStore = db.createObjectStore(STORE_LOGS, { keyPath: 'id', autoIncrement: true });
        logStore.createIndex('timestamp', 'timestamp', { unique: false });
        logStore.createIndex('type', 'type', { unique: false });
      }
    };
  });
};

const dbAction = async <T>(storeName: string, mode: IDBTransactionMode, callback: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = callback(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// --- Internal Logger ---
const logEvent = async (type: string, details: any) => {
    try {
        await dbAction(STORE_LOGS, 'readwrite', (store) => store.add({
            type,
            details,
            timestamp: Date.now(),
            sessionId: localStorage.getItem(SESSION_KEY) || 'ANONYMOUS'
        }));
    } catch (e) {
        console.warn("Audit Log Failed", e);
    }
};

// --- Auth Service (Async) ---

export const AuthService = {
  login: async (username: string, password: string): Promise<boolean> => {
    try {
      const user = await dbAction<User>(STORE_USERS, 'readonly', (store) => store.get(username));
      if (user && user.passwordHash === password) {
        localStorage.setItem(SESSION_KEY, username);
        await logEvent('AUTH_LOGIN_SUCCESS', { username });
        return true;
      }
      await logEvent('AUTH_LOGIN_FAIL', { username });
      return false;
    } catch (e) {
      console.error("Login Error:", e);
      return false;
    }
  },

  register: async (username: string, password: string): Promise<boolean> => {
    try {
      const existing = await dbAction<User>(STORE_USERS, 'readonly', (store) => store.get(username));
      if (existing) return false;

      // OWNER ACCOUNT LOGIC
      let badges = ['init'];
      let tagline = "Discord X User";
      let bio = "I am a mystery.";
      
      if (username.toLowerCase() === 'discord x') {
          if (password !== 'discordxadmin123') {
              console.warn("Unauthorized attempt to access Owner credentials.");
              return false; // Prevent registration of this name without correct password
          }
          badges = ['owner', 'icon', 'popular', 'first_contact'];
          tagline = "SYSTEM OVERLORD";
          bio = "Access Level: ROOT // The architect of the void.";
      }

      const newUser: User = {
        username,
        passwordHash: password,
        createdAt: Date.now(),
        badges: badges,
        profile: {
          displayName: username,
          bio: bio,
          discordId: username,
          avatarUrl: DEFAULT_AVATAR,
          bannerUrl: "https://picsum.photos/800/300?grayscale",
          tagline: tagline,
          friendRequestsReceived: 0,
          cardBackgroundUrl: "",
          keepBackgroundAudio: false,
          enableMouseTrail: true,
          backgroundMusicUrl: ""
        }
      };

      await dbAction(STORE_USERS, 'readwrite', (store) => store.put(newUser));
      localStorage.setItem(SESSION_KEY, username);
      await logEvent('AUTH_REGISTER', { username, type: badges.includes('owner') ? 'OWNER_CREATION' : 'STANDARD' });
      return true;
    } catch (e) {
      console.error("Register Error:", e);
      return false;
    }
  },

  logout: () => {
    logEvent('AUTH_LOGOUT', { username: localStorage.getItem(SESSION_KEY) });
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: async (): Promise<User | null> => {
    const username = localStorage.getItem(SESSION_KEY);
    if (!username) return null;
    try {
      return await dbAction<User>(STORE_USERS, 'readonly', (store) => store.get(username));
    } catch {
      return null;
    }
  },

  getUserByUsername: async (username: string): Promise<User | null> => {
    try {
      return await dbAction<User>(STORE_USERS, 'readonly', (store) => store.get(username));
    } catch {
      return null;
    }
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    const username = localStorage.getItem(SESSION_KEY);
    if (!username) return;
    
    try {
      const user = await dbAction<User>(STORE_USERS, 'readonly', (store) => store.get(username));
      if (user) {
        user.profile = { ...user.profile, ...updates };
        await dbAction(STORE_USERS, 'readwrite', (store) => store.put(user));
        await logEvent('PROFILE_UPDATE', { username, fields: Object.keys(updates) });
      }
    } catch (e) {
      console.error("Update Profile Error:", e);
      alert("Error saving profile. The file might be corrupted or too complex for the browser.");
    }
  },

  // --- Interaction Logic with Spam Protection ---

  hasInteracted: (targetUsername: string): boolean => {
      try {
          const history = JSON.parse(localStorage.getItem(INTERACTION_KEY) || '[]');
          return history.includes(targetUsername);
      } catch {
          return false;
      }
  },

  addFriendInteraction: async (targetUsername: string): Promise<boolean> => {
    try {
      // 1. Spam Check (Client Side)
      const history = JSON.parse(localStorage.getItem(INTERACTION_KEY) || '[]');
      if (history.includes(targetUsername)) {
          console.warn(`Spam Blocked: Already added ${targetUsername}`);
          return false;
      }

      // 2. Database Update
      const user = await dbAction<User>(STORE_USERS, 'readonly', (store) => store.get(targetUsername));
      if (user) {
        user.profile.friendRequestsReceived += 1;
        
        // Badge Logic
        const count = user.profile.friendRequestsReceived;
        const badges = new Set(user.badges);
        
        if (count >= 1) badges.add('first_contact');
        if (count >= 10) badges.add('popular');
        if (count >= 100) badges.add('icon');

        user.badges = Array.from(badges);
        await dbAction(STORE_USERS, 'readwrite', (store) => store.put(user));
        
        // 3. Update Local History (Prevent future spam)
        history.push(targetUsername);
        localStorage.setItem(INTERACTION_KEY, JSON.stringify(history));

        await logEvent('INTERACTION_FRIEND_ADD', { target: targetUsername });
        return true;
      }
      return false;
    } catch (e) {
      console.error("Interaction Error:", e);
      return false;
    }
  }
};