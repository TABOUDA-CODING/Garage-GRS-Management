import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { getDossierById } from "@/lib/services/dossier.service";
import { renderFicheInterventionPdf } from "@/lib/services/fiche.service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireRole(["RECEPTIONNISTE", "ADMIN", "TECHNICIEN"]);

  const { id } = await params;
  const dossier = await getDossierById(id);

  if (!dossier) {
    return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
  }

  const pdf = await renderFicheInterventionPdf({
    numero: dossier.numero,
    motifDeclare: dossier.motifDeclare,
    typesIntervention: dossier.typesIntervention,
    dateEntree: dossier.dateEntree,
    vehicule: {
      immatriculation: dossier.vehicule.immatriculation,
      marque: dossier.vehicule.marque,
      modele: dossier.vehicule.modele,
      annee: dossier.vehicule.annee,
      couleur: dossier.vehicule.couleur,
    },
    client: {
      nom: dossier.vehicule.client.nom,
      telephone: dossier.vehicule.client.telephone,
    },
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="fiche-${dossier.numero}.pdf"`,
    },
  });
}
