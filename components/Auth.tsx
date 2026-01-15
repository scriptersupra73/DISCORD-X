import React, { useState } from 'react';
import { AuthService } from '../services/db';
import { Button } from './ui/Button';
import { useNavigate, Link } from 'react-router-dom';
import { LOGO_URL } from '../types';

export const Auth: React.FC<{ mode: 'login' | 'register' }> = ({ mode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        if (mode === 'login') {
          const success = await AuthService.login(username, password);
          if (success) {
            navigate('/dashboard');
          } else {
            setError('INVALID CREDENTIALS');
          }
        } else {
          if (!username || !password) {
            setError('FIELDS REQUIRED');
            setLoading(false);
            return;
          }
          const success = await AuthService.register(username, password);
          if (success) {
            navigate('/dashboard');
          } else {
            setError('USERNAME TAKEN');
          }
        }
    } catch (err) {
        setError('SYSTEM ERROR');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-12 animate-fade-in">
             <img src={LOGO_URL} alt="DX" className="w-12 h-12 object-contain mx-auto mb-4 grayscale" />
             <h1 className="text-2xl font-black text-white tracking-[0.4em] uppercase">
                {mode === 'login' ? 'Identify' : 'Initialize'}
             </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-black border border-neutral-900 p-8 shadow-2xl">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-neutral-500 uppercase">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-3 focus:border-white outline-none transition-colors text-sm font-mono placeholder-neutral-800"
              placeholder="ENTER_ID"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-neutral-500 uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-3 focus:border-white outline-none transition-colors text-sm font-mono placeholder-neutral-800"
              placeholder="ACCESS_CODE"
            />
          </div>

          {error && (
            <div className="text-red-500 text-xs font-mono border border-red-900 bg-red-900/10 p-2 text-center">
              ERROR: {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'PROCESSING...' : (mode === 'login' ? 'Access System' : 'Create Record')}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link 
            to={mode === 'login' ? '/register' : '/login'} 
            className="text-xs font-mono text-neutral-500 hover:text-white transition-colors uppercase border-b border-transparent hover:border-white pb-1"
          >
            {mode === 'login' ? 'Initialize New User Protocol' : 'Existing User Identification'}
          </Link>
        </div>
      </div>
    </div>
  );
};