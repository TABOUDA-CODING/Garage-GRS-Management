import { differenceInDays } from "date-fns";
import { StatutDossier } from "@prisma/client";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { KANBAN_STATUTS, listDossiersAtelier } from "@/lib/services/dossier.service";
import { STATUT_DOSSIER_LABELS } from "@/lib/utils/labels";
import { DossierKanbanCard } from "@/components/features/dossier-kanban-card";

export default async function AtelierPage() {
  const session = await requireRole(["RECEPTIONNISTE", "TECHNICIEN", "ADMIN"]);
  const peutAssigner = session.role !== "TECHNICIEN";

  const [dossiers, techniciens] = await Promise.all([
    listDossiersAtelier({
      technicienId: session.role === "TECHNICIEN" ? session.userId : undefined,
    }),
    prisma.user.findMany({
      where: { role: "TECHNICIEN", actif: true },
      orderBy: { nom: "asc" },
      select: { id: true, nom: true },
    }),
  ]);

  const now = new Date();
  const colonnes = KANBAN_STATUTS.map((statut, index) => ({
    statut,
    label: STATUT_DOSSIER_LABELS[statut],
    precedent: (KANBAN_STATUTS[index - 1] ?? null) as StatutDossier | null,
    suivant: (KANBAN_STATUTS[index + 1] ?? null) as StatutDossier | null,
    dossiers: dossiers.filter((d) => d.statut === statut),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Atelier</h1>
        <p className="text-sm text-muted-foreground">{dossiers.length} véhicule(s) en atelier</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {colonnes.map((colonne) => (
          <div key={colonne.statut} className="space-y-3 rounded-lg border bg-muted/10 p-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold">{colonne.label}</h2>
              <span className="text-xs text-muted-foreground">{colonne.dossiers.length}</span>
            </div>

            <div className="space-y-3">
              {colonne.dossiers.length === 0 && (
                <p className="px-1 text-xs text-muted-foreground">Aucun véhicule</p>
              )}
              {colonne.dossiers.map((dossier) => (
                <DossierKanbanCard
                  key={dossier.id}
                  dossierId={dossier.id}
                  numero={dossier.numero}
                  immatriculation={dossier.vehicule.immatriculation}
                  marque={dossier.vehicule.marque}
                  modele={dossier.vehicule.modele}
                  typesIntervention={dossier.typesIntervention}
                  technicienId={dossier.technicienId}
                  ancienneteJours={differenceInDays(now, dossier.dateEntree)}
                  statutPrecedent={colonne.precedent}
                  statutSuivant={colonne.suivant}
                  techniciens={techniciens}
                  peutAssigner={peutAssigner}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
