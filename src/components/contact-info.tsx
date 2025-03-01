"use server";

import { EMAIL, PHONE } from "@/lib/constants";
import clsx from "clsx";
import { getTranslations } from "next-intl/server";

interface Props {
  className?: string;
}

const ContactInfo = async ({ className }: Props) => {
  const t = await getTranslations("Contact");

  return (
    <p className={clsx("text-gray-600", className)}>
      {t("email.label")}: {EMAIL.label}
      <br />
      {t("phone.label")}: {PHONE.label}
      <br />
      {t("openingHours.label")}: {t("openingHours.value")}
      <br />
    </p>
  );
};

export default ContactInfo;
