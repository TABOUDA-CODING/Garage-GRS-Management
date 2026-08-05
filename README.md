# KM0 — Système de gestion de garage automobile

Voir `CLAUDE.md` pour le contexte complet du projet et `TASKS.md` pour le planning.

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

## Comptes de démonstration

Mot de passe pour tous les comptes : `password123`

| Rôle | Email |
|---|---|
| Réceptionniste | reception@km0.ma |
| Technicien | technicien@km0.ma |
| Admin | admin@km0.ma |
| Vigile | vigile@km0.ma |
