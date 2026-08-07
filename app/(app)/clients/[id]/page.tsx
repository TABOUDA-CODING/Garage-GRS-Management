import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { getClientById } from "@/lib/services/client.service";
import { deleteClientAction } from "@/app/(app)/clients/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteClientButton } from "@/components/features/delete-client-button";
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

export default async function ClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erreur?: string }>;
}) {
  await requireRole(["RECEPTIONNISTE", "ADMIN"]);

  const { id } = await params;
  const { erreur } = await searchParams;
  const client = await getClientById(id);

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{client.nom}</h1>
            <Badge variant="outline">{TYPE_LABELS[client.type]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{client.telephone}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/clients/${client.id}/edit`} />}
          >
            Modifier
          </Button>
          <DeleteClientButton action={deleteClientAction.bind(null, client.id)} />
        </div>
      </div>

      {erreur && <p className="text-sm text-destructive">{erreur}</p>}

      <div className="grid max-w-lg grid-cols-2 gap-x-6 gap-y-2 text-sm">
        {client.email && (
          <>
            <span className="text-muted-foreground">E-mail</span>
            <span>{client.email}</span>
          </>
        )}
        {client.cin && (
          <>
            <span className="text-muted-foreground">CIN</span>
            <span>{client.cin}</span>
          </>
        )}
        {client.raisonSociale && (
          <>
            <span className="text-muted-foreground">Raison sociale</span>
            <span>{client.raisonSociale}</span>
          </>
        )}
        {client.ice && (
          <>
            <span className="text-muted-foreground">ICE</span>
            <span>{client.ice}</span>
          </>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Véhicules ({client.vehicules.length})</h2>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/vehicules/new?clientId=${client.id}`} />}
          >
            Nouveau véhicule
          </Button>
        </div>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Immatriculation</TableHead>
                <TableHead>Marque / Modèle</TableHead>
                <TableHead>Année</TableHead>
                <TableHead>Kilométrage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {client.vehicules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Aucun véhicule enregistré
                  </TableCell>
                </TableRow>
              )}
              {client.vehicules.map((vehicule) => (
                <TableRow key={vehicule.id}>
                  <TableCell className="font-medium">
                    <Link href={`/vehicules/${vehicule.id}`} className="hover:underline">
                      {vehicule.immatriculation}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {vehicule.marque} {vehicule.modele}
                  </TableCell>
                  <TableCell>{vehicule.annee ?? "-"}</TableCell>
                  <TableCell>
                    {vehicule.kilometrage ? `${vehicule.kilometrage} km` : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
