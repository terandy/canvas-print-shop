import { resend, FROM_EMAIL } from "./index";
import type { Order } from "@/types/order";

type Locale = "en" | "fr";

// Import translations directly for server-side email generation
import enMessages from "../../../messages/en.json";
import frMessages from "../../../messages/fr.json";

type EmailMessages = typeof enMessages.Email;

function getEmailTranslations(locale: Locale): EmailMessages {
  return locale === "fr" ? frMessages.Email : enMessages.Email;
}

function interpolate(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(
    /\{(\w+)\}/g,
    (_, key) => String(values[key] ?? `{${key}}`)
  );
}

export async function sendOrderConfirmation(
  order: Order,
  locale: Locale = "en"
): Promise<void> {
  if (!resend) {
    console.log("Resend not configured - skipping email");
    return;
  }

  const t = getEmailTranslations(locale).orderConfirmation;

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
    : t.notProvided;

  const greeting = order.customerName
    ? interpolate(t.greeting, { name: order.customerName })
    : t.greetingDefault;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: order.customerEmail,
    subject: interpolate(t.subject, { orderNumber: order.orderNumber }),
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #CC5500;">${t.thankYou}</h1>

        <p>${greeting},</p>

        <p>${t.received}</p>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">${interpolate(t.subject, { orderNumber: order.orderNumber })}</h2>

          <h3>${t.items}:</h3>
          <pre style="font-family: inherit; white-space: pre-wrap;">${itemsList}</pre>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

          <p><strong>${t.subtotal}:</strong> $${(order.subtotalCents / 100).toFixed(2)}</p>
          <p><strong>${t.shipping}:</strong> $${(order.shippingCents / 100).toFixed(2)}</p>
          <p><strong>${t.tax}:</strong> $${(order.taxCents / 100).toFixed(2)}</p>
          <p style="font-size: 1.2em;"><strong>${t.total}:</strong> $${(order.totalCents / 100).toFixed(2)} ${order.currency}</p>
        </div>

        <div style="margin: 20px 0;">
          <h3>${t.shippingAddress}:</h3>
          <pre style="font-family: inherit; white-space: pre-wrap;">${shippingAddress}</pre>
        </div>

        <p>${t.questions}</p>

        <p>${t.thankYouShopping}</p>

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
  trackingUrl?: string,
  locale: Locale = "en"
): Promise<void> {
  if (!resend) {
    console.log("Resend not configured - skipping email");
    return;
  }

  const t = getEmailTranslations(locale).shippingUpdate;

  const greeting = order.customerName
    ? interpolate(t.greeting, { name: order.customerName })
    : t.greetingDefault;

  const trackingLink = trackingUrl
    ? `<a href="${trackingUrl}" style="color: #CC5500;">${t.trackPackage}</a>`
    : interpolate(t.trackingNumber, { number: trackingNumber });

  await resend.emails.send({
    from: FROM_EMAIL,
    to: order.customerEmail,
    subject: interpolate(t.subject, { orderNumber: order.orderNumber }),
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #CC5500;">${t.title}</h1>

        <p>${greeting},</p>

        <p>${interpolate(t.message, { orderNumber: String(order.orderNumber) })}</p>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>${t.trackingInfo}:</h3>
          <p>${trackingLink}</p>
        </div>

        <p>${t.thankYou}</p>

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
