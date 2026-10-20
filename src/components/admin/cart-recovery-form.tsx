"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { sendCartRecoveryEmail } from "@/lib/db/actions/cart-recovery";

export default function CartRecoveryForm({
  cartId,
  fingerprint,
}: {
  cartId: string;
  fingerprint: string;
}) {
  const t = useTranslations("Admin.cartRecovery");
  const [state, action, pending] = useActionState(sendCartRecoveryEmail, {});
  const finished =
    state.status === "sent" ||
    state.status === "sendFailed" ||
    state.status === "unconfirmed";
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="cartId" value={cartId} />
      <input type="hidden" name="fingerprint" value={fingerprint} />
      <button
        disabled={pending || finished}
        className="rounded-md bg-primary-dark px-5 py-3 font-medium text-white disabled:opacity-50"
      >
        {pending ? t("sending") : t("send")}
      </button>
      {state.status && (
        <p
          role={state.status === "sent" ? "status" : "alert"}
          className="text-sm"
        >
          {t(state.status)}
        </p>
      )}
    </form>
  );
}
