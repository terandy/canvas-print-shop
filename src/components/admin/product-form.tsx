"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createProductAction,
  updateProductAction,
  type ProductFormState,
} from "@/lib/db/actions/products";

interface ProductFormProps {
  product?: {
    id: string;
    handle: string;
    titleEn: string;
    titleFr: string | null;
    descriptionEn: string | null;
    descriptionFr: string | null;
    descriptionHtmlEn: string | null;
    descriptionHtmlFr: string | null;
    featuredImageUrl: string | null;
    isActive: boolean | null;
  };
}

const INITIAL_STATE: ProductFormState = {};

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;

  const [state, formAction, isPending] = useActionState(
    isEditing ? updateProductAction : createProductAction,
    INITIAL_STATE
  );

  useEffect(() => {
    if (state.success && state.productId && !isEditing) {
      router.push(`/admin/products/${state.productId}`);
    }
  }, [state.success, state.productId, isEditing, router]);

  return (
    <form action={formAction} className="space-y-6">
      {product && <input type="hidden" name="productId" value={product.id} />}

      {state.error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
          Product saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="handle"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Handle (URL slug) *
          </label>
          <input
            id="handle"
            name="handle"
            type="text"
            required
            defaultValue={product?.handle || ""}
            placeholder="canvas-prints"
            pattern="[a-z0-9-]+"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
          <p className="mt-1 text-xs text-gray-500">
            Lowercase letters, numbers, and hyphens only
          </p>
        </div>

        <div>
          <label
            htmlFor="isActive"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <select
            id="isActive"
            name="isActive"
            defaultValue={product?.isActive !== false ? "true" : "false"}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="titleEn"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title (English) *
          </label>
          <input
            id="titleEn"
            name="titleEn"
            type="text"
            required
            defaultValue={product?.titleEn || ""}
            placeholder="Canvas Prints"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label
            htmlFor="titleFr"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title (French)
          </label>
          <input
            id="titleFr"
            name="titleFr"
            type="text"
            defaultValue={product?.titleFr || ""}
            placeholder="Impressions sur toile"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="descriptionEn"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description (English)
          </label>
          <textarea
            id="descriptionEn"
            name="descriptionEn"
            rows={4}
            defaultValue={product?.descriptionEn || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label
            htmlFor="descriptionFr"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description (French)
          </label>
          <textarea
            id="descriptionFr"
            name="descriptionFr"
            rows={4}
            defaultValue={product?.descriptionFr || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="featuredImageUrl"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Featured Image URL
        </label>
        <input
          id="featuredImageUrl"
          name="featuredImageUrl"
          type="url"
          defaultValue={product?.featuredImageUrl || ""}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
