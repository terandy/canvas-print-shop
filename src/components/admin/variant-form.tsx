"use client";

import { useActionState, useState } from "react";
import { X } from "lucide-react";
import {
  createVariantAction,
  updateVariantAction,
  type VariantFormState,
} from "@/lib/db/actions/products";

interface VariantFormProps {
  productId: string;
  variant?: {
    id: string;
    title: string;
    sku: string | null;
    priceCents: number;
    options: Record<string, string>;
    availableForSale: boolean | null;
  };
  productOptions: Array<{
    name: string;
    values: string[] | null;
    affectsPrice: boolean | null;
  }>;
  onClose: () => void;
  onSuccess?: () => void;
}

const INITIAL_STATE: VariantFormState = {};

export default function VariantForm({
  productId,
  variant,
  productOptions,
  onClose,
  onSuccess,
}: VariantFormProps) {
  const isEditing = !!variant;

  const [state, formAction, isPending] = useActionState(
    isEditing ? updateVariantAction : createVariantAction,
    INITIAL_STATE
  );

  // Track selected options
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    variant?.options || {}
  );

  // Generate title from selected options
  const generateTitle = () => {
    const priceOptions = productOptions.filter((o) => o.affectsPrice);
    return priceOptions
      .map((o) => selectedOptions[o.name] || "")
      .filter(Boolean)
      .join(" / ");
  };

  if (state.success && onSuccess) {
    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">
            {isEditing ? "Edit Variant" : "Add Variant"}
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
          {variant && <input type="hidden" name="variantId" value={variant.id} />}
          <input
            type="hidden"
            name="options"
            value={JSON.stringify(selectedOptions)}
          />

          {state.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {state.error}
            </div>
          )}

          {/* Options selectors */}
          {productOptions
            .filter((o) => o.affectsPrice)
            .map((option) => (
              <div key={option.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {option.name}
                </label>
                <select
                  value={selectedOptions[option.name] || ""}
                  onChange={(e) =>
                    setSelectedOptions({
                      ...selectedOptions,
                      [option.name]: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">Select {option.name}</option>
                  {(option.values || []).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            ))}

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Variant Title *
            </label>
            <div className="flex gap-2">
              <input
                id="title"
                name="title"
                type="text"
                required
                defaultValue={variant?.title || generateTitle()}
                placeholder="8x10 / black / gallery"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = document.getElementById("title") as HTMLInputElement;
                  if (input) input.value = generateTitle();
                }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Auto
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Price (CAD) *
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={variant ? (variant.priceCents / 100).toFixed(2) : ""}
                placeholder="49.99"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="sku"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                SKU
              </label>
              <input
                id="sku"
                name="sku"
                type="text"
                defaultValue={variant?.sku || ""}
                placeholder="CANVAS-8x10-BLK"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {isEditing && (
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="availableForSale"
                  value="true"
                  defaultChecked={variant?.availableForSale !== false}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Available for sale</span>
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? "Saving..." : isEditing ? "Save" : "Add Variant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
