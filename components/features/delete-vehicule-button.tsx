"use client";

import { Button } from "@/components/ui/button";

interface DeleteVehiculeButtonProps {
  action: () => Promise<void>;
}

export function DeleteVehiculeButton({ action }: DeleteVehiculeButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm("Supprimer définitivement ce véhicule ?")) {
          event.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="destructive">
        Supprimer
      </Button>
    </form>
  );
}
