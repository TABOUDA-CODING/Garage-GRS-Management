"use client";

import { Button } from "@/components/ui/button";

interface DeleteClientButtonProps {
  action: () => Promise<void>;
}

export function DeleteClientButton({ action }: DeleteClientButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!confirm("Supprimer définitivement ce client ?")) {
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
