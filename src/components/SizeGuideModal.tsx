import React from 'react';
import { X } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  category,
}) => {
  if (!isOpen) return null;

  const rows = [
    { size: 'XS', uk: '6', eu: '34', us: '2', bust: '81–84', waist: '63–66', hip: '89–92' },
    { size: 'S', uk: '8', eu: '36', us: '4', bust: '85–88', waist: '67–70', hip: '93–96' },
    { size: 'M', uk: '10', eu: '38', us: '6', bust: '89–93', waist: '71–75', hip: '97–101' },
    { size: 'L', uk: '12–14', eu: '40–42', us: '8–10', bust: '94–99', waist: '76–81', hip: '102–107' },
    { size: 'XL', uk: '16', eu: '44', us: '12', bust: '100–106', waist: '82–88', hip: '108–114' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#161514]/55 p-4 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-2xl bg-[#FAF8F5] border border-[#161514]/20 p-6 sm:p-10 shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#161514]/15 pb-4 mb-6">
          <div>
            <p className="text-[11px] font-mono-num uppercase tracking-[0.16em] text-[#5A4638]">
              AYÉ STUDIO · VICTORIA ISLAND ATELIER
            </p>
            <h3 className="font-editorial text-[28px] text-[#161514] mt-1">
              Size &amp; Proportion Guide {category ? `— ${category}` : ''}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close size guide"
            className="p-1.5 text-[#5A4638] hover:text-[#161514] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[13px] text-[#3E3027] leading-relaxed mb-6">
          All AYÉ STUDIO garments are drafted on our in-house block in Lagos. Bias-cut silk pieces mould to your natural frame, while tailored trousers include a 5cm blind hem allowance for complimentary length adjustment at our Victoria Island studio.
        </p>

        <div className="overflow-x-auto border border-[#161514]/15">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EFECE5] border-b border-[#161514]/15 text-[11px] font-mono-num uppercase tracking-[0.12em] text-[#5A4638]">
                <th className="py-3 px-4">AYÉ Size</th>
                <th className="py-3 px-4">NG / UK</th>
                <th className="py-3 px-4">EU</th>
                <th className="py-3 px-4">US</th>
                <th className="py-3 px-4">Bust (cm)</th>
                <th className="py-3 px-4">Waist (cm)</th>
                <th className="py-3 px-4">Hip (cm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161514]/10 text-[13px] font-mono-num text-[#161514]">
              {rows.map((r) => (
                <tr key={r.size} className="hover:bg-[#F2EFE9]">
                  <td className="py-3 px-4 font-medium">{r.size}</td>
                  <td className="py-3 px-4">{r.uk}</td>
                  <td className="py-3 px-4">{r.eu}</td>
                  <td className="py-3 px-4">{r.us}</td>
                  <td className="py-3 px-4">{r.bust}</td>
                  <td className="py-3 px-4">{r.waist}</td>
                  <td className="py-3 px-4">{r.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#161514]/12 text-[12px] text-[#5A4638]">
          <span>
            Between sizes? For bias-cut silk dresses we recommend sizing up for fluid drape.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#161514] text-[#F7F5F0] text-[11px] tracking-[0.16em] uppercase hover:bg-[#3E3027] transition-colors shrink-0 cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
