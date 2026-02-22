"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import {
  createOptionAction,
  updateOptionAction,
  type OptionFormState,
} from "@/lib/db/actions/products";

interface OptionFormProps {
  productId: string;
  option?: {
    id: string;
    name: string;
    values: string[] | null;
    affectsPrice: boolean | null;
  };
  onClose: () => void;
  onSuccess?: () => void;
}

const INITIAL_STATE: OptionFormState = {};

export default function OptionForm({
  productId,
  option,
  onClose,
  onSuccess,
}: OptionFormProps) {
  const t = useTranslations("Admin.optionForm");
  const isEditing = !!option;

  const [state, formAction, isPending] = useActionState(
    isEditing ? updateOptionAction : createOptionAction,
    INITIAL_STATE
  );

  if (state.success && onSuccess) {
    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">
            {isEditing ? t("editOption") : t("addOption")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={formAction} className="p-6 space-y-4">
          <input type="hidden" name="productId" value={productId} />
          {option && <input type="hidden" name="optionId" value={option.id} />}

          {state.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {state.error}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("optionName")} *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={option?.name || ""}
              placeholder="size, frame, depth..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="values"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("values")} *
            </label>
            <input
              id="values"
              name="values"
              type="text"
              required
              defaultValue={option?.values?.join(", ") || ""}
              placeholder="8x10, 11x14, 16x20..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            />
            <p className="mt-1 text-xs text-gray-500">
              {t("valuesHelp")}
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="affectsPrice"
                value="true"
                defaultChecked={option?.affectsPrice !== false}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">{t("affectsPrice")}</span>
            </label>
            <p className="mt-1 text-xs text-gray-500 ml-6">
              {t("affectsPriceHelp")}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending
                ? t("saving")
                : isEditing
                  ? t("save")
                  : t("addOption")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
