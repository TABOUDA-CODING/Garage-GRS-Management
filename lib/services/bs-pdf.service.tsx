import "server-only";
import QRCode from "qrcode";
import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { TypeIntervention } from "@prisma/client";
import { TYPE_INTERVENTION_LABELS } from "@/lib/utils/labels";

export interface BonDeSortiePdfData {
  numero: string;
  qrToken: string;
  dateGeneration: Date;
  derogationPaiement: boolean;
  derogationMotif: string | null;
  typesIntervention: TypeIntervention[];
  vehicule: {
    immatriculation: string;
    marque: string;
    modele: string;
  };
  client: {
    nom: string;
  };
}

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 11, color: "#555555", marginBottom: 18 },
  immat: { fontSize: 34, fontWeight: 700, marginBottom: 18 },
  row: { flexDirection: "row", gap: 24, marginBottom: 14 },
  section: { marginBottom: 14 },
  label: { fontSize: 9, color: "#666666", marginBottom: 2, textTransform: "uppercase" },
  value: { fontSize: 13 },
  badge: { fontSize: 11, marginBottom: 3 },
  derogation: {
    fontSize: 12,
    fontWeight: 700,
    color: "#b45309",
    marginBottom: 12,
  },
  qr: { width: 130, height: 130, alignSelf: "center", marginTop: 8 },
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

function BonDeSortieDocument({ bs, qrDataUrl }: { bs: BonDeSortiePdfData; qrDataUrl: string }) {
  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <Text style={styles.title}>Bon de sortie</Text>
        <Text style={styles.subtitle}>
          {bs.numero} — généré le {format(bs.dateGeneration, "dd/MM/yyyy HH:mm", { locale: fr })}
        </Text>

        <Text style={styles.immat}>{bs.vehicule.immatriculation}</Text>

        <View style={styles.row}>
          <View style={styles.section}>
            <Text style={styles.label}>Véhicule</Text>
            <Text style={styles.value}>
              {bs.vehicule.marque} {bs.vehicule.modele}
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Client</Text>
            <Text style={styles.value}>{bs.client.nom}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Type(s) d&apos;intervention</Text>
          {bs.typesIntervention.map((type) => (
            <Text key={type} style={styles.badge}>
              • {TYPE_INTERVENTION_LABELS[type]}
            </Text>
          ))}
        </View>

        {bs.derogationPaiement && (
          <Text style={styles.derogation}>
            DÉROGATION PAIEMENT ACCORDÉE{bs.derogationMotif ? ` — ${bs.derogationMotif}` : ""}
          </Text>
        )}

        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image, not an HTML img */}
        <Image src={qrDataUrl} style={styles.qr} />

        <Text style={styles.footer}>
          Document à présenter à la sortie du véhicule — usage unique, invalidé au premier scan
        </Text>
      </Page>
    </Document>
  );
}

export async function renderBonDeSortiePdf(bs: BonDeSortiePdfData): Promise<Buffer> {
  const qrDataUrl = await QRCode.toDataURL(bs.qrToken, { margin: 1, width: 400 });
  return renderToBuffer(<BonDeSortieDocument bs={bs} qrDataUrl={qrDataUrl} />);
}
