import { resend, ORDER_EMAIL } from "./index";
import type { Order } from "@/types/order";
import { getAdminUsersForOrderEmails } from "@/lib/db/queries/admin-users";
import { BASE_URL } from "@/lib/constants";
import { canSendPickupReady } from "@/lib/orders/status";
import { getOrderDiscountCents } from "@/lib/orders/discount";
import {
  BUSINESS_DATA,
  formatOpeningTime,
  getLocationAddressLines,
  type SupportedLocale,
} from "@/lib/business-data";

type Locale = "en" | "fr";

type AdminOrderEmailRecipient = {
  email: string;
  name: string | null;
};

const NEW_ORDER_ALERT_EMAIL = BUSINESS_DATA.organization.email;

export function getAdminOrderNotificationRecipients(
  adminEmails: AdminOrderEmailRecipient[],
  fallbackEmail?: string
): string[] {
  const candidates = adminEmails.map((admin) => admin.email);

  if (adminEmails.length === 0 && fallbackEmail) {
    candidates.push(fallbackEmail);
  }

  // The company inbox always receives new-order alerts. Setting it last also
  // normalizes any case-variant already present in the admin list.
  candidates.push(NEW_ORDER_ALERT_EMAIL);

  const uniqueRecipients = new Map<string, string>();
  for (const candidate of candidates) {
    const email = candidate.trim();
    if (email) uniqueRecipients.set(email.toLowerCase(), email);
  }

  return Array.from(uniqueRecipients.values());
}

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
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    String(values[key] ?? `{${key}}`)
  );
}

export async function sendOrderConfirmation(
  order: Order,
  locale: Locale = "en"
): Promise<void> {
  if (!resend) {
    return;
  }

  const t = getEmailTranslations(locale).orderConfirmation;
  const discountCents = getOrderDiscountCents(order);

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
    from: ORDER_EMAIL,
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
          ${discountCents > 0 ? `<p><strong>${t.discount}:</strong> -$${(discountCents / 100).toFixed(2)}</p>` : ""}
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

export async function sendAdminOrderNotification(order: Order): Promise<void> {
  if (!resend) {
    return;
  }
  const discountCents = getOrderDiscountCents(order);

  // Get all admins who should receive order notification emails
  let adminEmails: AdminOrderEmailRecipient[] = [];

  try {
    adminEmails = await getAdminUsersForOrderEmails();
  } catch (error) {
    console.error("Error fetching admin users for emails:", error);
  }

  const recipients = getAdminOrderNotificationRecipients(
    adminEmails,
    process.env.ADMIN_EMAIL
  );

  // If no recipients, return early
  if (recipients.length === 0) {
    console.warn("No admin users configured to receive order notifications");
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

  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #CC5500;">New Order Received</h1>

      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin-top: 0;">Order #${order.orderNumber}</h2>

        <p><strong>Customer:</strong> ${order.customerName || "N/A"}</p>
        <p><strong>Email:</strong> ${order.customerEmail}</p>

        <h3>Items:</h3>
        <pre style="font-family: inherit; white-space: pre-wrap;">${itemsList}</pre>
        <p><a href="https://canvasprintshop.ca/en/admin/orders/${order.id}" style="color: #CC5500;">View Order in Admin</a></p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

        <p><strong>Subtotal:</strong> $${(order.subtotalCents / 100).toFixed(2)}</p>
        ${discountCents > 0 ? `<p><strong>${getEmailTranslations("en").orderConfirmation.discount}:</strong> -$${(discountCents / 100).toFixed(2)}</p>` : ""}
        <p><strong>Shipping:</strong> $${(order.shippingCents / 100).toFixed(2)}</p>
        <p style="font-size: 1.2em;"><strong>Total:</strong> $${(order.totalCents / 100).toFixed(2)} ${order.currency}</p>
      </div>

      <div style="margin: 20px 0;">
        <h3>Shipping Address:</h3>
        <pre style="font-family: inherit; white-space: pre-wrap;">${shippingAddress}</pre>
      </div>

    </div>
  `;

  // Send a single email to all configured admins to avoid rate limiting
  try {
    await resend.emails.send({
      from: ORDER_EMAIL,
      to: recipients,
      subject: `New Order #${order.orderNumber} - $${(order.totalCents / 100).toFixed(2)}`,
      html: emailHtml,
    });
  } catch (error) {
    console.error("Failed to send admin order notification:", error);
  }
}

