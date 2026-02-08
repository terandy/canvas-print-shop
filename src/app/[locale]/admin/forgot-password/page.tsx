"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  requestPasswordResetAction,
  type PasswordResetRequestState,
} from "@/lib/auth/actions";

const INITIAL_STATE: PasswordResetRequestState = {};

export default function ForgotPasswordPage() {
  const t = useTranslations("Admin");
  const [state, formAction, isPending] = useActionState(
    requestPasswordResetAction,
    INITIAL_STATE
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("forgotPassword.title")}
          </h1>
          <p className="text-gray-600 mt-2">
            {t("forgotPassword.description")}
          </p>
        </div>

        {state.success ? (
          <div className="text-center">
            <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">
              <h2 className="font-semibold mb-1">
                {t("forgotPassword.successTitle")}
              </h2>
              <p className="text-sm">{t("forgotPassword.successMessage")}</p>
            </div>
            <Link
              href="/admin/login"
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              {t("forgotPassword.backToLogin")}
            </Link>
          </div>
        ) : (
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
                {t("forgotPassword.emailLabel")}
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

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending
                ? t("forgotPassword.submitting")
                : t("forgotPassword.submit")}
            </button>

            <div className="text-center">
              <Link
                href="/admin/login"
                className="text-primary hover:text-primary/80 text-sm font-medium"
              >
                {t("forgotPassword.backToLogin")}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
