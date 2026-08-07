import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { listVehicules } from "@/lib/services/vehicule.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function VehiculesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireRole(["RECEPTIONNISTE", "ADMIN"]);

  const { q, page } = await searchParams;
  const { vehicules, page: currentPage, totalPages, total } = await listVehicules({
    query: q,
    page: page ? Number(page) : 1,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Véhicules</h1>
          <p className="text-sm text-muted-foreground">{total} véhicule(s)</p>
        </div>
        <Button nativeButton={false} render={<Link href="/vehicules/new" />}>
          Nouveau véhicule
        </Button>
      </div>

      <form className="max-w-sm">
        <Input
          type="text"
          name="q"
          placeholder="Rechercher par immatriculation..."
          defaultValue={q}
          autoFocus
        />
      </form>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Immatriculation</TableHead>
              <TableHead>Marque / Modèle</TableHead>
              <TableHead>Année</TableHead>
              <TableHead>Client</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicules.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Aucun véhicule trouvé
                </TableCell>
              </TableRow>
            )}
            {vehicules.map((vehicule) => (
              <TableRow key={vehicule.id}>
                <TableCell>
                  <Link href={`/vehicules/${vehicule.id}`} className="font-medium hover:underline">
                    {vehicule.immatriculation}
                  </Link>
                </TableCell>
                <TableCell>
                  {vehicule.marque} {vehicule.modele}
                </TableCell>
                <TableCell>{vehicule.annee ?? "-"}</TableCell>
                <TableCell>
                  <Link href={`/clients/${vehicule.client.id}`} className="hover:underline">
                    {vehicule.client.nom}
                  </Link>
                </TableCell>
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
                  href={`/vehicules?${new URLSearchParams({
                    ...(q ? { q } : {}),
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
