"use client";

import { useActionState, useState } from "react";
import { TypeClient, TypeIntervention } from "@prisma/client";
import type { DossierFormState } from "@/app/(app)/dossiers/actions";
import { TYPE_CLIENT_LABELS, TYPE_INTERVENTION_LABELS } from "@/lib/utils/labels";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState: DossierFormState = {};

interface VehiculeOption {
  id: string;
  immatriculation: string;
  marque: string;
  modele: string;
  client: { nom: string };
}

interface DossierFormProps {
  action: (prevState: DossierFormState | undefined, formData: FormData) => Promise<DossierFormState>;
  vehicules: VehiculeOption[];
  defaultVehiculeId?: string;
}

export function DossierForm({ action, vehicules, defaultVehiculeId }: DossierFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [vehiculeId, setVehiculeId] = useState<string>(defaultVehiculeId ?? vehicules[0]?.id ?? "");
  const [clientType, setClientType] = useState<TypeClient>(TypeClient.PARTICULIER);

  const showRaisonSociale = clientType === TypeClient.ETAT || clientType === TypeClient.ENTREPRISE;
  const showIce = clientType === TypeClient.ENTREPRISE;

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <input type="hidden" name="mode" value={mode} />

      <div className="space-y-2">
        <Label>Véhicule</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={mode === "existing" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("existing")}
          >
            Véhicule existant
          </Button>
          <Button
            type="button"
            variant={mode === "new" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("new")}
          >
            Nouveau client + véhicule
          </Button>
        </div>
      </div>

      {mode === "existing" ? (
        <div className="space-y-2">
          <Label htmlFor="vehiculeId">Sélectionner un véhicule</Label>
          <Select name="vehiculeId" value={vehiculeId} onValueChange={(value) => setVehiculeId(value as string)}>
            <SelectTrigger id="vehiculeId" className="w-full">
              <SelectValue>
                {(value: string) => {
                  const vehicule = vehicules.find((v) => v.id === value);
                  return vehicule
                    ? `${vehicule.immatriculation} — ${vehicule.marque} ${vehicule.modele} (${vehicule.client.nom})`
                    : "Sélectionner un véhicule";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {vehicules.map((vehicule) => (
                <SelectItem key={vehicule.id} value={vehicule.id}>
                  {vehicule.immatriculation} — {vehicule.marque} {vehicule.modele} ({vehicule.client.nom})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-4 rounded-lg border p-4">
          <div className="space-y-2">
            <Label htmlFor="clientNom">Nom du client</Label>
            <Input id="clientNom" name="clientNom" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientTelephone">Téléphone</Label>
            <Input id="clientTelephone" name="clientTelephone" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientType">Type de client</Label>
            <Select
              name="clientType"
              value={clientType}
              onValueChange={(value) => setClientType(value as TypeClient)}
            >
              <SelectTrigger id="clientType" className="w-full">
                <SelectValue>{(value: TypeClient) => TYPE_CLIENT_LABELS[value]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.values(TypeClient).map((value) => (
                  <SelectItem key={value} value={value}>
                    {TYPE_CLIENT_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {showRaisonSociale && (
            <div className="space-y-2">
              <Label htmlFor="clientRaisonSociale">Raison sociale</Label>
              <Input id="clientRaisonSociale" name="clientRaisonSociale" required />
            </div>
          )}
          {showIce && (
            <div className="space-y-2">
              <Label htmlFor="clientIce">ICE</Label>
              <Input id="clientIce" name="clientIce" required />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="vehiculeImmatriculation">Immatriculation</Label>
            <Input id="vehiculeImmatriculation" name="vehiculeImmatriculation" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehiculeMarque">Marque</Label>
              <Input id="vehiculeMarque" name="vehiculeMarque" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehiculeModele">Modèle</Label>
              <Input id="vehiculeModele" name="vehiculeModele" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehiculeAnnee">Année</Label>
              <Input id="vehiculeAnnee" name="vehiculeAnnee" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehiculeCouleur">Couleur</Label>
              <Input id="vehiculeCouleur" name="vehiculeCouleur" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehiculeKilometrage">Kilométrage</Label>
            <Input id="vehiculeKilometrage" name="vehiculeKilometrage" type="number" />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Type(s) d&apos;intervention</Label>
        <div className="space-y-2">
          {Object.values(TypeIntervention).map((type) => (
            <Label key={type} className="flex items-center gap-2 font-normal">
              <Checkbox name="typesIntervention" value={type} />
              {TYPE_INTERVENTION_LABELS[type]}
            </Label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="motifDeclare">Motif déclaré</Label>
        <Textarea id="motifDeclare" name="motifDeclare" rows={3} required />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Création..." : "Créer le dossier"}
      </Button>
    </form>
  );
}