export async function sendShippingUpdate(
  order: Order,
  trackingNumber: string,
  trackingUrl?: string,
  locale: Locale = "en"
): Promise<void> {
  if (!resend) {
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
    from: ORDER_EMAIL,
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

/**
 * Tells a customer their order is waiting at the counter they chose.
 *
 * Pickup orders never get a tracking number, so `sendShippingUpdate` never
 * fires for them — without this they would hear nothing after paying. The
 * address shown is the counter they actually selected, not the workshop.
 */
export async function sendPickupReady(
  order: Order,
  locale: Locale = "en"
): Promise<void> {
  if (!resend || !ORDER_EMAIL) {
    throw new Error("Pickup email is not configured");
  }
  if (!canSendPickupReady(order)) {
    throw new Error("Order has no valid pickup location");
  }

  const t = getEmailTranslations(locale).pickupReady;

  const location =
    order.pickupLocation === "montreal"
      ? BUSINESS_DATA.locations.montrealBranch
      : BUSINESS_DATA.locations.quebecCityWorkshop;

  const greeting = order.customerName
    ? interpolate(t.greeting, { name: order.customerName })
    : t.greetingDefault;

  const addressHtml = getLocationAddressLines(
    location,
    locale as SupportedLocale
  ).join("<br>");

  const contactEmail = location.email ?? ORDER_EMAIL;

  const { data, error } = await resend.emails.send({
    from: ORDER_EMAIL,
    to: order.customerEmail,
    subject: interpolate(t.subject, { orderNumber: order.orderNumber }),
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #CC5500;">${t.title}</h1>

        <p>${greeting},</p>

        <p>${interpolate(t.message, { orderNumber: String(order.orderNumber) })}</p>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>${t.whereTitle}:</h3>
          <p>${location.name}<br>${addressHtml}</p>
          ${
            location.openingHours
              ? `<p>${interpolate(t.hours, {
                  days: t.days,
                  opens: formatOpeningTime(
                    location.openingHours.opens,
                    locale as SupportedLocale
                  ),
                  closes: formatOpeningTime(
                    location.openingHours.closes,
                    locale as SupportedLocale
                  ),
                })}</p>`
              : ""
          }
          <p>${interpolate(t.contact, { email: contactEmail })}</p>
        </div>

        <p>${interpolate(t.bring, { orderNumber: String(order.orderNumber) })}</p>

        <p>${t.thankYou}</p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

        <p style="color: #666; font-size: 12px;">
          Canvas Print Shop<br>
          ${addressHtml}
        </p>
      </div>
    `,
  });
  if (error || !data?.id) {
    throw new Error(error?.message || "Pickup email was not accepted");
  }
}

export async function sendPasswordResetEmail(
  email: string,
  name: string | null,
  token: string,
  locale: Locale = "en"
): Promise<void> {
  if (!resend) {
    return;
  }

  const t = getEmailTranslations(locale).passwordReset;
  const resetUrl = `${BASE_URL}/${locale}/admin/reset-password?token=${token}`;

  const greeting = name ? interpolate(t.greeting, { name }) : t.greetingDefault;

  await resend.emails.send({
    from: ORDER_EMAIL,
    to: email,
    subject: t.subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #CC5500;">${t.subject}</h1>

        <p>${greeting},</p>

        <p>${t.message}</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #CC5500; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">${t.buttonText}</a>
        </div>

        <p style="color: #666; font-size: 14px;">${t.expiry}</p>
        <p style="color: #666; font-size: 14px;">${t.ignore}</p>

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
