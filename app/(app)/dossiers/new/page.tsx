import { requireRole } from "@/lib/auth/guards";
import { createDossierAction } from "@/app/(app)/dossiers/actions";
import { listVehiculesForSelect } from "@/lib/services/vehicule.service";
import { DossierForm } from "@/components/features/dossier-form";

export default async function NewDossierPage({
  searchParams,
}: {
  searchParams: Promise<{ vehiculeId?: string }>;
}) {
  await requireRole(["RECEPTIONNISTE", "ADMIN"]);

  const { vehiculeId } = await searchParams;
  const vehicules = await listVehiculesForSelect();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Nouveau dossier</h1>
      <DossierForm action={createDossierAction} vehicules={vehicules} defaultVehiculeId={vehiculeId} />
    </div>
  );
}
