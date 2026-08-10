"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { StatutDossier, TypeIntervention } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TYPE_INTERVENTION_LABELS } from "@/lib/utils/labels";
import { changerStatutAction, type ChangerStatutState } from "@/app/(app)/atelier/actions";

interface DossierKanbanCardProps {
  dossierId: string;
  numero: string;
  immatriculation: string;
  marque: string;
  modele: string;
  typesIntervention: TypeIntervention[];
  technicienNom: string | null;
  ancienneteJours: number;
  statutPrecedent: StatutDossier | null;
  statutSuivant: StatutDossier | null;
}

export function DossierKanbanCard({
  dossierId,
  numero,
  immatriculation,
  marque,
  modele,
  typesIntervention,
  technicienNom,
  ancienneteJours,
  statutPrecedent,
  statutSuivant,
}: DossierKanbanCardProps) {
  const [state, formAction, isPending] = useActionState<ChangerStatutState | undefined, FormData>(
    changerStatutAction,
    undefined,
  );

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>
          <Link href={`/dossiers/${dossierId}`} className="hover:underline">
            {immatriculation}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {marque} {modele}
        </p>
        <div className="flex flex-wrap gap-1">
          {typesIntervention.map((type) => (
            <Badge key={type} variant="outline">
              {TYPE_INTERVENTION_LABELS[type]}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{technicienNom ?? "Non assigné"}</p>
        <p className="text-xs text-muted-foreground">
          {numero} · {ancienneteJours === 0 ? "Entré aujourd'hui" : `Entré il y a ${ancienneteJours} j`}
        </p>

        <form action={formAction} className="flex items-center justify-between gap-2 pt-1">
          <input type="hidden" name="dossierId" value={dossierId} />
          <Button
            type="submit"
            name="statutCible"
            value={statutPrecedent ?? ""}
            variant="outline"
            size="sm"
            disabled={!statutPrecedent || isPending}
          >
            ← Précédent
          </Button>
          <Button
            type="submit"
            name="statutCible"
            value={statutSuivant ?? ""}
            variant="outline"
            size="sm"
            disabled={!statutSuivant || isPending}
          >
            Suivant →
          </Button>
        </form>
        {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
      </CardContent>
    </Card>
  );
}
