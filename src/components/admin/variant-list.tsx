"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import VariantForm from "./variant-form";
import { deleteVariantAction } from "@/lib/db/actions/products";

interface Variant {
  id: string;
  title: string;
  sku: string | null;
  priceCents: number;
  options: Record<string, string>;
  availableForSale: boolean | null;
}

interface ProductOption {
  name: string;
  values: string[] | null;
  affectsPrice: boolean | null;
}

interface VariantListProps {
  productId: string;
  variants: Variant[];
  productOptions: ProductOption[];
}

export default function VariantList({
  productId,
  variants,
  productOptions,
}: VariantListProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (variantId: string) => {
    if (!confirm("Are you sure you want to delete this variant?")) return;

    setDeleting(variantId);
    const result = await deleteVariantAction(variantId, productId);
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
          Variants ({variants.length})
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-3 py-1.5 bg-primary text-white text-sm rounded-md hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Variant
        </button>
      </div>

      {variants.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No variants yet. Add your first variant to set pricing.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500">
                  SKU
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">
                  Title
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">
                  Options
                </th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">
                  Price
                </th>
                <th className="px-4 py-2 text-center font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {variants.map((variant) => (
                <tr key={variant.id}>
                  <td className="px-4 py-2 font-mono text-xs">
                    {variant.sku || "-"}
                  </td>
                  <td className="px-4 py-2">{variant.title}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(variant.options).map(([key, value]) => (
                        <span
                          key={key}
                          className="text-xs bg-gray-100 px-1.5 py-0.5 rounded"
                        >
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right font-medium">
                    ${(variant.priceCents / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span
                      className={`inline-flex h-2 w-2 rounded-full ${
                        variant.availableForSale ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingVariant(variant)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(variant.id)}
                        disabled={deleting === variant.id}
                        className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <VariantForm
          productId={productId}
          productOptions={productOptions}
          onClose={() => setShowForm(false)}
          onSuccess={() => router.refresh()}
        />
      )}

      {editingVariant && (
        <VariantForm
          productId={productId}
          variant={editingVariant}
          productOptions={productOptions}
          onClose={() => setEditingVariant(null)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}
