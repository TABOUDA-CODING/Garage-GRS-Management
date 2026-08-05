import Link from "next/link";
import type { Role } from "@prisma/client";
import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

interface NavLink {
  href: string;
  label: string;
}

const LINKS_BY_ROLE: Record<Role, NavLink[]> = {
  ADMIN: [
    { href: "/dashboard", label: "Tableau de bord" },
    { href: "/atelier", label: "Atelier" },
    { href: "/clients", label: "Clients" },
    { href: "/vehicules", label: "Véhicules" },
    { href: "/factures", label: "Factures" },
    { href: "/admin", label: "Administration" },
  ],
  RECEPTIONNISTE: [
    { href: "/dashboard", label: "Tableau de bord" },
    { href: "/atelier", label: "Atelier" },
    { href: "/clients", label: "Clients" },
    { href: "/vehicules", label: "Véhicules" },
    { href: "/factures", label: "Factures" },
  ],
  TECHNICIEN: [
    { href: "/dashboard", label: "Tableau de bord" },
    { href: "/atelier", label: "Atelier" },
  ],
  VIGILE: [],
};

interface AppSidebarProps {
  role: Role;
  userName: string;
}

export function AppSidebar({ role, userName }: AppSidebarProps) {
  const links = LINKS_BY_ROLE[role];

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-muted/20 p-4">
      <div className="mb-6 space-y-1">
        <p className="text-lg font-semibold">KM0</p>
        <p className="truncate text-sm text-muted-foreground">{userName}</p>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <form action={logoutAction}>
        <Button type="submit" variant="ghost" className="w-full justify-start">
          Se déconnecter
        </Button>
      </form>
    </aside>
  );
}
