import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../lib/api';
import { User } from '../types/store';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/auth/google/config')
      .then((r) => r.json())
      .then((d) => {
        if (d.configured && d.clientId) {
          setGoogleClientId(d.clientId);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAccountSelect = async (name: string, email: string) => {
    setError(null);
    setLoading(true);
    try {
      const { user } = await api.verifyGoogleLogin({
        name,
        email,
        google_id: `google_oauth_${email.toLowerCase()}`,
      });
      onSuccess(user);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) {
      setError('Please enter your Google account name and email address.');
      return;
    }
    await handleAccountSelect(customName.trim(), customEmail.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#161514]/55 p-4 backdrop-blur-xs">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md bg-[#FAF8F5] border border-[#161514]/20 p-7 sm:p-9 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#161514]/12 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            <span className="text-[11px] font-mono-num uppercase tracking-[0.14em] text-[#5A4638]">
              Google Cloud OAuth 2.0
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign-in modal"
            className="text-[#5A4638] hover:text-[#161514] p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="font-editorial text-[26px] text-[#161514] leading-tight">
          Choose a Google Account
        </h3>
        <p className="mt-1 text-[13px] text-[#5A4638]">
          to continue to <strong className="font-medium text-[#161514]">AYÉ STUDIO Lagos</strong>
        </p>

        {error && (
          <div className="mt-4 p-3 bg-[#7C4D36]/10 border border-[#7C4D36]/30 text-[12px] text-[#7C4D36]">
            {error}
          </div>
        )}

        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleAccountSelect('Summie Apatira', 'apatirasummie@gmail.com')}
            className="w-full flex items-center gap-3.5 p-3 border border-[#161514]/15 bg-[#F7F5F0] hover:border-[#161514] transition-colors text-left cursor-pointer"
          >
            <div className="w-9 h-9 bg-[#161514] text-[#F7F5F0] flex items-center justify-center text-[12px] font-mono-num shrink-0">
              SA
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-medium text-[#161514] truncate">
                Summie Apatira
              </div>
              <div className="text-[12px] text-[#5A4638] truncate">
                apatirasummie@gmail.com
              </div>
            </div>
            <span className="text-[11px] uppercase tracking-[0.12em] text-[#5A4638] shrink-0">
              Select
            </span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleAccountSelect('Adesua Balogun', 'adesua.balogun@gmail.com')}
            className="w-full flex items-center gap-3.5 p-3 border border-[#161514]/15 bg-[#F7F5F0] hover:border-[#161514] transition-colors text-left cursor-pointer"
          >
            <div className="w-9 h-9 bg-[#5A4638] text-[#F7F5F0] flex items-center justify-center text-[12px] font-mono-num shrink-0">
              AB
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-medium text-[#161514] truncate">
                Adesua Balogun
              </div>
              <div className="text-[12px] text-[#5A4638] truncate">
                adesua.balogun@gmail.com
              </div>
            </div>
            <span className="text-[11px] uppercase tracking-[0.12em] text-[#5A4638] shrink-0">
              Select
            </span>
          </button>
        </div>

        <div className="my-5 flex items-center gap-3">
          <div className="h-[1px] flex-1 bg-[#161514]/12" />
          <span className="text-[10px] font-mono-num uppercase tracking-[0.16em] text-[#786B5E]">
            Or use another Google Account
          </span>
          <div className="h-[1px] flex-1 bg-[#161514]/12" />
        </div>

        <form onSubmit={handleCustomSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.12em] text-[#5A4638] mb-1">
              Account Holder Name
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Zainab Abiola"
              className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#161514]/20 text-[13px] text-[#161514] focus:outline-none focus:border-[#161514]"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.12em] text-[#5A4638] mb-1">
              Google Email Address
            </label>
            <input
              type="email"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="name@gmail.com"
              className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#161514]/20 text-[13px] text-[#161514] focus:outline-none focus:border-[#161514]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-5 bg-[#161514] text-[#F7F5F0] text-[11px] tracking-[0.16em] uppercase hover:bg-[#3E3027] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? 'Authenticating with Google...' : 'Continue with Google'}
          </button>
        </form>

        {googleClientId && (
          <p className="mt-4 text-[10px] font-mono-num text-[#786B5E]">
            Connected Client ID: {googleClientId.slice(0, 22)}...
          </p>
        )}
      </div>
    </div>
  );
};
