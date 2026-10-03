import React, { useState } from 'react';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '../types/store';
import { formatNaira } from '../lib/api';

interface BagDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, variantId: string, newQty: number) => Promise<void>;
  onRemoveItem: (cartItemId: string) => Promise<void>;
  onProceedToCheckout: () => void;
  onSelectProduct: (slug: string) => void;
}

export const BagDrawer: React.FC<BagDrawerProps> = ({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onSelectProduct,
}) => {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const freeLagosShippingThreshold = 250000;
  const remainingForFreeShipping = Math.max(0, freeLagosShippingThreshold - subtotal);

  const handleQty = async (item: CartItem, nextQty: number) => {
    setErrorMsg(null);
    setBusyId(item.id);
    try {
      await onUpdateQuantity(item.product_id, item.variant_id, nextQty);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to update quantity.');
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (item: CartItem) => {
    setErrorMsg(null);
    setBusyId(item.id);
    try {
      await onRemoveItem(item.id);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to remove item.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#161514]/45 transition-opacity">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        aria-label="Shopping Bag"
        className="relative z-10 w-full sm:max-w-md bg-[#FAF8F5] h-[100dvh] flex flex-col border-l border-[#161514]/15 shadow-2xl"
      >
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#161514]/12 flex items-center justify-between">
          <div>
            <h2 className="font-editorial text-[22px] tracking-[0.06em] text-[#161514]">
              Shopping Bag
            </h2>
            <p className="text-[11px] font-mono-num uppercase tracking-[0.14em] text-[#5A4638]">
              {items.reduce((sum, i) => sum + i.quantity, 0)} Piece
              {items.reduce((sum, i) => sum + i.quantity, 0) === 1 ? '' : 's'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bag"
            className="p-2 text-[#161514] hover:text-[#5A4638] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-2.5 bg-[#EFECE5] border-b border-[#161514]/10 text-[11px] text-[#3E3027] tracking-[0.04em]">
          {remainingForFreeShipping === 0
            ? 'Your order qualifies for complimentary studio courier delivery across Lagos.'
            : `Add ${formatNaira(remainingForFreeShipping)} more for complimentary Lagos courier dispatch.`}
        </div>

        {errorMsg && (
          <div className="px-4 sm:px-6 py-3 bg-[#7C4D36]/10 border-b border-[#7C4D36]/30 text-[12px] text-[#7C4D36]">
            {errorMsg}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 divide-y divide-[#161514]/10">
          {items.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <p className="font-editorial text-[22px] text-[#161514]">
                Your bag is currently empty.
              </p>
              <p className="text-[13px] text-[#5A4638] max-w-xs mx-auto leading-relaxed">
                Explore the Autumn / Winter collection to add tailored silhouettes and studio pieces.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-6 py-3 border border-[#161514] text-[11px] tracking-[0.16em] uppercase text-[#161514] hover:bg-[#161514] hover:text-[#F7F5F0] transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => {
              const isOutOfStock = item.variant.inventory_quantity === 0;
              const exceedsStock = item.quantity > item.variant.inventory_quantity;

              return (
                <div key={item.id} className="py-4 sm:py-5 flex gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectProduct(item.product.slug);
                    }}
                    className="w-16 h-24 sm:w-20 sm:h-28 bg-[#EAE5DC] shrink-0 overflow-hidden border border-[#161514]/10"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectProduct(item.product.slug);
                          }}
                          className="font-editorial text-[18px] text-[#161514] hover:text-[#5A4638] text-left leading-tight"
                        >
                          {item.product.name}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(item)}
                          disabled={busyId === item.id}
                          aria-label={`Remove ${item.product.name}`}
                          className="text-[#786B5E] hover:text-[#161514] p-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-1 text-[12px] text-[#5A4638] flex items-center gap-1.5">
                        <span>{item.variant.colour}</span>
                        <span aria-hidden="true">·</span>
                        <span>Size {item.variant.size}</span>
                      </div>

                      {(isOutOfStock || exceedsStock) && (
                        <p className="mt-1 text-[11px] text-[#7C4D36]">
                          {isOutOfStock
                            ? 'Out of stock in this size'
                            : `Only ${item.variant.inventory_quantity} left in stock`}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center border border-[#161514]/25 bg-[#F7F5F0]">
                        <button
                          type="button"
                          disabled={busyId === item.id}
                          onClick={() => handleQty(item, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="w-7 h-7 flex items-center justify-center text-[#161514] hover:bg-[#EAE5DC] transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-mono-num text-[12px] text-[#161514]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={
                            busyId === item.id ||
                            item.quantity >= item.variant.inventory_quantity
                          }
                          onClick={() => handleQty(item, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="w-7 h-7 flex items-center justify-center text-[#161514] hover:bg-[#EAE5DC] disabled:opacity-30 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono-num text-[13px] text-[#161514]">
                        {formatNaira(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 sm:p-6 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-[#161514]/15 bg-[#F7F5F0] space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[13px] text-[#5A4638]">
                <span>Subtotal</span>
                <span className="font-mono-num text-[15px] text-[#161514] font-medium">
                  {formatNaira(subtotal)}
                </span>
              </div>
              <p className="text-[11px] text-[#786B5E]">
                Courier dispatch fees calculated at checkout based on destination.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-6 bg-[#161514] text-[#F7F5F0] text-[12px] tracking-[0.16em] uppercase hover:bg-[#3E3027] transition-colors cursor-pointer"
              >
                Proceed to Checkout
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-6 border border-[#161514]/25 text-[11px] tracking-[0.16em] uppercase text-[#161514] hover:border-[#161514] transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
