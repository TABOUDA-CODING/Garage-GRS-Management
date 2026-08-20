"use client";

import { useActionState } from "react";
import { Role, type User } from "@prisma/client";
import type { UserFormState } from "@/app/(app)/admin/utilisateurs/actions";
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
import { ROLE_LABELS } from "@/lib/utils/labels";

const initialState: UserFormState = {};

interface UserFormProps {
  action: (prevState: UserFormState | undefined, formData: FormData) => Promise<UserFormState>;
  initialData?: User;
  submitLabel: string;
}

export function UserForm({ action, initialData, submitLabel }: UserFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nom">Nom</Label>
        <Input id="nom" name="nom" defaultValue={initialData?.nom} required autoFocus />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" defaultValue={initialData?.email} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Rôle</Label>
        <Select name="role" defaultValue={initialData?.role ?? Role.RECEPTIONNISTE}>
          <SelectTrigger id="role" className="w-full">
            <SelectValue>{(value: Role) => ROLE_LABELS[value]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.values(Role).map((value) => (
              <SelectItem key={value} value={value}>
                {ROLE_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          {initialData ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required={!initialData}
          minLength={8}
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Enregistrement..." : submitLabel}
      </Button>
    </form>
  );
}
