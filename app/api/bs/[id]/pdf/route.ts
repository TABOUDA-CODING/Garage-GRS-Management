import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { getBonDeSortieById } from "@/lib/services/bs.service";
import { renderBonDeSortiePdf } from "@/lib/services/bs-pdf.service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN"]);

  const { id } = await params;
  const bs = await getBonDeSortieById(id);

  if (!bs) {
    return NextResponse.json({ error: "Bon de sortie introuvable" }, { status: 404 });
  }

  const pdf = await renderBonDeSortiePdf({
    numero: bs.numero,
    qrToken: bs.qrToken,
    dateGeneration: bs.dateGeneration,
    derogationPaiement: bs.derogationPaiement,
    derogationMotif: bs.derogationMotif,
    typesIntervention: bs.dossier.typesIntervention,
    vehicule: {
      immatriculation: bs.dossier.vehicule.immatriculation,
      marque: bs.dossier.vehicule.marque,
      modele: bs.dossier.vehicule.modele,
    },
    client: {
      nom: bs.dossier.vehicule.client.nom,
    },
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="bs-${bs.numero}.pdf"`,
    },
  });
}
