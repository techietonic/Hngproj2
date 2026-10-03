import React, { useState } from 'react';
import { Menu, X, Search, UserRound, ShoppingBag } from 'lucide-react';
import { User } from '../types/store';

interface HeaderProps {
  currentView: string;
  cartCount: number;
  user: User | null;
  onNavigate: (view: string, params?: Record<string, string>) => void;
  onOpenBag: () => void;
  onSearchSubmit: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  cartCount,
  user,
  onNavigate,
  onOpenBag,
  onSearchSubmit,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onSearchSubmit(searchQuery.trim());
    setSearchOpen(false);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { id: 'shop', label: 'SHOP' },
    { id: 'collection', label: 'COLLECTIONS' },
    { id: 'lookbook', label: 'LOOKBOOK' },
    { id: 'journal', label: 'JOURNAL' },
    { id: 'about', label: 'ABOUT' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/90 backdrop-blur-md transition-colors border-b border-[#161514]/[0.05]">
      {/* Editorial Single-Row Top Bar Contract */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-10 lg:px-16 py-3.5 sm:py-5 flex items-center justify-between gap-3">
        {/* Zone 1: Brand Wordmark & Mobile Trigger */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-1.5 -ml-1.5 text-[#161514] hover:opacity-60 transition-opacity cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4 stroke-[1.25]" />
            ) : (
              <Menu className="w-4 h-4 stroke-[1.25]" />
            )}
          </button>

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
            className="font-editorial text-[18px] sm:text-[23px] font-light tracking-[0.22em] sm:tracking-[0.3em] uppercase text-[#161514] hover:opacity-75 transition-opacity whitespace-nowrap"
          >
            AYÉ STUDIO
          </a>
        </div>

        {/* Zone 2: Light Minimalist Navigation */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-12">
          {navLinks.map((item) => {
            const active = currentView === item.id;
            return (
              <a
                key={item.id}
                href={`/?view=${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                }}
                className={`text-[11px] tracking-[0.24em] uppercase transition-colors duration-200 whitespace-nowrap ${
                  active
                    ? 'text-[#161514] font-medium'
                    : 'text-[#7D7063] hover:text-[#161514]'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Editorial Action Controls */}
        <div className="flex items-center gap-2 sm:gap-9 text-[11px] tracking-[0.24em] uppercase shrink-0">
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search"
            className="p-2 sm:p-0 text-[#7D7063] hover:text-[#161514] transition-colors cursor-pointer whitespace-nowrap"
          >
            <Search className="w-4 h-4 sm:hidden" />
            <span className="hidden sm:inline">SEARCH</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('account')}
            aria-label={user ? 'Open account' : 'Sign in'}
            className={`p-2 sm:p-0 transition-colors cursor-pointer whitespace-nowrap ${
              currentView === 'account'
                ? 'text-[#161514] font-medium'
                : 'text-[#7D7063] hover:text-[#161514]'
            }`}
          >
            <UserRound className="w-4 h-4 sm:hidden" />
            <span className="hidden sm:inline">{user ? user.name.split(' ')[0].toUpperCase() : 'ACCOUNT'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenBag}
            aria-label={`Open bag${cartCount ? `, ${cartCount} items` : ''}`}
            className="p-2 sm:p-0 text-[#161514] hover:opacity-70 transition-opacity cursor-pointer font-medium whitespace-nowrap"
          >
            <span className="inline-flex items-center gap-1"><ShoppingBag className="w-4 h-4 sm:hidden" /><span className="hidden sm:inline">BAG</span>{cartCount > 0 ? <span>({cartCount})</span> : null}</span>
          </button>
        </div>
      </div>

      {/* Minimalist In-Line Search Overlay */}
      {searchOpen && (
        <div className="border-t border-[#161514]/[0.05] bg-[#FBF9F5]/98 px-6 sm:px-10 lg:px-16 py-3.5 animate-in fade-in duration-150">
          <form
            onSubmit={handleSearchForm}
            className="max-w-xl mx-auto flex items-center justify-between gap-4"
          >
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search silhouettes, materials, archival pieces..."
              autoFocus
              className="w-full bg-transparent text-[13px] text-[#161514] placeholder-[#9E9184] font-light focus:outline-none py-1 border-b border-[#161514]/20 focus:border-[#161514] transition-colors"
            />
            <div className="flex items-center gap-4 shrink-0">
              <button
                type="submit"
                className="text-[10px] tracking-[0.22em] uppercase text-[#161514] hover:opacity-60 transition-opacity cursor-pointer"
              >
                FIND
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="text-[#7D7063] hover:text-[#161514] transition-colors cursor-pointer p-1"
              >
                <X className="w-3.5 h-3.5 stroke-[1.25]" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile Editorial Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#161514]/[0.05] bg-[#FBF9F5] px-6 py-8 space-y-6 animate-in slide-in-from-top-1 duration-150">
          <nav className="flex flex-col space-y-5 text-[12px] tracking-[0.26em] uppercase">
            {navLinks.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className="text-left text-[#161514] hover:text-[#7D7063] transition-colors py-1"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                onNavigate('account');
                setMobileMenuOpen(false);
              }}
              className="text-left text-[#161514] hover:text-[#7D7063] transition-colors py-1 pt-3 border-t border-[#161514]/[0.08]"
            >
              {user ? `ACCOUNT (${user.name})` : 'ACCOUNT / SIGN IN'}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
