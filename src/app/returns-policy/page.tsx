import { Metadata } from "next";
import { RefreshCw, ShieldCheck, Clock } from "lucide-react";
import {
  SectionHeader,
  SectionContainer,
  PageHeader,
  ContactSection,
} from "@/components";

export const metadata: Metadata = {
  title: "Returns Policy | Canvas Print Shop",
  description:
    "Learn about our 30-day return policy and our commitment to customer satisfaction. We make returns easy with our hassle-free process.",
};

export default function ReturnsPolicy() {
  return (
    <main className="flex-1 bg-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <PageHeader>Returns Policy</PageHeader>
        <div className="flex flex-col gap-8">
          {/* Introduction */}
          <section>
            <SectionContainer variant="secondary">
              <p className="text-lg leading-relaxed">
                At Canvas Print Shop, we take pride in delivering exceptional
                quality canvas prints. Your satisfaction is our top priority,
                which is why we offer a comprehensive 30-day return policy. We
                stand behind our products and will work with you to ensure
                you&apos;re completely happy with your purchase.
              </p>
            </SectionContainer>
          </section>

          {/* Return Window */}
          <section>
            <SectionHeader icon={Clock}>30-Day Return Window</SectionHeader>
            <SectionContainer>
              <p>
                You can initiate a return within 30 days of receiving your order
                if you&apos;re not completely satisfied. This applies to:
              </p>
              <ul>
                <li>Prints with quality issues</li>
                <li>Damaged items</li>
                <li>Incorrect sizes or specifications</li>
                <li>Items that don&apos;t meet your expectations</li>
              </ul>
            </SectionContainer>
          </section>

          {/* Return Process */}
          <section>
            <SectionHeader icon={RefreshCw}>
              How to Return Your Order
            </SectionHeader>
            <SectionContainer>
              <p>
                Starting a return is simple. Email us at
                returns@canvasprintshop.ca with:
              </p>
              <ul>
                <li>
                  Your order number and email address used for the purchase
                </li>
                <li>The reason for your return</li>
                <li>
                  Photos of the item (required for quality issues or damage)
                </li>
                <li>Your preference for a replacement or refund</li>
              </ul>
              <SectionContainer variant="secondary">
                <p className="text-secondary font-medium">
                  Our customer service team will respond within one business day
                  with detailed return instructions.
                </p>
              </SectionContainer>
            </SectionContainer>
          </section>

          {/* Our Guarantee */}
          <section>
            <SectionHeader icon={ShieldCheck}>
              Our Quality Guarantee
            </SectionHeader>
            <SectionContainer>
              <p>We stand behind the quality of our products:</p>
              <ul>
                <li>Free replacements for any quality issues</li>
                <li>
                  Full refunds available if we can&apos;t meet your satisfaction
                </li>
                <li>
                  No return shipping costs for defective or incorrect items
                </li>
                <li>Dedicated support throughout the return process</li>
              </ul>
            </SectionContainer>
          </section>

          {/* Refund Process */}
          <section>
            <SectionHeader>Refund Information</SectionHeader>
            <SectionContainer>
              <ul>
                <li>
                  Refunds are processed within 3-5 business days of receiving
                  the return
                </li>
                <li>Refunds are issued to the original payment method</li>
                <li>
                  You&apos;ll receive an email confirmation when your refund is
                  processed
                </li>
                <li>
                  Bank processing times may vary for the refund to appear in
                  your account
                </li>
              </ul>
            </SectionContainer>
          </section>

          {/* Exceptions */}
          <section>
            <SectionHeader>Return Exceptions</SectionHeader>
            <SectionContainer>
              <p>Please note that some items may not be eligible for return:</p>
              <ul>
                <li>Custom-sized prints outside our standard dimensions</li>
                <li>Items damaged due to misuse or improper handling</li>
                <li>Returns initiated after the 30-day window</li>
              </ul>
            </SectionContainer>
          </section>
          <ContactSection />
        </div>
      </div>
    </main>
  );
}
