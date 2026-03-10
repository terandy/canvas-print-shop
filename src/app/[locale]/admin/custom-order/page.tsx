import { getTranslations } from "next-intl/server";
import CustomOrderForm from "@/components/admin/custom-order-form";

export default async function AdminCustomOrderPage() {
  const t = await getTranslations("Admin");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("customOrder.title")}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {t("customOrder.subtitle")}
        </p>
      </div>

      <CustomOrderForm />
    </div>
  );
}
