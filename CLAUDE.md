# KM0 — Système de gestion de garage automobile

> Ce fichier est lu automatiquement par Claude Code à chaque session.
> Il contient tout le contexte du projet. Ne pas le supprimer.

---

## 1. CONTEXTE MÉTIER

**KM0** est une application web de gestion pour un garage automobile marocain
travaillant pour des **particuliers** et des **institutions étatiques**.

Types d'interventions traitées :
- **Diagnostic** — identification d'une panne
- **Réparation** — mécanique, moteur, transmission
- **Entretien** — vidange, filtres, révision périodique
- **Tôlerie / Carrosserie** — véhicules accidentés, redressage, peinture

### Problèmes actuels à résoudre

| Problème | Conséquence |
|---|---|
| Suivi papier / Excel / mémoire | Aucune traçabilité, perte d'information |
| Pas de contrôle formalisé à la sortie | Véhicules sortis sans paiement ou sans autorisation |
| Historique client dispersé | Impossible de savoir ce qui a été fait sur un véhicule |
| Aucune visibilité gérant | Pas de vue sur la charge, le CA, les délais |

### Objectifs

1. Centraliser la gestion des dossiers véhicules
2. Sécuriser la sortie via un Bon de Sortie (BS) vérifiable
3. Donner au gérant une vision business exploitable

---

## 2. STACK TECHNIQUE (à respecter strictement)

```
Framework    : Next.js 15 (App Router) + TypeScript strict mode
Base données : PostgreSQL 16
ORM          : Prisma 6
UI           : Tailwind CSS + shadcn/ui
Auth         : session-based custom (cookies httpOnly + bcrypt)
PDF          : @react-pdf/renderer
QR Code      : qrcode (génération) + html5-qrcode (scan navigateur)
Validation   : Zod
Dates        : date-fns (locale fr)
Tests        : Vitest
```

**Contraintes :**
- Aucune dépendance cloud tierce (pas de Clerk, Auth0, Supabase Auth) — l'app doit rester autonome pour une future version LAN
- Server Actions privilégiées sur les API Routes, sauf l'endpoint de vérification BS (appelable par scanner)
- Aucun `any` en TypeScript, `tsc --noEmit` doit passer proprement

---

## 3. SCHÉMA PRISMA

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  RECEPTIONNISTE
  TECHNICIEN
  ADMIN
  VIGILE
}

enum TypeIntervention {
  DIAGNOSTIC
  REPARATION
  ENTRETIEN
  TOLERIE
}

enum StatutDossier {
  ENTRE
  EN_DIAGNOSTIC
  DEVIS_ENVOYE
  DEVIS_ACCEPTE
  DEVIS_REFUSE
  EN_COURS
  PRET
  SORTI
  ANNULE
}

enum StatutPaiement {
  NON_SOLDE
  PARTIEL
  SOLDE
}

enum ModePaiement {
  ESPECES
  CHEQUE
  VIREMENT
  CARTE
}

enum StatutBS {
  VALIDE
  UTILISE
  ANNULE
}

enum TypeClient {
  PARTICULIER
  ETAT
  ENTREPRISE
}

model User {
  id           String   @id @default(cuid())
  nom          String
  email        String   @unique
  passwordHash String
  role         Role
  actif        Boolean  @default(true)
  createdAt    DateTime @default(now())

  dossiersAssignes Dossier[]          @relation("TechnicienDossier")
  derogations      BonDeSortie[]      @relation("DerogationPar")
  historique       HistoriqueStatut[]
}

model Client {
  id            String     @id @default(cuid())
  nom           String
  telephone     String
  email         String?
  cin           String?
  type          TypeClient @default(PARTICULIER)
  raisonSociale String?
  ice           String?
  createdAt     DateTime   @default(now())

  vehicules Vehicule[]

  @@index([telephone])
  @@index([nom])
}

model Vehicule {
  id              String   @id @default(cuid())
  immatriculation String   @unique
  marque          String
  modele          String
  annee           Int?
  couleur         String?
  kilometrage     Int?
  clientId        String
  client          Client   @relation(fields: [clientId], references: [id])
  createdAt       DateTime @default(now())

  dossiers Dossier[]

  @@index([immatriculation])
}

