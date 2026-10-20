import { NextResponse } from "next/server";
import { getRecoveryLink } from "@/lib/db/queries/cart-recovery";
import {
  recoveryHeaders,
  recoveryResponse,
  isSameOriginPost,
} from "@/lib/cart-recovery/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  try {
    const result = await getRecoveryLink(token);
    if (!result) return recoveryResponse("en", "invalid", "", 410);
    // Email scanners and browser prefetch must never change a cart cookie.
    return recoveryResponse(result.link.locale, "restore", token);
  } catch {
    return recoveryResponse("en", "error", "", 503);
  }
}

export async function POST(request: Request) {
  if (!isSameOriginPost(request))
    return recoveryResponse("en", "invalid", "", 403);
  try {
    const token = (await request.formData()).get("token");
    const result =
      typeof token === "string" ? await getRecoveryLink(token) : null;
    if (!result) return recoveryResponse("en", "invalid", "", 410);
    const response = NextResponse.redirect(
      new URL(`/${result.link.locale}/checkout`, request.url),
      303
    );
    for (const [name, value] of Object.entries(recoveryHeaders))
      response.headers.set(name, value);
    response.cookies.set("cartId", result.cart.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch {
    return recoveryResponse("en", "error", "", 503);
  }
}
