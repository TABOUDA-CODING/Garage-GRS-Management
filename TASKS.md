# KM0 — Planning de développement

Une tâche par jour. Cocher au fur et à mesure.

---

## Semaine 1 — Fondations

### [ ] Lundi 4 août — Setup projet
- Init Next.js 15 + TypeScript strict + Tailwind + shadcn/ui
- Setup Prisma + schéma complet + migration initiale
- Structure de dossiers du projet
- Seed : 4 utilisateurs (un par rôle), 5 clients (dont 1 État), 8 véhicules, 3 dossiers à différents statuts
- **Commit :** `chore: setup initial du projet KM0 + schéma Prisma complet`

### [ ] Mardi 5 août — Authentification & rôles
- Login/logout, sessions cookies httpOnly, hashing bcrypt
- Middleware de protection des routes par rôle
- Guard réutilisable pour Server Actions (`requireRole()`)
- Layout applicatif avec sidebar adaptée au rôle connecté
- **Commit :** `feat: authentification par session et contrôle d'accès par rôle`

### [ ] Mercredi 6 août — Module Clients
- CRUD client complet (particulier / État / entreprise, champs ICE conditionnels)
- Liste avec recherche (nom, téléphone) et pagination
- Fiche client avec ses véhicules
- **Commit :** `feat: gestion des clients avec distinction particulier/État`

### [ ] Jeudi 7 août — Module Véhicules
- CRUD véhicule rattaché à un client
- **Recherche par immatriculation** — fonction la plus utilisée au quotidien, accessible depuis partout, soigner l'UX
- Fiche véhicule avec historique des dossiers passés
- **Commit :** `feat: gestion des véhicules et recherche par immatriculation`

### [ ] Vendredi 8 août — Création de dossier
- Formulaire création (véhicule existant ou nouveau client+véhicule à la volée)
- Sélection multiple des types d'intervention
- Génération automatique du numéro `DOS-2026-XXXX`
- Génération automatique de la fiche d'intervention (PDF, informative, sans QR) à la création
- Liste des dossiers avec filtres
- **Commit :** `feat: création et listing des dossiers d'intervention`

---

## Semaine 2 — Cœur métier

### [ ] Lundi 11 août — Vue Kanban atelier
- Colonnes par statut (Entré / Diagnostic / En cours / Prêt)
- Cartes véhicule : immat, marque, type intervention, technicien, ancienneté
- Drag & drop OU boutons de transition
- **Commit :** `feat: vue Kanban de l'atelier avec transitions de statut`

### [ ] Mardi 12 août — Machine à états + audit
- Service de transition avec validation des transitions autorisées
- Écriture systématique dans `HistoriqueStatut`
- Assignation technicien
- Tests unitaires sur les transitions (Vitest)
- **Commit :** `feat: machine à états des dossiers avec traçabilité complète`

### [ ] Mercredi 13 août — Génération du Bon de Sortie
- Service de génération avec token QR unique
- Template PDF A5 (à coller sur pare-brise) : numéro BS, immatriculation en gros, marque/modèle, client, type intervention, date, QR, mention dérogation si applicable
- Blocage si statut != PRET
- **Commit :** `feat: génération du bon de sortie en PDF avec QR code`

### [ ] Jeudi 14 août — Écran vérification
- Page `/verification` plein écran, accès vigile
- Scan QR caméra + saisie manuelle
- Endpoint avec transaction atomique (invalidation BS + passage dossier en SORTI)
- Affichage vert/orange/rouge selon le résultat de la vérification
- **Commit :** `feat: écran de vérification avec invalidation du bon de sortie`

### [ ] Vendredi 15 août — Facturation
- Génération facture depuis dossier (HT, TVA 20%, TTC)
- Enregistrement paiement (mode, date) → mise à jour `statutPaiement`
- Blocage génération BS si non soldé
- Dérogation Admin avec motif obligatoire
- **Commit :** `feat: facturation et blocage de sortie sur impayé avec dérogation`

---

## Semaine 3 — Complétude & finition

### [ ] Lundi 18 août — Dashboard
- Compteurs : véhicules présents par statut, sorties du jour
- Alertes : dossiers stagnants (+3 jours), factures impayées, devis sans réponse
- CA jour / semaine / mois
- **Commit :** `feat: tableau de bord de synthèse pour le gérant`

### [ ] Mardi 19 août — Pièces & détail dossier
- Ajout de pièces sur un dossier (nom, référence, quantité, prix)
- Calcul automatique du montant total
- Page détail dossier avec timeline de l'historique
- **Commit :** `feat: gestion des pièces utilisées et vue détaillée du dossier`

### [ ] Mercredi 20 août — Administration
- Gestion des utilisateurs (CRUD, activation/désactivation)
- Régénération BS perdu (avec invalidation de l'ancien)
- Consultation de l'audit trail
- **Commit :** `feat: module d'administration et régénération des bons perdus`

### [ ] Jeudi 21 août — Polish UI/UX
- Cohérence visuelle, états de chargement, états vides
- Responsive (écran barrière doit fonctionner sur tablette)
- Messages d'erreur clairs en français
- **Commit :** `style: harmonisation de l'interface et amélioration de l'UX`

### [ ] Vendredi 22 août — Corrections
- Revue de tous les parcours, correction des bugs
- Vérification `tsc --noEmit` propre
- **Commit :** `fix: corrections issues de la revue fonctionnelle`

---

## Semaine 4 — Tests & livraison

### [ ] Lundi 25 août — Tests métier
- Tests unitaires : transitions de statut, génération numéros, règles BS
- **Commit :** `test: couverture des règles métier critiques`

### [ ] Mardi 26 août — Tests de parcours
- Scénarios complets : entrée → diagnostic → réparation → facture → BS → sortie
- Cas limites : BS déjà utilisé, dérogation, régénération
- **Commit :** `test: scénarios de bout en bout du cycle véhicule`

### [ ] Mercredi 27 août — Données de démonstration
- Jeu de données réaliste (une quinzaine de dossiers à tous les stades)
- Script de reset rapide de la démo
- **Commit :** `chore: jeu de données de démonstration pour la soutenance`

### [ ] Jeudi 28 août — Documentation
- README complet : installation, configuration, lancement
- Documentation des règles métier
- **Commit :** `docs: documentation technique et guide d'installation`

### [ ] Vendredi 29 août — Finalisation
- Dernières corrections, vérification complète
- **Commit :** `chore: finalisation de la version 1.0`
