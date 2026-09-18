

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, Sparkles, User as UserIcon, ShieldAlert, ArrowLeft, KeyRound, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLoginPage() {
  const { user, login } = useAuth();
  const router = useNavigate();
  
  const [selectedRole, setSelectedRole] = useState<'admin' | 'customer' | null>('admin');
  const [loginMethod, setLoginMethod] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [step, setStep] = useState<'LOGIN' | 'OTP_VERIFY'>('LOGIN');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'http://127.0.0.1:4001/api';

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        router('/admin/dashboard');
      } else {
        router('/dashboard');
      }
    }
  }, [user, router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (loginMethod === 'PASSWORD') {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        
        login(data.token, data.user, rememberMe);
        router('/admin/dashboard');
      } else {
        // Request OTP
        const res = await fetch(`${API_URL}/auth/email-otp/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
        
        setSuccess('OTP has been sent to your email.');
        setStep('OTP_VERIFY');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/email-otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid OTP');

      // Login to context. We pass token and user.
      login(data.token, { ...data.user, requiresPasswordSetup: data.requiresPasswordSetup }, rememberMe);
      
      // We will handle requiresPasswordSetup in the admin layout
      router('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-cream flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-luxury-gold/5 via-transparent to-luxury-gold/5 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-luxury-gold/5 filter blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-luxury-gold/5 filter blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center flex flex-col items-center space-y-2">
          <Link to="/" className="font-serif text-3xl sm:text-4xl tracking-[0.2em] text-luxury-charcoal hover:opacity-90 transition-opacity uppercase">
            {typeof window !== 'undefined' ? (window.location.hostname.split('.')[0] !== 'www' && window.location.hostname.split('.')[0] !== 'kalvixnexus' ? window.location.hostname.split('.')[0].charAt(0).toUpperCase() + window.location.hostname.split('.')[0].slice(1).toUpperCase() : (process.env.NEXT_PUBLIC_STORE_NAME || 'ADMIN PANEL')) : (process.env.NEXT_PUBLIC_STORE_NAME || 'ADMIN PANEL')}
          </Link>
          <span className="text-[9px] tracking-[0.45em] uppercase text-luxury-gold font-sans font-light">
            Luxurious Ayurveda
          </span>
          <div className="w-12 h-[1px] bg-luxury-gold/30 mt-4" />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 sm:px-10 border border-luxury-gold/15 rounded-lg shadow-2xl space-y-6 min-h-[400px] flex flex-col justify-center">
          
          <AnimatePresence mode="wait">
            {selectedRole === null && (
              <motion.div
                key="role-selection"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="text-center space-y-1">
                  <h2 className="font-serif text-lg text-luxury-charcoal tracking-wide">Workspace Sign In</h2>
                  <p className="text-[10px] text-luxury-gold uppercase tracking-widest font-sans font-light">Choose your login profile to continue</p>
                </div>

                <div className="space-y-4 pt-2">
                  <button
                    onClick={() => setSelectedRole('admin')}
                    disabled={loading}
                    className="w-full bg-white hover:bg-luxury-cream border border-luxury-gold text-luxury-charcoal text-left py-4 px-5 rounded-lg shadow-sm flex items-center justify-between transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2.5 bg-luxury-gold/10 rounded-full text-luxury-gold">
                        <ShieldAlert className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-sans font-semibold text-xs text-gray-900 block">Admin Dashboard Console</span>
                        <span className="text-[10px] text-gray-500 font-light block mt-0.5">Manage orders, products, and analytics</span>
                      </div>
                    </div>
                    <span className="text-xs text-luxury-gold group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </button>
                </div>
              </motion.div>
            )}

            {selectedRole === 'admin' && step === 'LOGIN' && (
              <motion.div
                key="admin-form"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <button
                  onClick={() => {
                    setSelectedRole(null);
                    setError(null);
                  }}
                  className="inline-flex items-center space-x-1.5 text-gray-500 hover:text-black text-[10px] uppercase tracking-wider"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to profiles</span>
                </button>

                <div className="text-center space-y-1">
                  <h2 className="font-serif text-lg text-luxury-charcoal tracking-wide">Admin Credentials</h2>
                  <p className="text-[10px] text-luxury-gold uppercase tracking-widest font-sans font-light">Verify security details</p>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-2 border-red-500 p-3 rounded text-xs text-red-700 font-sans">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-50 border-l-2 border-green-500 p-3 rounded text-xs text-green-700 font-sans">
                    {success}
                  </div>
                )}

                <div className="flex justify-center border-b border-luxury-gold/20 mb-4 pb-2">
                  <button
                    onClick={() => setLoginMethod('PASSWORD')}
                    className={`px-4 py-1 text-xs uppercase tracking-widest transition-colors ${loginMethod === 'PASSWORD' ? 'text-luxury-gold font-bold border-b-2 border-luxury-gold' : 'text-gray-400 hover:text-luxury-charcoal'}`}
                  >
                    Password
                  </button>
                  <button
                    onClick={() => setLoginMethod('OTP')}
                    className={`px-4 py-1 text-xs uppercase tracking-widest transition-colors ${loginMethod === 'OTP' ? 'text-luxury-gold font-bold border-b-2 border-luxury-gold' : 'text-gray-400 hover:text-luxury-charcoal'}`}
                  >
                    Email OTP
                  </button>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-5 text-xs">
                  <div className="space-y-1">
                    <label className="font-sans font-medium text-luxury-charcoal uppercase tracking-widest text-[9px] block">
                      Admin Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-luxury-gold/60" />
                      </div>
                      <input
                         type="email"
                         required
                         placeholder="you@domain.com"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className="w-full bg-luxury-cream/35 border border-luxury-gold/20 focus:border-luxury-gold rounded-md pl-10 pr-3 py-2.5 outline-none font-sans"
                      />
                    </div>
                  </div>

                  {loginMethod === 'PASSWORD' && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-sans font-medium text-luxury-charcoal uppercase tracking-widest text-[9px] block">
                          Security Password
                        </label>
                        <Link to="/admin/forgot-password" className="text-[9px] text-luxury-gold hover:underline font-sans uppercase tracking-wider">
                          Forgot Password?
                        </Link>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-4 w-4 text-luxury-gold/60" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-luxury-cream/35 border border-luxury-gold/20 focus:border-luxury-gold rounded-md pl-10 pr-10 py-2.5 outline-none font-sans"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-luxury-gold/60 hover:text-luxury-gold"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 space-y-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-black text-white hover:bg-gray-800 py-3.5 rounded-md font-sans uppercase tracking-[0.2em] font-medium transition-colors shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <span>{loginMethod === 'OTP' ? 'Sending...' : 'Verifying credentials...'}</span>
                      ) : (
                        <>
                          <Sparkles className="h-4.5 w-4.5 text-luxury-gold" />
                          <span>{loginMethod === 'OTP' ? 'Send OTP' : 'Secure Sign In'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {selectedRole === 'admin' && step === 'OTP_VERIFY' && (
              <motion.div
                key="otp-form"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <button
                  onClick={() => {
                    setStep('LOGIN');
                    setError(null);
                    setSuccess(null);
                  }}
                  className="inline-flex items-center space-x-1.5 text-gray-500 hover:text-black text-[10px] uppercase tracking-wider"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>

                <div className="text-center space-y-1">
                  <h2 className="font-serif text-lg text-luxury-charcoal tracking-wide">Enter Verification Code</h2>
                  <p className="text-[10px] text-luxury-gold uppercase tracking-widest font-sans font-light">We sent a 6-digit code to {email}</p>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-2 border-red-500 p-3 rounded text-xs text-red-700 font-sans">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-50 border-l-2 border-green-500 p-3 rounded text-xs text-green-700 font-sans">
                    {success}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-5 text-xs">
                  <div className="space-y-1">
                    <label className="font-sans font-medium text-luxury-charcoal uppercase tracking-widest text-[9px] block">
                      6-Digit OTP
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-4 w-4 text-luxury-gold/60" />
                      </div>
                      <input
                         type="text"
                         required
                         maxLength={6}
                         placeholder="123456"
                         value={otp}
                         onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                         className="w-full bg-luxury-cream/35 border border-luxury-gold/20 focus:border-luxury-gold rounded-md pl-10 pr-3 py-2.5 outline-none font-sans tracking-widest text-lg"
                      />
                    </div>
                  </div>

                  <div className="pt-4 space-y-4">
                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="w-full bg-black text-white hover:bg-gray-800 py-3.5 rounded-md font-sans uppercase tracking-[0.2em] font-medium transition-colors shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Verifying...</span>
                      ) : (
                        <>
                          <Sparkles className="h-4.5 w-4.5 text-luxury-gold" />
                          <span>Verify & Sign In</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
