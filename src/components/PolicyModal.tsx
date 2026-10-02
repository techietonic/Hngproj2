import React from 'react';
import { X } from 'lucide-react';

interface PolicyModalProps {
  policy: 'shipping' | 'privacy' | 'care' | null;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ policy, onClose }) => {
  if (!policy) return null;

  const content = {
    shipping: {
      kicker: 'DISPATCH & RETURNS LEDGER',
      title: 'Shipping & Returns',
      sections: [
        {
          heading: 'Lagos Studio Courier (Victoria Island, Ikoyi & Lekki)',
          body: 'Orders placed before 14:00 WAT are dispatched via dedicated studio courier within 24 hours. Delivery is complimentary on all orders above ₦250,000, or ₦5,000–₦7,500 standard flat rate.',
        },
        {
          heading: 'Nationwide Nigeria & International DHL Express',
          body: 'Domestic deliveries outside Lagos ship via DHL Express (2–4 business days, ₦16,500). International parcels ship via DHL Express Air Waybill (4–7 business days, ₦65,000) with full tracking sent via Mailgun confirmation.',
        },
        {
          heading: 'Returns & Exchanges',
          body: 'Unworn garments with original studio swing tags intact may be returned or exchanged within 14 days of receipt. Complimentary courier collection is available within Lagos.',
        },
      ],
    },
    care: {
      kicker: 'TEXTILE PRESERVATION',
      title: 'Garment Care & Studio Alterations',
      sections: [
        {
          heading: 'Mulberry Silk & Bias-Cut Pieces',
          body: 'Store bias-cut garments folded in acid-free tissue or suspended by their internal grosgrain loops to prevent stretching along the 45-degree grain. Specialist dry clean only.',
        },
        {
          heading: 'Hand-Loomed Iseyin Aso-Oke',
          body: 'Our indigenous strip-weave cotton is unbleached and unmercerised. Air between wears and spot-clean or cold hand wash with pH-neutral soap.',
        },
        {
          heading: 'Complimentary Hem Adjustments',
          body: 'Every pair of AYÉ STUDIO trousers includes a 5cm internal hem allowance. Clients in Lagos may visit our Akin Olugbade Street studio for complimentary hemming.',
        },
      ],
    },
    privacy: {
      kicker: 'CLIENT CONFIDENTIALITY',
      title: 'Privacy & Data Stewardship',
      sections: [
        {
          heading: 'Client Records & Order Data',
          body: 'AYÉ STUDIO collects only the contact and delivery details necessary to fulfil your order, send transactional Mailgun dispatch confirmations, and maintain your client archive.',
        },
        {
          heading: 'Google OAuth Authentication',
          body: 'When you sign in with Google, we verify your identity via OAuth 2.0 to associate your order history with your profile. We never sell or share client data with third-party marketers.',
        },
      ],
    },
  }[policy];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#161514]/55 p-4 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-xl bg-[#FAF8F5] border border-[#161514]/20 p-7 sm:p-10 shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#161514]/15 pb-4 mb-6">
          <div>
            <p className="text-[11px] font-mono-num uppercase tracking-[0.16em] text-[#5A4638]">
              {content.kicker}
            </p>
            <h3 className="font-editorial text-[28px] text-[#161514] mt-1">
              {content.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close policy modal"
            className="p-1 text-[#5A4638] hover:text-[#161514] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {content.sections.map((sec) => (
            <div key={sec.heading} className="space-y-1.5">
              <h4 className="text-[12px] uppercase tracking-[0.12em] font-medium text-[#161514]">
                {sec.heading}
              </h4>
              <p className="text-[13px] text-[#3E3027] leading-relaxed">
                {sec.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t border-[#161514]/12 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[#161514] text-[#F7F5F0] text-[11px] tracking-[0.16em] uppercase hover:bg-[#3E3027] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
