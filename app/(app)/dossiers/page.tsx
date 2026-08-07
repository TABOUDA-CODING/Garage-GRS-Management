import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { StatutDossier } from "@prisma/client";
import { requireRole } from "@/lib/auth/guards";
import { listDossiers } from "@/lib/services/dossier.service";
import { STATUT_DOSSIER_LABELS, TYPE_INTERVENTION_LABELS } from "@/lib/utils/labels";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function DossiersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; statut?: string; page?: string }>;
}) {
  await requireRole(["RECEPTIONNISTE", "ADMIN"]);

  const { q, statut, page } = await searchParams;
  const statutFilter =
    statut && statut in STATUT_DOSSIER_LABELS ? (statut as StatutDossier) : undefined;

  const { dossiers, page: currentPage, totalPages, total } = await listDossiers({
    query: q,
    statut: statutFilter,
    page: page ? Number(page) : 1,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dossiers</h1>
          <p className="text-sm text-muted-foreground">{total} dossier(s)</p>
        </div>
        <Button nativeButton={false} render={<Link href="/dossiers/new" />}>
          Nouveau dossier
        </Button>
      </div>

      <form className="flex flex-wrap items-end gap-3">
        <div className="max-w-sm flex-1">
          <Input
            type="text"
            name="q"
            placeholder="Rechercher par numéro, immatriculation ou client..."
            defaultValue={q}
          />
        </div>
        <select
          name="statut"
          defaultValue={statut ?? ""}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUT_DOSSIER_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Filtrer
        </Button>
      </form>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numéro</TableHead>
              <TableHead>Véhicule</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type(s)</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Entrée</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dossiers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Aucun dossier trouvé
                </TableCell>
              </TableRow>
            )}
            {dossiers.map((dossier) => (
              <TableRow key={dossier.id}>
                <TableCell>
                  <Link href={`/dossiers/${dossier.id}`} className="font-medium hover:underline">
                    {dossier.numero}
                  </Link>
                </TableCell>
                <TableCell>{dossier.vehicule.immatriculation}</TableCell>
                <TableCell>{dossier.vehicule.client.nom}</TableCell>
                <TableCell>
                  {dossier.typesIntervention.map((type) => TYPE_INTERVENTION_LABELS[type]).join(", ")}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{STATUT_DOSSIER_LABELS[dossier.statut]}</Badge>
                </TableCell>
                <TableCell>{format(dossier.dateEntree, "dd/MM/yyyy", { locale: fr })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <Button
              key={pageNumber}
              variant={pageNumber === currentPage ? "default" : "outline"}
              size="sm"
              nativeButton={false}
              render={
                <Link
                  href={`/dossiers?${new URLSearchParams({
                    ...(q ? { q } : {}),
                    ...(statut ? { statut } : {}),
                    page: String(pageNumber),
                  }).toString()}`}
                />
              }
            >
              {pageNumber}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
