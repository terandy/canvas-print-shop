import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createOrderFromCheckout } from "@/lib/db/queries/orders";
import { sendOrderConfirmation } from "@/lib/email/send";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("Missing Stripe signature");
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error(
          `Payment failed for PaymentIntent ${paymentIntent.id}:`,
          paymentIntent.last_payment_error?.message
        );
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Get cart ID from metadata
  const cartId = session.metadata?.cartId;

  if (!cartId) {
    console.error("No cartId in session metadata");
    return;
  }

  // Get customer details
  const customerEmail = session.customer_details?.email;
  const customerName = session.customer_details?.name;
  const customerPhone = session.customer_details?.phone;

  if (!customerEmail) {
    console.error("No customer email in session");
    return;
  }

  // Parse shipping address from collected_information or shipping_details
  const shippingInfo =
    (session as any).shipping_details ||
    (session as any).collected_information?.shipping_details;
  const shippingAddress = shippingInfo?.address
    ? {
        line1: shippingInfo.address.line1 || "",
        line2: shippingInfo.address.line2 || undefined,
        city: shippingInfo.address.city || "",
        state: shippingInfo.address.state || "",
        postalCode: shippingInfo.address.postal_code || "",
        country: shippingInfo.address.country || "",
      }
    : undefined;

  // Parse billing address (from payment intent if available)
  const billingAddress = session.customer_details?.address
    ? {
        line1: session.customer_details.address.line1 || "",
        line2: session.customer_details.address.line2 || undefined,
        city: session.customer_details.address.city || "",
        state: session.customer_details.address.state || "",
        postalCode: session.customer_details.address.postal_code || "",
        country: session.customer_details.address.country || "",
      }
    : undefined;

  // Get amounts (Stripe returns in cents)
  const subtotalCents = session.amount_subtotal || 0;
  const totalCents = session.amount_total || 0;
  const taxCents = (session.total_details?.amount_tax || 0);
  const shippingCents = (session.total_details?.amount_shipping || 0);

  try {
    // Create order in database
    const order = await createOrderFromCheckout({
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id || "",
      cartId,
      customerEmail,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      shippingAddress,
      billingAddress,
      subtotalCents,
      taxCents,
      shippingCents,
      totalCents,
    });

    console.log(`Order ${order.orderNumber} created successfully`);

    // Send confirmation email in customer's locale
    const locale = (session.metadata?.locale === "fr" ? "fr" : "en") as
      | "en"
      | "fr";
    try {
      await sendOrderConfirmation(order, locale);
      console.log(`Confirmation email sent for order ${order.orderNumber}`);
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't throw - order was created successfully
    }
  } catch (error) {
    console.error("Failed to create order:", error);
    throw error;
  }
}

async function handleRefund(charge: Stripe.Charge) {
  // TODO: Update order status to refunded
  console.log(`Refund processed for charge ${charge.id}`);
}
