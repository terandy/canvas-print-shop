import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { getOrder, updateOrderStatus } from "@/lib/db/queries/orders";
import { sendShippingUpdate } from "@/lib/email/send";

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    // Check authentication
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, trackingNumber } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Get current order
    const order = await getOrder(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order status
    await updateOrderStatus(id, status);

    // If status is "shipped" and we have a tracking number, send shipping email
    if (status === "shipped" && trackingNumber) {
      try {
        // Determine locale from order metadata or default to 'en'
        const locale = "en"; // Could be stored on order if needed
        await sendShippingUpdate(order, trackingNumber, undefined, locale);
      } catch (emailError) {
        console.error("Failed to send shipping update email:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
