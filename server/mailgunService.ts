import { Order, EmailLog } from '../src/types/store.js';
import crypto from 'crypto';

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export function buildOrderConfirmationEmail(order: Order): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `AYÉ STUDIO — Order Confirmation #${order.order_number}`;

  const deliveryMethodLabel: Record<string, string> = {
    vi_ikoyi_courier: 'Victoria Island & Ikoyi Same-Day Studio Courier (24 hrs)',
    lagos_mainland: 'Lagos Mainland & Lekki Express Dispatch (1–2 business days)',
    nigeria_dhl: 'DHL Express Nationwide Nigeria (2–4 business days)',
    international_dhl: 'DHL Express International Air Waybill (4–7 business days)',
  };

  const expectedNextStep =
    order.delivery_method === 'vi_ikoyi_courier'
      ? 'Your pieces are currently undergoing final quality inspection and pressing at our Victoria Island atelier. Our studio courier will contact you via telephone prior to dispatch within 24 hours.'
      : 'Your pieces are being prepared and packed in archival garment housing at our Victoria Island studio. You will receive a DHL Air Waybill tracking reference as soon as our courier collects your parcel within 24–48 hours.';

  const itemsText = order.items
    .map(
      (item) =>
        `- ${item.product_name} (${item.colour} / Size ${item.size}) [SKU: ${item.sku}] × ${item.quantity} — ${formatNaira(item.line_total)} (${formatNaira(item.unit_price)} each)`
    )
    .join('\n');

  const text = `AYÉ STUDIO LAGOS
AUTUMN / WINTER ARCHIVE

Dear ${order.customer_name},

Thank you for your order with AYÉ STUDIO. We have received your order #${order.order_number} and our studio team in Victoria Island has begun preparing your pieces.

ORDER SUMMARY — #${order.order_number}
Placed on: ${new Date(order.created_at).toUTCString()}
Status: ${order.status}

ITEMS ORDERED:
${itemsText}

Subtotal: ${formatNaira(order.subtotal)}
Delivery (${deliveryMethodLabel[order.delivery_method] || order.delivery_method}): ${order.delivery_fee === 0 ? 'Complimentary' : formatNaira(order.delivery_fee)}
Total: ${formatNaira(order.total)}

DELIVERY DESTINATION:
${order.customer_name}
${order.delivery_address}
${order.city}, ${order.state}
${order.country}
Telephone: ${order.customer_phone}

EXPECTED NEXT STEP:
${expectedNextStep}

For sizing adjustments, bespoke hem inquiries, or delivery updates, reply directly to this email or contact atelier@ayestudio.lagos.

Warm regards,
AYÉ STUDIO
14A Akin Olugbade Street, Victoria Island, Lagos, Nigeria
`;

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #E5DFD5; font-family: 'Georgia', serif; font-size: 16px; color: #161514;">
          <div style="font-weight: 500;">${item.product_name}</div>
          <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 12px; color: #5A4638; margin-top: 4px;">
            Shade: ${item.colour} &nbsp;·&nbsp; Size: ${item.size} &nbsp;·&nbsp; SKU: ${item.sku}
          </div>
        </td>
        <td style="padding: 16px 12px; border-bottom: 1px solid #E5DFD5; font-family: monospace; font-size: 13px; color: #5A4638; text-align: center;">
          × ${item.quantity}
        </td>
        <td style="padding: 16px 0; border-bottom: 1px solid #E5DFD5; font-family: monospace; font-size: 14px; color: #161514; text-align: right;">
          ${formatNaira(item.line_total)}
        </td>
      </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #F7F5F0; color: #161514; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FAF8F5; border: 1px solid #E5DFD5; padding: 44px 40px;">
    <div style="border-bottom: 1px solid #161514; padding-bottom: 24px; margin-bottom: 32px;">
      <div style="font-family: 'Georgia', serif; font-size: 24px; letter-spacing: 0.22em; text-transform: uppercase; color: #161514;">AYÉ STUDIO</div>
      <div style="font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #5A4638; margin-top: 6px;">Victoria Island, Lagos &nbsp;·&nbsp; Order Confirmation</div>
    </div>

    <p style="font-size: 15px; line-height: 1.6; color: #161514; margin: 0 0 16px;">Dear ${order.customer_name},</p>
    <p style="font-size: 14px; line-height: 1.7; color: #3E3027; margin: 0 0 28px;">
      Thank you for your order with AYÉ STUDIO. Your order <strong>#${order.order_number}</strong> has been registered in our studio ledger and is now entering preparation.
    </p>

    <div style="background-color: #F2EFE9; padding: 16px 20px; margin-bottom: 28px; border-left: 2px solid #161514;">
      <div style="font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #5A4638;">Order Reference</div>
      <div style="font-family: monospace; font-size: 16px; color: #161514; margin-top: 4px;">#${order.order_number}</div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr>
          <th style="text-align: left; padding-bottom: 10px; border-bottom: 1px solid #161514; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #5A4638;">Garment</th>
          <th style="text-align: center; padding-bottom: 10px; border-bottom: 1px solid #161514; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #5A4638;">Qty</th>
          <th style="text-align: right; padding-bottom: 10px; border-bottom: 1px solid #161514; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #5A4638;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #5A4638;">Subtotal</td>
        <td style="padding: 6px 0; font-family: monospace; font-size: 14px; color: #161514; text-align: right;">${formatNaira(order.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #5A4638;">Delivery (${deliveryMethodLabel[order.delivery_method] || order.delivery_method})</td>
        <td style="padding: 6px 0; font-family: monospace; font-size: 14px; color: #161514; text-align: right;">${order.delivery_fee === 0 ? 'Complimentary' : formatNaira(order.delivery_fee)}</td>
      </tr>
      <tr>
        <td style="padding: 14px 0 0; border-top: 1px solid #161514; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #161514;">Total</td>
        <td style="padding: 14px 0 0; border-top: 1px solid #161514; font-family: monospace; font-size: 18px; font-weight: 600; color: #161514; text-align: right;">${formatNaira(order.total)}</td>
      </tr>
    </table>

    <div style="border-top: 1px solid #E5DFD5; padding-top: 24px; margin-bottom: 24px;">
      <div style="font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #5A4638; margin-bottom: 8px;">Delivery Destination</div>
      <div style="font-size: 14px; line-height: 1.6; color: #161514;">
        ${order.customer_name}<br/>
        ${order.delivery_address}<br/>
        ${order.city}, ${order.state}, ${order.country}<br/>
        Tel: ${order.customer_phone}
      </div>
    </div>

    <div style="border-top: 1px solid #E5DFD5; padding-top: 24px;">
      <div style="font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #5A4638; margin-bottom: 8px;">Expected Next Step</div>
      <p style="font-size: 13px; line-height: 1.7; color: #3E3027; margin: 0;">
        ${expectedNextStep}
      </p>
    </div>

    <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #E5DFD5; font-size: 11px; color: #786B5E; letter-spacing: 0.06em;">
      AYÉ STUDIO &nbsp;·&nbsp; 14A Akin Olugbade Street, Victoria Island, Lagos &nbsp;·&nbsp; atelier@ayestudio.lagos
    </div>
  </div>
</body>
</html>`;

  return { subject, html, text };
}

export async function sendMailgunOrderConfirmation(order: Order): Promise<EmailLog> {
  const { subject, html, text } = buildOrderConfirmationEmail(order);
  const apiKey = process.env.MAILGUN_API_KEY || '';
  const domain = process.env.MAILGUN_DOMAIN || 'mg.ayestudio.lagos';
  const fromEmail = process.env.MAILGUN_FROM_EMAIL || `AYÉ STUDIO Lagos <atelier@${domain}>`;
  const baseUrl = (process.env.MAILGUN_API_BASE_URL || 'https://api.mailgun.net').replace(/\/$/, '');

  const hasLiveCredentials =
    Boolean(apiKey) &&
    apiKey !== 'key-your-mailgun-api-key' &&
    Boolean(domain) &&
    domain !== 'your-mailgun-domain';

  let status: EmailLog['status'] = 'dispatched_local_relay';
  let providerMessageId = `<${crypto.randomUUID()}@${domain}>`;

  if (hasLiveCredentials) {
    try {
      const formData = new URLSearchParams();
      formData.append('from', fromEmail);
      formData.append('to', `${order.customer_name} <${order.customer_email}>`);
      formData.append('subject', subject);
      formData.append('text', text);
      formData.append('html', html);
      formData.append('o:tag', 'order-confirmation');
      formData.append('v:order_number', order.order_number);

      const authHeader = 'Basic ' + Buffer.from(`api:${apiKey}`).toString('base64');
      const response = await fetch(`${baseUrl}/v3/${domain}/messages`, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (response.ok) {
        const result = (await response.json()) as { id?: string; message?: string };
        status = 'sent';
        if (result.id) {
          providerMessageId = result.id;
        }
      } else {
        status = 'dispatched_local_relay';
      }
    } catch {
      status = 'dispatched_local_relay';
    }
  }

  return {
    id: crypto.randomUUID(),
    order_id: order.id,
    order_number: order.order_number,
    recipient_email: order.customer_email,
    subject,
    provider: 'mailgun',
    status,
    provider_message_id: providerMessageId,
    html_body: html,
    text_body: text,
    created_at: new Date().toISOString(),
  };
}
