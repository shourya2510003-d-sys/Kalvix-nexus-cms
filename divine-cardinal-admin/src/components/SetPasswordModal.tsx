

import React, { useState } from 'react';
import { Lock, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SetPasswordModal() {
  const { token, login } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'http://127.0.0.1:4001/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/set-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to set password');
      }

      // Update auth context with new token and user
      login(data.token, data.user);
      // Reload window to refresh layout without modal
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'An error occurred while setting your password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white max-w-md w-full rounded-2xl p-8 shadow-2xl border border-luxury-gold/20 flex flex-col items-center">
        <div className="w-16 h-16 bg-luxury-gold/10 rounded-full flex items-center justify-center mb-6">
          <Lock className="h-8 w-8 text-luxury-gold" />
        </div>
        
        <h2 className="font-serif text-2xl text-luxury-charcoal tracking-wide mb-2">Secure Your Account</h2>
        <p className="text-sm text-gray-500 text-center mb-8 font-sans">
          Welcome to your store dashboard! Since this is your first time logging in, please set a permanent password for your admin account.
        </p>

        {error && (
          <div className="w-full bg-red-50 border-l-2 border-red-500 p-3 rounded text-xs text-red-700 font-sans mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="space-y-1">
            <label className="font-sans font-medium text-luxury-charcoal uppercase tracking-widest text-[10px] block">
              New Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-luxury-cream/35 border border-luxury-gold/20 focus:border-luxury-gold rounded-md px-4 py-3 outline-none font-sans text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="font-sans font-medium text-luxury-charcoal uppercase tracking-widest text-[10px] block">
              Confirm Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-luxury-cream/35 border border-luxury-gold/20 focus:border-luxury-gold rounded-md px-4 py-3 outline-none font-sans text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password || !confirmPassword}
            className="w-full bg-black text-white hover:bg-gray-800 py-4 rounded-md font-sans uppercase tracking-[0.2em] font-medium transition-colors shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4.5 w-4.5 text-luxury-gold" />
                <span>Save Password</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
