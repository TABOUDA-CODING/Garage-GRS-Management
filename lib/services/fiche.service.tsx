import "server-only";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { TypeIntervention } from "@prisma/client";
import { TYPE_INTERVENTION_LABELS } from "@/lib/utils/labels";

export interface FicheDossierData {
  numero: string;
  motifDeclare: string;
  typesIntervention: TypeIntervention[];
  dateEntree: Date;
  vehicule: {
    immatriculation: string;
    marque: string;
    modele: string;
    annee: number | null;
    couleur: string | null;
  };
  client: {
    nom: string;
    telephone: string;
  };
}

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 11, color: "#555555", marginBottom: 20 },
  immat: { fontSize: 30, fontWeight: 700, marginBottom: 18 },
  row: { flexDirection: "row", gap: 24, marginBottom: 14 },
  section: { marginBottom: 14 },
  label: { fontSize: 9, color: "#666666", marginBottom: 2, textTransform: "uppercase" },
  value: { fontSize: 13 },
  badge: { fontSize: 11, marginBottom: 3 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    fontSize: 8,
    color: "#999999",
    textAlign: "center",
  },
});

function FicheDocument({ dossier }: { dossier: FicheDossierData }) {
  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <Text style={styles.title}>Fiche d&apos;intervention</Text>
        <Text style={styles.subtitle}>
          {dossier.numero} — {format(dossier.dateEntree, "dd/MM/yyyy", { locale: fr })}
        </Text>

        <Text style={styles.immat}>{dossier.vehicule.immatriculation}</Text>

        <View style={styles.row}>
          <View style={styles.section}>
            <Text style={styles.label}>Véhicule</Text>
            <Text style={styles.value}>
              {dossier.vehicule.marque} {dossier.vehicule.modele}
              {dossier.vehicule.annee ? ` (${dossier.vehicule.annee})` : ""}
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Client</Text>
            <Text style={styles.value}>{dossier.client.nom}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Type(s) d&apos;intervention</Text>
          {dossier.typesIntervention.map((type) => (
            <Text key={type} style={styles.badge}>
              • {TYPE_INTERVENTION_LABELS[type]}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Motif déclaré</Text>
          <Text style={styles.value}>{dossier.motifDeclare}</Text>
        </View>

        <Text style={styles.footer}>
          Document informatif — à placer dans le véhicule — aucune valeur d&apos;autorisation de sortie
        </Text>
      </Page>
    </Document>
  );
}

export async function renderFicheInterventionPdf(dossier: FicheDossierData): Promise<Buffer> {
  return renderToBuffer(<FicheDocument dossier={dossier} />);
}
