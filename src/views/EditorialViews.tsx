import React from 'react';
import { Product } from '../types/store';
import { formatNaira } from '../lib/api';

const ATELIER_IMAGE = '/images/editorial_atelier_lagos_1790917127723.jpg';
const HERO_IMAGE = '/images/hero_campaign_aw26_1790917116291.jpg';

interface CollectionViewProps {
  products: Product[];
  onSelectProduct: (slug: string) => void;
  onShopAll: () => void;
}

export const CollectionView: React.FC<CollectionViewProps> = ({
  products,
  onSelectProduct,
  onShopAll,
}) => {
  return (
    <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-8 sm:pt-12 space-y-20">
      <div className="border-b border-[#161514]/15 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-7 space-y-3">
          <p className="text-[11px] font-mono-num uppercase tracking-[0.22em] text-[#5A4638]">
            COLLECTION &nbsp;·&nbsp; AUTUMN / WINTER 2026
          </p>
          <h1 className="font-editorial text-[42px] sm:text-[56px] font-normal text-[#161514] leading-[1.05]">
            Coastal Architecture &amp; The Bias Drape
          </h1>
        </div>
        <div className="lg:col-span-5 text-[14px] text-[#3E3027] leading-relaxed">
          Constructed for movement between humid equatorial afternoons and tailored evening interiors. Our seasonal collection pairs unbleached strip-loomed cotton from Iseyin with heavy matte viscose-silk crepe and vegetable-tanned leather.
        </div>
      </div>

      <div className="space-y-24">
        {products.slice(0, 6).map((item, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div
              key={item.id}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
            >
              <div
                className={`lg:col-span-6 ${
                  isEven ? 'lg:order-1' : 'lg:order-2'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectProduct(item.slug)}
                  className="block w-full aspect-[3/4] bg-[#EAE5DC] overflow-hidden border border-[#161514]/10 cursor-pointer group shadow-sm"
                >
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                  />
                </button>
              </div>

              <div
                className={`lg:col-span-6 space-y-5 ${
                  isEven ? 'lg:order-2 lg:pl-8' : 'lg:order-1 lg:pr-8'
                }`}
              >
                <div className="text-[11px] font-mono-num uppercase tracking-[0.2em] text-[#5A4638]">
                  LOOK 0{idx + 1} &nbsp;·&nbsp; {item.category.toUpperCase()}
                </div>
                <h2 className="font-editorial text-[34px] sm:text-[40px] font-normal text-[#161514] leading-tight">
                  {item.name}
                </h2>
                <p className="text-[14px] text-[#3E3027] leading-relaxed max-w-lg">
                  {item.description}
                </p>
                <div className="pt-2 flex items-center gap-6 text-[13px]">
                  <span className="font-mono-num text-[#161514] font-medium">
                    {formatNaira(item.price)}
                  </span>
                  <span aria-hidden="true" className="text-[#5A4638]">
                    ·
                  </span>
                  <span className="text-[#5A4638]">{item.colour}</span>
                </div>
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => onSelectProduct(item.slug)}
                    className="px-6 py-3 border border-[#161514] text-[11px] tracking-[0.18em] uppercase text-[#161514] hover:bg-[#161514] hover:text-[#F7F5F0] transition-colors cursor-pointer"
                  >
                    Inspect Silhouette
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-10 border-t border-[#161514]/15 text-center">
        <button
          type="button"
          onClick={onShopAll}
          className="px-9 py-4 bg-[#161514] text-[#F7F5F0] text-[11px] font-mono-num tracking-[0.2em] uppercase hover:bg-[#3E3027] transition-colors cursor-pointer shadow-md"
        >
          Shop Complete Catalogue ({products.length} Pieces)
        </button>
      </div>
    </div>
  );
};

export const LookbookView: React.FC<{
  products: Product[];
  onSelectProduct: (slug: string) => void;
  onShopAll: () => void;
}> = ({ products, onSelectProduct, onShopAll }) => {
  return (
    <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-8 sm:pt-12 space-y-16">
      <div className="border-b border-[#161514]/15 pb-8">
        <p className="text-[11px] font-mono-num uppercase tracking-[0.22em] text-[#5A4638]">
          EDITORIAL ARCHIVE
        </p>
        <h1 className="font-editorial text-[42px] sm:text-[54px] font-normal text-[#161514] leading-tight mt-1">
          Autumn / Winter Campaign Lookbook
        </h1>
        <p className="text-[14px] text-[#5A4638] max-w-xl mt-2">
          Photographed in Victoria Island, Lagos. Explore each seasonal look and click any piece to discover pattern details and fabric origin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {products.map((item, index) => (
          <div key={item.id} className="space-y-4 group">
            <div
              onClick={() => onSelectProduct(item.slug)}
              className="aspect-[3/4] bg-[#EAE5DC] overflow-hidden border border-[#161514]/15 cursor-pointer relative"
            >
              <img
                src={item.images[0]}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
              />
              <div className="absolute bottom-3 left-3 bg-[#161514]/80 text-[#F7F5F0] px-2.5 py-1 text-[9px] font-mono-num uppercase tracking-[0.16em]">
                LOOK 0{index + 1}
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-editorial text-[22px] text-[#161514] group-hover:text-[#5A4638] transition-colors">
                {item.name}
              </h3>
              <p className="text-[12px] text-[#5A4638] font-mono-num">
                {formatNaira(item.price)} &nbsp;·&nbsp; {item.colour}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const JournalView: React.FC = () => {
  return (
    <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-8 sm:pt-12 space-y-16">
      <div className="border-b border-[#161514]/15 pb-8">
        <p className="text-[11px] font-mono-num uppercase tracking-[0.22em] text-[#5A4638]">
          STUDIO DISPATCHES &amp; STORIES
        </p>
        <h1 className="font-editorial text-[42px] sm:text-[54px] font-normal text-[#161514] leading-tight mt-1">
          The Lagos Journal
        </h1>
        <p className="text-[14px] text-[#5A4638] max-w-xl mt-2">
          Documenting indigenous textile traditions, pattern geometry, and material sourcing from our Victoria Island atelier.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <article className="space-y-4">
          <div className="aspect-[16/10] bg-[#EAE5DC] overflow-hidden border border-[#161514]/15">
            <img
              src={ATELIER_IMAGE}
              alt="Atelier cutting table"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#8D7F73]">
            OCTOBER 2026 · STUDIO NOTE
          </span>
          <h2 className="font-editorial text-[28px] text-[#161514]">
            Notes on Coastal Drape &amp; Atlantic Humidity
          </h2>
          <p className="text-[14px] text-[#3E3027] leading-relaxed">
            In Victoria Island, relative humidity regularly hovers between 60% and 80%. Under these conditions, conventional tailored wools collapse, while lightweight silks cling uncomfortably. We resolved this through sandwashed 22-momme silk and Belgian linen-wool blends that breathe without losing line.
          </p>
        </article>

        <article className="space-y-4">
          <div className="aspect-[16/10] bg-[#EAE5DC] overflow-hidden border border-[#161514]/15">
            <img
              src={HERO_IMAGE}
              alt="Iseyin loom textiles"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#8D7F73]">
            SEPTEMBER 2026 · WEAVING ARCHIVE
          </span>
          <h2 className="font-editorial text-[28px] text-[#161514]">
            The Iseyin Strip-Loom: Architecture of the 14cm Band
          </h2>
          <p className="text-[14px] text-[#3E3027] leading-relaxed">
            Unlike industrial wide-width textile looms, traditional strip-looms produce narrow 14cm lengths with rigid selvedges. By assembling these bands using open faggoting stitching, the seams become structural ventilation channels rather than mere decoration.
          </p>
        </article>
      </div>
    </div>
  );
};

export const AboutView: React.FC<{ onShopAll: () => void }> = ({ onShopAll }) => {
  return (
    <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-8 sm:pt-12 space-y-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start border-b border-[#161514]/15 pb-16">
        <div className="lg:col-span-5 space-y-6">
          <p className="text-[11px] font-mono-num uppercase tracking-[0.2em] text-[#5A4638]">
            THE HOUSE &amp; ATELIER
          </p>
          <h1 className="font-editorial text-[40px] sm:text-[52px] font-normal text-[#161514] leading-[1.08]">
            Independent womenswear drafted and finished in Victoria Island, Lagos.
          </h1>
          <div className="space-y-4 text-[14px] sm:text-[15px] text-[#3E3027] leading-relaxed">
            <p>
              Founded in Lagos, AYÉ STUDIO began with a simple premise: to construct contemporary womenswear rooted in West African textile intelligence without relying on folkloric clichés or disposable seasonal trends.
            </p>
            <p>
              Inside our Akin Olugbade Street studio, patternmakers and sample machinists work alongside third-generation strip-loom weavers in Iseyin, Oyo State. Each piece is cut individually and finished with French seams, natural horn closures, and generous internal hem allowances so garments can be adjusted over years of wear.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] bg-[#EAE5DC] overflow-hidden border border-[#161514]/10 shadow-sm">
            <img
              src={ATELIER_IMAGE}
              alt="AYÉ STUDIO Victoria Island cutting room"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-[11px] font-mono-num uppercase tracking-[0.14em] text-[#5A4638]">
            AKIN OLUGBADE ATELIER &nbsp;·&nbsp; PATTERN ARCHIVE &amp; CUTTING TABLE
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="space-y-3 border-t border-[#161514] pt-5">
          <div className="text-[11px] font-mono-num uppercase tracking-[0.16em] text-[#5A4638]">
            INDIGENOUS WEAVE
          </div>
          <h2 className="font-editorial text-[26px] text-[#161514]">
            Iseyin Strip-Loom Cotton
          </h2>
          <p className="text-[13px] text-[#3E3027] leading-relaxed">
            Our outerwear textiles are woven in 14cm narrow bands by master artisans in Oyo State using unbleached Nigerian cotton, then joined in Lagos with open faggoting stitchwork.
          </p>
        </div>

        <div className="space-y-3 border-t border-[#161514] pt-5">
          <div className="text-[11px] font-mono-num uppercase tracking-[0.16em] text-[#5A4638]">
            BIAS ARCHITECTURE
          </div>
          <h2 className="font-editorial text-[26px] text-[#161514]">
            45-Degree Grain Drape
          </h2>
          <p className="text-[13px] text-[#3E3027] leading-relaxed">
            Our silk dresses and tops are suspended on the true bias and stabilized with internal organic cotton grosgrain stays, allowing fluid drape in tropical humidity without losing shoulder structure.
          </p>
        </div>

        <div className="space-y-3 border-t border-[#161514] pt-5">
          <div className="text-[11px] font-mono-num uppercase tracking-[0.16em] text-[#5A4638]">
            SMALL-RUN PRODUCTION
          </div>
          <h2 className="font-editorial text-[26px] text-[#161514]">
            Numbered Studio Editions
          </h2>
          <p className="text-[13px] text-[#3E3027] leading-relaxed">
            We produce between 12 and 30 pieces per silhouette each season. Every garment is inspected, steamed, and packed in archival cotton housing before leaving Victoria Island.
          </p>
        </div>
      </div>

      <div className="bg-[#EFECE5] border border-[#161514]/15 p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-2 max-w-xl">
          <p className="text-[11px] font-mono-num uppercase tracking-[0.16em] text-[#5A4638]">
            PRIVATE APPOINTMENTS &amp; FITTINGS
          </p>
          <h3 className="font-editorial text-[30px] text-[#161514]">
            14A Akin Olugbade Street, Victoria Island, Lagos
          </h3>
          <p className="text-[13px] text-[#3E3027]">
            Open Monday through Saturday, 10:00 – 18:30 WAT. Walk-ins welcome; private fitting appointments available via atelier@ayestudio.lagos.
          </p>
        </div>

        <button
          type="button"
          onClick={onShopAll}
          className="px-7 py-3.5 bg-[#161514] text-[#F7F5F0] text-[11px] font-mono-num tracking-[0.18em] uppercase hover:bg-[#3E3027] transition-colors shrink-0 cursor-pointer shadow-sm"
        >
          Explore Collection
        </button>
      </div>
    </div>
  );
};
