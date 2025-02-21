import ContactInfo from "@/components/contact-info";
import PageHeader from "@/components/typography/page-header";
import SectionHeader from "@/components/typography/section-header";
import SectionContainer from "@/components/typography/section-container";
import { Metadata } from "next";
import ContactSection from "@/components/contact-section";

export const metadata: Metadata = {
  title: "Privacy Policy | Canvas Print Shop",
  description:
    "Learn about how Canvas Print Shop protects and handles your personal information. Our privacy policy outlines our data collection, use, and protection practices.",
};

export default function PrivacyPolicy() {
  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <PageHeader>Privacy Policy</PageHeader>

        <div className="flex flex-col gap-8">
          {/* Last Updated */}
          <p className="text-gray text-center">
            Last updated: {new Date().toLocaleDateString("en-CA")}
          </p>

          {/* Introduction */}
          <section>
            <SectionHeader>Introduction</SectionHeader>
            <SectionContainer>
              <p>
                Canvas Print Shop (&quot;we&quot;, &quot;our&quot;, or
                &quot;us&quot;) respects your privacy and is committed to
                protecting your personal information. This privacy policy
                explains how we collect, use, disclose, and safeguard your
                information when you visit our website canvasprintshop.ca or
                make a purchase from us.
              </p>
            </SectionContainer>
          </section>

          {/* Information We Collect */}
          <section>
            <SectionHeader>Information We Collect</SectionHeader>
            <SectionContainer>
              <p>
                We collect information that you voluntarily provide to us when
                you:
              </p>
              <ul>
                <li>Create an account or place an order</li>
                <li>Upload images for printing</li>
                <li>Contact us for support</li>
                <li>Subscribe to our newsletter</li>
                <li>Participate in promotions or surveys</li>
              </ul>
              <p className="mt-4">
                This information may include your name, email address, postal
                address, phone number, payment information, and the images you
                upload for printing.
              </p>
            </SectionContainer>
          </section>

          {/* How We Use Your Information */}
          <section>
            <SectionHeader>How We Use Your Information</SectionHeader>
            <SectionContainer>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your order status</li>
                <li>Provide customer support</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Improve our products and services</li>
                <li>Protect against fraud and unauthorized transactions</li>
              </ul>
            </SectionContainer>
          </section>

          {/* Information Sharing */}
          <section>
            <SectionHeader>Information Sharing and Disclosure</SectionHeader>
            <SectionContainer>
              <p>
                We do not sell or rent your personal information to third
                parties. We may share your information with:
              </p>
              <ul>
                <li>
                  Service providers who assist in our operations (payment
                  processors, shipping carriers)
                </li>
                <li>Professional advisers (lawyers, accountants, auditors)</li>
                <li>
                  Law enforcement or regulatory bodies when required by law
                </li>
              </ul>
            </SectionContainer>
          </section>

          {/* Data Security */}
          <section>
            <SectionHeader>Data Security</SectionHeader>
            <SectionContainer>
              <p>
                We implement appropriate technical and organizational measures
                to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction. This includes
                encrypted data transmission, secure payment processing, and
                regular security assessments.
              </p>
            </SectionContainer>
          </section>

          {/* Your Rights */}
          <section>
            <SectionHeader>Your Rights</SectionHeader>
            <SectionContainer>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Withdraw consent for marketing communications</li>
                <li>Request a copy of your data</li>
              </ul>
            </SectionContainer>
          </section>

          {/* Cookie Policy */}
          <section>
            <SectionHeader>Cookie Policy</SectionHeader>
            <SectionContainer>
              <p>
                We use cookies and similar tracking technologies to improve your
                browsing experience, analyze site traffic, and understand where
                our audience is coming from. You can choose to disable cookies
                through your browser settings, although this may affect some
                website functionality.
              </p>
            </SectionContainer>
          </section>

          {/* Changes to Policy */}
          <section>
            <SectionHeader>Changes to This Policy</SectionHeader>
            <SectionContainer>
              <p>
                We may update this privacy policy from time to time. We will
                notify you of any changes by posting the new policy on this page
                and updating the &quot;Last updated&quot; date.
              </p>
            </SectionContainer>
          </section>

          {/* Contact Section */}
          <section>
            <SectionHeader>Questions?</SectionHeader>
            <SectionContainer className="bg-primary/5 border border-primary/10">
              <p>If you have any questions about our privacy policy:</p>
              <div className="mt-4">
                <ContactInfo />
              </div>
            </SectionContainer>
          </section>
        </div>
      </div>
    </main>
  );
}
