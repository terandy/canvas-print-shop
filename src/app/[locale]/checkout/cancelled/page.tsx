import { XCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function CheckoutCancelledPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <XCircle className="h-10 w-10 text-gray-600" />
      </div>

      <h1 className="text-3xl font-bold">Checkout Cancelled</h1>

      <p className="mt-4 text-gray-600">
        Your checkout was cancelled. Your cart items are still saved if you'd
        like to complete your purchase.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/cart"
          className="inline-block rounded-md bg-primary px-6 py-3 text-white hover:bg-primary/90"
        >
          Return to Cart
        </Link>
        <Link
          href="/"
          className="inline-block rounded-md border border-gray-300 px-6 py-3 hover:bg-gray-50"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
