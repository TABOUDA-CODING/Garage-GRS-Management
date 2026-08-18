import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { verifierEtConsommerBs } from "@/lib/services/verification.service";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "VIGILE") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code : "";
  if (!code.trim()) {
    return NextResponse.json({ error: "Code requis" }, { status: 400 });
  }

  const result = await verifierEtConsommerBs(code, session.userId);
  return NextResponse.json(result);
}
