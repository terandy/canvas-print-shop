import {
  getUnsubscribeLink,
  unsubscribeRecovery,
} from "@/lib/db/queries/cart-recovery";
import {
  recoveryResponse,
  isSameOriginPost,
} from "@/lib/cart-recovery/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  try {
    const link = await getUnsubscribeLink(token);
    return link
      ? recoveryResponse(link.locale, "unsubscribe", token)
      : recoveryResponse("en", "invalid", "", 410);
  } catch {
    return recoveryResponse("en", "error", "", 503);
  }
}

export async function POST(request: Request) {
  if (!isSameOriginPost(request))
    return recoveryResponse("en", "invalid", "", 403);
  try {
    const token = (await request.formData()).get("token");
    const link =
      typeof token === "string" ? await unsubscribeRecovery(token) : null;
    return link
      ? recoveryResponse(link.locale, "unsubscribed")
      : recoveryResponse("en", "invalid", "", 410);
  } catch {
    return recoveryResponse("en", "error", "", 503);
  }
}
