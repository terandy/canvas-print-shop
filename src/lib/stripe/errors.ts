/** Log actionable Stripe diagnostics, never secrets, payloads or customer data. */
export function checkoutErrorDetails(error: unknown) {
  const source =
    error && typeof error === "object"
      ? (error as Record<string, unknown>)
      : {};
  const details: Record<string, string | number> = {};
  for (const key of ["type", "code", "param", "requestId"]) {
    const value = source[key];
    if (typeof value === "string" && /^[a-zA-Z0-9_.\[\]-]{1,200}$/.test(value))
      details[key] = value;
  }
  if (typeof source.statusCode === "number")
    details.statusCode = source.statusCode;
  return details;
}
