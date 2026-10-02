import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Product } from '../types/store';
import { formatNaira } from '../lib/api';
import { ProductCard } from '../components/ProductCard';

const HERO_IMAGE = '/src/assets/images/hero_campaign_aw26_1790917116291.jpg';
const ATELIER_IMAGE = '/src/assets/images/editorial_atelier_lagos_1790917127723.jpg';

interface HomeViewProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onNavigate: (view: string, params?: Record<string, string>) => void;
  onSelectProduct: (slug: string) => void;
  onOpenDiagnostic?: () => void;
}

interface LookbookItem {
  id: string;
  lookTitle: string;
  season: string;
  location: string;
  photo: string;
  garmentsWorn: {
    name: string;
    slug: string;
    price: number;
    role: string;
  }[];
  notes: string;
}

const LOOKBOOK_ITEMS: LookbookItem[] = [
  {
    id: 'look-1',
    lookTitle: 'Look I — Asymmetric Bias & Pleat',
    season: 'Autumn / Winter',
    location: 'Studio Court, Victoria Island',
    photo: '/src/assets/images/product_nia_draped_top_1790917140380.jpg',
    garmentsWorn: [
      { name: 'Nia Draped Top in Raw Bone Silk', slug: 'nia-draped-top', price: 165000, role: 'Blouse' },
      { name: 'Tolu Wide-Leg Trouser in Warm Clay', slug: 'tolu-wide-leg-trouser', price: 195000, role: 'Trouser' },
    ],
    notes: 'Cut on a 45-degree true bias from 22-momme sandwashed mulberry silk, paired with double-pleated Belgian linen-wool trousers.',
  },
  {
    id: 'look-2',
    lookTitle: 'Look II — The Helical Column',
    season: 'Autumn / Winter',
    location: 'Akin Olugbade Atelier, Lagos',
    photo: '/src/assets/images/product_sade_column_dress_1790917152807.jpg',
    garmentsWorn: [
      { name: 'Sade Column Dress in Espresso Crepe', slug: 'sade-column-dress', price: 285000, role: 'Dress' },
      { name: 'Dara Structured Saddle Bag', slug: 'dara-structured-bag', price: 240000, role: 'Leather Object' },
    ],
    notes: 'A continuous diagonal bias seam spiraling from the ribcage to the ankle in heavy matte FSC-certified viscose-silk crepe.',
  },
  {
    id: 'look-3',
    lookTitle: 'Look III — Tailored Volume & Travertine',
    season: 'Autumn / Winter',
    location: 'Victoria Island Gallery',
    photo: '/src/assets/images/product_tolu_wide_trouser_1790917162690.jpg',
    garmentsWorn: [
      { name: 'Tolu Wide-Leg Trouser', slug: 'tolu-wide-leg-trouser', price: 195000, role: 'Tailoring' },
      { name: 'Eko Poplin Shirt', slug: 'eko-poplin-shirt', price: 145000, role: 'Shirting' },
    ],
    notes: 'Inward box pleats engineered to preserve a crisp crease under coastal humidity, with French-bound internal waistband construction.',
  },
];

const CRAFT_STORIES = [
  {
    title: 'Pattern Drafting & Grain Tension',
    caption: 'Every garment pattern is drafted by hand in our Victoria Island cutting room. Rather than decorative darting, volume is resolved through 45-degree diagonal grain orientation.',
    image: ATELIER_IMAGE,
    spec: 'Plate A · Studio Cutting Table',
  },
  {
    title: 'Iseyin Narrow Strip-Loom Weaving',
    caption: 'Narrow 14cm bands hand-loomed in Oyo State from unbleached indigenous cotton. Strips are joined sequentially using traditional open faggoting seams.',
    image: HERO_IMAGE,
    spec: 'Plate B · Textile Architecture',
  },
];

