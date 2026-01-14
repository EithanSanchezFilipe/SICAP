# SICAP – Lancement de l’application (Backend)

Ce document décrit les étapes pour installer, configurer et lancer le **backend** du projet SICAP.

## Prérequis

- Node.js (version LTS recommandée)
- npm
- Git
- Une base de données PostgreSQL (ex : Supabase)

---

## Installation

### 1. Se placer dans le dossier backend

```bash
cd backend
```

### 2. Configuration des variables d’environnement

**Création du fichier .env**

```bash
cp .env.exemple .env
```

> **Note :** Renseigner les variables nécessaires dans le fichier `.env` (URL de la base de données, port, etc.).

**Création du fichier .env.test**

```bash
cp .env.test.exemple .env.test
```

> ⚠️ Attention : Assurez-vous d'utiliser la commande `cp` (copier).

### 3. Installation des dépendances

```bash
npm install
```

_Des alertes de sécurité (npm audit) peuvent apparaître, elles ne bloquent pas le lancement du projet._

### 4. Configuration Prisma

Générer le client Prisma :

```bash
npx prisma generate
```

---

## Lancement des tests

Pour vérifier l'installation, lancez :

```bash
npm run test
```

**Cette commande :**

1. Synchronise la base de données de test.
2. Lance les tests avec **Vitest**.

---

## 💻 Lancement en mode développement

Pour lancer le serveur avec rechargement automatique (hot-reload) pour le développement :

```bash
npm run dev
```

**Cette commande :**

1. Démarre le serveur Node.js.
2. Active l'écoute des modifications (le serveur redémarre à chaque sauvegarde).

### Si tout fonctionne :

- Le serveur démarre sur : `http://localhost:3000`
- La documentation Swagger est disponible sur : `http://localhost:3000/docs`

## Erreurs courantes

### Erreur Prisma P1000

```text
Authentication failed against database server
```

**Cause :** Identifiants de base de données incorrects dans `.env` ou `.env.test`.

**Solution :**

1. Vérifier `DATABASE_URL`.
2. Vérifier l’utilisateur et le mot de passe.
3. Vérifier le port et le host.

---

## Commandes utiles (Récapitulatif)

| Commande              | Action                        |
| :-------------------- | :---------------------------- |
| `npm install`         | Installe les dépendances      |
| `npx prisma generate` | Génère le client Prisma       |
| `npm run test`        | Lance les tests et le serveur |

**Statut :** Backend fonctionnel | Tests passants | Prisma synchronisé
