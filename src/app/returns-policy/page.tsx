// app/returns-policy/page.tsx
import { Metadata } from 'next'
import { RefreshCw, ShieldCheck, Mail, Clock } from 'lucide-react'
import ContactInfo from '@/components/contact-info'

export const metadata: Metadata = {
  title: 'Returns Policy | Canvas Print Shop',
  description: 'Learn about our 30-day return policy and our commitment to customer satisfaction. We make returns easy with our hassle-free process.',
}

export default function ReturnsPolicy() {
  return (
    <main className="flex-1 bg-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Returns Policy
        </h1>

        <div className="prose max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <p className="text-gray-700 text-lg">
                At Canvas Print Shop, we take pride in delivering exceptional quality canvas prints. Your satisfaction is our top priority, which is why we offer a comprehensive 30-day return policy. We stand behind our products and will work with you to ensure you&apos;re completely happy with your purchase.
              </p>
            </div>
          </section>

          {/* Return Window */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                30-Day Return Window
              </h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600 mb-4">
                You can initiate a return within 30 days of receiving your order if you&apos;re not completely satisfied. This applies to:
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li>Prints with quality issues</li>
                <li>Damaged items</li>
                <li>Incorrect sizes or specifications</li>
                <li>Items that don&apos;t meet your expectations</li>
              </ul>
            </div>
          </section>

          {/* Return Process */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                How to Return Your Order
              </h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600 mb-4">
                Starting a return is simple. Email us at returns@canvasprintshop.ca with:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-6">
                <li>Your order number and email address used for the purchase</li>
                <li>The reason for your return</li>
                <li>Photos of the item (required for quality issues or damage)</li>
                <li>Your preference for a replacement or refund</li>
              </ul>
              <div className="bg-yellow-50 rounded p-4 text-sm">
                <p className="text-gray-700">
                  Our customer service team will respond within one business day with detailed return instructions and next steps.
                </p>
              </div>
            </div>
          </section>

          {/* Our Guarantee */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Our Quality Guarantee
              </h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600 mb-4">
                We stand behind the quality of our products:
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li>Free replacements for any quality issues</li>
                <li>Full refunds available if we can&apos;t meet your satisfaction</li>
                <li>No return shipping costs for defective or incorrect items</li>
                <li>Dedicated support throughout the return process</li>
              </ul>
            </div>
          </section>

          {/* Refund Process */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Refund Information
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="list-disc pl-6 text-gray-600">
                <li>Refunds are processed within 3-5 business days of receiving the return</li>
                <li>Refunds are issued to the original payment method</li>
                <li>You&apos;ll receive an email confirmation when your refund is processed</li>
                <li>Bank processing times may vary for the refund to appear in your account</li>
              </ul>
            </div>
          </section>

          {/* Exceptions */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Return Exceptions
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600 mb-4">
                Please note that some items may not be eligible for return:
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li>Custom-sized prints outside our standard dimensions</li>
                <li>Items damaged due to misuse or improper handling</li>
                <li>Returns initiated after the 30-day window</li>
              </ul>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Need Help?
              </h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600">
                Our customer service team is here to help with any questions about returns:
              </p>
              <ContactInfo />
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}