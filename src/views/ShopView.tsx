import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Product } from '../types/store';
import { api } from '../lib/api';
import { ProductCard } from '../components/ProductCard';

interface ShopViewProps {
  initialCategory: string;
  initialQuery: string;
  initialSort: string;
  onUpdateUrlParams: (params: { category: string; q: string; sort: string }) => void;
  onSelectProduct: (slug: string) => void;
}

const CATEGORIES = [
  'All',
  'Dresses',
  'Tops & Shirts',
  'Trousers & Skirts',
  'Outerwear',
  'Leather Goods',
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Curated Order' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Alphabetical (A–Z)' },
];

export const ShopView: React.FC<ShopViewProps> = ({
  initialCategory,
  initialQuery,
  initialSort,
  onUpdateUrlParams,
  onSelectProduct,
}) => {
  const [category, setCategory] = useState(initialCategory || 'All');
  const [searchInput, setSearchInput] = useState(initialQuery || '');
  const [activeQuery, setActiveQuery] = useState(initialQuery || '');
  const [sort, setSort] = useState(initialSort || 'featured');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCategory(initialCategory || 'All');
    setSearchInput(initialQuery || '');
    setActiveQuery(initialQuery || '');
    setSort(initialSort || 'featured');
  }, [initialCategory, initialQuery, initialSort]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .fetchProducts({
        category,
        q: activeQuery,
        sort,
      })
      .then((res) => {
        if (!cancelled) {
          setProducts(res);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load catalogue.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [category, activeQuery, sort]);

  const applyFilter = (nextCategory: string, nextQuery: string, nextSort: string) => {
    setCategory(nextCategory);
    setActiveQuery(nextQuery);
    setSort(nextSort);
    onUpdateUrlParams({
      category: nextCategory,
      q: nextQuery,
      sort: nextSort,
    });
  };

  const handleSearchForm = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilter(category, searchInput.trim(), sort);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-8 sm:pt-12">
      <div className="pb-8 border-b border-[#161514]/15 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-mono-num uppercase tracking-[0.2em] text-[#5A4638]">
            AUTUMN / WINTER CATALOGUE
          </p>
          <h1 className="font-editorial text-[38px] sm:text-[48px] font-normal text-[#161514] leading-none mt-2">
            {category === 'All' ? 'All Garments & Objects' : category}
          </h1>
        </div>

        <p className="text-[13px] text-[#5A4638] max-w-md leading-relaxed">
          Small-batch womenswear and architectural leather goods cut and finished in Victoria Island, Lagos.
        </p>
      </div>

      <div className="py-6 border-b border-[#161514]/12 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          {CATEGORIES.map((cat) => {
            const isActive = category.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => applyFilter(cat, activeQuery, sort)}
                className={`px-4 py-2 text-[11px] tracking-[0.15em] uppercase whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#161514] text-[#F7F5F0]'
                    : 'bg-transparent text-[#5A4638] border border-[#161514]/15 hover:border-[#161514] hover:text-[#161514]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <form onSubmit={handleSearchForm} className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#5A4638] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (e.target.value === '') {
                  applyFilter(category, '', sort);
                }
              }}
              placeholder="Search fabric, colour, silhouette..."
              className="w-full pl-9 pr-8 py-2 bg-[#FAF8F5] border border-[#161514]/20 text-[12px] text-[#161514] placeholder-[#786B5E] focus:outline-none focus:border-[#161514]"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  applyFilter(category, '', sort);
                }}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5A4638] hover:text-[#161514]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          <div className="flex items-center gap-2">
            <label
              htmlFor="shop-sort"
              className="text-[11px] font-mono-num uppercase tracking-[0.12em] text-[#5A4638] whitespace-nowrap"
            >
              Sort:
            </label>
            <select
              id="shop-sort"
              value={sort}
              onChange={(e) => applyFilter(category, activeQuery, e.target.value)}
              className="px-3 py-2 bg-[#FAF8F5] border border-[#161514]/20 text-[12px] text-[#161514] focus:outline-none focus:border-[#161514] cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="py-4 flex items-center justify-between text-[12px] text-[#5A4638]">
        <div className="flex items-center gap-2">
          <span className="font-mono-num">
            {loading ? 'Loading archive...' : `Showing ${products.length} piece${products.length === 1 ? '' : 's'}`}
          </span>
          {activeQuery && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                Search: <strong className="text-[#161514]">“{activeQuery}”</strong>
              </span>
            </>
          )}
        </div>

        {(category !== 'All' || activeQuery !== '' || sort !== 'featured') && (
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              applyFilter('All', '', 'featured');
            }}
            className="text-[11px] uppercase tracking-[0.14em] text-[#161514] underline underline-offset-4 hover:text-[#5A4638] cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-7 gap-y-12">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] bg-[#EAE5DC] animate-pulse" />
              <div className="h-5 w-2/3 bg-[#EAE5DC] animate-pulse" />
              <div className="h-4 w-1/3 bg-[#EAE5DC] animate-pulse" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="my-16 p-12 border border-[#7C4D36]/30 bg-[#FAF8F5] text-center space-y-4">
          <p className="font-editorial text-[26px] text-[#161514]">{error}</p>
          <button
            type="button"
            onClick={() => applyFilter(category, activeQuery, sort)}
            className="px-6 py-2.5 bg-[#161514] text-[#F7F5F0] text-[11px] tracking-[0.16em] uppercase cursor-pointer"
          >
            Retry Loading Catalogue
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="my-16 py-20 px-6 border border-[#161514]/12 bg-[#FAF8F5] text-center space-y-4">
          <p className="font-editorial text-[28px] text-[#161514]">
            No garments match your current selection.
          </p>
          <p className="text-[13px] text-[#5A4638] max-w-md mx-auto">
            Try clearing your search filter or exploring all categories from our Autumn / Winter collection.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              applyFilter('All', '', 'featured');
            }}
            className="mt-2 px-7 py-3 bg-[#161514] text-[#F7F5F0] text-[11px] tracking-[0.16em] uppercase hover:bg-[#3E3027] transition-colors cursor-pointer"
          >
            View All Garments
          </button>
        </div>
      ) : (
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-7 gap-y-12">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
};
