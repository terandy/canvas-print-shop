"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createAdminUserAction,
  updateAdminUserAction,
  type AdminUserFormState,
} from "@/lib/db/actions/admin-users";

interface AdminUserFormProps {
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: string | null;
    isActive: boolean | null;
    receiveOrderEmails: boolean | null;
  };
}

const INITIAL_STATE: AdminUserFormState = {};

export default function AdminUserForm({ user }: AdminUserFormProps) {
  const router = useRouter();
  const isEditing = !!user;

  const [state, formAction, isPending] = useActionState(
    isEditing ? updateAdminUserAction : createAdminUserAction,
    INITIAL_STATE
  );

  useEffect(() => {
    if (state.success && !isEditing) {
      router.push("/admin/users");
    }
  }, [state.success, isEditing, router]);

  return (
    <form action={formAction} className="space-y-6">
      {user && <input type="hidden" name="userId" value={user.id} />}

      {state.error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
          Admin user saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={user?.email || ""}
            placeholder="admin@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={user?.name || ""}
            placeholder="John Doe"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password {isEditing ? "" : "*"}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required={!isEditing}
            placeholder={isEditing ? "Leave blank to keep current" : "••••••••"}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          />
          <p className="mt-1 text-xs text-gray-500">
            {isEditing
              ? "Leave blank to keep current password"
              : "Minimum 8 characters, must contain letter and number"}
          </p>
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Role *
          </label>
          <select
            id="role"
            name="role"
            defaultValue={user?.role || "admin"}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          >
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Super admins can manage other admin users
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            defaultValue={user?.isActive !== false ? "true" : "false"}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="flex items-center pt-6">
          <input
            id="receiveOrderEmails"
            name="receiveOrderEmails"
            type="checkbox"
            defaultChecked={user?.receiveOrderEmails || false}
            value="true"
            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label
            htmlFor="receiveOrderEmails"
            className="ml-2 block text-sm text-gray-700"
          >
            Send email notifications for new orders
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Saving..." : isEditing ? "Update Admin User" : "Create Admin User"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/users")}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
