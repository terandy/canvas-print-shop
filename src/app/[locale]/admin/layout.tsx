import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import AdminSidebar from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // Allow access to login page without auth
  // The login page handles its own layout
  if (!session) {
    redirect("/admin/login");
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
