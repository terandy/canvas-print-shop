import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { getAdminByIdWithDetails } from "@/lib/db/queries/admin-users";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminUserForm from "@/components/admin/admin-user-form";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditAdminUserPage({ params }: Props) {
  const session = await getAdminSession();

  // Only super_admin can access this page
  if (!session || session.role !== "super_admin") {
    redirect("/admin");
  }

  const { id } = await params;
  const user = await getAdminByIdWithDetails(id);

  if (!user) {
    redirect("/admin/users");
  }

  const t = await getTranslations("Admin.users");

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t("backToUsers")}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t("editUser")}</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <AdminUserForm user={user} />
      </div>
    </div>
  );
}
