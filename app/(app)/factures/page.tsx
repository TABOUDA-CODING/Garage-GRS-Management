import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { StatutPaiement } from "@prisma/client";
import { requireRole } from "@/lib/auth/guards";
import { listFactures } from "@/lib/services/facture.service";
import { STATUT_PAIEMENT_BADGE_VARIANT, STATUT_PAIEMENT_LABELS } from "@/lib/utils/labels";
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

export default async function FacturesPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; page?: string }>;
}) {
  await requireRole(["RECEPTIONNISTE", "ADMIN"]);

  const { statut, page } = await searchParams;
  const statutFilter = statut && statut in STATUT_PAIEMENT_LABELS ? (statut as StatutPaiement) : undefined;

  const { factures, page: currentPage, totalPages, total } = await listFactures({
    statut: statutFilter,
    page: page ? Number(page) : 1,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Factures</h1>
        <p className="text-sm text-muted-foreground">{total} facture(s)</p>
      </div>

      <form className="flex flex-wrap items-end gap-3">
        <select
          name="statut"
          defaultValue={statut ?? ""}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUT_PAIEMENT_LABELS).map(([value, label]) => (
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
              <TableHead>Dossier</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Montant TTC</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {factures.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Aucune facture trouvée
                </TableCell>
              </TableRow>
            )}
            {factures.map((facture) => (
              <TableRow key={facture.id}>
                <TableCell className="font-medium">{facture.numero}</TableCell>
                <TableCell>
                  <Link href={`/dossiers/${facture.dossierId}`} className="hover:underline">
                    {facture.dossier.numero}
                  </Link>
                </TableCell>
                <TableCell>{facture.dossier.vehicule.client.nom}</TableCell>
                <TableCell>{facture.montantTTC.toString()} MAD</TableCell>
                <TableCell>
                  <Badge variant={STATUT_PAIEMENT_BADGE_VARIANT[facture.statutPaiement]}>
                    {STATUT_PAIEMENT_LABELS[facture.statutPaiement]}
                  </Badge>
                </TableCell>
                <TableCell>{format(facture.createdAt, "dd/MM/yyyy", { locale: fr })}</TableCell>
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
                  href={`/factures?${new URLSearchParams({
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
