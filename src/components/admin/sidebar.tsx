"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ShoppingBasket,
  Users,
  LogOut,
  Menu,
  X,
  ImageIcon,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { logoutAction } from "@/lib/auth/actions";

const NAVIGATION = [
  { key: "dashboard", href: "/admin", icon: LayoutDashboard },
  { key: "orders", href: "/admin/orders", icon: ShoppingCart },
  { key: "products", href: "/admin/products", icon: Package },
  { key: "images", href: "/admin/images", icon: ImageIcon },
  { key: "customOrder", href: "/admin/custom-order", icon: FileText },
  { key: "carts", href: "/admin/carts", icon: ShoppingBasket },
  { key: "users", href: "/admin/users", icon: Users, superAdminOnly: true },
] as const;

interface AdminSidebarProps {
  user: {
    email: string;
    role: string;
  };
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const t = useTranslations("Admin");
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Extract locale from pathname
  const locale = pathname.split("/")[1] || "en";

  const isActive = (href: string) => {
    const fullPath = `/${locale}${href}`;
    if (href === "/admin") {
      return pathname === fullPath;
    }
    return pathname.startsWith(fullPath);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-gray-900">
          {t("dashboard.title")}
        </span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b">
            <Link
              href={`/${locale}/admin`}
              className="font-bold text-lg text-gray-900"
            >
              Canvas Print Shop
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {NAVIGATION.map((item) => {
              // Hide users link from non-super_admin
              if ("superAdminOnly" in item && item.superAdminOnly && user.role !== "super_admin") {
                return null;
              }

              const active = isActive(item.href);
              return (
                <Link
                  key={item.key}
                  href={`/${locale}${item.href}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {t(`sidebar.${item.key}`)}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.email}
                </p>
                <p className="text-xs text-gray-500">
                  {user.role === "super_admin"
                    ? t("users.roleSuperAdmin")
                    : t("users.roleAdmin")}
                </p>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                  title={t("sidebar.logout")}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-14" />
    </>
  );
}
