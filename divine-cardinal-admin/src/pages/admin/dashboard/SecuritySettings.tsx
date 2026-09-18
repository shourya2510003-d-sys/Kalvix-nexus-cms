

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { ShieldCheck, ShieldAlert, KeyRound, Loader2, Mail } from 'lucide-react';

export default function SecuritySettings() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // States for 2FA Setup
  const [otpAuthUrl, setOtpAuthUrl] = useState('');
  const [setupOtp, setSetupOtp] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // States for 2FA Disable
  const [isDisabling, setIsDisabling] = useState(false);
  const [disableCode, setDisableCode] = useState('');

  const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'http://127.0.0.1:4001/api';

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleSetup2FA = async () => {
    clearMessages();
    setLoading(true);
    try {
      const storeName = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_STORE_NAME || window.location.hostname.split('.')[0]) : 'Kalvix Nexus';
      const res = await fetch(`${API_URL}/auth/2fa/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ storeName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to setup 2FA');
      setOtpAuthUrl(data.otpAuthUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/2fa/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otp: setupOtp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to verify code');
      setSuccess('Google Authenticator successfully enabled!');
      setOtpAuthUrl('');
      setIs2FAEnabled(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDisable = async () => {
    clearMessages();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/2fa/request-disable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to request disable');
      setIsDisabling(true);
      setSuccess('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/2fa/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: disableCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to disable 2FA');
      setSuccess('Google Authenticator successfully removed.');
      setIsDisabling(false);
      setIs2FAEnabled(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold font-sans">Security Settings</h1>
        <p className="text-xs text-gray-500 mt-1">Manage your Two-Factor Authentication and security preferences.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded border border-red-200 text-xs">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded border border-green-200 text-xs">
          {success}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <ShieldCheck className="h-6 w-6 text-green-600" />
          <h2 className="text-lg font-bold font-sans">Google Authenticator (2FA)</h2>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Add an extra layer of security to your store by enabling Google Authenticator. 
          Each store can have its own unique Authenticator profile.
        </p>

        {/* SETUP FLOW */}
        {!isDisabling && (
          <div className="space-y-6">
            {!otpAuthUrl ? (
              <button
                onClick={handleSetup2FA}
                disabled={loading}
                className="bg-black text-white px-4 py-2 rounded text-sm font-bold flex items-center space-x-2 hover:bg-gray-800 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Add / Update 2FA</span>
              </button>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                <h3 className="text-sm font-bold">1. Scan this QR Code</h3>
                <p className="text-xs text-gray-500">Open Google Authenticator on your phone and scan the barcode below.</p>
                <div className="bg-white p-2 inline-block border rounded">
                  <img src={otpAuthUrl} alt="QR Code" className="w-40 h-40" />
                </div>
                
                <h3 className="text-sm font-bold mt-4">2. Verify Code</h3>
                <form onSubmit={handleEnable2FA} className="flex items-end space-x-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">6-Digit Code</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <KeyRound className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={setupOtp}
                        onChange={(e) => setSetupOtp(e.target.value.replace(/\D/g, ''))}
                        className="pl-10 pr-3 py-2 border rounded-md font-mono text-sm tracking-widest outline-none focus:border-black"
                        placeholder="000000"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || setupOtp.length < 6}
                    className="bg-black text-white px-4 py-2 rounded text-sm font-bold hover:bg-gray-800 disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Enable 2FA'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtpAuthUrl('')}
                    className="text-xs text-gray-500 hover:text-black underline ml-2"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}
            
            <div className="pt-4 border-t">
              <button
                onClick={handleRequestDisable}
                disabled={loading}
                className="text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2 rounded text-sm font-bold flex items-center space-x-2 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
                <span>Remove 2FA</span>
              </button>
              <p className="text-xs text-gray-500 mt-2">Removing 2FA requires email verification.</p>
            </div>
          </div>
        )}

        {/* DISABLE FLOW */}
        {isDisabling && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg space-y-4">
            <h3 className="text-sm font-bold text-red-800 flex items-center gap-2">
              <Mail className="h-4 w-4" /> Verify Email to Remove 2FA
            </h3>
            <p className="text-xs text-red-600">
              We have sent a 6-digit verification code to your email. Enter it below to disable Google Authenticator.
            </p>
            <form onSubmit={handleDisable2FA} className="flex items-end space-x-3">
              <div>
                <label className="block text-xs font-bold text-red-800 mb-1">Email Code</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value)}
                    className="px-3 py-2 border border-red-300 rounded-md font-mono text-sm tracking-widest outline-none focus:border-red-500 bg-white"
                    placeholder="123456"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || disableCode.length < 6}
                className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Removing...' : 'Remove 2FA'}
              </button>
              <button
                type="button"
                onClick={() => setIsDisabling(false)}
                className="text-xs text-gray-500 hover:text-black underline ml-2"
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