const JOURNAL_ENTRIES = [
  {
    date: 'Autumn 2026',
    title: 'Notes on Coastal Drape & Atlantic Humidity',
    excerpt: 'How coastal Lagos moisture transforms the weight and drape of raw silk, leading to our choice of dense 22-momme sandwashed fibers.',
    readTime: '4 min read',
  },
  {
    date: 'Studio Archive',
    title: 'The Unbleached Palette: Bone, Clay, and Umber',
    excerpt: 'An investigation into indigenous earth pigments and undyed cotton lots sourced directly from smallholder weavers across southwestern Nigeria.',
    readTime: '3 min read',
  },
  {
    date: 'Craft Document',
    title: 'French Seams & Interior Longevity',
    excerpt: 'Why every interior seam is fully enclosed, eliminating overlocking in favour of archival dressmaking finishes that endure decades.',
    readTime: '5 min read',
  },
];

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  loading,
  error,
  onNavigate,
  onSelectProduct,
  onOpenDiagnostic,
}) => {
  const [activeLookIdx, setActiveLookIdx] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const activeLook = LOOKBOOK_ITEMS[activeLookIdx];

  const categories = ['All', 'Dresses', 'Tops & Shirts', 'Trousers & Skirts', 'Outerwear', 'Leather Goods'];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="space-y-24 sm:space-y-36">
      {/* 1. CAMPAIGN HERO (One dominating photograph owning the viewport) */}
      <section className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-3 sm:pt-6">
        <div className="relative overflow-hidden bg-[#161514] group">
          <div className="aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/10] w-full relative overflow-hidden">
            <img
              src={HERO_IMAGE}
              alt="AYÉ STUDIO Autumn / Winter Campaign — Victoria Island, Lagos"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-100 group-hover:scale-[1.015] transition-transform duration-1000 ease-out"
            />
            {/* Cinematic subtle contrast gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#161514]/85 via-[#161514]/25 to-transparent" />
          </div>

          {/* Model & Setting Credit (Top Right) */}
          <div className="absolute top-6 right-6 hidden sm:block text-right text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#C5BDB2]">
            <p>CAMPAIGN AW26</p>
            <p className="text-[#8D7F73]">VICTORIA ISLAND, LAGOS</p>
          </div>

          {/* Editorial Content (Bottom Left) */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 lg:p-16 text-[#F7F5F0]">
            <div className="max-w-2xl space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-[1px] bg-[#EFECE5]" />
                <p className="text-[11px] font-mono-num uppercase tracking-[0.28em] text-[#EFECE5]">
                  AYÉ STUDIO &nbsp;·&nbsp; LAGOS
                </p>
              </div>

              <h1 className="font-editorial text-[44px] sm:text-[64px] lg:text-[76px] font-light tracking-[0.02em] leading-[0.98] text-[#F7F5F0]">
                AUTUMN / WINTER
              </h1>

              <p className="text-[14px] sm:text-[16px] text-[#E5DFD5] font-light max-w-lg leading-relaxed pt-1">
                Quiet tailoring, cut in Lagos. Limited pieces for the season.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('shop')}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-[#F7F5F0] text-[#161514] text-[11px] font-mono-num tracking-[0.2em] uppercase hover:bg-[#EFECE5] transition-colors cursor-pointer"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('lookbook')}
                  className="px-6 py-4 border border-[#F7F5F0]/40 text-[#F7F5F0] text-[11px] font-mono-num tracking-[0.2em] uppercase hover:bg-[#F7F5F0]/10 transition-colors cursor-pointer"
                >
                  View Lookbook
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EDITORIAL STATEMENT & BRAND CONTEXT */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-6">
        <p className="text-[11px] font-mono-num uppercase tracking-[0.24em] text-[#5A4638]">
          THE STUDIO PHILOSOPHY
        </p>
        <p className="font-editorial text-[26px] sm:text-[36px] font-light text-[#161514] leading-[1.3] tracking-tight">
          Clothes with a considered line, made in small runs for a life in motion.
        </p>
        <div className="pt-2 flex justify-center">
          <span className="w-12 h-[1px] bg-[#161514]/25" />
        </div>
      </section>

      {/* 3. THE LOOKBOOK — EDITORIAL TO COMMERCE CONNECTION */}
      <section id="lookbook" className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-[#161514]/12">
          <div>
            <p className="text-[10px] font-mono-num uppercase tracking-[0.24em] text-[#5A4638]">
              SEASONAL ARCHIVE
            </p>
            <h2 className="font-editorial text-[36px] sm:text-[44px] font-light text-[#161514] mt-1">
              Campaign Lookbook
            </h2>
          </div>

          {/* Lookbook Navigation Tabs */}
          <div className="flex items-center gap-3">
            {LOOKBOOK_ITEMS.map((look, idx) => (
              <button
                key={look.id}
                type="button"
                onClick={() => setActiveLookIdx(idx)}
                className={`px-3 py-1.5 text-[10px] font-mono-num uppercase tracking-[0.18em] transition-colors border cursor-pointer ${
                  activeLookIdx === idx
                    ? 'bg-[#161514] text-[#F7F5F0] border-[#161514]'
                    : 'bg-[#FAF8F5] text-[#5A4638] border-[#161514]/15 hover:border-[#161514]'
                }`}
              >
                Look 0{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Lookbook Stage: Image on Left, Shop The Look on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left: Real Lookbook Photography */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[3/4] bg-[#EAE5DC] overflow-hidden border border-[#161514]/15 group">
              <img
                src={activeLook.photo}
                alt={activeLook.lookTitle}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-[1.015] transition-transform duration-700 ease-out"
              />
              <div className="absolute top-4 left-4 bg-[#161514]/80 text-[#F7F5F0] px-3 py-1 text-[9px] font-mono-num tracking-[0.2em] uppercase">
                {activeLook.season} · {activeLook.location}
              </div>
            </div>
          </div>

          {/* Right: Garment Identification & Direct Shopping Link */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border-b border-[#161514]/12 pb-4 space-y-1">
              <p className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#5A4638]">
                EDITORIAL DOCUMENTATION
              </p>
              <h3 className="font-editorial text-[32px] text-[#161514] leading-tight">
                {activeLook.lookTitle}
              </h3>
            </div>

            <p className="text-[14px] text-[#3E3027] leading-relaxed">
              {activeLook.notes}
            </p>

            {/* Shop the Pieces in this Look */}
            <div className="space-y-3 pt-2">
              <p className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#5A4638]">
                PIECES WORN IN THIS LOOK
              </p>

              <div className="space-y-2.5">
                {activeLook.garmentsWorn.map((garment) => (
                  <button
                    key={garment.slug}
                    type="button"
                    onClick={() => onSelectProduct(garment.slug)}
                    className="w-full text-left p-3.5 border border-[#161514]/15 bg-[#FAF8F5] hover:border-[#161514] hover:bg-[#EFECE5] transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <span className="text-[9px] font-mono-num uppercase tracking-[0.16em] text-[#8D7F73] block">
                        {garment.role}
                      </span>
                      <span className="text-[13px] font-medium text-[#161514] group-hover:text-[#5A4638] transition-colors">
                        {garment.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono-num text-[13px] text-[#161514] font-medium">
                        {formatNaira(garment.price)}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#5A4638] group-hover:text-[#161514] transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ATELIER CRAFT & MATERIALITY */}
      <section className="bg-[#EFECE5] border-y border-[#161514]/12 py-20 sm:py-28">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 space-y-16">
          <div className="max-w-2xl space-y-3">
            <p className="text-[10px] font-mono-num uppercase tracking-[0.24em] text-[#5A4638]">
              CRAFT &amp; CONSTRUCTION
            </p>
            <h2 className="font-editorial text-[36px] sm:text-[44px] font-light text-[#161514] leading-tight">
              Cut in Lagos. Finished by Hand.
            </h2>
            <p className="text-[14px] text-[#3E3027] leading-relaxed">
              Every AYÉ STUDIO garment is drafted, cut, and finished in small editions at our Victoria Island cutting rooms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
            {CRAFT_STORIES.map((story) => (
              <div key={story.title} className="space-y-4">
                <div className="aspect-[4/3] bg-[#EAE5DC] overflow-hidden border border-[#161514]/15">
                  <img
                    src={story.image}
                    alt={story.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-mono-num uppercase tracking-[0.16em] text-[#5A4638]">
                    {story.spec}
                  </span>
                  <h3 className="font-editorial text-[24px] text-[#161514]">
                    {story.title}
                  </h3>
                  <p className="text-[13px] text-[#3E3027] leading-relaxed">
                    {story.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS / COLLECTION RAIL */}
      <section className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-[#161514]/12">
          <div>
            <p className="text-[10px] font-mono-num uppercase tracking-[0.24em] text-[#5A4638]">
              AUTUMN / WINTER 2026
            </p>
            <h2 className="font-editorial text-[36px] sm:text-[44px] font-light text-[#161514] mt-1">
              Current Selection
            </h2>
          </div>

          {/* Clean Category Filters without pills */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-mono-num tracking-[0.16em] uppercase">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`pb-1 transition-colors border-b cursor-pointer ${
                    active
                      ? 'border-[#161514] text-[#161514] font-medium'
                      : 'border-transparent text-[#786B5E] hover:text-[#161514]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-[3/4] bg-[#EAE5DC] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center border border-[#161514]/20 bg-[#FAF8F5]">
            <p className="font-editorial text-[20px] text-[#161514]">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-7 gap-y-12">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}

        <div className="pt-8 border-t border-[#161514]/10 flex justify-center">
          <button
            type="button"
            onClick={() => onNavigate('shop')}
            className="px-9 py-3.5 border border-[#161514] text-[10px] font-mono-num tracking-[0.2em] uppercase text-[#161514] hover:bg-[#161514] hover:text-[#F7F5F0] transition-colors cursor-pointer"
          >
            Browse Full Catalogue ({products.length} Pieces)
          </button>
        </div>
      </section>

      {/* 6. THE STUDIO JOURNAL */}
      <section className="bg-[#FAF8F5] border-y border-[#161514]/12 py-20 sm:py-28">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#161514]/12 pb-6">
            <div>
              <p className="text-[10px] font-mono-num uppercase tracking-[0.24em] text-[#5A4638]">
                STUDIO NOTES &amp; ARCHIVE
              </p>
              <h2 className="font-editorial text-[36px] sm:text-[44px] font-light text-[#161514] mt-1">
                The Lagos Journal
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="text-[11px] font-mono-num uppercase tracking-[0.16em] text-[#161514] underline underline-offset-4 hover:text-[#5A4638]"
            >
              Read About the Atelier &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {JOURNAL_ENTRIES.map((entry) => (
              <article key={entry.title} className="p-6 bg-[#F7F5F0] border border-[#161514]/15 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono-num uppercase tracking-[0.18em] text-[#8D7F73]">
                    {entry.date} · {entry.readTime}
                  </span>
                  <h3 className="font-editorial text-[22px] text-[#161514] leading-snug">
                    {entry.title}
                  </h3>
                  <p className="text-[13px] text-[#4A3B32] leading-relaxed">
                    {entry.excerpt}
                  </p>
                </div>
                <div className="pt-2 text-[10px] font-mono-num uppercase tracking-[0.16em] text-[#161514] font-medium">
                  Studio Entry &rarr;
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Developer / Diagnostic Quick Link Bar at bottom */}
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pb-6 flex justify-end">
        <button
          type="button"
          onClick={onOpenDiagnostic}
          className="text-[10px] font-mono-num tracking-[0.16em] uppercase text-[#8D7F73] hover:text-[#161514] transition-colors cursor-pointer"
        >
          ⚙ Database &amp; Supabase Connection Check
        </button>
      </div>
    </div>
  );
};
