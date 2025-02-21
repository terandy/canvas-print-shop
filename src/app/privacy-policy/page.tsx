// app/privacy-policy/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Canvas Print Shop',
  description: 'Learn about how Canvas Print Shop protects and handles your personal information. Our privacy policy outlines our data collection, use, and protection practices.',
}

export default function PrivacyPolicy() {
  return (
    <main className="flex-1 bg-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Privacy Policy
        </h1>

        <div className="prose max-w-none">
          <p className="text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString('en-CA')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Introduction
            </h2>
            <p className="text-gray-600">
              Canvas Print Shop (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy and is committed to protecting your personal information. This privacy policy explains how we collect, use, disclose, and safeguard your information when you visit our website canvasprintshop.ca or make a purchase from us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Information We Collect
            </h2>
            <p className="text-gray-600 mb-4">
              We collect information that you voluntarily provide to us when you:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600">
              <li>Create an account or place an order</li>
              <li>Upload images for printing</li>
              <li>Contact us for support</li>
              <li>Subscribe to our newsletter</li>
              <li>Participate in promotions or surveys</li>
            </ul>
            <p className="text-gray-600">
              This information may include your name, email address, postal address, phone number, payment information, and the images you upload for printing.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              How We Use Your Information
            </h2>
            <p className="text-gray-600 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your order status</li>
              <li>Provide customer support</li>
              <li>Send you marketing communications (with your consent)</li>
              <li>Improve our products and services</li>
              <li>Protect against fraud and unauthorized transactions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Information Sharing and Disclosure
            </h2>
            <p className="text-gray-600 mb-4">
              We do not sell or rent your personal information to third parties. We may share your information with:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600">
              <li>Service providers who assist in our operations (payment processors, shipping carriers)</li>
              <li>Professional advisers (lawyers, accountants, auditors)</li>
              <li>Law enforcement or regulatory bodies when required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Data Security
            </h2>
            <p className="text-gray-600">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encrypted data transmission, secure payment processing, and regular security assessments.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Your Rights
            </h2>
            <p className="text-gray-600 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Withdraw consent for marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Cookie Policy
            </h2>
            <p className="text-gray-600">
              We use cookies and similar tracking technologies to improve your browsing experience, analyze site traffic, and understand where our audience is coming from. You can choose to disable cookies through your browser settings, although this may affect some website functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Changes to This Policy
            </h2>
            <p className="text-gray-600">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-600">
              If you have any questions about this privacy policy or our practices, please contact us at:<br />
              Email: info@canvasprintshop.ca<br />
              Phone: (514) 441-2230 <br />
              Address: 1172 Av. du Lac-Saint-Charles, Québec, QC G3G 2S7
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}