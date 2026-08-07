import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { getVehiculeById } from "@/lib/services/vehicule.service";
import { listClientsForSelect } from "@/lib/services/client.service";
import { updateVehiculeAction } from "@/app/(app)/vehicules/actions";
import { VehiculeForm } from "@/components/features/vehicule-form";

export default async function EditVehiculePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["RECEPTIONNISTE", "ADMIN"]);

  const { id } = await params;
  const [vehicule, clients] = await Promise.all([getVehiculeById(id), listClientsForSelect()]);

  if (!vehicule) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Modifier {vehicule.immatriculation}</h1>
      <VehiculeForm
        action={updateVehiculeAction.bind(null, id)}
        clients={clients}
        initialData={vehicule}
        submitLabel="Enregistrer"
      />
    </div>
  );
}
