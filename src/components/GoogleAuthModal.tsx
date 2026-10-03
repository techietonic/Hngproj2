import React, { useState } from 'react';
import { X } from 'lucide-react';
import { setAuthToken } from '../lib/api';
import { User } from '../types/store';

interface GoogleAuthModalProps { isOpen: boolean; onClose: () => void; onSuccess: (user: User) => void; }

async function readAuthResponse(response: Response): Promise<{ url?: string; error?: string }> {
  const body = await response.text();
  try {
    return JSON.parse(body) as { url?: string; error?: string };
  } catch {
    throw new Error(
      response.ok
        ? 'Google sign-in returned an invalid response. Please try again.'
        : `Google sign-in is temporarily unavailable (${response.status}). Please try again.`
    );
  }
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!isOpen) return null;

  const startGoogleSignIn = async () => {
    setLoading(true); setError(null);
    try {
      const response = await fetch('/api/auth/google/url');
      const data = await readAuthResponse(response);
      if (!response.ok || !data.url) throw new Error(data.error || 'Google sign-in is not configured.');
      const popup = window.open(data.url, 'aye_google_oauth', 'width=520,height=680,noopener=no');
      if (!popup) throw new Error('Your browser blocked the Google sign-in window. Please allow pop-ups and try again.');
      const receiveAuth = (event: MessageEvent) => {
        if (event.origin !== window.location.origin || event.data?.type !== 'AYE_GOOGLE_AUTH_SUCCESS') return;
        const payload = event.data.payload as { user: User; token: string };
        setAuthToken(payload.token); window.removeEventListener('message', receiveAuth); setLoading(false);
        onSuccess(payload.user); onClose();
      };
      window.addEventListener('message', receiveAuth);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.'); setLoading(false);
    }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#161514]/55 p-4 backdrop-blur-xs">
    <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
    <div className="relative z-10 w-full max-w-md bg-[#FAF8F5] border border-[#161514]/20 p-7 sm:p-9 shadow-2xl">
      <button type="button" onClick={onClose} aria-label="Close sign-in modal" className="absolute right-5 top-5 text-[#5A4638] hover:text-[#161514] p-1 cursor-pointer"><X className="w-4 h-4" /></button>
      <p className="text-[11px] font-mono-num uppercase tracking-[0.14em] text-[#5A4638]">Google Cloud OAuth 2.0</p>
      <h3 className="mt-3 font-editorial text-[27px] text-[#161514] leading-tight">Sign in securely</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-[#5A4638]">Continue with your verified Google account to save delivery details and view your orders.</p>
      {error && <div className="mt-5 p-3 bg-[#7C4D36]/10 border border-[#7C4D36]/30 text-[12px] text-[#7C4D36]">{error}</div>}
      <button type="button" disabled={loading} onClick={startGoogleSignIn} className="mt-6 w-full py-3 px-5 bg-[#161514] text-[#F7F5F0] text-[11px] tracking-[0.16em] uppercase hover:bg-[#3E3027] disabled:opacity-50 cursor-pointer">{loading ? 'Opening Google…' : 'Continue with Google'}</button>
    </div>
  </div>;
};
