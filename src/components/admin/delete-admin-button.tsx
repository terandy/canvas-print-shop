"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteAdminUserAction } from "@/lib/db/actions/admin-users";
import { useRouter } from "next/navigation";

interface DeleteAdminButtonProps {
  userId: string;
  isCurrentUser: boolean;
}

export default function DeleteAdminButton({
  userId,
  isCurrentUser,
}: DeleteAdminButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isCurrentUser) {
      alert("You cannot delete your own account");
      return;
    }

    if (!confirm("Are you sure you want to delete this admin user?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteAdminUserAction(userId);
      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    } catch (error) {
      alert("Failed to delete admin user");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
      title="Delete"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
