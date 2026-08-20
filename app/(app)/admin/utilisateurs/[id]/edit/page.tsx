import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { getUserById } from "@/lib/services/user.service";
import { updateUserAction } from "@/app/(app)/admin/utilisateurs/actions";
import { UserForm } from "@/components/features/user-form";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN"]);

  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Modifier {user.nom}</h1>
      <UserForm
        action={updateUserAction.bind(null, id)}
        initialData={user}
        submitLabel="Enregistrer"
      />
    </div>
  );
}
