import React, { useState, useEffect } from 'react';
import { ArrowLeft, Minus, Plus, Check, Ruler, Eye, Compass, ShieldCheck } from 'lucide-react';
import { Product, ProductVariant } from '../types/store';
import { api, formatNaira } from '../lib/api';
import { SizeGuideModal } from '../components/SizeGuideModal';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailViewProps {
  slug: string;
  onBack: () => void;
  onAddToCart: (productId: string, variantId: string, quantity: number) => Promise<void>;
  onSelectProduct: (slug: string) => void;
}

type PerspectiveTab = 'LOOK' | 'DETAIL' | 'FABRIC' | 'FIT' | 'TECHNICAL';

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  slug,
  onBack,
  onAddToCart,
  onSelectProduct,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activePerspective, setActivePerspective] = useState<PerspectiveTab>('LOOK');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string>('composition');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setActiveImageIdx(0);
    setActivePerspective('LOOK');
    setQuantity(1);
    setCartError(null);

    api
      .fetchProductDetail(slug)
      .then((data) => {
        if (!cancelled) {
          setProduct(data.product);
          setRelated(data.related);
          const firstAvailable =
            data.product.variants.find((v) => v.inventory_quantity > 0) ||
            data.product.variants[0] ||
            null;
          setSelectedVariant(firstAvailable);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Piece not found.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleVariantChange = (v: ProductVariant) => {
    setSelectedVariant(v);
    setCartError(null);
    if (quantity > v.inventory_quantity && v.inventory_quantity > 0) {
      setQuantity(v.inventory_quantity);
    } else if (quantity < 1) {
      setQuantity(1);
    }
  };

  const handlePerspectiveSelect = (tab: PerspectiveTab) => {
    setActivePerspective(tab);
    if (tab === 'LOOK') {
      setActiveImageIdx(0);
    } else if (tab === 'DETAIL' && product?.images[1]) {
      setActiveImageIdx(1);
    } else if (tab === 'FABRIC' && product?.images[2]) {
      setActiveImageIdx(2);
    }
  };

  const handleAdd = async () => {
    if (!product || !selectedVariant) return;
    if (selectedVariant.inventory_quantity <= 0) {
      setCartError('This size is currently out of stock.');
      return;
    }

    setCartError(null);
    setAdding(true);
    try {
      await onAddToCart(product.id, selectedVariant.id, quantity);
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 2000);
    } catch (err: unknown) {
      setCartError(err instanceof Error ? err.message : 'Unable to add piece to bag.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 aspect-[3/4] bg-[#EAE5DC] animate-pulse" />
          <div className="lg:col-span-5 space-y-6">
            <div className="h-6 w-32 bg-[#EAE5DC] animate-pulse" />
            <div className="h-12 w-3/4 bg-[#EAE5DC] animate-pulse" />
            <div className="h-8 w-24 bg-[#EAE5DC] animate-pulse" />
            <div className="h-28 w-full bg-[#EAE5DC] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-24 text-center">
        <h2 className="font-editorial text-[32px] text-[#161514]">
          {error || 'Silhouette Not Found'}
        </h2>
        <p className="mt-2 text-[14px] text-[#5A4638]">
          The requested studio archive piece could not be retrieved.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 border border-[#161514] text-[11px] font-mono-num uppercase tracking-[0.18em] text-[#161514] hover:bg-[#161514] hover:text-[#F7F5F0] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Collection</span>
        </button>
      </div>
    );
  }

  const maxAvailable = selectedVariant ? selectedVariant.inventory_quantity : 0;
  const isOutOfStock = maxAvailable === 0;

  return (
    <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-8 sm:py-14 space-y-16">
      {/* Editorial Breadcrumbs & Back Link */}
      <div className="flex items-center justify-between border-b border-[#161514]/12 pb-4 text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#5A4638]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 hover:text-[#161514] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO COLLECTION</span>
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span>ATELIER ARCHIVE</span>
          <span>/</span>
          <span>{product.category.toUpperCase()}</span>
          <span>/</span>
          <span className="text-[#161514] font-medium">{product.name.toUpperCase()}</span>
        </div>
      </div>

      {/* Main Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left: Real Fashion Photography Gallery & Perspective Navigator (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Natural Perspective Switcher: LOOK · DETAIL · FABRIC · FIT · TECHNICAL (Requirement 14) */}
          <div className="flex items-center gap-1 sm:gap-2 border-b border-[#161514]/15 pb-2 text-[10px] font-mono-num uppercase tracking-[0.18em]">
            {(['LOOK', 'DETAIL', 'FABRIC', 'FIT', 'TECHNICAL'] as PerspectiveTab[]).map((tab) => {
              const active = activePerspective === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handlePerspectiveSelect(tab)}
                  className={`px-3 py-1.5 transition-colors cursor-pointer border-b-2 ${
                    active
                      ? 'border-[#161514] text-[#161514] font-medium'
                      : 'border-transparent text-[#786B5E] hover:text-[#161514]'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Primary Viewport Image */}
          <div className="relative aspect-[3/4] bg-[#EAE5DC] overflow-hidden border border-[#161514]/15 group">
            <img
              src={product.images[activeImageIdx] || product.images[0]}
              alt={`${product.name} — ${activePerspective}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-100 group-hover:scale-[1.015] transition-transform duration-700 ease-out"
            />
            {/* Viewport Metadata Stamp */}
            <div className="absolute top-4 left-4 bg-[#161514]/85 text-[#F7F5F0] px-3 py-1 text-[9px] font-mono-num tracking-[0.2em] uppercase backdrop-blur-xs">
              {activePerspective} SPEC · 0{activeImageIdx + 1}
            </div>
          </div>

          {/* Perspective-Specific Technical Reveal Box */}
          {activePerspective === 'FIT' && (
            <div className="bg-[#FAF8F5] border border-[#161514]/15 p-6 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#5A4638]">
                <span>MANNEQUIN FIT PROFILE</span>
                <span className="text-emerald-700">STUDIO ACCURACY 1:1</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-mono-num">
                <div className="bg-[#EFECE5] p-2.5">
                  <span className="text-[#8D7F73] block text-[9px] uppercase">HEIGHT</span>
                  <span className="text-[#161514] font-medium">179 CM (5&apos;10.5&quot;)</span>
                </div>
                <div className="bg-[#EFECE5] p-2.5">
                  <span className="text-[#8D7F73] block text-[9px] uppercase">BUST</span>
                  <span className="text-[#161514] font-medium">82 CM (32.3&quot;)</span>
                </div>
                <div className="bg-[#EFECE5] p-2.5">
                  <span className="text-[#8D7F73] block text-[9px] uppercase">WAIST</span>
                  <span className="text-[#161514] font-medium">61 CM (24.0&quot;)</span>
                </div>
                <div className="bg-[#EFECE5] p-2.5">
                  <span className="text-[#8D7F73] block text-[9px] uppercase">SAMPLE SIZE</span>
                  <span className="text-[#161514] font-medium">UK 8 / SMALL</span>
                </div>
              </div>
              <p className="text-[13px] text-[#4A3B32] pt-1">{product.fit}</p>
            </div>
          )}

          {activePerspective === 'TECHNICAL' && (
            <div className="bg-[#FAF8F5] border border-[#161514]/15 p-6 space-y-3 animate-in fade-in duration-300 font-mono-num text-[11px]">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#5A4638] pb-1 border-b border-[#161514]/10">
                PATTERN CONSTRUCTION SPECIFICATIONS
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[#3E3027]">
                <div>
                  <strong className="text-[#161514] block text-[9px] uppercase text-[#8D7F73]">SEAM ALLOWANCE:</strong>
                  1.2cm French-bound interior seam with continuous silk topstitch.
                </div>
                <div>
                  <strong className="text-[#161514] block text-[9px] uppercase text-[#8D7F73]">GRAIN ORIENTATION:</strong>
                  True 45-degree diagonal bias grain cut across single-ply fabric.
                </div>
                <div>
                  <strong className="text-[#161514] block text-[9px] uppercase text-[#8D7F73]">HEM FINISH:</strong>
                  Hand-rolled blind pick stitch; 3.5cm interior drop weight.
                </div>
                <div>
                  <strong className="text-[#161514] block text-[9px] uppercase text-[#8D7F73]">DISPATCH TIMETABLE:</strong>
                  Dispatched from Victoria Island atelier within 24–48 hours.
                </div>
              </div>
            </div>
          )}

          {/* Multiple Image Thumbnails */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-3 gap-4 pt-2">
              {product.images.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => {
                    setActiveImageIdx(idx);
                  }}
                  className={`aspect-[3/4] border overflow-hidden transition-all cursor-pointer ${
                    activeImageIdx === idx
                      ? 'border-[#161514] shadow-sm'
                      : 'border-[#161514]/20 opacity-70 hover:opacity-100 hover:border-[#161514]/50'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Contiguous Purchase Module (5 Cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-7">
          <div className="border-b border-[#161514]/12 pb-6 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#5A4638]">
              <span>{product.category}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedVariant?.sku || product.variants[0]?.sku}</span>
            </div>

            <h1 className="font-editorial text-[34px] sm:text-[42px] font-normal text-[#161514] leading-[1.08]">
              {product.name}
            </h1>

            <p className="font-mono-num text-[19px] text-[#161514] pt-1 font-medium">
              {formatNaira(product.price)}
            </p>
          </div>

          <p className="text-[14px] text-[#3E3027] leading-relaxed">
            {product.description}
          </p>

          {/* Color Way Swatch */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono-num uppercase tracking-[0.16em] text-[#5A4638]">
              SHADE: <span className="text-[#161514] font-medium">{product.colour}</span>
            </div>
            <div className="inline-flex items-center gap-2.5 p-1.5 border border-[#161514] bg-[#FAF8F5]">
              <span
                className="w-5 h-5 border border-[#161514]/20 shadow-xs"
                style={{ backgroundColor: product.colour_hex }}
              />
              <span className="text-[12px] pr-2 text-[#161514] font-medium">{product.colour}</span>
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono-num uppercase tracking-[0.18em] text-[#5A4638]">
                SELECT ATELIER SIZE
              </span>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="text-[10px] font-mono-num uppercase tracking-[0.16em] text-[#161514] underline underline-offset-4 hover:text-[#5A4638] cursor-pointer"
              >
                Size Guide &amp; Specs
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {product.variants.map((variant) => {
                const isSelected = selectedVariant?.id === variant.id;
                const outOfStock = variant.inventory_quantity === 0;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => handleVariantChange(variant)}
                    className={`py-3 px-2 border text-[12px] font-mono-num uppercase transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#161514] text-[#F7F5F0] border-[#161514]'
                        : outOfStock
                        ? 'bg-[#EFECE5] text-[#8D7F73] border-[#161514]/10 line-through'
                        : 'bg-[#FAF8F5] text-[#161514] border-[#161514]/25 hover:border-[#161514]'
                    }`}
                  >
                    {variant.size}
                  </button>
                );
              })}
            </div>

            {selectedVariant && (
              <div className="text-[11px] font-mono-num flex items-center gap-2 pt-1">
                <span
                  className={`w-2 h-2 ${
                    selectedVariant.inventory_quantity === 0
                      ? 'bg-rose-700'
                      : selectedVariant.inventory_quantity <= 3
                      ? 'bg-amber-600'
                      : 'bg-emerald-600'
                  }`}
                />
                <span className="text-[#3E3027]">
                  {selectedVariant.inventory_quantity === 0
                    ? `Size ${selectedVariant.size} is currently out of stock.`
                    : selectedVariant.inventory_quantity <= 3
                    ? `Low stock — only ${selectedVariant.inventory_quantity} piece${
                        selectedVariant.inventory_quantity === 1 ? '' : 's'
                      } remaining in Size ${selectedVariant.size}.`
                    : `In stock — ${selectedVariant.inventory_quantity} pieces ready in Victoria Island atelier.`}
                </span>
              </div>
            )}
          </div>

          {/* Add to Bag Module (Requirement 14) */}
          <div className="space-y-3 pt-2">
            {cartError && (
              <div className="p-3 bg-red-900/10 border border-red-900/30 text-[11px] font-mono-num text-red-900">
                {cartError}
              </div>
            )}

            <div className="flex items-stretch gap-3">
              <div className="flex items-center border border-[#161514]/30 bg-[#FAF8F5]">
                <button
                  type="button"
                  disabled={quantity <= 1 || maxAvailable === 0}
                  onClick={() => {
                    setQuantity((q) => Math.max(1, q - 1));
                  }}
                  aria-label="Decrease quantity"
                  className="w-11 h-full flex items-center justify-center text-[#161514] hover:bg-[#EFECE5] disabled:opacity-30 transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-mono-num text-[13px] text-[#161514]">
                  {maxAvailable === 0 ? 0 : quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= maxAvailable || maxAvailable === 0}
                  onClick={() => {
                    setQuantity((q) => Math.min(maxAvailable, q + 1));
                  }}
                  aria-label="Increase quantity"
                  className="w-11 h-full flex items-center justify-center text-[#161514] hover:bg-[#EFECE5] disabled:opacity-30 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                disabled={adding || maxAvailable === 0}
                onClick={handleAdd}
                className="flex-1 py-4 px-6 bg-[#161514] text-[#F7F5F0] text-[11px] font-mono-num tracking-[0.2em] uppercase hover:bg-[#322A25] disabled:bg-[#C9C1B4] disabled:text-[#5A4638] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {maxAvailable === 0 ? (
                  'Out of Stock'
                ) : adding ? (
                  'Adding to Bag...'
                ) : addedFeedback ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  `Add to Bag — ${formatNaira(product.price * quantity)}`
                )}
              </button>
            </div>
          </div>

          {/* Accordion Specifications */}
          <div className="pt-4 border-t border-[#161514]/15 divide-y divide-[#161514]/12">
            {[
              { id: 'composition', label: 'Composition & Fabric Spec', content: product.composition },
              { id: 'fit', label: 'Fit & Proportions', content: product.fit },
              { id: 'care', label: 'Atelier Garment Care', content: product.care },
              { id: 'shipping', label: 'Courier Dispatch & Returns', content: product.shipping },
            ].map((sec) => {
              const isOpen = openAccordion === sec.id;
              return (
                <div key={sec.id} className="py-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenAccordion(isOpen ? '' : sec.id);
                    }}
                    className="w-full flex items-center justify-between text-left text-[11px] font-mono-num uppercase tracking-[0.16em] text-[#161514] font-medium cursor-pointer"
                  >
                    <span>{sec.label}</span>
                    <span className="font-mono-num text-[14px] text-[#5A4638]">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <p className="mt-2.5 text-[13px] text-[#3E3027] leading-relaxed">
                      {sec.content}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Complementary Silhouettes from Same Archive */}
      {related.length > 0 && (
        <section className="mt-24 pt-14 border-t border-[#161514]/15">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#5A4638]">
                COMPLEMENTARY ARCHIVAL SILHOUETTES
              </p>
              <h2 className="font-editorial text-[32px] text-[#161514] mt-1">
                From the Same Collection
              </h2>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="text-[11px] font-mono-num uppercase tracking-[0.16em] text-[#161514] underline underline-offset-4 hover:text-[#5A4638]"
            >
              View Full Archive
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {related.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        category={product.category}
      />
    </div>
  );
};
