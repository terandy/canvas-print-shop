// app/shipping-policy/page.tsx
import { Metadata } from "next";
import { Truck, Clock, MapPin } from "lucide-react";
import ContactInfo from "@/components/contact-info";

export const metadata: Metadata = {
  title: "Shipping Policy | Canvas Print Shop",
  description:
    "Learn about our shipping options including Canada Post delivery and local pickup in Quebec City.",
};

export default function ShippingPolicy() {
  return (
    <main className="flex-1 bg-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Shipping Policy
        </h1>

        <div className="prose max-w-none">
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Local Pickup
              </h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-gray-600 mb-4">
                We offer free local pickup at our Quebec City location for your
                convenience.
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li>
                  Available during business hours: Monday to Friday, 9am - 5pm
                  EST
                </li>
                <li>Select &quot;Local Pickup&quot; during checkout</li>
                <li>
                  You&apos;ll receive an email when your order is ready for
                  pickup
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Canada Post Delivery
              </h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-gray-600 mb-4">
                We ship all orders through Canada Post with tracking provided on
                every shipment.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Estimated Delivery Times:
              </h3>
              <ul className="list-disc pl-6 text-gray-600 mb-4">
                <li>Local (Quebec): 1-2 business days</li>
                <li>Major cities: 2-3 business days</li>
                <li>Rural areas: 3-7 business days</li>
                <li>Remote locations: 7-14 business days</li>
              </ul>
              <p className="text-gray-600 text-sm">
                *Delivery times are estimates and may vary based on weather
                conditions and Canada Post service updates.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Processing Time
              </h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600 mb-4">
                Each canvas print is carefully crafted to order:
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li>Standard orders: 2-3 business days processing time</li>
                <li>Processing begins once payment is confirmed</li>
                <li>
                  You&apos;ll receive an email with tracking information once
                  your order ships
                </li>
                <li>Rush processing may be available upon request</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Shipping Costs
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="list-disc pl-6 text-gray-600">
                <li>Local Pickup: Free</li>
                <li>
                  Standard Shipping: Calculated at checkout based on size and
                  destination
                </li>
                <li>
                  Free shipping on orders over $150 (some remote locations
                  excluded)
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Order Tracking
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600 mb-4">
                Stay informed about your order status:
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li>Tracking number provided via email once order ships</li>
                <li>
                  Track your package directly through Canada Post&apos;s website
                </li>
                <li>
                  Email notifications for order confirmation, processing, and
                  shipping
                </li>
                <li>
                  Contact our customer service team for additional tracking
                  support
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Contact Us
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600">
                Questions about shipping? We&apos;re here to help:
                <br />
              </p>
              <ContactInfo />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
