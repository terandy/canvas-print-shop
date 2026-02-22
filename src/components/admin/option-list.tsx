"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2 } from "lucide-react";
import OptionForm from "./option-form";
import { deleteOptionAction } from "@/lib/db/actions/products";

interface ProductOption {
  id: string;
  name: string;
  values: string[] | null;
  affectsPrice: boolean | null;
}

interface OptionListProps {
  productId: string;
  options: ProductOption[];
}

export default function OptionList({ productId, options }: OptionListProps) {
  const t = useTranslations("Admin.optionForm");
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingOption, setEditingOption] = useState<ProductOption | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (optionId: string) => {
    if (!confirm(t("confirmDelete"))) return;

    setDeleting(optionId);
    const result = await deleteOptionAction(optionId, productId);
    setDeleting(null);

    if (result.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {t("title")} ({options.length})
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-3 py-1.5 bg-primary text-white text-sm rounded-md hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-1" />
          {t("addOption")}
        </button>
      </div>

      {options.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          {t("noOptions")}
        </p>
      ) : (
        <div className="space-y-3">
          {options.map((option) => (
            <div key={option.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{option.name}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      option.affectsPrice
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {option.affectsPrice
                      ? t("affectsPrice")
                      : t("displayOnly")}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingOption(option)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title={t("edit")}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(option.id)}
                    disabled={deleting === option.id}
                    className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                    title={t("delete")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {(option.values || []).map((value, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-100 rounded text-sm"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <OptionForm
          productId={productId}
          onClose={() => setShowForm(false)}
          onSuccess={() => router.refresh()}
        />
      )}

      {editingOption && (
        <OptionForm
          productId={productId}
          option={editingOption}
          onClose={() => setEditingOption(null)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
