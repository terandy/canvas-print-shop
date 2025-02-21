import React from "react";
import SectionHeader from "./typography/section-header";
import SectionContainer from "./typography/section-container";
import { Mail } from "lucide-react";
import ContactInfo from "./contact-info";

function ContactSection() {
  return (
    <section>
      <SectionHeader icon={Mail}>Need Help?</SectionHeader>
      <SectionContainer className="bg-secondary/5 border border-secondary/10">
        <p>Our customer service team is here to help with any questions:</p>
        <ContactInfo />
      </SectionContainer>
    </section>
  );
}

export default ContactSection;
