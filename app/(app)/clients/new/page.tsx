import { requireRole } from "@/lib/auth/guards";
import { createClientAction } from "@/app/(app)/clients/actions";
import { ClientForm } from "@/components/features/client-form";

export default async function NewClientPage() {
  await requireRole(["RECEPTIONNISTE", "ADMIN"]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Nouveau client</h1>
      <ClientForm action={createClientAction} submitLabel="Créer le client" />
    </div>
  );
}
