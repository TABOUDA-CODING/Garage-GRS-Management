"use server";

import { redirect } from "next/navigation";
import { logout } from "@/lib/services/auth.service";

export async function logoutAction(): Promise<void> {
  await logout();
  redirect("/login");
}
