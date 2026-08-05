import { PrismaClient, Role, TypeClient, TypeIntervention, StatutDossier } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const [receptionniste, technicien, admin, vigile] = await Promise.all([
    prisma.user.upsert({
      where: { email: "reception@km0.ma" },
      update: {},
      create: {
        nom: "Sanae Berrada",
        email: "reception@km0.ma",
        passwordHash,
        role: Role.RECEPTIONNISTE,
      },
    }),
    prisma.user.upsert({
      where: { email: "technicien@km0.ma" },
      update: {},
      create: {
        nom: "Hicham Ouazzani",
        email: "technicien@km0.ma",
        passwordHash,
        role: Role.TECHNICIEN,
      },
    }),
    prisma.user.upsert({
      where: { email: "admin@km0.ma" },
      update: {},
      create: {
        nom: "Marouane Essaadouni",
        email: "admin@km0.ma",
        passwordHash,
        role: Role.ADMIN,
      },
    }),
    prisma.user.upsert({
      where: { email: "vigile@km0.ma" },
      update: {},
      create: {
        nom: "Rachid Amrani",
        email: "vigile@km0.ma",
        passwordHash,
        role: Role.VIGILE,
      },
    }),
  ]);

  const clientAhmed = await prisma.client.create({
    data: {
      nom: "Ahmed Bennani",
      telephone: "0661234567",
      type: TypeClient.PARTICULIER,
    },
  });

  const clientFatima = await prisma.client.create({
    data: {
      nom: "Fatima Zahra Idrissi",
      telephone: "0662345678",
      email: "fz.idrissi@example.ma",
      type: TypeClient.PARTICULIER,
    },
  });

  const clientEtat = await prisma.client.create({
    data: {
      nom: "Ministère de l'Intérieur",
      telephone: "0537000000",
      type: TypeClient.ETAT,
      raisonSociale: "Ministère de l'Intérieur — Parc Auto",
    },
  });

  const clientYoussef = await prisma.client.create({
    data: {
      nom: "Youssef Alaoui",
      telephone: "0663456789",
      cin: "BE123456",
      type: TypeClient.PARTICULIER,
    },
  });

  const clientEntreprise = await prisma.client.create({
    data: {
      nom: "Atlas Logistique",
      telephone: "0522334455",
      type: TypeClient.ENTREPRISE,
      raisonSociale: "Atlas Logistique SARL",
      ice: "001234567000045",
    },
  });

  const [
    vehiculeLogan,
    vehiculeClio,
    vehicule208,
    vehiculeDuster1,
    vehiculeDuster2,
    vehiculeGolf,
    vehiculeSprinter,
    vehiculeKangoo,
  ] = await Promise.all([
    prisma.vehicule.create({
      data: {
        immatriculation: "12345-A-1",
        marque: "Dacia",
        modele: "Logan",
        annee: 2019,
        couleur: "Blanc",
        kilometrage: 87000,
        clientId: clientAhmed.id,
      },
    }),
    prisma.vehicule.create({
      data: {
        immatriculation: "23456-A-1",
        marque: "Renault",
        modele: "Clio",
        annee: 2021,
        couleur: "Gris",
        kilometrage: 34000,
        clientId: clientAhmed.id,
      },
    }),
    prisma.vehicule.create({
      data: {
        immatriculation: "34567-B-6",
        marque: "Peugeot",
        modele: "208",
        annee: 2020,
        couleur: "Rouge",
        kilometrage: 52000,
        clientId: clientFatima.id,
      },
    }),
    prisma.vehicule.create({
      data: {
        immatriculation: "45678-C-12",
        marque: "Dacia",
        modele: "Duster",
        annee: 2022,
        couleur: "Bleu",
        kilometrage: 21000,
        clientId: clientEtat.id,
      },
    }),
    prisma.vehicule.create({
      data: {
        immatriculation: "45679-C-12",
        marque: "Dacia",
        modele: "Duster",
        annee: 2022,
        couleur: "Bleu",
        kilometrage: 19500,
        clientId: clientEtat.id,
      },
    }),
    prisma.vehicule.create({
      data: {
        immatriculation: "56789-D-3",
        marque: "Volkswagen",
        modele: "Golf",
        annee: 2018,
        couleur: "Noir",
        kilometrage: 102000,
        clientId: clientYoussef.id,
      },
    }),
    prisma.vehicule.create({
      data: {
        immatriculation: "67890-E-8",
        marque: "Mercedes",
        modele: "Sprinter",
        annee: 2017,
        couleur: "Blanc",
        kilometrage: 145000,
        clientId: clientEntreprise.id,
      },
    }),
    prisma.vehicule.create({
      data: {
        immatriculation: "78901-E-8",
        marque: "Renault",
        modele: "Kangoo",
        annee: 2020,
        couleur: "Blanc",
        kilometrage: 61000,
        clientId: clientEntreprise.id,
      },
    }),
  ]);

  const dossierEnCours = await prisma.dossier.create({
    data: {
      numero: "DOS-2026-0001",
      vehiculeId: vehiculeLogan.id,
      typesIntervention: [TypeIntervention.REPARATION],
      statut: StatutDossier.EN_COURS,
      motifDeclare: "Bruit anormal au niveau du moteur au démarrage",
      technicienId: technicien.id,
      montantTotal: 1200,
      historique: {
        create: [
          { statutAvant: null, statutApres: StatutDossier.ENTRE, userId: receptionniste.id },
          { statutAvant: StatutDossier.ENTRE, statutApres: StatutDossier.EN_DIAGNOSTIC, userId: technicien.id },
          { statutAvant: StatutDossier.EN_DIAGNOSTIC, statutApres: StatutDossier.EN_COURS, userId: technicien.id },
        ],
      },
    },
  });

  const dossierPret = await prisma.dossier.create({
    data: {
      numero: "DOS-2026-0002",
      vehiculeId: vehiculeDuster1.id,
      typesIntervention: [TypeIntervention.ENTRETIEN, TypeIntervention.DIAGNOSTIC],
      statut: StatutDossier.PRET,
      motifDeclare: "Révision périodique 20 000 km",
      technicienId: technicien.id,
      montantTotal: 850,
      statutPaiement: "SOLDE",
      historique: {
        create: [
          { statutAvant: null, statutApres: StatutDossier.ENTRE, userId: receptionniste.id },
          { statutAvant: StatutDossier.ENTRE, statutApres: StatutDossier.EN_DIAGNOSTIC, userId: technicien.id },
          { statutAvant: StatutDossier.EN_DIAGNOSTIC, statutApres: StatutDossier.EN_COURS, userId: technicien.id },
          { statutAvant: StatutDossier.EN_COURS, statutApres: StatutDossier.PRET, userId: technicien.id },
        ],
      },
    },
  });

  const dossierEntre = await prisma.dossier.create({
    data: {
      numero: "DOS-2026-0003",
      vehiculeId: vehiculeSprinter.id,
      typesIntervention: [TypeIntervention.TOLERIE],
      statut: StatutDossier.ENTRE,
      motifDeclare: "Choc arrière, pare-chocs et hayon endommagés",
      historique: {
        create: [{ statutAvant: null, statutApres: StatutDossier.ENTRE, userId: receptionniste.id }],
      },
    },
  });

  console.log("Seed terminé :");
  console.log(`  Utilisateurs : ${[receptionniste, technicien, admin, vigile].length}`);
  console.log(
    `  Clients : ${[clientAhmed, clientFatima, clientEtat, clientYoussef, clientEntreprise].length}`,
  );
  console.log(
    `  Véhicules : ${
      [
        vehiculeLogan,
        vehiculeClio,
        vehicule208,
        vehiculeDuster1,
        vehiculeDuster2,
        vehiculeGolf,
        vehiculeSprinter,
        vehiculeKangoo,
      ].length
    }`,
  );
  console.log(`  Dossiers : ${[dossierEnCours, dossierPret, dossierEntre].length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
