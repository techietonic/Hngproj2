import React, { useState } from 'react';
import { Check, Mail, ArrowRight } from 'lucide-react';
import { Order, EmailLog } from '../types/store';
import { formatNaira } from '../lib/api';

interface OrderConfirmationViewProps {
  order: Order;
  emailLog?: EmailLog | null;
  onContinueShopping: () => void;
  onViewAccountOrders: () => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
  order,
  emailLog,
  onContinueShopping,
  onViewAccountOrders,
}) => {
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const effectiveEmailLog = emailLog || order.email_log || null;

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <div className="bg-[#FAF8F5] border border-[#161514]/20 p-7 sm:p-12 space-y-10 shadow-sm">
        <div className="border-b border-[#161514] pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono-num uppercase tracking-[0.18em] text-[#5A4638]">
              <Check className="w-3.5 h-3.5 text-[#161514]" />
              <span>ORDER REGISTERED IN STUDIO LEDGER</span>
            </div>
            <h1 className="font-editorial text-[36px] sm:text-[44px] font-normal text-[#161514] leading-none">
              Thank you, {order.customer_name}.
            </h1>
          </div>

          <div className="bg-[#EFECE5] px-5 py-3 border-l-2 border-[#161514]">
            <div className="text-[10px] font-mono-num uppercase tracking-[0.16em] text-[#5A4638]">
              Order Number
            </div>
            <div className="font-mono-num text-[18px] font-medium text-[#161514] mt-0.5">
              #{order.order_number}
            </div>
          </div>
        </div>

        <div className="p-5 bg-[#EFECE5] border border-[#161514]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <Mail className="w-5 h-5 text-[#161514] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-[13px] font-medium text-[#161514]">
                Confirmation email dispatched via Mailgun to {order.customer_email}
              </div>
              <p className="text-[12px] text-[#5A4638]">
                Message ID:{' '}
                <span className="font-mono-num">
                  {effectiveEmailLog?.provider_message_id || order.mailgun_message_id || 'Recorded'}
                </span>
              </p>
            </div>
          </div>

          {effectiveEmailLog && (
            <button
              type="button"
              onClick={() => {
                setShowEmailPreview(!showEmailPreview);
              }}
              className="px-4 py-2 border border-[#161514] text-[11px] font-mono-num uppercase tracking-[0.14em] text-[#161514] hover:bg-[#161514] hover:text-[#F7F5F0] transition-colors shrink-0 cursor-pointer"
            >
              {showEmailPreview ? 'Hide Email Receipt' : 'Inspect Mailgun Email'}
            </button>
          )}
        </div>

        {showEmailPreview && effectiveEmailLog && (
          <div className="border border-[#161514]/25 bg-[#F7F5F0] p-5 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono-num uppercase tracking-[0.12em] text-[#5A4638] border-b border-[#161514]/12 pb-2">
              <span>Subject: {effectiveEmailLog.subject}</span>
              <span>To: {effectiveEmailLog.recipient_email}</span>
            </div>
            <pre className="text-[12px] font-mono-num text-[#161514] whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-80">
              {effectiveEmailLog.text_body}
            </pre>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="font-editorial text-[24px] text-[#161514]">
            Reserved Garments &amp; Pieces
          </h2>

          <div className="divide-y divide-[#161514]/12 border-y border-[#161514]/15">
            {order.items.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-20 bg-[#EAE5DC] border border-[#161514]/10 overflow-hidden shrink-0">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-editorial text-[19px] text-[#161514]">
                      {item.product_name}
                    </h3>
                    <p className="text-[12px] text-[#5A4638]">
                      Shade: {item.colour} &nbsp;·&nbsp; Size: {item.size} &nbsp;·&nbsp; SKU: {item.sku}
                    </p>
                    <p className="text-[12px] font-mono-num text-[#786B5E] mt-0.5">
                      Qty: {item.quantity} × {formatNaira(item.unit_price)}
                    </p>
                  </div>
                </div>
                <span className="font-mono-num text-[14px] text-[#161514] shrink-0">
                  {formatNaira(item.line_total)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          <div className="space-y-2">
            <div className="text-[11px] font-mono-num uppercase tracking-[0.16em] text-[#5A4638]">
              Delivery Destination
            </div>
            <div className="text-[14px] text-[#161514] leading-relaxed">
              <p className="font-medium">{order.customer_name}</p>
              <p>{order.delivery_address}</p>
              <p>
                {order.city}, {order.state}, {order.country}
              </p>
              <p className="text-[#5A4638] mt-1">Tel: {order.customer_phone}</p>
            </div>
          </div>

          <div className="space-y-2.5 text-[13px]">
            <div className="flex justify-between text-[#5A4638]">
              <span>Subtotal</span>
              <span className="font-mono-num text-[#161514]">{formatNaira(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#5A4638]">
              <span>Courier Dispatch</span>
              <span className="font-mono-num text-[#161514]">
                {order.delivery_fee === 0 ? 'Complimentary' : formatNaira(order.delivery_fee)}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-[#161514] text-[15px] font-medium text-[#161514]">
              <span className="uppercase tracking-[0.12em] text-[12px]">Total</span>
              <span className="font-mono-num text-[18px]">{formatNaira(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#161514]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={onViewAccountOrders}
            className="w-full sm:w-auto px-6 py-3 border border-[#161514] text-[11px] tracking-[0.16em] uppercase text-[#161514] hover:bg-[#EFECE5] transition-colors cursor-pointer"
          >
            View Order History in Account
          </button>

          <button
            type="button"
            onClick={onContinueShopping}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#161514] text-[#F7F5F0] text-[11px] tracking-[0.18em] uppercase hover:bg-[#3E3027] transition-colors cursor-pointer"
          >
            <span>Continue Exploring Archive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