model Dossier {
  id                     String             @id @default(cuid())
  numero                 String             @unique
  vehiculeId             String
  vehicule               Vehicule           @relation(fields: [vehiculeId], references: [id])
  typesIntervention      TypeIntervention[]
  statut                 StatutDossier      @default(ENTRE)
  motifDeclare           String
  descriptionTravaux     String?
  observationsTechnicien String?

  dateEntree       DateTime  @default(now())
  datePrevueSortie DateTime?
  dateSortieReelle DateTime?

  technicienId String?
  technicien   User?   @relation("TechnicienDossier", fields: [technicienId], references: [id])

  montantTotal   Decimal        @default(0) @db.Decimal(10, 2)
  statutPaiement StatutPaiement @default(NON_SOLDE)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  bonsDeSortie    BonDeSortie[]
  factures        Facture[]
  piecesUtilisees PieceUtilisee[]
  historique      HistoriqueStatut[]

  @@index([statut])
  @@index([numero])
}

model BonDeSortie {
  id        String   @id @default(cuid())
  numero    String   @unique
  dossierId String
  dossier   Dossier  @relation(fields: [dossierId], references: [id])
  qrToken   String   @unique
  statut    StatutBS @default(VALIDE)

  dateGeneration  DateTime  @default(now())
  dateUtilisation DateTime?

  derogationPaiement Boolean @default(false)
  derogationMotif    String?
  derogationParId    String?
  derogationPar      User?   @relation("DerogationPar", fields: [derogationParId], references: [id])

  @@index([qrToken])
}

model Facture {
  id             String         @id @default(cuid())
  numero         String         @unique
  dossierId      String
  dossier        Dossier        @relation(fields: [dossierId], references: [id])
  montantHT      Decimal        @db.Decimal(10, 2)
  tauxTVA        Decimal        @default(20) @db.Decimal(5, 2)
  montantTTC     Decimal        @db.Decimal(10, 2)
  statutPaiement StatutPaiement @default(NON_SOLDE)
  modePaiement   ModePaiement?
  datePaiement   DateTime?
  createdAt      DateTime       @default(now())
}

model PieceUtilisee {
  id           String  @id @default(cuid())
  dossierId    String
  dossier      Dossier @relation(fields: [dossierId], references: [id])
  nomPiece     String
  reference    String?
  quantite     Int     @default(1)
  prixUnitaire Decimal @db.Decimal(10, 2)
}

