import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { listUsers } from "@/lib/services/user.service";
import { ROLE_LABELS } from "@/lib/utils/labels";
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
import { toggleUserActifAction } from "./actions";

export default async function UtilisateursPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const session = await requireRole(["ADMIN"]);
  const { erreur } = await searchParams;

  const users = await listUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground">{users.length} utilisateur(s)</p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/utilisateurs/new" />}>
          Nouvel utilisateur
        </Button>
      </div>

      {erreur && <p className="text-sm text-destructive">{erreur}</p>}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.nom}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{ROLE_LABELS[user.role]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.actif ? "default" : "secondary"}>
                    {user.actif ? "Actif" : "Désactivé"}
                  </Badge>
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/admin/utilisateurs/${user.id}/edit`} />}>
                    Modifier
                  </Button>
                  <form
                    action={toggleUserActifAction.bind(null, user.id, !user.actif)}
                  >
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      disabled={session.userId === user.id && user.actif}
                    >
                      {user.actif ? "Désactiver" : "Activer"}
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
