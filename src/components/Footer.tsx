import React, { useState } from 'react';
import { api } from '../lib/api';

interface FooterProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
  onOpenPolicy: (policy: 'shipping' | 'privacy' | 'care') => void;
  onOpenDiagnostic?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPolicy, onOpenDiagnostic }) => {
  const [email, setEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setErrorMsg(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const msg = await api.subscribeNewsletter(email.trim());
      setStatusMsg(msg);
      setEmail('');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to subscribe.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#EFECE5] border-t border-[#161514]/15 text-[#161514] mt-24">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-14 border-b border-[#161514]/12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-6 space-y-2">
            <p className="text-[11px] font-mono-num uppercase tracking-[0.18em] text-[#5A4638]">
              STUDIO DISPATCH
            </p>
            <h2 className="font-editorial text-[28px] sm:text-[32px] font-normal text-[#161514] leading-snug">
              Private lookbook releases and Victoria Island studio appointments.
            </h2>
          </div>

          <div className="lg:col-span-6">
            <form
              onSubmit={handleSubscribe}
              noValidate
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                aria-label="Email address for newsletter"
                className="flex-1 px-4 py-3 bg-[#FAF8F5] border border-[#161514]/25 text-[13px] text-[#161514] placeholder-[#786B5E] focus:outline-none focus:border-[#161514]"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-7 py-3 bg-[#161514] text-[#F7F5F0] text-[11px] tracking-[0.18em] uppercase whitespace-nowrap hover:bg-[#3E3027] disabled:opacity-50 transition-colors cursor-pointer"
              >
                {submitting ? 'Registering...' : 'Subscribe'}
              </button>
            </form>
            {statusMsg && (
              <p className="mt-2.5 text-[12px] text-[#3E3027]">{statusMsg}</p>
            )}
            {errorMsg && (
              <p className="mt-2.5 text-[12px] text-[#7C4D36]">{errorMsg}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          <div className="lg:col-span-4 space-y-4">
            <div className="font-editorial text-[22px] tracking-[0.24em] uppercase text-[#161514]">
              AYÉ STUDIO
            </div>
            <p className="text-[13px] text-[#3E3027] leading-relaxed max-w-sm">
              Independent womenswear label founded in Lagos. Patterned, cut, and finished in small runs at our Victoria Island atelier using hand-loomed Nigerian cotton, bias silk, and tropical wool.
            </p>
            <div className="text-[12px] text-[#5A4638] space-y-0.5 pt-1">
              <p>14A Akin Olugbade Street, Victoria Island, Lagos</p>
              <p>Mon – Sat · 10:00 – 18:30 WAT</p>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <div className="text-[11px] font-mono-num uppercase tracking-[0.16em] text-[#5A4638]">
              Shop
            </div>
            <ul className="space-y-2.5 text-[13px] text-[#161514]">
              {[
                { label: 'All Garments', category: 'All' },
                { label: 'Dresses', category: 'Dresses' },
                { label: 'Tops & Shirts', category: 'Tops & Shirts' },
                { label: 'Trousers & Skirts', category: 'Trousers & Skirts' },
                { label: 'Outerwear', category: 'Outerwear' },
                { label: 'Leather Goods', category: 'Leather Goods' },
              ].map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => onNavigate('shop', { category: link.category })}
                    className="hover:text-[#5A4638] transition-colors cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <div className="text-[11px] font-mono-num uppercase tracking-[0.16em] text-[#5A4638]">
              Customer Care
            </div>
            <ul className="space-y-2.5 text-[13px] text-[#161514]">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy('shipping')}
                  className="hover:text-[#5A4638] transition-colors cursor-pointer"
                >
                  Shipping &amp; Returns
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy('care')}
                  className="hover:text-[#5A4638] transition-colors cursor-pointer"
                >
                  Garment Care &amp; Alterations
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy('privacy')}
                  className="hover:text-[#5A4638] transition-colors cursor-pointer"
                >
                  Privacy &amp; Terms
                </button>
              </li>
              {onOpenDiagnostic && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenDiagnostic}
                    className="hover:text-[#5A4638] transition-colors cursor-pointer text-[#8D7F73]"
                  >
                    Database Diagnostics
                  </button>
                </li>
              )}
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('account')}
                  className="hover:text-[#5A4638] transition-colors cursor-pointer"
                >
                  Client Account &amp; Orders
                </button>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <div className="text-[11px] font-mono-num uppercase tracking-[0.16em] text-[#5A4638]">
              Contact
            </div>
            <ul className="space-y-2.5 text-[13px] text-[#161514]">
              <li>
                <a
                  href="mailto:atelier@ayestudio.lagos"
                  className="hover:text-[#5A4638] transition-colors"
                >
                  atelier@ayestudio.lagos
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#5A4638] transition-colors"
                >
                  Instagram (@ayestudio.lagos)
                </a>
              </li>
              <li className="text-[#5A4638] font-mono-num text-[12px] pt-1">
                +234 (0) 908 412 0900
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-[#161514]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-[#5A4638]">
          <span>© {new Date().getFullYear()} AYÉ STUDIO LAGOS. All rights reserved.</span>
          <span>Made in Lagos · Cut for everywhere.</span>
        </div>
      </div>
    </footer>
  );
};
