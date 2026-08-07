# KM0 — Système de gestion de garage automobile

Application de gestion pour garage automobile : suivi des dossiers véhicules,
bon de sortie sécurisé par QR code, facturation et tableau de bord.

## Démarrage

```bash
# 1. Démarrer PostgreSQL (Docker)
docker compose up -d

# 2. Installer les dépendances
npm install

# 3. Appliquer les migrations
npx prisma migrate dev

# 4. Charger les données de démonstration
npx prisma db seed

# 5. Lancer le serveur de développement
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

## Fonctionnalités disponibles

Le projet est en cours de développement (voir `TASKS.md` pour le planning détaillé).
À ce stade sont disponibles :

- Authentification par session (cookies `httpOnly` + `bcrypt`) et contrôle d'accès par rôle
  (Réceptionniste, Technicien, Admin, Vigile)
- Gestion des clients (particulier / État / entreprise, champs conditionnels)
- Gestion des véhicules rattachés à un client, avec recherche par immatriculation accessible
  depuis toutes les pages
- Création de dossiers d'intervention (véhicule existant ou nouveau client + véhicule à la volée),
  numérotation séquentielle `DOS-2026-XXXX` et génération automatique de la fiche d'intervention
  au format PDF

Les modules restants (vue Kanban, Bon de Sortie, écran de vérification, facturation, tableau de
bord) sont détaillés dans `TASKS.md` et `cc.tex`.

## Comptes de démonstration

Mot de passe pour tous les comptes : `password123`

| Rôle | Email |
|---|---|
| Réceptionniste | reception@km0.ma |
| Technicien | technicien@km0.ma |
| Admin | admin@km0.ma |
| Vigile | vigile@km0.ma |