model HistoriqueStatut {
  id          String         @id @default(cuid())
  dossierId   String
  dossier     Dossier        @relation(fields: [dossierId], references: [id])
  statutAvant StatutDossier?
  statutApres StatutDossier
  userId      String
  user        User           @relation(fields: [userId], references: [id])
  commentaire String?
  createdAt   DateTime       @default(now())

  @@index([dossierId])
}
```

---

## 4. RÔLES ET PERMISSIONS

| Rôle | Permissions |
|---|---|
| **RECEPTIONNISTE** | Créer/éditer clients, véhicules, dossiers. Voir tous les dossiers. Encaisser paiements. **Ne peut PAS générer de BS.** |
| **TECHNICIEN** | Voir dossiers assignés. Changer statut (EN_DIAGNOSTIC → EN_COURS → PRET). Ajouter observations et pièces. |
| **ADMIN** | Accès total. Génération BS. Dérogations. Statistiques. Gestion utilisateurs. Régénération BS perdu. |
| **VIGILE** | Accès **exclusif** à `/verification`. Redirection forcée depuis toute autre route. Aucune donnée financière visible. |

Middleware Next.js pour le routing **et** vérification dans chaque Server Action (défense en profondeur).

---

## 5. RÈGLES MÉTIER CRITIQUES (non négociables)

1. **Statut SORTI automatique uniquement** — posé QUE via le scan du BS sur `/verification`. Aucune interface ne permet de le poser manuellement.

2. **Génération BS conditionnée** — bouton visible seulement si `statut = PRET`. Si `statutPaiement != SOLDE`, génération bloquée sauf dérogation Admin (motif obligatoire, min. 10 caractères, tracé).

3. **Usage unique du BS** — au scan, passage en `UTILISE` de manière atomique (transaction Prisma). Un QR ne peut jamais autoriser deux sorties, même en double scan simultané.

4. **Régénération BS** — si perdu, seul un Admin peut en générer un nouveau ; l'ancien passe en `ANNULE` dans la même transaction.

5. **Multi-intervention** — un dossier peut cumuler plusieurs `typesIntervention` mais génère un seul BS.

6. **Audit trail obligatoire** — tout changement de statut écrit dans `HistoriqueStatut` avec l'utilisateur responsable. Implémenté au niveau service, non contournable.

7. **Numérotation séquentielle** — `DOS-2026-XXXX`, `BS-2026-XXXX`, `FACT-2026-XXXX` générés séquentiellement par année, sans trou, via transaction (éviter les collisions).

---

## 6. ÉCRAN `/verification` — spécification

Écran le plus critique. Utilisé par un agent de sécurité non technique, sur tablette, dans une guérite.

**Comportement :**
1. Champ auto-focus + scanner QR caméra OU saisie manuelle du numéro
2. Vérification serveur dans l'ordre : BS existe ? → statut `VALIDE` ? → dossier `PRET` ? → paiement soldé OU dérogation ?
3. Réponse plein écran, lisible à distance :

| État | Affichage |
|---|---|
| ✅ **VERT** | "SORTIE AUTORISÉE" + immatriculation très gros + marque/modèle + client |
| 🟠 **ORANGE** | "SORTIE AUTORISÉE — DÉROGATION" + "Non payé — autorisé par [Admin]" |
| ❌ **ROUGE** | "SORTIE REFUSÉE" + raison : "Facture non réglée" / "Bon déjà utilisé le [date]" / "Bon inconnu" / "Véhicule non prêt" |

**UX :** typographie très large (lisible à 2m), zéro jargon technique, retour auto au scan après 8 secondes.

---

## 7. CONVENTIONS DE CODE

```
app/
  (auth)/login/
  (app)/dashboard/
  (app)/atelier/              → vue Kanban
  (app)/dossiers/[id]/
  (app)/clients/
  (app)/vehicules/
  (app)/factures/
  (app)/admin/
  verification/               → hors layout app, accès vigile
  api/verification/route.ts   → endpoint scan (POST)
lib/
  auth/                       → session, hashing, guards
  services/                   → logique métier (dossier.service.ts, bs.service.ts)
  validations/                → schémas Zod
  utils/
components/
  ui/                         → shadcn
  features/                   → composants métier
prisma/
```

**Règles :**
- Logique métier dans `lib/services/`, jamais dans les composants React
- Toute Server Action valide ses entrées avec Zod avant traitement
- Toute Server Action vérifie le rôle en première ligne
- Nommage français pour le domaine (dossier, vehicule, bonDeSortie), anglais pour la technique (getUser, formatDate)
- Messages utilisateur en français, logs techniques en anglais
- Commits en français, format conventionnel : `feat:`, `fix:`, `chore:`, `test:`, `docs:`

---

## 8. PÉRIMÈTRE

**MVP (à développer) :**
Auth + rôles · Clients & Véhicules · Dossiers + Kanban · Bon de Sortie (PDF + QR) · Écran vérification · Facturation · Dashboard · Historique véhicule

**V2 (NE PAS développer sauf demande explicite) :**
Stock détaillé · Planning technicien avancé · Notifications SMS/WhatsApp réelles · Mode LAN sans internet · Système de licence · Multi-garage · App mobile native

Ne pas sur-architecturer pour la V2, mais garder les services découplés pour rendre la migration possible.

---

## 9. MODE DE TRAVAIL

À chaque session, une tâche du jour est donnée (voir `TASKS.md`). Pour chacune :

1. Implémenter **complètement** — code fonctionnel, aucun placeholder ni TODO silencieux
2. Ajouter des tests sur la logique métier critique quand pertinent
3. Vérifier que `tsc --noEmit` passe avant de commiter
4. Faire **un commit atomique** avec message clair en français
5. Terminer par un résumé court : fait / reste / points d'attention

**Règles :**
- Ne pas regrouper plusieurs jours dans un commit, sauf demande explicite de rattrapage
- Ne pas anticiper les fonctionnalités V2
- Ne pas demander de valider ce qui est déjà spécifié ici — avancer
- Poser une question uniquement en cas d'ambiguïté technique réellement bloquante
