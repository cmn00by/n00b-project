# Mise en ligne

Le jeu est servi par un **Worker Cloudflare** (`n00b-project`), à l'adresse `workers.dev` du compte Cloudflare de cmn00by.
Bloc **15. Mise en ligne et admin** de [features.md](features.md), issue #12.

## 1. Comment ça marche

```text
navigateur ──► Worker n00b-project
                 ├─ /api/*      → worker/index.ts (le serveur du jeu)
                 └─ tout le reste → les fichiers de dist/ (le jeu construit par `npm run build`)
```

- **`wrangler.jsonc`** : la configuration du Worker (nom, point d'entrée, dossier `dist/`, adresses de preview). Son bloc `build` fait construire le jeu
  (`npm run build`) par wrangler **avant chaque envoi** : `dist/` est toujours à jour, que la commande de build soit réglée dans Cloudflare ou non.
- **`worker/index.ts`** : le code du Worker. Aujourd'hui, il ne répond qu'à **`/api/sante`** (`{ ok, apiVersion }`), pour vérifier qu'un déploiement répond.
- Les fichiers du jeu sont servis **directement par Cloudflare**, sans passer par le code : c'est rapide et gratuit dans les limites du plan.

## 2. Quand le jeu est mis en ligne

| Événement                      | Ce qui se passe                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------------- |
| **Merge sur `main`**           | Cloudflare construit le jeu (`npm run build`) et le met en ligne (`npx wrangler deploy`) |
| **Push sur une autre branche** | Cloudflare construit une **Preview** (`npx wrangler preview`), avec sa propre adresse    |
| **PR ouverte**                 | Cloudflare commente la PR avec l'adresse de la preview : on teste avant de merger        |

C'est **Workers Builds**, l'intégration Git de Cloudflare : rien à configurer dans GitHub Actions, et aucun secret dans le repo.

### Réglages dans le tableau de bord Cloudflare (une seule fois, par cmn00by)

_Fait le 2026-11-16 : le repo est connecté._

**Workers & Pages → n00b-project → Settings → Builds → Connect** :

| Réglage                      | Valeur                                                                                        |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| Dépôt                        | `cmn00by/n00b-project`                                                                        |
| Branche de production        | `main`                                                                                        |
| Commande de build            | vide : wrangler construit le jeu lui-même (bloc `build` de `wrangler.jsonc`)                  |
| Commande de déploiement      | `npx wrangler deploy`                                                                         |
| Builds des autres branches   | activés                                                                                       |
| Commande des autres branches | `npx wrangler preview` (réglage par défaut ; il exige le bloc `previews` de `wrangler.jsonc`) |

## 3. À la main (secours)

Depuis la racine, avec `npx wrangler login` fait une fois :

```bash
npm run deploy           # construit puis met en ligne (wrangler deploy)
npm run preview:worker   # construit puis lance le Worker en local (wrangler dev, http://localhost:8787)
```

Seul cmn00by a accès au compte Cloudflare. Baghorror12 n'en a pas besoin : il teste ses PR sur l'adresse de preview.

## 4. Les secrets

**Aucun secret dans le repo**, ni dans `wrangler.jsonc`. Quand il en faudra (admin, base de données…), ils se règlent dans le tableau de bord
(**Settings → Variables and Secrets**) ou avec `npx wrangler secret put NOM`, et seul **leur nom** est noté ici.

| Nom                    | Pour | Où  |
| ---------------------- | ---- | --- |
| _aucun pour l'instant_ |      |     |

## 5. Plus tard : jouer à plusieurs dans la même partie

Le Worker est déjà la porte d'entrée du serveur (`/api/`). Les parties à plusieurs (bloc **16. Coop**) s'y brancheront ainsi :

```text
joueur A ─┐
joueur B ─┼─ WebSocket /api/salons/<code> ──► Worker ──► Durable Object « Salon <code> »
joueur C ─┘                                               (un salon = une partie : la simulation, la liste des connectés)
```

- **Un salon = une partie = un Durable Object**, retrouvé par son **code** (4 lettres à partager). Toutes les connexions du même code
  arrivent dans **la même instance** : c'est ce qui garantit que tout le monde joue la même partie.
- **Plusieurs connexions par salon** : 2 à 4 joueurs, et un joueur qui se reconnecte (coupure, autre appareil) **retrouve sa place** grâce à un
  identifiant de joueur gardé par le navigateur.
- **Le salon fait tourner la simulation** (`src/sim`, qui tourne sans navigateur ni three.js) ; les joueurs envoient leurs **commandes**
  (`player:move`, `vehicle:drive`…), le salon renvoie l'état. Le jeu solo garde exactement le même code.
- `apiVersion` (dans `/api/sante`) empêche un jeu en cache de parler à un serveur plus récent qu'il ne comprend pas.

Ce qu'il faudra ajouter à `wrangler.jsonc` à ce moment-là : la déclaration du Durable Object (`durable_objects.bindings`) et sa migration (`migrations`).
