import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { AppSidebar } from "@/components/features/app-sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.userId } });

  return (
    <div className="flex min-h-screen">
      <AppSidebar role={user.role} userName={user.nom} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
