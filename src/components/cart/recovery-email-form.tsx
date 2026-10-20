"use client";

import { useActionState, useId } from "react";
import { useTranslations } from "next-intl";
import { saveCartRecoveryEmail } from "@/lib/db/actions/cart-recovery";

export default function RecoveryEmailForm() {
  const t = useTranslations("Cart.Recovery");
  const id = useId();
  const [state, action, pending] = useActionState(saveCartRecoveryEmail, {});
  return (
    <details className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
      <summary className="cursor-pointer font-medium text-secondary">
        {t("title")}
      </summary>
      <form action={action} className="mt-3 space-y-3">
        <label htmlFor={`${id}-email`} className="block text-gray-700">
          {t("email")}
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={255}
          className="w-full rounded-md border border-gray-300 p-2"
        />
        <label className="flex items-start gap-2 text-gray-600">
          <input name="consent" type="checkbox" required className="mt-1" />
          <span>{t("consent")}</span>
        </label>
        <button
          disabled={pending}
          className="w-full rounded-md border border-primary-dark px-3 py-2 font-medium text-primary-dark disabled:opacity-50"
        >
          {pending ? t("saving") : t("save")}
        </button>
        {state.status && (
          <p role={state.status === "saved" ? "status" : "alert"}>
            {t(state.status)}
          </p>
        )}
      </form>
    </details>
  );
}
