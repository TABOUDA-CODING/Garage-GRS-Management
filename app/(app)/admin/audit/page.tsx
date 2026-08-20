import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { requireRole } from "@/lib/auth/guards";
import { listHistorique } from "@/lib/services/audit.service";
import { STATUT_DOSSIER_BADGE_VARIANT, STATUT_DOSSIER_LABELS } from "@/lib/utils/labels";
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

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireRole(["ADMIN"]);

  const { page } = await searchParams;
  const { entries, page: currentPage, totalPages, total } = await listHistorique({
    page: page ? Number(page) : 1,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Audit trail</h1>
        <p className="text-sm text-muted-foreground">{total} évènement(s)</p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Dossier</TableHead>
              <TableHead>Véhicule</TableHead>
              <TableHead>Statut avant</TableHead>
              <TableHead>Statut après</TableHead>
              <TableHead>Par</TableHead>
              <TableHead>Commentaire</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Aucun évènement enregistré
                </TableCell>
              </TableRow>
            )}
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{format(entry.createdAt, "dd/MM/yyyy HH:mm", { locale: fr })}</TableCell>
                <TableCell>
                  <Link href={`/dossiers/${entry.dossierId}`} className="hover:underline">
                    {entry.dossier.numero}
                  </Link>
                </TableCell>
                <TableCell>{entry.dossier.vehicule.immatriculation}</TableCell>
                <TableCell>
                  {entry.statutAvant ? (
                    <Badge variant={STATUT_DOSSIER_BADGE_VARIANT[entry.statutAvant]}>
                      {STATUT_DOSSIER_LABELS[entry.statutAvant]}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUT_DOSSIER_BADGE_VARIANT[entry.statutApres]}>
                    {STATUT_DOSSIER_LABELS[entry.statutApres]}
                  </Badge>
                </TableCell>
                <TableCell>{entry.user.nom}</TableCell>
                <TableCell className="text-muted-foreground">{entry.commentaire ?? "—"}</TableCell>
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
              render={<Link href={`/admin/audit?page=${pageNumber}`} />}
            >
              {pageNumber}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
