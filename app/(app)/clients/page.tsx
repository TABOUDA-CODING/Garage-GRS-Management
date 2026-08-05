import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { listClients } from "@/lib/services/client.service";
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

const TYPE_LABELS = {
  PARTICULIER: "Particulier",
  ETAT: "État",
  ENTREPRISE: "Entreprise",
} as const;

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireRole(["RECEPTIONNISTE", "ADMIN"]);

  const { q, page } = await searchParams;
  const { clients, page: currentPage, totalPages, total } = await listClients({
    query: q,
    page: page ? Number(page) : 1,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-sm text-muted-foreground">{total} client(s)</p>
        </div>
        <Button nativeButton={false} render={<Link href="/clients/new" />}>
          Nouveau client
        </Button>
      </div>

      <form className="max-w-sm">
        <Input
          type="text"
          name="q"
          placeholder="Rechercher par nom ou téléphone..."
          defaultValue={q}
        />
      </form>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Véhicules</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Aucun client trouvé
                </TableCell>
              </TableRow>
            )}
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <Link href={`/clients/${client.id}`} className="font-medium hover:underline">
                    {client.nom}
                  </Link>
                </TableCell>
                <TableCell>{client.telephone}</TableCell>
                <TableCell>
                  <Badge variant="outline">{TYPE_LABELS[client.type]}</Badge>
                </TableCell>
                <TableCell>{client._count.vehicules}</TableCell>
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
                  href={`/clients?${new URLSearchParams({
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
