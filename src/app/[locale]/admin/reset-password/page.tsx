"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  resetPasswordAction,
  type ResetPasswordState,
} from "@/lib/auth/actions";

const INITIAL_STATE: ResetPasswordState = {};

export default function ResetPasswordPage() {
  const t = useTranslations("Admin");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    INITIAL_STATE
  );

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {t("resetPassword.invalidToken")}
          </div>
          <Link
            href="/admin/forgot-password"
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            {t("forgotPassword.submit")}
          </Link>
        </div>
      </div>
    );
  }

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "passwordMismatch":
        return t("resetPassword.passwordMismatch");
      case "passwordRequirements":
        return t("resetPassword.passwordRequirements");
      case "invalidToken":
        return t("resetPassword.invalidToken");
      default:
        return error;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("resetPassword.title")}
          </h1>
        </div>

        {state.success ? (
          <div className="text-center">
            <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">
              <h2 className="font-semibold mb-1">
                {t("resetPassword.successTitle")}
              </h2>
              <p className="text-sm">{t("resetPassword.successMessage")}</p>
            </div>
            <Link
              href="/admin/login"
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              {t("resetPassword.loginLink")}
            </Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-6">
            {state.error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {getErrorMessage(state.error)}
              </div>
            )}

            <input type="hidden" name="token" value={token} />

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                {t("resetPassword.newPassword")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                {t("resetPassword.confirmPassword")}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <p className="text-xs text-gray-500">
              {t("resetPassword.passwordRequirements")}
            </p>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending
                ? t("resetPassword.resetting")
                : t("resetPassword.submit")}
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
