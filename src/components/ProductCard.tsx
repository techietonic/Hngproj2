import React from 'react';
import { Product } from '../types/store';
import { formatNaira } from '../lib/api';
import { EditorialImage } from './EditorialImage';

interface ProductCardProps {
  product: Product;
  onSelect: (slug: string) => void;
  aspectClassName?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  aspectClassName = 'aspect-[3/4]',
}) => {
  const totalStock =
    product.total_inventory ??
    product.variants.reduce((sum, v) => sum + v.inventory_quantity, 0);

  return (
    <article className="group flex flex-col">
      <button
        type="button"
        onClick={() => onSelect(product.slug)}
        className="text-left block w-full focus:outline-none cursor-pointer"
      >
        <EditorialImage
          src={product.images[0]}
          hoverSrc={product.images[1]}
          alt={product.name}
          aspectClassName={aspectClassName}
          colourHex={product.colour_hex}
        />

        <div className="pt-3.5 flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-editorial text-[20px] sm:text-[21px] leading-snug font-normal text-[#161514] group-hover:text-[#7D7063] transition-colors duration-200">
              {product.name}
            </h3>
            <span className="font-mono-num text-[13px] text-[#161514] shrink-0">
              {formatNaira(product.price)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 text-[12px] text-[#7D7063]">
            <div className="flex items-center gap-2 truncate">
              <span
                className="inline-block w-2 h-2 rounded-full border border-[#161514]/20 shrink-0"
                style={{ backgroundColor: product.colour_hex }}
                aria-hidden="true"
              />
              <span className="truncate">{product.colour}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{product.category}</span>
            </div>

            {totalStock === 0 ? (
              <span className="text-[10px] uppercase tracking-[0.14em] text-[#8C4A32] shrink-0">
                Sold Out
              </span>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono-num text-[#8D7F73] shrink-0">
                {product.variants.map((v) => (
                  <span
                    key={v.id}
                    className={
                      v.inventory_quantity === 0
                        ? 'line-through opacity-35'
                        : 'text-[#5A4638]'
                    }
                  >
                    {v.size}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </button>
    </article>
  );
};
