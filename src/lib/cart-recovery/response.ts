import { createTranslator } from "next-intl";
import en from "../../../messages/en.json";
import fr from "../../../messages/fr.json";
import { escapeHtml } from "./shared";

export const recoveryHeaders = {
  "Cache-Control": "private, no-store",
  // Strip the bearer-token path/query while preserving Origin on HTML POSTs.
  // no-referrer makes browsers submit these forms with Origin: null.
  "Referrer-Policy": "strict-origin",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy":
    "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
};

export function recoveryResponse(
  locale: "en" | "fr",
  state: "restore" | "unsubscribe" | "unsubscribed" | "invalid" | "error",
  token = "",
  status = 200
) {
  const t = createTranslator({
    locale,
    messages: locale === "fr" ? fr : en,
    namespace: "CartRecovery",
  });
  const canSubmit = state === "restore" || state === "unsubscribe";
  const action =
    state === "unsubscribe"
      ? "/api/cart-recovery/unsubscribe"
      : "/api/cart-recovery";
  return new Response(
    `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(t(`${state}Title`))}</title></head>
    <body style="margin:0;background:#faf9f6;font-family:Arial,sans-serif;color:#292524"><main style="max-width:520px;margin:12vh auto;padding:32px">
      <p style="font-size:12px;letter-spacing:2px;color:#a44922">CANVAS PRINT SHOP</p>
      <h1>${escapeHtml(t(`${state}Title`))}</h1><p style="line-height:1.6">${escapeHtml(t(`${state}Body`))}</p>
      ${canSubmit ? `<form method="post" action="${action}"><input type="hidden" name="token" value="${escapeHtml(token)}"><button style="margin:20px 0;padding:14px 24px;border:0;border-radius:6px;background:#a44922;color:white;font-size:16px;cursor:pointer">${escapeHtml(t(`${state}Button`))}</button></form>` : ""}
      <p><a style="color:#a44922" href="/${locale}">${escapeHtml(t("home"))}</a></p>
    </main></body></html>`,
    {
      status,
      headers: {
        ...recoveryHeaders,
        "Content-Type": "text/html; charset=utf-8",
      },
    }
  );
}

export function isSameOriginPost(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}
