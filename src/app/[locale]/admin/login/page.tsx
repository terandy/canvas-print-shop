"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { loginAction, type LoginState } from "@/lib/auth/actions";

const INITIAL_STATE: LoginState = {};

export default function AdminLoginPage() {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    loginAction,
    INITIAL_STATE
  );

  useEffect(() => {
    if (state.success) {
      router.push("/admin");
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("login.title")}
          </h1>
          <p className="text-gray-600 mt-2">Canvas Print Shop Dashboard</p>
        </div>

        <form action={formAction} className="space-y-6">
          {state.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {state.error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              {t("login.email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder={t("login.emailPlaceholder")}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              {t("login.password")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? t("login.signingIn") : t("login.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
