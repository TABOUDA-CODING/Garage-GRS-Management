import { requireRole } from "@/lib/auth/guards";
import { createVehiculeAction } from "@/app/(app)/vehicules/actions";
import { listClientsForSelect } from "@/lib/services/client.service";
import { VehiculeForm } from "@/components/features/vehicule-form";

export default async function NewVehiculePage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  await requireRole(["RECEPTIONNISTE", "ADMIN"]);

  const { clientId } = await searchParams;
  const clients = await listClientsForSelect();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Nouveau véhicule</h1>
      <VehiculeForm
        action={createVehiculeAction}
        clients={clients}
        defaultClientId={clientId}
        submitLabel="Créer le véhicule"
      />
    </div>
  );
}
