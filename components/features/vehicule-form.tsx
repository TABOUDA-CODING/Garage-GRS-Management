"use client";

import { useActionState, useState } from "react";
import type { Vehicule } from "@prisma/client";
import type { VehiculeFormState } from "@/app/(app)/vehicules/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState: VehiculeFormState = {};

interface ClientOption {
  id: string;
  nom: string;
  telephone: string;
}

interface VehiculeFormProps {
  action: (prevState: VehiculeFormState | undefined, formData: FormData) => Promise<VehiculeFormState>;
  clients: ClientOption[];
  initialData?: Vehicule;
  defaultClientId?: string;
  submitLabel: string;
}

export function VehiculeForm({
  action,
  clients,
  initialData,
  defaultClientId,
  submitLabel,
}: VehiculeFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [clientId, setClientId] = useState<string>(
    initialData?.clientId ?? defaultClientId ?? clients[0]?.id ?? "",
  );

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label htmlFor="immatriculation">Immatriculation</Label>
        <Input
          id="immatriculation"
          name="immatriculation"
          defaultValue={initialData?.immatriculation}
          required
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientId">Client</Label>
        <Select name="clientId" value={clientId} onValueChange={(value) => setClientId(value as string)}>
          <SelectTrigger id="clientId" className="w-full">
            <SelectValue>
              {(value: string) =>
                clients.find((client) => client.id === value)?.nom ?? "Sélectionner un client"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.nom} — {client.telephone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="marque">Marque</Label>
          <Input id="marque" name="marque" defaultValue={initialData?.marque} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="modele">Modèle</Label>
          <Input id="modele" name="modele" defaultValue={initialData?.modele} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="annee">Année</Label>
          <Input id="annee" name="annee" type="number" defaultValue={initialData?.annee ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="couleur">Couleur</Label>
          <Input id="couleur" name="couleur" defaultValue={initialData?.couleur ?? ""} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="kilometrage">Kilométrage</Label>
        <Input
          id="kilometrage"
          name="kilometrage"
          type="number"
          defaultValue={initialData?.kilometrage ?? ""}
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Enregistrement..." : submitLabel}
      </Button>
    </form>
  );
}
