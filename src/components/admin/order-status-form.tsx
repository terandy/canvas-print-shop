"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import {
  updateOrderStatusAction,
  type OrderStatusState,
} from "@/lib/auth/actions";

const STATUS_VALUES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "fulfilled",
  "cancelled",
  "refunded",
] as const;

const INITIAL_STATE: OrderStatusState = {};

interface OrderStatusFormProps {
  orderId: string;
  currentStatus: string;
}

export default function OrderStatusForm({
  orderId,
  currentStatus,
}: OrderStatusFormProps) {
  const t = useTranslations("Admin");
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [state, formAction, isPending] = useActionState(
    updateOrderStatusAction,
    INITIAL_STATE
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />

      {state.error && (
        <div className="p-3 rounded-md text-sm bg-red-50 text-red-700">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="p-3 rounded-md text-sm bg-green-50 text-green-700">
          {t("orders.updateSuccess")}
        </div>
      )}

      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {t("orders.status")}
        </label>
        <select
          id="status"
          name="status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        >
          {STATUS_VALUES.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
            </option>
          ))}
        </select>
      </div>

      {selectedStatus === "shipped" && (
        <>
          <div>
            <label
              htmlFor="trackingNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("orders.trackingNumber")}
            </label>
            <input
              id="trackingNumber"
              name="trackingNumber"
              type="text"
              placeholder={t("orders.trackingPlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label
              htmlFor="trackingUrl"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("orders.trackingUrl")}
            </label>
            <input
              id="trackingUrl"
              name="trackingUrl"
              type="url"
              placeholder={t("orders.trackingUrlPlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={isPending || selectedStatus === currentStatus}
        className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? t("orders.updating") : t("orders.updateButton")}
      </button>
    </form>
  );
}
