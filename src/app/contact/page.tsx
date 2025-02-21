import React from "react";

import { Metadata } from "next";
import { Mail, Phone, MapPin, LucideIcon } from "lucide-react";
import { EMAIL, PHONE, ADDRESS, OPENING_HOURS } from "@/lib/constants";
import { PageHeader, SectionHeader, SectionContainer } from "@/components";
import Link from "next/link";

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
  <SectionContainer className="transition-all hover:border-primary/10 hover:bg-primary/5">
    <div className="flex items-start gap-6">
      <div className="bg-primary/10 rounded-full p-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div className="flex-1 space-y-3">
        <SectionHeader className="!mt-4">{title}</SectionHeader>
        <p className="text-gray">{subtitle}</p>
        <Link
          href={href}
          className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
          {...(href.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {label}
        </Link>
      </div>
    </div>
  </SectionContainer>
);

export default function ContactPage() {
  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
        <div className="mb-16 text-center space-y-4">
          <PageHeader className="!mb-0">Contact us</PageHeader>
          <p className="text-lg text-gray max-w-2xl mx-auto">
            We&apos;re here to help! Choose the best way to reach us below.
          </p>
        </div>

        <div className="flex flex-col gap-8">
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
              <address className="not-italic">
                {ADDRESS.label.split("::").map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            }
          />
        </div>
      </div>
    </main>
  );
}
