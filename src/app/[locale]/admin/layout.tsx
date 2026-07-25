import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { getAdminSession } from "@/lib/auth/session";
import AdminSidebar from "@/components/admin/sidebar";
import { noIndexMetadata } from "@/lib/seo";

/**
 * robots.txt blocks crawling of /*\/admin/, but a URL that is merely
 * disallowed can still be indexed if it is linked from elsewhere. This keeps
 * the whole admin tree out of the index outright.
 */
export const metadata: Metadata = noIndexMetadata;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname =
    headersList.get("x-pathname") || headersList.get("x-invoke-path") || "";

  // Allow access to auth pages without login
  const publicPaths = [
    "/admin/login",
    "/admin/forgot-password",
    "/admin/reset-password",
  ];
  if (publicPaths.some((path) => pathname.includes(path))) {
    return <>{children}</>;
  }

  const session = await getAdminSession();

  if (!session) {
    // Strip locale prefix to get the app-relative path for redirect
    const redirectTo = pathname.replace(/^\/(en|fr)/, "");
    redirect(`/admin/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar user={{ email: session.email, role: session.role }} />
      <div className="lg:pl-64">
        <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
