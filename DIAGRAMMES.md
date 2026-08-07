# Images à fournir pour `rapport.tex` (et `cc.tex`)

Ce fichier liste les images que je ne peux pas générer directement par du code LaTeX
(tikz ne rend pas bien les diagrammes UML normalisés). Pour chacune : le nom de fichier
attendu, l'endroit où elle est utilisée dans le `.tex`, et le code source à coller dans un
générateur externe pour produire le PNG.

Une fois les images générées, place-les dans les dossiers indiqués (à créer s'ils
n'existent pas) à la racine du projet, à côté de `rapport.tex` — ce sont ces mêmes
dossiers qu'il faudra uploader sur Overleaf avec le `.tex`.

---

## 1. Logo de l'école (déjà requis par `cc.tex` et `rapport.tex`)

- **Fichier attendu :** `logo.png` (racine du projet, à côté de `rapport.tex`)
- **Utilisé dans :** page de garde des deux documents (`\includegraphics[width=4.6cm]{logo.png}`)
- **Contenu :** logo officiel de l'EMSI (Casablanca — Campus Oranger)
- **Génération :** pas de diagramme ici — récupère le logo officiel (site de l'école,
  charte graphique) et exporte-le en PNG avec fond transparent si possible.

---

## 2. Diagramme de cas d'utilisation

- **Fichier attendu :** `diagrams/diagramme_cas_utilisation.png`
- **Utilisé dans :** `rapport.tex`, chapitre *Analyse et spécification des besoins*,
  section *Besoins fonctionnels* (macro `\diagram{diagramme_cas_utilisation}{0.95}{...}`)
- **Génération :** colle le bloc ci-dessous dans l'éditeur en ligne
  [plantuml.com/plantuml](https://www.plantuml.com/plantuml/uml/) (ou l'extension
  PlantUML de VS Code, ou `plantuml.jar` en local), exporte en PNG, puis renomme le
  fichier `diagramme_cas_utilisation.png`.

```plantuml
@startuml diagramme_cas_utilisation
left to right direction
skinparam packageStyle rectangle
skinparam actorStyle awesome
skinparam backgroundColor white

actor "Réceptionniste" as RECEP
actor "Technicien" as TECH
actor "Admin" as ADMIN
actor "Vigile" as VIGILE

rectangle "Système KM0" {
  usecase "Se connecter" as UC0
  usecase "Gérer les clients" as UC1
  usecase "Gérer les véhicules" as UC2
  usecase "Créer un dossier d'intervention" as UC3
  usecase "Consulter la fiche d'intervention" as UC4
  usecase "Suivre l'atelier (Kanban)" as UC5
  usecase "Changer le statut d'un dossier" as UC6
  usecase "Ajouter pièces / observations" as UC7
  usecase "Générer le Bon de Sortie" as UC8
  usecase "Accorder une dérogation de paiement" as UC9
  usecase "Vérifier une sortie (scan BS)" as UC10
  usecase "Facturer / encaisser un paiement" as UC11
  usecase "Consulter le tableau de bord" as UC12
  usecase "Gérer les utilisateurs" as UC13
  usecase "Régénérer un BS perdu" as UC14
}

RECEP --> UC0
TECH --> UC0
ADMIN --> UC0
VIGILE --> UC0

RECEP --> UC1
RECEP --> UC2
RECEP --> UC3
RECEP --> UC4
RECEP --> UC5
RECEP --> UC11

TECH --> UC4
TECH --> UC5
TECH --> UC6
TECH --> UC7

ADMIN --> UC1
ADMIN --> UC2
ADMIN --> UC3
ADMIN --> UC4
ADMIN --> UC5
ADMIN --> UC6
ADMIN --> UC8
ADMIN --> UC9
ADMIN --> UC11
ADMIN --> UC12
ADMIN --> UC13
ADMIN --> UC14

VIGILE --> UC10

UC8 ..> UC3 : <<include>>
UC10 ..> UC8 : <<extend>>
@enduml
```

---

## 3. Diagramme de classes UML

- **Fichier attendu :** `diagrams/diagramme_classes.png`
- **Utilisé dans :** `rapport.tex`, chapitre *Conception*, section *Modélisation des
  données* (macro `\diagram{diagramme_classes}{0.95}{...}`)
- **Génération :** même procédé que ci-dessus (PlantUML), le diagramme reprend
  fidèlement le schéma Prisma du projet (`prisma/schema.prisma`).

```plantuml
@startuml diagramme_classes
skinparam classAttributeIconSize 0
skinparam backgroundColor white
hide circle

enum Role {
  RECEPTIONNISTE
  TECHNICIEN
  ADMIN
  VIGILE
}

enum TypeClient {
  PARTICULIER
  ETAT
  ENTREPRISE
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

enum StatutBS {
  VALIDE
  UTILISE
  ANNULE
}

class User {
  +id: String
  +nom: String
  +email: String
  -passwordHash: String
  +role: Role
  +actif: Boolean
}

class Client {
  +id: String
  +nom: String
  +telephone: String
  +email: String
  +cin: String
  +type: TypeClient
  +raisonSociale: String
  +ice: String
}

class Vehicule {
  +id: String
  +immatriculation: String
  +marque: String
  +modele: String
  +annee: Int
  +couleur: String
  +kilometrage: Int
}

class Dossier {
  +id: String
  +numero: String
  +typesIntervention: TypeIntervention[]
  +statut: StatutDossier
  +motifDeclare: String
  +dateEntree: DateTime
  +montantTotal: Decimal
  +statutPaiement: StatutPaiement
}

class BonDeSortie {
  +id: String
  +numero: String
  +qrToken: String
  +statut: StatutBS
  +derogationPaiement: Boolean
  +derogationMotif: String
}

class Facture {
  +id: String
  +numero: String
  +montantHT: Decimal
  +tauxTVA: Decimal
  +montantTTC: Decimal
  +statutPaiement: StatutPaiement
}

class PieceUtilisee {
  +id: String
  +nomPiece: String
  +reference: String
  +quantite: Int
  +prixUnitaire: Decimal
}

class HistoriqueStatut {
  +id: String
  +statutAvant: StatutDossier
  +statutApres: StatutDossier
  +commentaire: String
  +createdAt: DateTime
}

Client "1" -- "0..*" Vehicule
Vehicule "1" -- "0..*" Dossier
Dossier "1" -- "0..*" BonDeSortie
Dossier "1" -- "0..*" Facture
Dossier "1" -- "0..*" PieceUtilisee
Dossier "1" -- "0..*" HistoriqueStatut
User "1" -- "0..*" Dossier : technicien >
User "1" -- "0..*" HistoriqueStatut : auteur >
User "1" -- "0..*" BonDeSortie : dérogation >

Dossier --> StatutDossier
Dossier --> TypeIntervention
Dossier --> StatutPaiement
Client --> TypeClient
User --> Role
BonDeSortie --> StatutBS
@enduml
```

---

## À faire à chaque nouveau diagramme

Quand un futur chapitre du rapport aura besoin d'un diagramme trop complexe pour tikz
(ex. diagramme d'activité pour la machine à états détaillée, diagramme de déploiement),
ce fichier sera complété de la même façon : nom de fichier attendu, emplacement dans le
`.tex`, code PlantUML prêt à coller.
