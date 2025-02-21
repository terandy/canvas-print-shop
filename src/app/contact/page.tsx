import { Metadata } from "next";
import { Mail, Phone, MapPin, LucideIcon } from "lucide-react";
import { EMAIL, PHONE, ADDRESS, OPENING_HOURS } from "@/lib/constants";
import React from "react";

export const metadata: Metadata = {
  title: "Contact us | Canvas Print Shop",
  description: "We're here to help! Choose the best way to reach us below.",
};

interface ContactSectionProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  href: string;
  label: React.ReactNode;
}

const ContactSection = ({
  icon: Icon,
  title,
  subtitle,
  href,
  label,
}: ContactSectionProps) => (
  <div className="bg-gray-50 rounded-lg p-6 transition-all hover:bg-gray-100">
    <div className="flex items-start gap-4">
      <div className="p-2 bg-white rounded-lg shadow-sm">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div className="flex-1">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{subtitle}</p>
        <a
          href={href}
          className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          {...(href.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {label}
        </a>
      </div>
    </div>
  </div>
);

export default function ContactPage() {
  return (
    <main className="flex-1 bg-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We`&apos`'re here to help! Choose the best way to reach us below.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-1">
          <ContactSection
            icon={Mail}
            title="Send an email"
            subtitle="Available anytime"
            href={EMAIL.href}
            label={EMAIL.label}
          />

          <ContactSection
            icon={Phone}
            title="Call us"
            subtitle={OPENING_HOURS}
            href={PHONE.href}
            label={PHONE.label}
          />

          <ContactSection
            icon={MapPin}
            title="Visit us in store"
            subtitle={OPENING_HOURS}
            href={ADDRESS.href}
            label={
              <div>
                {ADDRESS.label.split("::").map((l) => (
                  <p key={l}>{l}</p>
                ))}
              </div>
            }
          />
        </div>
      </div>
    </main>
  );
}
