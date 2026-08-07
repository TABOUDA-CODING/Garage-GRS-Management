import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { requireRole } from "@/lib/auth/guards";
import { getDossierById } from "@/lib/services/dossier.service";
import { STATUT_DOSSIER_LABELS, TYPE_INTERVENTION_LABELS } from "@/lib/utils/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function DossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["RECEPTIONNISTE", "ADMIN"]);

  const { id } = await params;
  const dossier = await getDossierById(id);

  if (!dossier) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{dossier.numero}</h1>
            <Badge variant="outline">{STATUT_DOSSIER_LABELS[dossier.statut]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Entré le {format(dossier.dateEntree, "dd/MM/yyyy", { locale: fr })}
          </p>
        </div>
        <Button variant="outline" nativeButton={false} render={<a href={`/api/dossiers/${dossier.id}/fiche`} target="_blank" />}>
          Fiche d&apos;intervention (PDF)
        </Button>
      </div>

      <div className="grid max-w-lg grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <span className="text-muted-foreground">Véhicule</span>
        <span>
          <Link href={`/vehicules/${dossier.vehicule.id}`} className="hover:underline">
            {dossier.vehicule.immatriculation} — {dossier.vehicule.marque} {dossier.vehicule.modele}
          </Link>
        </span>
        <span className="text-muted-foreground">Client</span>
        <span>
          <Link href={`/clients/${dossier.vehicule.client.id}`} className="hover:underline">
            {dossier.vehicule.client.nom}
          </Link>
        </span>
        <span className="text-muted-foreground">Type(s) d&apos;intervention</span>
        <span>{dossier.typesIntervention.map((type) => TYPE_INTERVENTION_LABELS[type]).join(", ")}</span>
        <span className="text-muted-foreground">Motif déclaré</span>
        <span>{dossier.motifDeclare}</span>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Historique</h2>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Par</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dossier.historique.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{format(entry.createdAt, "dd/MM/yyyy HH:mm", { locale: fr })}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{STATUT_DOSSIER_LABELS[entry.statutApres]}</Badge>
                  </TableCell>
                  <TableCell>{entry.user.nom}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
