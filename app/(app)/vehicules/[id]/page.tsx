import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { requireRole } from "@/lib/auth/guards";
import { getVehiculeById } from "@/lib/services/vehicule.service";
import { deleteVehiculeAction } from "@/app/(app)/vehicules/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteVehiculeButton } from "@/components/features/delete-vehicule-button";
import { STATUT_DOSSIER_LABELS } from "@/lib/utils/labels";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function VehiculePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erreur?: string }>;
}) {
  await requireRole(["RECEPTIONNISTE", "ADMIN"]);

  const { id } = await params;
  const { erreur } = await searchParams;
  const vehicule = await getVehiculeById(id);

  if (!vehicule) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{vehicule.immatriculation}</h1>
          <p className="text-sm text-muted-foreground">
            {vehicule.marque} {vehicule.modele}
            {vehicule.annee ? ` (${vehicule.annee})` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/vehicules/${vehicule.id}/edit`} />}
          >
            Modifier
          </Button>
          <DeleteVehiculeButton action={deleteVehiculeAction.bind(null, vehicule.id)} />
        </div>
      </div>

      {erreur && <p className="text-sm text-destructive">{erreur}</p>}

      <div className="grid max-w-lg grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <span className="text-muted-foreground">Client</span>
        <span>
          <Link href={`/clients/${vehicule.client.id}`} className="hover:underline">
            {vehicule.client.nom}
          </Link>
        </span>
        {vehicule.couleur && (
          <>
            <span className="text-muted-foreground">Couleur</span>
            <span>{vehicule.couleur}</span>
          </>
        )}
        {vehicule.kilometrage != null && (
          <>
            <span className="text-muted-foreground">Kilométrage</span>
            <span>{vehicule.kilometrage} km</span>
          </>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Historique des dossiers ({vehicule.dossiers.length})</h2>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/dossiers/new?vehiculeId=${vehicule.id}`} />}
          >
            Nouveau dossier
          </Button>
        </div>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date d&apos;entrée</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicule.dossiers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Aucun dossier enregistré
                  </TableCell>
                </TableRow>
              )}
              {vehicule.dossiers.map((dossier) => (
                <TableRow key={dossier.id}>
                  <TableCell>
                    <Link href={`/dossiers/${dossier.id}`} className="font-medium hover:underline">
                      {dossier.numero}
                    </Link>
                  </TableCell>
                  <TableCell>{dossier.motifDeclare}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{STATUT_DOSSIER_LABELS[dossier.statut]}</Badge>
                  </TableCell>
                  <TableCell>{format(dossier.dateEntree, "dd/MM/yyyy", { locale: fr })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
