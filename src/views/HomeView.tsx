import React, { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types/store';
import { formatNaira } from '../lib/api';
import { ProductCard } from '../components/ProductCard';

const HERO_IMAGE = '/images/hero_campaign_aw26_1790917116291.jpg';
const ATELIER_IMAGE = '/images/editorial_atelier_lagos_1790917127723.jpg';

interface HomeViewProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onNavigate: (view: string, params?: Record<string, string>) => void;
  onSelectProduct: (slug: string) => void;
  onOpenDiagnostic?: () => void;
}

const LOOKS = [
  {
    number: '01',
    title: 'Bias / volume',
    location: 'Victoria Island, Lagos',
    image: '/images/product_nia_draped_top_1790917140380.jpg',
    note: 'A fluid silk blouse with a clean shoulder line, paired with considered tailoring.',
    pieces: [
      { name: 'Nia Draped Top', slug: 'nia-draped-top', price: 165000 },
      { name: 'Tolu Wide-Leg Trouser', slug: 'tolu-wide-leg-trouser', price: 195000 },
    ],
  },
  {
    number: '02',
    title: 'The column',
    location: 'Akin Olugbade Atelier, Lagos',
    image: '/images/product_sade_column_dress_1790917152807.jpg',
    note: 'A long line, held close to the body, cut from matte crepe that moves with ease.',
    pieces: [
      { name: 'Sade Column Dress', slug: 'sade-column-dress', price: 285000 },
      { name: 'Dara Structured Bag', slug: 'dara-structured-bag', price: 320000 },
    ],
  },
  {
    number: '03',
    title: 'Quiet tailoring',
    location: 'AYÉ Studio, Lagos',
    image: '/images/product_tolu_wide_trouser_1790917162690.jpg',
    note: 'A crisp trouser with room to move, finished with a hand-pressed crease.',
    pieces: [
      { name: 'Tolu Wide-Leg Trouser', slug: 'tolu-wide-leg-trouser', price: 195000 },
      { name: 'Eko Poplin Shirt', slug: 'eko-poplin-shirt', price: 140000 },
    ],
  },
];

