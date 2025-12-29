import { resend, FROM_EMAIL } from "./index";
import type { Order } from "@/types/order";

export async function sendOrderConfirmation(order: Order): Promise<void> {
  if (!resend) {
    console.log("Resend not configured - skipping email");
    return;
  }

  const itemsList = order.items
    .map(
      (item) =>
        `- ${item.productTitle} (${item.variantTitle}) x${item.quantity} - $${(item.priceCents / 100).toFixed(2)}`
    )
    .join("\n");

  const shippingAddress = order.shippingAddress
    ? `${order.shippingAddress.line1}${order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}
${order.shippingAddress.country}`
    : "Not provided";

  await resend.emails.send({
    from: FROM_EMAIL,
    to: order.customerEmail,
    subject: `Order Confirmation #${order.orderNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #CC5500;">Thank you for your order!</h1>

        <p>Hi ${order.customerName || "there"},</p>

        <p>We've received your order and are getting it ready. We'll send you another email when it ships.</p>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Order #${order.orderNumber}</h2>

          <h3>Items:</h3>
          <pre style="font-family: inherit; white-space: pre-wrap;">${itemsList}</pre>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

          <p><strong>Subtotal:</strong> $${(order.subtotalCents / 100).toFixed(2)}</p>
          <p><strong>Shipping:</strong> $${(order.shippingCents / 100).toFixed(2)}</p>
          <p><strong>Tax:</strong> $${(order.taxCents / 100).toFixed(2)}</p>
          <p style="font-size: 1.2em;"><strong>Total:</strong> $${(order.totalCents / 100).toFixed(2)} ${order.currency}</p>
        </div>

        <div style="margin: 20px 0;">
          <h3>Shipping Address:</h3>
          <pre style="font-family: inherit; white-space: pre-wrap;">${shippingAddress}</pre>
        </div>

        <p>If you have any questions, please reply to this email or contact us at info@canvasprintshop.ca</p>

        <p>Thank you for shopping with Canvas Print Shop!</p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

        <p style="color: #666; font-size: 12px;">
          Canvas Print Shop<br>
          1172 Av. du Lac-Saint-Charles<br>
          Québec, QC, G3G 2S7, Canada
        </p>
      </div>
    `,
  });
}

export async function sendShippingUpdate(
  order: Order,
  trackingNumber: string,
  trackingUrl?: string
): Promise<void> {
  if (!resend) {
    console.log("Resend not configured - skipping email");
    return;
  }

  const trackingLink = trackingUrl
    ? `<a href="${trackingUrl}" style="color: #CC5500;">Track your package</a>`
    : `Tracking number: ${trackingNumber}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: order.customerEmail,
    subject: `Your order #${order.orderNumber} has shipped!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #CC5500;">Your order is on its way!</h1>

        <p>Hi ${order.customerName || "there"},</p>

        <p>Great news! Your order #${order.orderNumber} has been shipped.</p>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Tracking Information:</h3>
          <p>${trackingLink}</p>
        </div>

        <p>Thank you for shopping with Canvas Print Shop!</p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

        <p style="color: #666; font-size: 12px;">
          Canvas Print Shop<br>
          1172 Av. du Lac-Saint-Charles<br>
          Québec, QC, G3G 2S7, Canada
        </p>
      </div>
    `,
  });
}
