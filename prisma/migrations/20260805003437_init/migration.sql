-- CreateEnum
CREATE TYPE "Role" AS ENUM ('RECEPTIONNISTE', 'TECHNICIEN', 'ADMIN', 'VIGILE');

-- CreateEnum
CREATE TYPE "TypeIntervention" AS ENUM ('DIAGNOSTIC', 'REPARATION', 'ENTRETIEN', 'TOLERIE');

-- CreateEnum
CREATE TYPE "StatutDossier" AS ENUM ('ENTRE', 'EN_DIAGNOSTIC', 'DEVIS_ENVOYE', 'DEVIS_ACCEPTE', 'DEVIS_REFUSE', 'EN_COURS', 'PRET', 'SORTI', 'ANNULE');

-- CreateEnum
CREATE TYPE "StatutPaiement" AS ENUM ('NON_SOLDE', 'PARTIEL', 'SOLDE');

-- CreateEnum
CREATE TYPE "ModePaiement" AS ENUM ('ESPECES', 'CHEQUE', 'VIREMENT', 'CARTE');

-- CreateEnum
CREATE TYPE "StatutBS" AS ENUM ('VALIDE', 'UTILISE', 'ANNULE');

-- CreateEnum
CREATE TYPE "TypeClient" AS ENUM ('PARTICULIER', 'ETAT', 'ENTREPRISE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "cin" TEXT,
    "type" "TypeClient" NOT NULL DEFAULT 'PARTICULIER',
    "raisonSociale" TEXT,
    "ice" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicule" (
    "id" TEXT NOT NULL,
    "immatriculation" TEXT NOT NULL,
    "marque" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "annee" INTEGER,
    "couleur" TEXT,
    "kilometrage" INTEGER,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vehicule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dossier" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "vehiculeId" TEXT NOT NULL,
    "typesIntervention" "TypeIntervention"[],
    "statut" "StatutDossier" NOT NULL DEFAULT 'ENTRE',
    "motifDeclare" TEXT NOT NULL,
    "descriptionTravaux" TEXT,
    "observationsTechnicien" TEXT,
    "dateEntree" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datePrevueSortie" TIMESTAMP(3),
    "dateSortieReelle" TIMESTAMP(3),
    "technicienId" TEXT,
    "montantTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "statutPaiement" "StatutPaiement" NOT NULL DEFAULT 'NON_SOLDE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dossier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonDeSortie" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "qrToken" TEXT NOT NULL,
    "statut" "StatutBS" NOT NULL DEFAULT 'VALIDE',
    "dateGeneration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateUtilisation" TIMESTAMP(3),
    "derogationPaiement" BOOLEAN NOT NULL DEFAULT false,
    "derogationMotif" TEXT,
    "derogationParId" TEXT,

    CONSTRAINT "BonDeSortie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facture" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "montantHT" DECIMAL(10,2) NOT NULL,
    "tauxTVA" DECIMAL(5,2) NOT NULL DEFAULT 20,
    "montantTTC" DECIMAL(10,2) NOT NULL,
    "statutPaiement" "StatutPaiement" NOT NULL DEFAULT 'NON_SOLDE',
    "modePaiement" "ModePaiement",
    "datePaiement" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Facture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PieceUtilisee" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "nomPiece" TEXT NOT NULL,
    "reference" TEXT,
    "quantite" INTEGER NOT NULL DEFAULT 1,
    "prixUnitaire" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "PieceUtilisee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoriqueStatut" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "statutAvant" "StatutDossier",
    "statutApres" "StatutDossier" NOT NULL,
    "userId" TEXT NOT NULL,
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoriqueStatut_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Client_telephone_idx" ON "Client"("telephone");

-- CreateIndex
CREATE INDEX "Client_nom_idx" ON "Client"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicule_immatriculation_key" ON "Vehicule"("immatriculation");

-- CreateIndex
CREATE INDEX "Vehicule_immatriculation_idx" ON "Vehicule"("immatriculation");

-- CreateIndex
CREATE UNIQUE INDEX "Dossier_numero_key" ON "Dossier"("numero");

-- CreateIndex
CREATE INDEX "Dossier_statut_idx" ON "Dossier"("statut");

-- CreateIndex
CREATE INDEX "Dossier_numero_idx" ON "Dossier"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "BonDeSortie_numero_key" ON "BonDeSortie"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "BonDeSortie_qrToken_key" ON "BonDeSortie"("qrToken");

-- CreateIndex
CREATE INDEX "BonDeSortie_qrToken_idx" ON "BonDeSortie"("qrToken");

-- CreateIndex
CREATE UNIQUE INDEX "Facture_numero_key" ON "Facture"("numero");

-- CreateIndex
CREATE INDEX "HistoriqueStatut_dossierId_idx" ON "HistoriqueStatut"("dossierId");

-- AddForeignKey
ALTER TABLE "Vehicule" ADD CONSTRAINT "Vehicule_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dossier" ADD CONSTRAINT "Dossier_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dossier" ADD CONSTRAINT "Dossier_technicienId_fkey" FOREIGN KEY ("technicienId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonDeSortie" ADD CONSTRAINT "BonDeSortie_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonDeSortie" ADD CONSTRAINT "BonDeSortie_derogationParId_fkey" FOREIGN KEY ("derogationParId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facture" ADD CONSTRAINT "Facture_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PieceUtilisee" ADD CONSTRAINT "PieceUtilisee_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriqueStatut" ADD CONSTRAINT "HistoriqueStatut_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriqueStatut" ADD CONSTRAINT "HistoriqueStatut_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
