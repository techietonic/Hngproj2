import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CartItem, User, CheckoutFormPayload, Order, EmailLog } from '../types/store';
import { api, formatNaira } from '../lib/api';

interface CheckoutViewProps {
  cart: CartItem[];
  user: User | null;
  onBackToShop: () => void;
  onOpenAuthModal: () => void;
  onOrderCreated: (order: Order, emailLog: EmailLog) => void;
}

const NIGERIAN_STATES = [
  'Lagos',
  'Abuja (FCT)',
  'Rivers',
  'Oyo',
  'Ogun',
  'Kano',
  'Enugu',
  'Delta',
  'Edo',
  'Kaduna',
  'Anambra',
  'Akwa Ibom',
  'Cross River',
  'Kwara',
  'Osun',
  'Ondo',
  'Other / International',
];

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  user,
  onBackToShop,
  onOpenAuthModal,
  onOrderCreated,
}) => {
  const [form, setForm] = useState<CheckoutFormPayload>({
    customer_name: user?.name || '',
    customer_email: user?.email || '',
    customer_phone: user?.phone || '',
    delivery_address: user?.default_address || '',
    city: user?.default_city || 'Victoria Island',
    state: user?.default_state || 'Lagos',
    country: user?.default_country || 'Nigeria',
    delivery_method: 'vi_ikoyi_courier',
    delivery_notes: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        customer_name: prev.customer_name || user.name || '',
        customer_email: prev.customer_email || user.email || '',
        customer_phone: prev.customer_phone || user.phone || '',
        delivery_address: prev.delivery_address || user.default_address || '',
        city: prev.city || user.default_city || 'Victoria Island',
        state: prev.state || user.default_state || 'Lagos',
        country: prev.country || user.default_country || 'Nigeria',
      }));
    }
  }, [user]);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const computeDeliveryFee = (method: CheckoutFormPayload['delivery_method']): number => {
    if (method === 'vi_ikoyi_courier') return subtotal >= 250000 ? 0 : 5000;
    if (method === 'lagos_mainland') return subtotal >= 250000 ? 0 : 7500;
    if (method === 'nigeria_dhl') return 16500;
    return 65000;
  };

  const deliveryFee = computeDeliveryFee(form.delivery_method);
  const total = subtotal + deliveryFee;

  const validateClientSide = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.customer_name.trim() || form.customer_name.trim().length < 2) {
      errs.customer_name = 'Please enter your full name.';
    }
    if (
      !form.customer_email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email.trim())
    ) {
      errs.customer_email = 'Please enter a valid email address for order updates.';
    }
    if (
      !form.customer_phone.trim() ||
      !/^[+\d\s()-]{7,20}$/.test(form.customer_phone.trim())
    ) {
      errs.customer_phone = 'Please enter a valid phone number (e.g. +234 803 000 0000).';
    }
    if (!form.delivery_address.trim() || form.delivery_address.trim().length < 5) {
      errs.delivery_address = 'Please enter a complete street address and building number.';
    }
    if (!form.city.trim() || form.city.trim().length < 2) {
      errs.city = 'Please enter your delivery city or district.';
    }
    if (!form.state.trim()) {
      errs.state = 'Please select or enter a state.';
    }
    if (!form.country.trim()) {
      errs.country = 'Please enter your country.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    if (!validateClientSide()) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.submitOrder(form);
      onOrderCreated(result.order, result.emailLog);
    } catch (err: unknown) {
      const customErr = err as Error & { fieldErrors?: Record<string, string> };
      if (customErr.fieldErrors) {
        setFieldErrors(customErr.fieldErrors);
      }
      setGeneralError(customErr.message || 'Could not complete order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 text-center space-y-5">
        <h1 className="font-editorial text-[34px] text-[#161514]">
          Your bag is empty.
        </h1>
        <p className="text-[14px] text-[#5A4638] max-w-md mx-auto">
          Add garments from the Autumn / Winter collection before proceeding to checkout.
        </p>
        <button
          type="button"
          onClick={onBackToShop}
          className="px-7 py-3 bg-[#161514] text-[#F7F5F0] text-[11px] tracking-[0.16em] uppercase cursor-pointer"
        >
          Explore Catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-6 sm:pt-12 pb-8">
      <div className="pb-6 border-b border-[#161514]/15 flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={onBackToShop}
            className="inline-flex items-center gap-2 text-[11px] font-mono-num uppercase tracking-[0.14em] text-[#5A4638] hover:text-[#161514] mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>
          <h1 className="font-editorial text-[36px] sm:text-[44px] font-normal text-[#161514] leading-none">
            Studio Checkout
          </h1>
        </div>

        {!user && (
          <div className="hidden sm:flex items-center gap-3 text-[12px] text-[#5A4638]">
            <span>Have an AYÉ client profile?</span>
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="text-[#161514] underline underline-offset-4 uppercase tracking-[0.12em] text-[11px] cursor-pointer"
            >
              Sign in with Google
            </button>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="pt-7 sm:pt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start"
      >
        <div className="lg:col-span-7 space-y-10">
          {generalError && (
            <div className="p-4 bg-[#7C4D36]/10 border border-[#7C4D36]/35 text-[13px] text-[#7C4D36]">
              {generalError}
            </div>
          )}

          <div className="space-y-5">
            <div className="border-b border-[#161514]/12 pb-2 flex items-baseline justify-between">
              <h2 className="font-editorial text-[24px] text-[#161514]">
                01. Client Information
              </h2>
              <span className="text-[11px] font-mono-num uppercase tracking-[0.12em] text-[#5A4638]">
                Used for order updates
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label
                  htmlFor="checkout-name"
                  className="block text-[11px] font-mono-num uppercase tracking-[0.14em] text-[#5A4638] mb-1.5"
                >
                  Full Name *
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  value={form.customer_name}
                  onChange={(e) => {
                    setForm({ ...form, customer_name: e.target.value });
                    if (fieldErrors.customer_name) {
                      setFieldErrors({ ...fieldErrors, customer_name: '' });
                    }
                  }}
                  placeholder="e.g. Summie Apatira"
                  className={`w-full px-4 py-3 bg-[#FAF8F5] border text-[14px] text-[#161514] focus:outline-none ${
                    fieldErrors.customer_name
                      ? 'border-[#7C4D36]'
                      : 'border-[#161514]/25 focus:border-[#161514]'
                  }`}
                />
                {fieldErrors.customer_name && (
                  <p className="mt-1 text-[12px] text-[#7C4D36]">
                    {fieldErrors.customer_name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="checkout-email"
                  className="block text-[11px] font-mono-num uppercase tracking-[0.14em] text-[#5A4638] mb-1.5"
                >
                  Email Address *
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  value={form.customer_email}
                  onChange={(e) => {
                    setForm({ ...form, customer_email: e.target.value });
                    if (fieldErrors.customer_email) {
                      setFieldErrors({ ...fieldErrors, customer_email: '' });
                    }
                  }}
                  placeholder="client@example.com"
                  className={`w-full px-4 py-3 bg-[#FAF8F5] border text-[14px] text-[#161514] focus:outline-none ${
                    fieldErrors.customer_email
                      ? 'border-[#7C4D36]'
                      : 'border-[#161514]/25 focus:border-[#161514]'
                  }`}
                />
                {fieldErrors.customer_email && (
                  <p className="mt-1 text-[12px] text-[#7C4D36]">
                    {fieldErrors.customer_email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="checkout-phone"
                  className="block text-[11px] font-mono-num uppercase tracking-[0.14em] text-[#5A4638] mb-1.5"
                >
                  Telephone Number *
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  value={form.customer_phone}
                  onChange={(e) => {
                    setForm({ ...form, customer_phone: e.target.value });
                    if (fieldErrors.customer_phone) {
                      setFieldErrors({ ...fieldErrors, customer_phone: '' });
                    }
                  }}
                  placeholder="+234 803 000 0000"
                  className={`w-full px-4 py-3 bg-[#FAF8F5] border text-[14px] text-[#161514] focus:outline-none ${
                    fieldErrors.customer_phone
                      ? 'border-[#7C4D36]'
                      : 'border-[#161514]/25 focus:border-[#161514]'
                  }`}
                />
                {fieldErrors.customer_phone && (
                  <p className="mt-1 text-[12px] text-[#7C4D36]">
                    {fieldErrors.customer_phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="border-b border-[#161514]/12 pb-2">
              <h2 className="font-editorial text-[24px] text-[#161514]">
                02. Delivery Address
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label
                  htmlFor="checkout-address"
                  className="block text-[11px] font-mono-num uppercase tracking-[0.14em] text-[#5A4638] mb-1.5"
                >
                  Street Address &amp; Apartment / Suite *
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  value={form.delivery_address}
                  onChange={(e) => {
                    setForm({ ...form, delivery_address: e.target.value });
                    if (fieldErrors.delivery_address) {
                      setFieldErrors({ ...fieldErrors, delivery_address: '' });
                    }
                  }}
                  placeholder="e.g. 14A Akin Olugbade Street, Flat 3"
                  className={`w-full px-4 py-3 bg-[#FAF8F5] border text-[14px] text-[#161514] focus:outline-none ${
                    fieldErrors.delivery_address
                      ? 'border-[#7C4D36]'
                      : 'border-[#161514]/25 focus:border-[#161514]'
                  }`}
                />
                {fieldErrors.delivery_address && (
                  <p className="mt-1 text-[12px] text-[#7C4D36]">
                    {fieldErrors.delivery_address}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="checkout-city"
                  className="block text-[11px] font-mono-num uppercase tracking-[0.14em] text-[#5A4638] mb-1.5"
                >
                  City / District *
                </label>
                <input
                  id="checkout-city"
                  type="text"
                  value={form.city}
                  onChange={(e) => {
                    setForm({ ...form, city: e.target.value });
                    if (fieldErrors.city) {
                      setFieldErrors({ ...fieldErrors, city: '' });
                    }
                  }}
                  placeholder="Victoria Island"
                  className={`w-full px-4 py-3 bg-[#FAF8F5] border text-[14px] text-[#161514] focus:outline-none ${
                    fieldErrors.city
                      ? 'border-[#7C4D36]'
                      : 'border-[#161514]/25 focus:border-[#161514]'
                  }`}
                />
                {fieldErrors.city && (
                  <p className="mt-1 text-[12px] text-[#7C4D36]">{fieldErrors.city}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="checkout-state"
                  className="block text-[11px] font-mono-num uppercase tracking-[0.14em] text-[#5A4638] mb-1.5"
                >
                  State / Province *
                </label>
                <select
                  id="checkout-state"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#161514]/25 text-[14px] text-[#161514] focus:outline-none focus:border-[#161514]"
                >
                  {NIGERIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                {fieldErrors.state && (
                  <p className="mt-1 text-[12px] text-[#7C4D36]">{fieldErrors.state}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="checkout-country"
                  className="block text-[11px] font-mono-num uppercase tracking-[0.14em] text-[#5A4638] mb-1.5"
                >
                  Country *
                </label>
                <input
                  id="checkout-country"
                  type="text"
                  value={form.country}
                  onChange={(e) => {
                    setForm({ ...form, country: e.target.value });
                    if (fieldErrors.country) {
                      setFieldErrors({ ...fieldErrors, country: '' });
                    }
                  }}
                  placeholder="Nigeria"
                  className={`w-full px-4 py-3 bg-[#FAF8F5] border text-[14px] text-[#161514] focus:outline-none ${
                    fieldErrors.country
                      ? 'border-[#7C4D36]'
                      : 'border-[#161514]/25 focus:border-[#161514]'
                  }`}
                />
                {fieldErrors.country && (
                  <p className="mt-1 text-[12px] text-[#7C4D36]">{fieldErrors.country}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="border-b border-[#161514]/12 pb-2">
              <h2 className="font-editorial text-[24px] text-[#161514]">
                03. Courier Dispatch Method
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {(
                [
                  {
                    id: 'vi_ikoyi_courier',
                    title: 'Victoria Island & Ikoyi Studio Courier',
                    timeline: 'Same-day / 24-hour dispatch from Akin Olugbade Atelier',
                    fee: subtotal >= 250000 ? 0 : 5000,
                  },
                  {
                    id: 'lagos_mainland',
                    title: 'Lagos Mainland & Lekki Express Dispatch',
                    timeline: '1–2 business days dedicated rider',
                    fee: subtotal >= 250000 ? 0 : 7500,
                  },
                  {
                    id: 'nigeria_dhl',
                    title: 'DHL Express Nationwide (Abuja, Port Harcourt, Ibadan & all states)',
                    timeline: '2–4 business days tracked air parcel',
                    fee: 16500,
                  },
                  {
                    id: 'international_dhl',
                    title: 'DHL Express International (UK, Europe, US, West Africa)',
                    timeline: '4–7 business days international air waybill',
                    fee: 65000,
                  },
                ] as const
              ).map((option) => {
                const selected = form.delivery_method === option.id;
                return (
                  <label
                    key={option.id}
                    className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 border cursor-pointer transition-colors ${
                      selected
                        ? 'bg-[#EFECE5] border-[#161514]'
                        : 'bg-[#FAF8F5] border-[#161514]/20 hover:border-[#161514]/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="delivery_method"
                        checked={selected}
                        onChange={() =>
                          setForm({ ...form, delivery_method: option.id })
                        }
                        className="mt-1 accent-[#161514]"
                      />
                      <div>
                        <div className="text-[14px] font-medium text-[#161514]">
                          {option.title}
                        </div>
                        <div className="text-[12px] text-[#5A4638] mt-0.5">
                          {option.timeline}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono-num text-[13px] text-[#161514] shrink-0 pl-7 sm:pl-0">
                      {option.fee === 0 ? 'Complimentary' : formatNaira(option.fee)}
                    </span>
                  </label>
                );
              })}
            </div>

            <div>
              <label
                htmlFor="checkout-notes"
                className="block text-[11px] font-mono-num uppercase tracking-[0.14em] text-[#5A4638] mb-1.5"
              >
                Atelier or Delivery Notes (Optional)
              </label>
              <textarea
                id="checkout-notes"
                rows={2}
                value={form.delivery_notes}
                onChange={(e) => setForm({ ...form, delivery_notes: e.target.value })}
                placeholder="Gate code, bespoke hem length request, or preferred delivery window..."
                className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#161514]/25 text-[13px] text-[#161514] focus:outline-none focus:border-[#161514]"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-28 bg-[#FAF8F5] border border-[#161514]/20 p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-sm">
          <div className="border-b border-[#161514]/15 pb-4">
            <p className="text-[11px] font-mono-num uppercase tracking-[0.16em] text-[#5A4638]">
              ORDER ARCHIVE SUMMARY
            </p>
            <h2 className="font-editorial text-[26px] text-[#161514] mt-1">
              Your Selected Pieces ({cart.reduce((s, i) => s + i.quantity, 0)})
            </h2>
          </div>

          <div className="divide-y divide-[#161514]/10 max-h-96 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.id} className="py-4 flex gap-3 sm:gap-4">
                <div className="w-14 h-20 sm:w-16 sm:h-24 bg-[#EAE5DC] shrink-0 border border-[#161514]/10 overflow-hidden">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-editorial text-[17px] text-[#161514] truncate">
                      {item.product.name}
                    </h3>
                    <span className="font-mono-num text-[13px] text-[#161514] shrink-0">
                      {formatNaira(item.product.price * item.quantity)}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#5A4638] mt-0.5">
                    {item.variant.colour} &nbsp;·&nbsp; Size {item.variant.size}
                  </p>
                  <p className="text-[11px] font-mono-num text-[#786B5E] mt-1">
                    Qty: {item.quantity} × {formatNaira(item.product.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#161514]/15 pt-4 space-y-2.5 text-[13px]">
            <div className="flex justify-between text-[#5A4638]">
              <span>Subtotal</span>
              <span className="font-mono-num text-[#161514]">{formatNaira(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#5A4638]">
              <span>Courier Dispatch Fee</span>
              <span className="font-mono-num text-[#161514]">
                {deliveryFee === 0 ? 'Complimentary' : formatNaira(deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-[#161514] text-[15px] font-medium text-[#161514]">
              <span className="uppercase tracking-[0.12em] text-[12px]">Total (NGN)</span>
              <span className="font-mono-num text-[18px]">{formatNaira(total)}</span>
            </div>
          </div>

          <div className="p-4 bg-[#EFECE5] border-l-2 border-[#161514] text-[12px] text-[#3E3027] leading-relaxed">
            Your pieces are reserved securely and a confirmation with dispatch details will be sent to your email address.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 bg-[#161514] text-[#F7F5F0] text-[12px] tracking-[0.2em] uppercase hover:bg-[#3E3027] disabled:opacity-50 transition-colors cursor-pointer shadow-md"
          >
            {submitting
              ? 'Confirming Order...'
              : `Confirm Order — ${formatNaira(total)}`}
          </button>
        </div>
      </form>
    </div>
  );
};