const JOURNAL = [
  { date: '01.10.26', title: 'Notes on coastal drape', text: 'Why Lagos humidity changes the way we choose and finish silk.' },
  { date: '24.09.26', title: 'The unbleached palette', text: 'Bone, clay, and umber: colour found in the material itself.' },
  { date: '17.09.26', title: 'Inside the seam', text: 'A closer look at the quiet construction behind every silhouette.' },
];

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  loading,
  error,
  onNavigate,
  onSelectProduct,
  onOpenDiagnostic,
}) => {
  const [activeLook, setActiveLook] = useState(0);
  const [category, setCategory] = useState('All');
  const look = LOOKS[activeLook];

  const featured = useMemo(() => {
    const available = products.filter((product) => product.is_featured || product.is_new_arrival);
    const filtered = category === 'All' ? available : available.filter((product) => product.category === category);
    return (filtered.length ? filtered : available).slice(0, 4);
  }, [products, category]);

  return (
    <div className="pb-20">
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-4 sm:pt-8">
        <div className="grid lg:grid-cols-[0.78fr_1.22fr] min-h-[min(720px,calc(100svh-112px))] bg-[#1e1916] overflow-hidden">
          <div className="relative z-10 flex flex-col justify-between p-6 sm:p-10 lg:p-14 text-[#F7F5F0]">
            <div className="flex items-center justify-between text-[10px] font-mono-num uppercase tracking-[0.18em] text-[#c9bfb4]">
              <span>AYÉ / AW26</span>
              <span className="hidden sm:inline">Lagos, Nigeria</span>
            </div>
            <div className="max-w-xl py-16 lg:py-24">
              <p className="text-[11px] font-mono-num uppercase tracking-[0.22em] text-[#c9bfb4]">A contemporary Lagos wardrobe</p>
              <h1 className="mt-5 font-editorial text-[52px] sm:text-[68px] lg:text-[84px] leading-[0.9] font-light tracking-[-0.025em]">Clothes with a considered line.</h1>
              <p className="mt-7 max-w-sm text-[14px] leading-7 text-[#ded4ca]">Small-run womenswear, cut and finished in Lagos. Built around clean pattern, useful movement, and materials that age well.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <button type="button" onClick={() => onNavigate('shop')} className="inline-flex items-center gap-3 bg-[#F7F5F0] px-5 py-3.5 text-[11px] font-mono-num uppercase tracking-[0.16em] text-[#1e1916] transition-transform hover:-translate-y-0.5 focus-visible:outline-[#F7F5F0]">Shop the collection <ArrowRight className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => onNavigate('about')} className="inline-flex items-center gap-2 border border-[#F7F5F0]/40 px-5 py-3.5 text-[11px] font-mono-num uppercase tracking-[0.16em] text-[#F7F5F0] transition-colors hover:border-[#F7F5F0]">The studio <ArrowUpRight className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <p className="max-w-xs text-[11px] leading-5 text-[#a99d92]">Pattern, proportion, and texture — made here, worn anywhere.</p>
          </div>
          <div className="relative min-h-[420px] lg:min-h-0 overflow-hidden">
            <img src={HERO_IMAGE} alt="AYÉ Studio autumn winter campaign in Lagos" className="h-full w-full object-cover object-center transition-transform duration-[1400ms] hover:scale-[1.025]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1e1916]/30 via-transparent to-transparent lg:from-[#1e1916]/20" />
            <div className="absolute bottom-5 right-5 text-right text-[10px] font-mono-num uppercase tracking-[0.16em] text-[#F7F5F0]/75"><p>Campaign 01</p><p className="mt-1 text-[#F7F5F0]/55">Victoria Island</p></div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#161514]/12 bg-[#efece5]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 divide-x divide-[#161514]/12 px-4 sm:grid-cols-4 sm:px-8 lg:px-12">
          {['Cut in Lagos', 'Small editions', 'Natural materials', 'Nationwide delivery'].map((item, index) => <div key={item} className={`${index > 1 ? 'hidden sm:block' : ''} py-5 text-center text-[10px] font-mono-num uppercase tracking-[0.14em] text-[#5a4638]`}>{item}</div>)}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="flex flex-col gap-5 border-b border-[#161514]/15 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#786b5e]">The current edit</p><h2 className="mt-2 font-editorial text-[42px] leading-none tracking-[-0.02em] text-[#161514] sm:text-[54px]">Made for now.</h2></div>
          <button type="button" onClick={() => onNavigate('shop')} className="inline-flex items-center gap-2 self-start text-[11px] font-mono-num uppercase tracking-[0.14em] text-[#161514] underline underline-offset-4 transition-colors hover:text-[#7d7063] sm:self-auto">View all pieces <ArrowRight className="h-3.5 w-3.5" /></button>
        </div>
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Shop categories">
          {['All', 'Dresses', 'Tops & Shirts', 'Trousers & Skirts', 'Outerwear', 'Leather Goods'].map((item) => <button key={item} type="button" role="tab" aria-selected={category === item} onClick={() => setCategory(item)} className={`shrink-0 border-b pb-2 text-[10px] font-mono-num uppercase tracking-[0.14em] transition-colors ${category === item ? 'border-[#161514] text-[#161514]' : 'border-transparent text-[#8d7f73] hover:text-[#161514]'}`}>{item}</button>)}
        </div>
        {loading ? <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-6">{[1, 2, 3, 4].map((item) => <div key={item} className="studio-skeleton aspect-[3/4]" />)}</div> : error ? <div className="mt-8 border border-[#7c4d36]/30 bg-[#faf8f5] p-8 text-center"><p className="font-editorial text-2xl text-[#161514]">The edit is resting.</p><p className="mt-2 text-sm text-[#5a4638]">Please refresh to reconnect to the studio catalogue.</p></div> : <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-4 sm:gap-x-6 sm:gap-y-14">{featured.map((product, index) => <div key={product.id} className="studio-reveal" style={{ animationDelay: `${index * 70}ms` }}><ProductCard product={product} onSelect={onSelectProduct} /></div>)}</div>}
      </section>

      <section className="border-y border-[#161514]/12 bg-[#faf8f5]">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="min-h-[420px] overflow-hidden lg:min-h-[650px]"><img src={ATELIER_IMAGE} alt="AYÉ Studio atelier in Victoria Island, Lagos" className="h-full w-full object-cover transition-transform duration-1000 hover:scale-[1.02]" /></div>
          <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-20 lg:py-24"><p className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#786b5e]">How we work</p><h2 className="mt-4 max-w-lg font-editorial text-[42px] leading-[0.95] tracking-[-0.02em] text-[#161514] sm:text-[58px]">Good clothes start with a good pattern.</h2><p className="mt-7 max-w-md text-[14px] leading-7 text-[#4a3b32]">We draft, cut, and finish every edition in our Victoria Island studio. The process is deliberately close: fewer pieces, better decisions, and a clear relationship between cloth and body.</p><button type="button" onClick={() => onNavigate('about')} className="mt-9 inline-flex items-center gap-2 self-start border-b border-[#161514] pb-2 text-[11px] font-mono-num uppercase tracking-[0.14em] text-[#161514] transition-colors hover:text-[#7d7063]">Visit the atelier <ArrowUpRight className="h-3.5 w-3.5" /></button></div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="flex items-end justify-between border-b border-[#161514]/15 pb-7"><div><p className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#786b5e]">A study in three looks</p><h2 className="mt-2 font-editorial text-[42px] leading-none tracking-[-0.02em] text-[#161514] sm:text-[54px]">The lookbook</h2></div><div className="flex gap-1"><button type="button" onClick={() => setActiveLook((activeLook + LOOKS.length - 1) % LOOKS.length)} aria-label="Previous look" className="border border-[#161514]/20 p-2.5 transition-colors hover:bg-[#161514] hover:text-[#F7F5F0]"><ChevronLeft className="h-4 w-4" /></button><button type="button" onClick={() => setActiveLook((activeLook + 1) % LOOKS.length)} aria-label="Next look" className="border border-[#161514]/20 p-2.5 transition-colors hover:bg-[#161514] hover:text-[#F7F5F0]"><ChevronRight className="h-4 w-4" /></button></div></div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:items-center"><div className="relative aspect-[4/5] overflow-hidden bg-[#eae5dc]"><img src={look.image} alt={`${look.title}, AYÉ Studio look ${look.number}`} className="h-full w-full object-cover studio-reveal" key={look.image} /><span className="absolute left-4 top-4 bg-[#1e1916] px-3 py-2 text-[10px] font-mono-num uppercase tracking-[0.16em] text-[#f7f5f0]">Look {look.number}</span></div><div className="lg:py-8"><p className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#786b5e]">{look.location}</p><h3 className="mt-3 font-editorial text-[42px] leading-none text-[#161514]">{look.title}</h3><p className="mt-5 max-w-sm text-[14px] leading-7 text-[#4a3b32]">{look.note}</p><div className="mt-8 border-t border-[#161514]/15">{look.pieces.map((piece) => <button key={piece.slug} type="button" onClick={() => onSelectProduct(piece.slug)} className="flex w-full items-center justify-between gap-4 border-b border-[#161514]/15 py-4 text-left transition-colors hover:bg-[#faf8f5]"><span className="text-[13px] text-[#161514]">{piece.name}</span><span className="shrink-0 font-mono-num text-[12px] text-[#5a4638]">{formatNaira(piece.price)}</span></button>)}</div><button type="button" onClick={() => onNavigate('lookbook')} className="mt-8 inline-flex items-center gap-2 text-[11px] font-mono-num uppercase tracking-[0.14em] text-[#161514] underline underline-offset-4">Open full lookbook <ArrowRight className="h-3.5 w-3.5" /></button></div></div>
      </section>

      <section className="border-y border-[#161514]/12 bg-[#efece5]"><div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-8 sm:py-24 lg:px-12"><div className="flex flex-col justify-between gap-4 border-b border-[#161514]/15 pb-7 sm:flex-row sm:items-end"><div><p className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#786b5e]">From the studio</p><h2 className="mt-2 font-editorial text-[42px] leading-none text-[#161514] sm:text-[54px]">Notes, not noise.</h2></div><button type="button" onClick={() => onNavigate('journal')} className="self-start text-[11px] font-mono-num uppercase tracking-[0.14em] text-[#161514] underline underline-offset-4 sm:self-auto">Read the journal <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></button></div><div className="mt-8 divide-y divide-[#161514]/15">{JOURNAL.map((entry) => <button key={entry.title} type="button" onClick={() => onNavigate('journal')} className="grid w-full gap-2 py-5 text-left transition-colors hover:bg-[#f7f5f0] sm:grid-cols-[120px_1fr_1.1fr] sm:items-baseline sm:gap-8"><span className="text-[10px] font-mono-num uppercase tracking-[0.14em] text-[#8d7f73]">{entry.date}</span><span className="font-editorial text-[26px] leading-tight text-[#161514]">{entry.title}</span><span className="text-[13px] leading-6 text-[#5a4638]">{entry.text}</span></button>)}</div></div></section>

      {onOpenDiagnostic && <div className="mx-auto flex max-w-[1440px] justify-end px-4 py-5 sm:px-8 lg:px-12"><button type="button" onClick={onOpenDiagnostic} className="text-[9px] font-mono-num uppercase tracking-[0.14em] text-[#9b8d80] transition-colors hover:text-[#161514]">Connection status</button></div>}
    </div>
  );
};
