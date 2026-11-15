# n00b-project : consignes pour Claude

Mini monde ouvert parodique en 2D (navigateur), développé **à deux** : `cmn00by` (propriétaire du repo, relit et merge) et `Baghorror12` (contributeur).
Ce fichier est lu automatiquement par Claude Code. Ses règles valent pour **les deux développeurs et leurs assistants IA**.
En cas de doute : **demander, ne pas deviner.**

| | |
|---|---|
| Repo | https://github.com/cmn00by/n00b-project (public) |
| Tableau de tâches | https://github.com/users/cmn00by/projects/3 |
| Branche de production | `main` (protégée : modification uniquement par Pull Request) |
| Hébergement | Cloudflare Workers : un merge sur `main` = mise en ligne |

## Sommaire

1. [Façon de travailler](#1-façon-de-travailler)
2. [Le tableau et les issues](#2-le-tableau-et-les-issues)
3. [Git : branches, commits, Pull Requests](#3-git--branches-commits-pull-requests)
4. [Architecture](#4-architecture)
5. [Règles du code](#5-règles-du-code)
6. [Documentation](#6-documentation)
7. [Vérifications avant une PR](#7-vérifications-avant-une-pr)
8. [Déploiement et environnements](#8-déploiement-et-environnements)
9. [Interdits](#9-interdits)
10. [Commandes](#10-commandes)

---

## 1. Façon de travailler

- **Toujours en français** : échanges, commentaires du code, libellés du jeu, messages de commit, issues, PR.
- **Étape par étape** : proposer un plan, puis **attendre la validation (« Go »)** avant de coder et avant chaque étape suivante.
  Pour un nouveau chantier, **brainstormer d'abord** : reformuler l'envie, regarder ce qui existe déjà, poser des questions fermées sur les vrais choix.
- **Découper** : une fonctionnalité se découpe en étapes vérifiables (logique du jeu → branchement → interface → admin).
  À la fin de chaque étape, un point rapide : ce qui est fait, ce qui a été vérifié, ce qui vient ensuite.
- **Pédagogie Git** : l'un des développeurs débute. Avant chaque commande Git, dire en une phrase ce qu'elle fait et pourquoi.
  Préférer les commandes simples. Ne jamais laisser le dépôt dans un état bizarre sans l'expliquer.
- **Honnêteté** : dire clairement ce qui a été testé et ce qui ne l'a pas été. Un test qui échoue se signale, il ne se cache pas.
- **Rester dans le sujet** : ne pas modifier, reformater ou « améliorer » du code hors de la tâche en cours. Une idée ou un bug repéré en chemin → une nouvelle issue.

## 2. Le tableau et les issues

**Aucun travail sans issue.** Le tableau est la source de vérité de qui fait quoi.

### Avant de coder

1. Chercher l'issue correspondante : `gh issue list`.
2. Si elle n'existe pas, **proposer** une issue (titre, contexte, critères de fin) et la créer après accord :
   ```bash
   gh issue create --title "Saut du joueur" --body "..." --label feature
   ```
3. S'assigner l'issue : `gh issue edit <n> --add-assignee @me`, puis la passer en **In Progress** sur le tableau.
4. Vérifier sur le tableau que **l'autre développeur ne travaille pas sur les mêmes fichiers**. Si oui, le signaler avant de commencer.

### Rédiger une bonne issue

```markdown
## Contexte
Pourquoi on en a besoin, côté joueur.

## À faire
- [ ] point 1
- [ ] point 2

## Critères de fin
Ce qu'on doit pouvoir constater en jouant pour considérer la tâche terminée.
```

- Une issue = **un objectif**, faisable en une PR (quelques heures à 2 jours). Plus gros → découper en plusieurs issues.
- Labels : `feature`, `bug`, `docs`, `refactor`, `idée`.
- Colonnes du tableau : **Todo** → **In Progress** → **Done** (passage automatique en Done au merge grâce à `Closes #n`).

## 3. Git : branches, commits, Pull Requests

### Règles absolues

- **Jamais de commit ni de push sur `main`.** Tout passe par une branche et une Pull Request.
- **Une issue = une branche = une PR.**
- **Seul `cmn00by` merge.** L'assistant IA ne merge jamais une PR.
- **Relecture assistée** : l'assistant peut relire une PR (`gh pr diff <n>`) et en faire un résumé : ce qui change, les risques, les points à tester, les problèmes repérés.
  Il ne lance `gh pr review <n> --approve` **qu'après l'accord explicite** du développeur, donné après avoir lu ce résumé.
  Sans accord, ou en cas de doute, il s'arrête au résumé. Voir [docs/git.md](docs/git.md#7-relire-une-pr).

### Le cycle d'une tâche

Guide pas à pas, avec GitHub Desktop et en ligne de commande : [docs/git.md](docs/git.md).

```bash
git switch main && git pull                 # repartir de la dernière version
git switch -c feature/4-saut-joueur         # créer sa branche
# ... coder, tester ...
git add <fichiers>                          # ajouter seulement les fichiers de la tâche
git commit -m "feat: ajoute le saut du joueur"
git push -u origin feature/4-saut-joueur    # envoyer la branche
gh pr create --fill                         # ouvrir la Pull Request
```

Pendant la PR, si `main` a avancé : `git switch main && git pull && git switch - && git merge main`, puis vérifier que tout marche encore.

### Nommage des branches

`<type>/<n°issue>-<description-courte>` en minuscules, mots séparés par des tirets :
`feature/4-saut-joueur`, `fix/12-collision-murs`, `docs/7-guide-installation`, `refactor/9-module-input`.

### Messages de commit

En français, à l'impératif, préfixés par le type :

| Préfixe | Usage |
|---|---|
| `feat:` | nouvelle fonctionnalité |
| `fix:` | correction de bug |
| `refactor:` | réorganisation sans changement de comportement |
| `docs:` | documentation seule |
| `test:` | ajout ou correction de tests |
| `chore:` | outils, dépendances, configuration |

Un commit = un changement cohérent qui compile. Pas de « wip », « test », « fix fix ».
Les commits faits avec Claude se terminent par la ligne `Co-Authored-By` demandée par la session.

### Pull Request

- **Petite** : une seule chose. Viser moins de ~400 lignes modifiées.
- Description :
  ```markdown
  Closes #4

  ## Ce qui change
  - ...

  ## Comment tester
  1. `npm run dev`
  2. ...

  ## Non vérifié
  - ... (ou « rien »)
  ```
- Joindre une **capture ou un GIF** si l'interface change.
- Les retours de relecture se corrigent par de **nouveaux commits** sur la même branche (pas de force push).

### En cas de problème

- **Conflit de merge** : s'arrêter, montrer les fichiers en conflit, expliquer les deux versions, et résoudre **avec le développeur**.
- **Erreur de commit / mauvaise branche** : ne rien effacer. Expliquer la situation et proposer la solution la plus sûre.
- Commandes **interdites sans accord explicite** : `git push --force`, `git reset --hard`, `git rebase` sur une branche poussée, `git clean -fd`, `git branch -D`, suppression de branche distante.

## 4. Architecture

> Le jeu : un **mini monde ouvert parodique en vue de dessus, en 2D pixel art** (voir [docs/GDD.md](docs/GDD.md)).
> Stack : **Phaser 3 + TypeScript + Vite**, **Vitest**, cartes **Tiled**, hébergement **Cloudflare Workers** (+ R2, puis D1 et Durable Objects).
> Raisons et alternatives : [docs/decisions.md](docs/decisions.md). Si la stack change, mettre à jour cette section **dans la même PR**.

### Les dossiers

```
src/
  sim/          la simulation : TypeScript pur, SANS Phaser, sans navigateur
    config.ts   toutes les valeurs d'équilibrage (TUNING)
    rng.ts      le hasard déterministe
    commands.ts les commandes des joueurs (accélérer, monter, frapper...)
    world.ts    l'état du monde et le pas de simulation (step)
    entities/   joueur, véhicules, piétons, police
    systems/    déplacement, collisions, IA des PNJ, recherche, missions
    types.ts    les types partagés
  game/         l'affichage Phaser
    scenes/     les scènes (Boot, Ville, Interface, Menu)
    render/     dessine l'état de la simulation (sprites, caméra, effets)
    input/      clavier, souris, manette, tactile → commandes
  data/         données du jeu en JSON / TS : missions, dialogues, véhicules
  net/          (V2) le client réseau de la coop
worker/         les Workers Cloudflare (jeu, API, et plus tard salons coop en Durable Objects)
public/
  maps/         cartes Tiled exportées en JSON
  assets/       sprites, tuiles, sons (packs CC0, visuels maison ou générés)
docs/           la documentation du projet
```

### Les trois couches

1. **La simulation (`src/sim`)** : c'est le jeu (règles, état, IA). Elle ne connaît **ni Phaser ni le navigateur**,
   pour être testée dans Node et, plus tard, tourner sur un serveur (Durable Object) pour la coop.
2. **Les entrées (`src/game/input`)** : transforment clavier, souris, manette ou tactile en **commandes**.
   La simulation ne lit jamais le clavier directement.
3. **L'affichage (`src/game/render`, `scenes`)** : lit l'état de la simulation et le dessine. **Il ne décide rien** :
   aucune règle de jeu dans une scène Phaser.

Le sens des dépendances est **unique** : `game → sim`. `sim` n'importe jamais `game`, `net` ni Phaser.

### La boucle

- La simulation avance à **pas de temps fixe** (par exemple 30 pas par seconde) : `step(world, commands, dt)`.
- L'affichage tourne à la vitesse de l'écran et **interpole** entre deux pas.
- C'est ce qui garantit le même résultat sur toutes les machines, condition de la coop.

## 5. Règles du code

### Clarté

- **Clair avant malin.** Noms explicites (`playerSpeed`, pas `ps` ; `isGameOver`, pas `flag`).
- Fonctions **courtes**, qui font **une seule chose**. Au-delà de ~50 lignes, se demander s'il faut découper.
- Fichiers **d'une seule responsabilité**. Au-delà de ~300 lignes, envisager de découper.
- Pas de code dupliqué : si un bout de code existe déjà, le réutiliser ou l'extraire dans une fonction commune.
- Pas de code mort, pas de code commenté « au cas où », pas de `console.log` de debug dans une PR.

### Modularité

- Chaque système du jeu (déplacement, collisions, score, audio, sauvegarde…) dans **son propre module**, avec une interface claire (ce qu'il exporte).
- Séparer **simulation**, **entrées** et **affichage** (voir l'architecture).
- Une fonction qui peut échouer renvoie `{ ok: true }` ou `{ ok: false, why: '...' }`, et l'interface affiche la raison au joueur.

### Règles de la simulation (repris de GRINTA)

- **Déterministe** : tout le hasard passe par `Rng` (`src/sim/rng.ts`) avec une graine. **Jamais `Math.random()` dans `src/sim`.** Pas de `Date.now()` non plus : le temps vient du pas de simulation.
  Même graine + mêmes choix = même partie : c'est ce qui rend les bugs reproductibles et les tests fiables.
- **Pas de valeurs en dur** : vitesses, dégâts, durées, probabilités… vont dans `src/sim/config.ts` (`TUNING`), avec un commentaire sur leur rôle.
- **Sauvegardes compatibles** : un nouveau champ de sauvegarde est **optionnel** ou complété par une fonction de migration. Une ancienne partie doit toujours se charger.

### Style

- TypeScript **strict**, pas de `any` (sauf exception justifiée en commentaire).
- Formatage : Prettier, pas de point-virgule, guillemets simples, lignes de 200 caractères max.
  `npx prettier --no-semi --single-quote --print-width 200 --write <fichier>`
- Phaser : une scène = un rôle. Les clés d'assets sont déclarées à un seul endroit (pas de chaînes `'car_red'` éparpillées). Les sprites ne portent pas de logique de jeu.
- Contenus (missions, dialogues, véhicules) **en données** dans `src/data/`, pas en code : on doit pouvoir écrire une mission sans toucher à la simulation.
- Respecter le style du code existant, même s'il diffère de ses habitudes.

### Dépendances

- **Pas de nouvelle dépendance sans accord** des deux développeurs. Justifier le besoin dans la PR ou l'issue.
- Préférer une dépendance connue et maintenue, ou quelques lignes de code maison si le besoin est petit.

## 6. Documentation

- **Commentaires en français**, qui expliquent **ce que ça fait pour le jeu et pourquoi**, pas la paraphrase du code.
  ```ts
  // Mauvais : incrémente le compteur
  // Bon : le joueur garde 3 frames d'invincibilité après un coup, pour ne pas perdre deux vies d'un coup
  ```
- Chaque module a un **commentaire d'en-tête** : son rôle et ce qu'il expose.
- Fichiers de documentation, à tenir à jour **dans la même PR** que le changement qu'ils décrivent :

| Fichier | Contenu |
|---|---|
| `README.md` | ce qu'est le jeu, installer, lancer en local |
| `docs/README.md` | le sommaire de la documentation |
| `docs/architecture.md` | les dossiers, les couches, les grands systèmes |
| `docs/GDD.md` | le game design : concept, boucle de jeu, règles |
| `docs/decisions.md` | les décisions importantes : date, choix, alternatives, raison |
| `docs/deploiement.md` | les Workers, les environnements, les secrets (noms seulement, jamais les valeurs) |
| `src/data/changelog.ts` | le journal des nouveautés, rédigé **pour le joueur** |

- Avant de toucher à un système, **lire sa doc**. Si elle est fausse ou manquante, la corriger.

## 7. Vérifications avant une PR

À faire passer **avant chaque PR** :

```bash
npm test          # les tests passent
npm run build     # le projet compile sans erreur
npm run dev       # le jeu se lance et la fonctionnalité marche en jouant
```

Liste de contrôle :

- [ ] Branche à jour avec `main`, sans conflit
- [ ] Tests et build qui passent ; tests ajoutés pour la nouvelle logique de `src/sim`
- [ ] Testé en jouant, sur ordinateur et sur mobile si l'interface change
- [ ] Pas de `Math.random()` ni de Phaser dans `src/sim`, pas de valeur d'équilibrage en dur
- [ ] Anciennes sauvegardes toujours chargeables
- [ ] Pas de secret, pas de log de debug, pas de code mort
- [ ] Doc et changelog à jour
- [ ] Description de PR complète (`Closes #n`, comment tester, ce qui n'est pas vérifié)

## 8. Déploiement et environnements

| Environnement | Comment | Pour quoi |
|---|---|---|
| **Local** | `npm run dev` | développer |
| **Preview** | automatique, une URL par branche / PR | tester une PR avant le merge |
| **Production** | automatique au merge sur `main` | le jeu en ligne |
| **Admin** | Worker séparé, protégé par Cloudflare Access | gérer le jeu en ligne |

- **Personne ne déploie en production à la main** (`wrangler deploy` vers la prod est interdit) : le merge sur `main` s'en charge.
- Les modifications faites dans le panneau admin en ligne sont **publiées par un humain**, jamais par l'assistant IA.

## 9. Interdits

- Commiter ou pusher sur `main`, merger une PR, approuver une PR sans l'accord explicite du développeur.
- Commandes Git destructives sans accord explicite (voir section 3).
- **Secrets** : le repo est **public**. Jamais de clé API, jeton, mot de passe dans le code, les commits, les issues ou la discussion.
  Secrets locaux dans `.dev.vars` / `.env` (ignorés par Git), secrets de prod via `wrangler secret put` ou le dashboard Cloudflare.
  Ne jamais afficher ni copier le contenu de ces fichiers.
- `git add -A` ou `git add .` sans avoir vérifié `git status` : ajouter seulement les fichiers de la tâche.
- Ajouter une dépendance, changer la stack ou l'architecture sans accord.
- Dépenser de l'argent (API payantes, génération d'images, services Cloudflare payants) sans budget donné par le propriétaire.
- Contenus protégés : pas de noms, personnages, musiques ou visuels de jeux, marques ou personnes réels.

## 10. Commandes

```bash
npm install       # installer les dépendances (après un clone ou un pull qui change package.json)
npm run dev       # lancer le jeu en local
npm test          # tests
npm run build     # compiler
gh issue list     # voir les tâches
gh pr list        # voir les Pull Requests ouvertes
gh pr checks      # voir l'état des vérifications d'une PR
```

> Les commandes `npm` seront disponibles une fois le projet initialisé (première issue). Mettre cette section à jour si des scripts sont ajoutés.
