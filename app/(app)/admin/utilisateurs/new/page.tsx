import { requireRole } from "@/lib/auth/guards";
import { createUserAction } from "@/app/(app)/admin/utilisateurs/actions";
import { UserForm } from "@/components/features/user-form";

export default async function NewUserPage() {
  await requireRole(["ADMIN"]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Nouvel utilisateur</h1>
      <UserForm action={createUserAction} submitLabel="Créer l'utilisateur" />
    </div>
  );
}
