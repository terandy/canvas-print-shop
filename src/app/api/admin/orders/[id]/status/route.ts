import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/session";
import { updateStatusWithNotification } from "@/lib/orders/update-status";

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    if (!(await getAdminSession())) {
      return NextResponse.json(
        { success: false, error: "unauthorized" },
        { status: 401 }
      );
    }
    const { id } = await params;
    const body = await request.json();
    const result = await updateStatusWithNotification({
      orderId: id,
      status: body.status,
      trackingNumber:
        typeof body.trackingNumber === "string"
          ? body.trackingNumber
          : undefined,
      trackingUrl:
        typeof body.trackingUrl === "string" ? body.trackingUrl : undefined,
      resendPickupEmail: body.intent === "resendPickupEmail",
    });
    if (result.status) {
      for (const locale of ["en", "fr"]) {
        revalidatePath(`/${locale}/admin/orders/${id}`);
        revalidatePath(`/${locale}/admin/orders`);
        revalidatePath(`/${locale}/admin`);
      }
    }
    const status = result.success
      ? 200
      : result.error === "pickupEmailFailed"
        ? 502
        : result.error === "notFound"
          ? 404
          : result.error === "updateFailed"
            ? 500
            : 400;
    return NextResponse.json(result, { status });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { success: false, error: "updateFailed" },
      { status: 500 }
    );
  }
}
