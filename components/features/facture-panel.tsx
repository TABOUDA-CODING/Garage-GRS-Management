"use client";

import { useActionState, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ModePaiement, StatutPaiement } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STATUT_PAIEMENT_BADGE_VARIANT, STATUT_PAIEMENT_LABELS } from "@/lib/utils/labels";
import {
  genererFactureAction,
  enregistrerPaiementAction,
  type GenererFactureState,
  type EnregistrerPaiementState,
} from "@/app/(app)/dossiers/[id]/actions";

const MODE_PAIEMENT_LABELS: Record<ModePaiement, string> = {
  ESPECES: "Espèces",
  CHEQUE: "Chèque",
  VIREMENT: "Virement",
  CARTE: "Carte",
};

interface FactureItem {
  id: string;
  numero: string;
  montantHT: string;
  tauxTVA: string;
  montantTTC: string;
  statutPaiement: StatutPaiement;
  modePaiement: ModePaiement | null;
  datePaiement: Date | null;
  createdAt: Date;
}

interface FacturePanelProps {
  dossierId: string;
  facture: FactureItem | null;
}

export function FacturePanel({ dossierId, facture }: FacturePanelProps) {
  if (!facture) {
    return <GenererFactureForm dossierId={dossierId} />;
  }

  return <FactureDetail dossierId={dossierId} facture={facture} />;
}

function GenererFactureForm({ dossierId }: { dossierId: string }) {
  const [state, formAction, isPending] = useActionState<GenererFactureState | undefined, FormData>(
    genererFactureAction,
    undefined,
  );
  const [montantHT, setMontantHT] = useState("");
  const [tauxTVA, setTauxTVA] = useState("20");
  const montantTTC =
    montantHT && !Number.isNaN(Number(montantHT))
      ? (Number(montantHT) * (1 + Number(tauxTVA || 0) / 100)).toFixed(2)
      : "0.00";

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium">Facturation</h2>
      <form action={formAction} className="max-w-sm space-y-3">
        <input type="hidden" name="dossierId" value={dossierId} />
        <div className="space-y-2">
          <Label htmlFor="montantHT">Montant HT (MAD)</Label>
          <Input
            id="montantHT"
            name="montantHT"
            type="number"
            step="0.01"
            min="0"
            required
            value={montantHT}
            onChange={(event) => setMontantHT(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tauxTVA">TVA (%)</Label>
          <Input
            id="tauxTVA"
            name="tauxTVA"
            type="number"
            step="0.01"
            min="0"
            max="100"
            required
            value={tauxTVA}
            onChange={(event) => setTauxTVA(event.target.value)}
          />
        </div>
        <p className="text-sm text-muted-foreground">Montant TTC : {montantTTC} MAD</p>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Génération..." : "Générer la facture"}
        </Button>
      </form>
    </div>
  );
}

function FactureDetail({ dossierId, facture }: { dossierId: string; facture: FactureItem }) {
  const [state, formAction, isPending] = useActionState<EnregistrerPaiementState | undefined, FormData>(
    enregistrerPaiementAction,
    undefined,
  );

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium">Facturation</h2>
      <div className="max-w-sm space-y-2 rounded-lg border p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium">{facture.numero}</span>
          <Badge variant={STATUT_PAIEMENT_BADGE_VARIANT[facture.statutPaiement]}>
            {STATUT_PAIEMENT_LABELS[facture.statutPaiement]}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-y-1 text-muted-foreground">
          <span>Montant HT</span>
          <span className="text-right text-foreground">{facture.montantHT} MAD</span>
          <span>TVA</span>
          <span className="text-right text-foreground">{facture.tauxTVA}%</span>
          <span>Montant TTC</span>
          <span className="text-right font-medium text-foreground">{facture.montantTTC} MAD</span>
        </div>
        {facture.modePaiement && facture.datePaiement && (
          <p className="text-xs text-muted-foreground">
            Payé par {MODE_PAIEMENT_LABELS[facture.modePaiement]} le{" "}
            {format(facture.datePaiement, "dd/MM/yyyy", { locale: fr })}
          </p>
        )}
      </div>

      {facture.statutPaiement !== "SOLDE" && (
        <form action={formAction} className="max-w-sm space-y-3">
          <input type="hidden" name="dossierId" value={dossierId} />
          <input type="hidden" name="factureId" value={facture.id} />
          <div className="space-y-2">
            <Label htmlFor="statutPaiement">Statut du paiement</Label>
            <select
              id="statutPaiement"
              name="statutPaiement"
              defaultValue="SOLDE"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="PARTIEL">Partiel</option>
              <option value="SOLDE">Soldé</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="modePaiement">Mode de paiement</Label>
            <select
              id="modePaiement"
              name="modePaiement"
              required
              defaultValue=""
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="" disabled>
                Sélectionner...
              </option>
              {Object.entries(MODE_PAIEMENT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="datePaiement">Date de paiement</Label>
            <Input
              id="datePaiement"
              name="datePaiement"
              type="date"
              required
              defaultValue={format(new Date(), "yyyy-MM-dd")}
            />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Enregistrement..." : "Enregistrer le paiement"}
          </Button>
        </form>
      )}
    </div>
  );
}
