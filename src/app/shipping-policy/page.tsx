import { Metadata } from "next";
import { Truck, Clock, MapPin } from "lucide-react";
import {
  SectionHeader,
  SectionContainer,
  PageHeader,
  ContactSection,
} from "@/components";
export const metadata: Metadata = {
  title: "Shipping Policy | Canvas Print Shop",
  description:
    "Learn about our shipping options including Canada Post delivery and local pickup in Quebec City.",
};

export default function ShippingPolicy() {
  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <PageHeader>Shipping Policy</PageHeader>

        <div className="flex flex-col gap-8">
          {/* Local Pickup */}
          <section>
            <SectionHeader icon={MapPin}>Local Pickup</SectionHeader>
            <SectionContainer>
              <p>
                We offer free local pickup at our Quebec City location for your
                convenience.
              </p>
              <ul>
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
            </SectionContainer>
          </section>

          {/* Canada Post Delivery */}
          <section>
            <SectionHeader icon={Truck}>Canada Post Delivery</SectionHeader>
            <SectionContainer>
              <p>
                We ship all orders through Canada Post with tracking provided on
                every shipment.
              </p>
              <h3 className="text-xl font-semibold text-secondary mt-6 mb-3">
                Estimated Delivery Times:
              </h3>
              <ul>
                <li>Local (Quebec): 1-2 business days</li>
                <li>Major cities: 2-3 business days</li>
                <li>Rural areas: 3-7 business days</li>
                <li>Remote locations: 7-14 business days</li>
              </ul>
              <p className="text-sm mt-4">
                *Delivery times are estimates and may vary based on weather
                conditions and Canada Post service updates.
              </p>
            </SectionContainer>
          </section>

          {/* Processing Time */}
          <section>
            <SectionHeader icon={Clock}>Processing Time</SectionHeader>
            <SectionContainer>
              <p>Each canvas print is carefully crafted to order:</p>
              <ul>
                <li>Standard orders: 2-3 business days processing time</li>
                <li>Processing begins once payment is confirmed</li>
                <li>
                  You&apos;ll receive an email with tracking information once
                  your order ships
                </li>
                <li>Rush processing may be available upon request</li>
              </ul>
            </SectionContainer>
          </section>

          {/* Shipping Costs */}
          <section>
            <SectionHeader>Shipping Costs</SectionHeader>
            <SectionContainer>
              <ul>
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
            </SectionContainer>
          </section>

          {/* Order Tracking */}
          <section>
            <SectionHeader>Order Tracking</SectionHeader>
            <SectionContainer>
              <p>Stay informed about your order status:</p>
              <ul>
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
            </SectionContainer>
          </section>
          <ContactSection />
        </div>
      </div>
    </main>
  );
}
