import React, { useState, useEffect } from 'react';
import { LogOut, Mail, Package, Check } from 'lucide-react';
import { User, Order } from '../types/store';
import { api, formatNaira } from '../lib/api';

interface AccountViewProps {
  user: User | null;
  onOpenAuthModal: () => void;
  onLogout: () => Promise<void>;
  onUserUpdated: (user: User) => void;
  onSelectProduct: (slug: string) => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  user,
  onOpenAuthModal,
  onLogout,
  onUserUpdated,
  onSelectProduct,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [expandedEmailOrderId, setExpandedEmailOrderId] = useState<string | null>(null);

  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.default_address || '');
  const [city, setCity] = useState(user?.default_city || 'Victoria Island');
  const [stateName, setStateName] = useState(user?.default_state || 'Lagos');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }

    setPhone(user.phone || '');
    setAddress(user.default_address || '');
    setCity(user.default_city || 'Victoria Island');
    setStateName(user.default_state || 'Lagos');

    setLoadingOrders(true);
    setOrdersError(null);
    api
      .fetchMyOrders()
      .then((res) => {
        setOrders(res);
        setLoadingOrders(false);
      })
      .catch((err: unknown) => {
        setOrdersError(err instanceof Error ? err.message : 'Could not load order history.');
        setLoadingOrders(false);
      });
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setProfileSaved(false);
    try {
      const updated = await api.updateProfile({
        phone,
        default_address: address,
        default_city: city,
        default_state: stateName,
      });
      onUserUpdated(updated);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } finally {
      setSavingProfile(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-5 sm:px-8 py-20">
        <div className="bg-[#FAF8F5] border border-[#161514]/20 p-8 sm:p-12 text-center space-y-6 shadow-sm">
          <p className="text-[11px] font-mono-num uppercase tracking-[0.2em] text-[#5A4638]">
            CLIENT ARCHIVE &amp; ORDERS
          </p>
          <h1 className="font-editorial text-[36px] text-[#161514] leading-tight">
            Sign in to your AYÉ STUDIO account
          </h1>
          <p className="text-[14px] text-[#3E3027] leading-relaxed">
            Access your order history and keep your delivery preferences ready for the next piece, securely linked to your Google account.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                onOpenAuthModal();
              }}
              className="w-full py-4 px-6 bg-[#161514] text-[#F7F5F0] text-[12px] tracking-[0.18em] uppercase hover:bg-[#3E3027] transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-md"
            >
              <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
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
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-8 sm:pt-12 pb-16 studio-reveal">
      <div className="relative overflow-hidden bg-[#EFECE5] border border-[#161514]/15 px-6 sm:px-10 py-8 sm:py-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div aria-hidden="true" className="absolute right-0 top-0 h-full w-24 border-l border-[#161514]/10 opacity-70" />
        <div>
          <p className="text-[11px] font-mono-num uppercase tracking-[0.2em] text-[#5A4638]">
            PRIVATE CLIENT ARCHIVE
          </p>
          <h1 className="relative font-editorial text-[38px] sm:text-[46px] font-normal text-[#161514] leading-none mt-2">
            {user.name}
          </h1>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="relative self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 border border-[#161514]/30 text-[11px] uppercase tracking-[0.16em] text-[#161514] hover:bg-[#161514] hover:text-[#F7F5F0] transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="pt-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-baseline justify-between border-b border-[#161514]/12 pb-3">
            <h2 className="font-editorial text-[28px] text-[#161514]">
              Order History ({orders.length})
            </h2>
            <span className="text-[11px] font-mono-num uppercase tracking-[0.14em] text-[#5A4638]">
              YOUR COLLECTION HISTORY
            </span>
          </div>

          {loadingOrders ? (
            <div className="space-y-4">
              <div className="h-36 bg-[#EAE5DC] animate-pulse" />
              <div className="h-36 bg-[#EAE5DC] animate-pulse" />
            </div>
          ) : ordersError ? (
            <div className="p-6 border border-[#7C4D36]/30 bg-[#FAF8F5] text-[13px] text-[#7C4D36]">
              {ordersError}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 border border-[#161514]/15 bg-[#FAF8F5] text-center space-y-3">
              <Package className="w-6 h-6 text-[#5A4638] mx-auto" />
              <p className="font-editorial text-[24px] text-[#161514]">
                No orders recorded yet.
              </p>
              <p className="text-[13px] text-[#5A4638] max-w-sm mx-auto">
                Your confirmed pieces will appear here, with delivery details and order totals kept in one quiet archive.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {orders.map((order) => {
                const emailExpanded = expandedEmailOrderId === order.id;
                return (
                  <div
                    key={order.id}
                    className="bg-[#FAF8F5] border border-[#161514]/20 p-6 sm:p-8 space-y-6 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161514]/12">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono-num text-[16px] font-medium text-[#161514]">
                            #{order.order_number}
                          </span>
                          <span aria-hidden="true" className="text-[#5A4638]">
                            ·
                          </span>
                          <span className="text-[12px] uppercase tracking-[0.12em] text-[#3E3027]">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[12px] font-mono-num text-[#786B5E] mt-1">
                          Placed on{' '}
                          {new Date(order.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="text-[11px] font-mono-num uppercase tracking-[0.12em] text-[#5A4638]">
                          Total Amount
                        </div>
                        <div className="font-mono-num text-[17px] font-medium text-[#161514]">
                          {formatNaira(order.total)}
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-[#161514]/10">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="py-3.5 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <button
                              type="button"
                              onClick={() => onSelectProduct(item.product_slug)}
                              className="w-12 h-16 bg-[#EAE5DC] border border-[#161514]/10 overflow-hidden shrink-0 cursor-pointer"
                            >
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            </button>
                            <div>
                              <button
                                type="button"
                                onClick={() => onSelectProduct(item.product_slug)}
                                className="font-editorial text-[18px] text-[#161514] hover:text-[#5A4638] text-left cursor-pointer"
                              >
                                {item.product_name}
                              </button>
                              <p className="text-[12px] text-[#5A4638]">
                                {item.colour} &nbsp;·&nbsp; Size {item.size} &nbsp;·&nbsp; Qty{' '}
                                {item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono-num text-[13px] text-[#161514]">
                            {formatNaira(item.line_total)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-[#161514]/12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[12px] text-[#5A4638]">
                      <div>
                        <span className="uppercase tracking-[0.1em] text-[11px]">
                          Destination:
                        </span>{' '}
                        <span className="text-[#161514]">
                          {order.delivery_address}, {order.city}, {order.state}
                        </span>
                      </div>

                      {order.email_log && (
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedEmailOrderId(emailExpanded ? null : order.id);
                          }}
                          className="inline-flex items-center gap-2 text-[11px] font-mono-num uppercase tracking-[0.12em] text-[#161514] underline underline-offset-4 cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>
                            {emailExpanded
                              ? 'Hide Confirmation'
                              : 'View Confirmation'}
                          </span>
                        </button>
                      )}
                    </div>

                    {emailExpanded && order.email_log && (
                      <div className="p-4 bg-[#F7F5F0] border border-[#161514]/20 animate-in fade-in duration-200">
                        <pre className="text-[11px] font-mono-num text-[#161514] whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-64">
                          {order.email_log.text_body}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 bg-[#FAF8F5] border border-[#161514]/20 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-[#161514]/12 pb-3">
            <p className="text-[11px] font-mono-num uppercase tracking-[0.16em] text-[#5A4638]">
              CLIENT PREFERENCES
            </p>
            <h2 className="font-editorial text-[24px] text-[#161514] mt-1">
              Default Delivery Address
            </h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono-num uppercase tracking-[0.12em] text-[#5A4638] mb-1">
                Telephone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 803 000 0000"
                className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#161514]/20 text-[13px] text-[#161514] focus:outline-none focus:border-[#161514]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono-num uppercase tracking-[0.12em] text-[#5A4638] mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="14A Akin Olugbade Street"
                className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#161514]/20 text-[13px] text-[#161514] focus:outline-none focus:border-[#161514]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono-num uppercase tracking-[0.12em] text-[#5A4638] mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#161514]/20 text-[13px] text-[#161514] focus:outline-none focus:border-[#161514]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono-num uppercase tracking-[0.12em] text-[#5A4638] mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F0] border border-[#161514]/20 text-[13px] text-[#161514] focus:outline-none focus:border-[#161514]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-3 px-5 bg-[#161514] text-[#F7F5F0] text-[11px] tracking-[0.16em] uppercase hover:bg-[#3E3027] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {profileSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved to Profile</span>
                </>
              ) : savingProfile ? (
                'Saving...'
              ) : (
                'Save Delivery Preferences'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
