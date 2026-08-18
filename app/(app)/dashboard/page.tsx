import Link from "next/link";
import { differenceInDays } from "date-fns";
import { requireUser } from "@/lib/auth/guards";
import { getDashboardData } from "@/lib/services/dashboard.service";
import { STATUT_DOSSIER_LABELS, TYPE_CLIENT_LABELS } from "@/lib/utils/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function montant(valeur: number): string {
  return `${valeur.toLocaleString("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`;
}

export default async function DashboardPage() {
  await requireUser();

  const data = await getDashboardData();
  const now = new Date();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">Synthèse de l&apos;activité de l&apos;atelier</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Véhicules présents</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total présents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{data.vehiculesPresents}</p>
            </CardContent>
          </Card>
          {data.comptagesParStatut.map(({ statut, count }) => (
            <Card key={statut}>
              <CardHeader>
                <CardTitle>{STATUT_DOSSIER_LABELS[statut]}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{count}</p>
              </CardContent>
            </Card>
          ))}
          <Card>
            <CardHeader>
              <CardTitle>Sorties aujourd&apos;hui</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{data.sortiesDuJour}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Chiffre d&apos;affaires (encaissé)</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Aujourd&apos;hui</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{montant(data.ca.jour)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Cette semaine</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{montant(data.ca.semaine)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ce mois-ci</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{montant(data.ca.mois)}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Alertes</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Dossiers stagnants (+3 j)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.dossiersStagnants.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun dossier stagnant</p>
              )}
              {data.dossiersStagnants.map((dossier) => (
                <Link
                  key={dossier.id}
                  href={`/dossiers/${dossier.id}`}
                  className="block rounded-md border p-2 text-sm hover:bg-muted"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{dossier.vehicule.immatriculation}</span>
                    <Badge variant="outline">{STATUT_DOSSIER_LABELS[dossier.statut]}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dossier.numero} · sans mise à jour depuis {differenceInDays(now, dossier.updatedAt)} j
                  </p>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Factures impayées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.facturesImpayees.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucune facture impayée</p>
              )}
              {data.facturesImpayees.map((facture) => (
                <Link
                  key={facture.id}
                  href={`/dossiers/${facture.dossierId}`}
                  className="block rounded-md border p-2 text-sm hover:bg-muted"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{facture.numero}</span>
                    <span>{montant(Number(facture.montantTTC))}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {facture.dossier.vehicule.client.nom}
                    {facture.dossier.vehicule.client.type !== "PARTICULIER"
                      ? ` (${TYPE_CLIENT_LABELS[facture.dossier.vehicule.client.type]})`
                      : ""}
                  </p>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Devis sans réponse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.devisSansReponse.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun devis en attente</p>
              )}
              {data.devisSansReponse.map((dossier) => (
                <Link
                  key={dossier.id}
                  href={`/dossiers/${dossier.id}`}
                  className="block rounded-md border p-2 text-sm hover:bg-muted"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{dossier.vehicule.immatriculation}</span>
                    <span className="text-xs text-muted-foreground">
                      envoyé il y a {differenceInDays(now, dossier.updatedAt)} j
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{dossier.vehicule.client.nom}</p>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
