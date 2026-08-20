import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function AdminPage() {
  await requireRole(["ADMIN"]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Administration</h1>

      <div className="grid max-w-2xl grid-cols-2 gap-4">
        <Link href="/admin/utilisateurs">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle>Utilisateurs</CardTitle>
              <CardDescription>Créer, modifier, activer ou désactiver les comptes</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/audit">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader>
              <CardTitle>Audit trail</CardTitle>
              <CardDescription>Historique des changements de statut des dossiers</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
