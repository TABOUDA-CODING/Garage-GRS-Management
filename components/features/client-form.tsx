"use client";

import { useActionState, useState } from "react";
import { TypeClient, type Client } from "@prisma/client";
import type { ClientFormState } from "@/app/(app)/clients/actions";
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

const TYPE_LABELS: Record<TypeClient, string> = {
  PARTICULIER: "Particulier",
  ETAT: "État",
  ENTREPRISE: "Entreprise",
};

const initialState: ClientFormState = {};

interface ClientFormProps {
  action: (prevState: ClientFormState | undefined, formData: FormData) => Promise<ClientFormState>;
  initialData?: Client;
  submitLabel: string;
}

export function ClientForm({ action, initialData, submitLabel }: ClientFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [type, setType] = useState<TypeClient>(initialData?.type ?? TypeClient.PARTICULIER);

  const showRaisonSociale = type === TypeClient.ETAT || type === TypeClient.ENTREPRISE;
  const showIce = type === TypeClient.ENTREPRISE;
  const showCin = type === TypeClient.PARTICULIER;

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nom">Nom</Label>
        <Input id="nom" name="nom" defaultValue={initialData?.nom} required autoFocus />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telephone">Téléphone</Label>
        <Input id="telephone" name="telephone" defaultValue={initialData?.telephone} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" defaultValue={initialData?.email ?? ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type de client</Label>
        <Select
          name="type"
          value={type}
          onValueChange={(value) => setType(value as TypeClient)}
        >
          <SelectTrigger id="type" className="w-full">
            <SelectValue>{(value: TypeClient) => TYPE_LABELS[value]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.values(TypeClient).map((value) => (
              <SelectItem key={value} value={value}>
                {TYPE_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showCin && (
        <div className="space-y-2">
          <Label htmlFor="cin">CIN</Label>
          <Input id="cin" name="cin" defaultValue={initialData?.cin ?? ""} />
        </div>
      )}

      {showRaisonSociale && (
        <div className="space-y-2">
          <Label htmlFor="raisonSociale">Raison sociale</Label>
          <Input
            id="raisonSociale"
            name="raisonSociale"
            defaultValue={initialData?.raisonSociale ?? ""}
            required
          />
        </div>
      )}

      {showIce && (
        <div className="space-y-2">
          <Label htmlFor="ice">ICE</Label>
          <Input id="ice" name="ice" defaultValue={initialData?.ice ?? ""} required />
        </div>
      )}

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Enregistrement..." : submitLabel}
      </Button>
    </form>
  );
}
