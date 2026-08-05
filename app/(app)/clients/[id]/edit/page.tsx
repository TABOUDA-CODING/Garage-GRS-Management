import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { getClientById } from "@/lib/services/client.service";
import { updateClientAction } from "@/app/(app)/clients/actions";
import { ClientForm } from "@/components/features/client-form";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["RECEPTIONNISTE", "ADMIN"]);

  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Modifier {client.nom}</h1>
      <ClientForm
        action={updateClientAction.bind(null, id)}
        initialData={client}
        submitLabel="Enregistrer"
      />
    </div>
  );
}
