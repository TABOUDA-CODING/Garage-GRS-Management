"use client";

import { useActionState, useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { StatutBS, StatutDossier, StatutPaiement } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  STATUT_BS_BADGE_VARIANT,
  STATUT_BS_LABELS,
  STATUT_PAIEMENT_LABELS,
} from "@/lib/utils/labels";
import {
  genererBsAction,
  regenererBsAction,
  type GenererBsState,
  type RegenererBsState,
} from "@/app/(app)/dossiers/[id]/actions";

interface BonDeSortieItem {
  id: string;
  numero: string;
  statut: StatutBS;
  dateGeneration: Date;
  dateUtilisation: Date | null;
  derogationPaiement: boolean;
}

interface BonDeSortiePanelProps {
  dossierId: string;
  statutDossier: StatutDossier;
  statutPaiement: StatutPaiement;
  isAdmin: boolean;
  bonsDeSortie: BonDeSortieItem[];
}

export function BonDeSortiePanel({
  dossierId,
  statutDossier,
  statutPaiement,
  isAdmin,
  bonsDeSortie,
}: BonDeSortiePanelProps) {
  const bsValide = bonsDeSortie.find((bs) => bs.statut === "VALIDE") ?? null;
  const paiementSolde = statutPaiement === "SOLDE";
  const peutGenerer = isAdmin && statutDossier === "PRET" && !bsValide;

  const [genState, genFormAction, genPending] = useActionState<GenererBsState | undefined, FormData>(
    genererBsAction,
    undefined,
  );
  const [regenState, regenFormAction, regenPending] = useActionState<RegenererBsState | undefined, FormData>(
    regenererBsAction,
    undefined,
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (genState && !genState.error) {
      setDialogOpen(false);
    }
  }, [genState]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Bon de sortie</h2>

        {peutGenerer &&
          (paiementSolde ? (
            <form action={genFormAction}>
              <input type="hidden" name="dossierId" value={dossierId} />
              <Button type="submit" disabled={genPending}>
                {genPending ? "Génération..." : "Générer le bon de sortie"}
              </Button>
            </form>
          ) : (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger render={<Button />}>Générer le bon de sortie</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dérogation de paiement</DialogTitle>
                  <DialogDescription>
                    Ce dossier n&apos;est pas soldé ({STATUT_PAIEMENT_LABELS[statutPaiement]}). Indiquez un motif
                    pour autoriser la sortie malgré tout.
                  </DialogDescription>
                </DialogHeader>
                <form action={genFormAction} className="space-y-3">
                  <input type="hidden" name="dossierId" value={dossierId} />
                  <div className="space-y-2">
                    <Label htmlFor="derogationMotif">Motif de la dérogation</Label>
                    <Textarea id="derogationMotif" name="derogationMotif" required minLength={10} autoFocus />
                  </div>
                  {genState?.error && <p className="text-sm text-destructive">{genState.error}</p>}
                  <DialogFooter>
                    <Button type="submit" disabled={genPending}>
                      {genPending ? "Génération..." : "Confirmer la dérogation"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          ))}
      </div>

      {!isAdmin && statutDossier === "PRET" && !bsValide && (
        <p className="text-sm text-muted-foreground">Seul un administrateur peut générer le bon de sortie.</p>
      )}
      {statutDossier !== "PRET" && bonsDeSortie.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Le bon de sortie sera disponible une fois le dossier au statut « Prêt ».
        </p>
      )}

      {bonsDeSortie.length > 0 && (
        <div className="space-y-2">
          {bonsDeSortie.map((bs) => (
            <div key={bs.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{bs.numero}</span>
                  <Badge variant={STATUT_BS_BADGE_VARIANT[bs.statut]}>{STATUT_BS_LABELS[bs.statut]}</Badge>
                  {bs.derogationPaiement && <Badge variant="outline">Dérogation</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  Généré le {format(bs.dateGeneration, "dd/MM/yyyy HH:mm", { locale: fr })}
                  {bs.dateUtilisation &&
                    ` · Utilisé le ${format(bs.dateUtilisation, "dd/MM/yyyy HH:mm", { locale: fr })}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<a href={`/api/bs/${bs.id}/pdf`} target="_blank" />}
                >
                  PDF
                </Button>
                {isAdmin && bs.statut === "VALIDE" && (
                  <form
                    action={regenFormAction}
                    onSubmit={(event) => {
                      if (!confirm("Régénérer ce bon (perdu) ? L'ancien sera invalidé.")) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="dossierId" value={dossierId} />
                    <input type="hidden" name="bsId" value={bs.id} />
                    <Button type="submit" variant="outline" size="sm" disabled={regenPending}>
                      Régénérer (perdu)
                    </Button>
                  </form>
                )}
              </div>
            </div>
          ))}
          {regenState?.error && <p className="text-sm text-destructive">{regenState.error}</p>}
        </div>
      )}
    </div>
  );
}
