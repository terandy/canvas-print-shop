import { createTranslator } from "next-intl";
import en from "../../../messages/en.json";
import fr from "../../../messages/fr.json";
import { BUSINESS_DATA, getLocationAddressLines } from "@/lib/business-data";
import { escapeHtml, type RecoveryCart } from "@/lib/cart-recovery/shared";

export function renderCartRecoveryEmail(
  cart: RecoveryCart,
  recoveryUrl: string,
  unsubscribeUrl: string
) {
  const locale = cart.contact?.locale ?? "en";
  const t = createTranslator({
    locale,
    messages: locale === "fr" ? fr : en,
    namespace: "Email.cartRecovery",
  });
  const items = cart.items.map((item) => ({
    title:
      locale === "fr"
        ? item.productTitleFr || item.productTitle
        : item.productTitle,
    variant: item.variantTitle,
    quantity: item.quantity,
    total: `$${((item.priceCents * item.quantity) / 100).toFixed(2)}`,
  }));
  const subtotal = `$${(cart.items.reduce((total, item) => total + item.priceCents * item.quantity, 0) / 100).toFixed(2)} CAD`;
  const address = getLocationAddressLines(
    BUSINESS_DATA.locations.quebecCityWorkshop,
    locale
  ).join(", ");
  const lines = items.map(
    (item) =>
      `${item.quantity} × ${item.title} — ${item.variant} — ${item.total}`
  );
  const subject = t("subject");
  return {
    subject,
    text: [
      t("heading"),
      t("intro"),
      ...lines,
      `${t("subtotal")}: ${subtotal}`,
      t("pricing"),
      `${t("button")}: ${recoveryUrl}`,
      t("expiry"),
      t("help"),
      BUSINESS_DATA.organization.email,
      "Canvas Print Shop",
      address,
      t("permission"),
      `${t("unsubscribe")}: ${unsubscribeUrl}`,
    ].join("\n\n"),
    html: `<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;padding:28px;color:#292524;line-height:1.6">
      <p style="font-size:12px;letter-spacing:2px;color:#a44922">CANVAS PRINT SHOP</p>
      <h1 style="font-size:28px;line-height:1.2">${escapeHtml(t("heading"))}</h1>
      <p>${escapeHtml(t("intro"))}</p>
      <table style="width:100%;border-collapse:collapse"><tbody>${items
        .map(
          (item) =>
            `<tr><td style="padding:14px 0;border-bottom:1px solid #e7e5e4">${escapeHtml(item.title)}<br><span style="font-size:13px;color:#57534e">${escapeHtml(item.variant)} · ${item.quantity} ×</span></td><td style="text-align:right;border-bottom:1px solid #e7e5e4">${item.total}</td></tr>`
        )
        .join("")}</tbody></table>
      <p><strong>${escapeHtml(t("subtotal"))}: ${subtotal}</strong></p>
      <p style="font-size:13px;color:#57534e">${escapeHtml(t("pricing"))}</p>
      <p style="margin:28px 0"><a href="${escapeHtml(recoveryUrl)}" style="display:inline-block;padding:13px 24px;border-radius:6px;background:#a44922;color:white;text-decoration:none;font-weight:bold">${escapeHtml(t("button"))}</a></p>
      <p style="font-size:13px;color:#57534e">${escapeHtml(t("expiry"))}</p>
      <p>${escapeHtml(t("help"))} <a href="mailto:${escapeHtml(BUSINESS_DATA.organization.email)}">${escapeHtml(BUSINESS_DATA.organization.email)}</a></p>
      <hr style="border:0;border-top:1px solid #e7e5e4;margin:28px 0">
      <p style="font-size:12px;color:#78716c">Canvas Print Shop<br>${escapeHtml(address)}</p>
      <p style="font-size:12px;color:#78716c">${escapeHtml(t("permission"))}<br><a href="${escapeHtml(unsubscribeUrl)}">${escapeHtml(t("unsubscribe"))}</a></p>
    </div>`,
  };
}
