# n00b-project : consignes pour Claude

Mini monde ouvert parodique en 2D (navigateur), développé **à deux** : `cmn00by` (propriétaire du repo, relit et merge) et `Baghorror12` (contributeur).
Ce fichier est lu automatiquement par Claude Code. Ses règles valent pour **les deux développeurs et leurs assistants IA**.
En cas de doute : **demander, ne pas deviner.**

|                       |                                                              |
| --------------------- | ------------------------------------------------------------ |
| Repo                  | https://github.com/cmn00by/n00b-project (public)             |
| Tableau de tâches     | https://github.com/users/cmn00by/projects/3                  |
| Branche de production | `main` (protégée : modification uniquement par Pull Request) |
| Hébergement           | Cloudflare Workers : un merge sur `main` = mise en ligne     |

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

### Tenir GitHub à jour à chaque ajout

Chaque ajout, même petit, laisse GitHub dans un état exact :

- le travail est **poussé** sur sa branche et passe par une **PR** (jamais de travail qui reste seulement en local) ;
- la carte de l'issue est dans la bonne colonne du tableau (_In Progress_ pendant, _Done_ au merge via `Closes #n`) ;
- la PR met à jour **`CHANGELOG.md`** (une ligne dans « Non publié ») et coche les cases dans **`docs/roadmap.md`** et **`docs/features.md`** ;
- une nouvelle idée ou un bug repéré devient une **issue**, ajoutée au tableau.

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

| Préfixe     | Usage                                          |
| ----------- | ---------------------------------------------- |
| `feat:`     | nouvelle fonctionnalité                        |
| `fix:`      | correction de bug                              |
| `refactor:` | réorganisation sans changement de comportement |
| `docs:`     | documentation seule                            |
| `test:`     | ajout ou correction de tests                   |
| `chore:`    | outils, dépendances, configuration             |

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

### Développement modulaire (« LEGO ») : à lire avant de coder

Le détail est dans **[docs/architecture.md](docs/architecture.md)** (structure) et **[docs/conventions.md](docs/conventions.md)** (nommage). L'essentiel :

- Un **noyau stable** (`src/sim/core`) : monde, entités, événements, registres, `Rng`, `TUNING`. On le modifie **rarement**, en PR dédiée.
- Des **briques** qui s'y emboîtent : chaque système est un **dossier** avec `index.ts` (seule porte d'entrée), ses tests et un `README.md`,
  enregistré par **une ligne** dans `SYSTEMS`. Chaque contenu (véhicule, mission, objet…) est un **fichier de données** + une ligne dans sa liste.
- Les briques **ne s'importent jamais entre elles** : elles communiquent par **événements** (`world.events`) et lisent l'état par **composants**.
- **Ajouter, pas modifier** : une nouvelle fonctionnalité ajoute un dossier, une ligne de registre, un événement ou un composant. Si elle oblige à modifier un autre système, s'arrêter et en parler.
- **Test LEGO** avant chaque PR : retirer la ligne d'enregistrement de la brique ne casse rien, et ses tests passent seuls.
- Les règles d'import sont **vérifiées automatiquement** (`npm run lint`, `npm run check:cycles`).

### Les dossiers

```
src/
  sim/                 la simulation : TypeScript pur, SANS Phaser, sans navigateur
    core/              le noyau stable : world, entities, components, events, commands, registry, rng, config (TUNING), step
    systems/           les briques de règles, un dossier chacune, listées dans systems/index.ts (SYSTEMS)
      driving/  pedestrians/  traffic/  wanted/  missions/  ...
  data/                les contenus en données, un dossier par type, chacun avec sa liste (VEHICLES, MISSIONS...)
    vehicles/  missions/  npcTypes/  props/  barks/  ...
  game/                l'affichage Phaser
    scenes/            BootScene, CityScene, HudScene, MenuScene
    render/            un renderer par type d'entité (vehicleRenderer...)
    fx/  audio/  hud/  les effets, sons et widgets, qui écoutent les événements
    input/             clavier, manette, tactile → commandes
    assets.ts          toutes les clés d'assets (ASSET_KEYS)
  net/                 (V2) le client réseau de la coop
worker/                les Workers Cloudflare (jeu, API, et plus tard salons coop en Durable Objects)
public/
  maps/                cartes Tiled exportées en JSON
  assets/              visuels et sons (voir docs/style.md)
docs/                  la documentation du projet
```

### Les trois couches

1. **La simulation (`src/sim`)** : c'est le jeu (règles, état, IA). Elle ne connaît **ni Phaser ni le navigateur**,
   pour être testée dans Node et, plus tard, tourner sur un serveur (Durable Object) pour la coop.
2. **Les entrées (`src/game/input`)** : transforment clavier, souris, manette ou tactile en **commandes**.
   La simulation ne lit jamais le clavier directement.
3. **L'affichage (`src/game/render`, `scenes`)** : lit l'état de la simulation et le dessine. **Il ne décide rien** :
   aucune règle de jeu dans une scène Phaser.

Le sens des dépendances est **unique** : `game → systems → core`, et `data → core` (types seulement). `sim` n'importe jamais `game`, `net` ni Phaser. Un système n'importe jamais un autre système.

### La boucle

- La simulation avance à **pas de temps fixe** (30 pas par seconde) : `step(world, commands)` appelle chaque système de `SYSTEMS` dans l'ordre de `SYSTEM_ORDER`.
- L'affichage tourne à la vitesse de l'écran et **interpole** entre deux pas.
- C'est ce qui garantit le même résultat sur toutes les machines, condition de la coop.

## 5. Règles du code

### Clarté

- **Clair avant malin.** Noms explicites, selon **[docs/conventions.md](docs/conventions.md)** : code en anglais, commentaires en français, verbes de fonctions à sens fixe (`get`, `find`, `compute`, `try`, `apply`…), glossaire des mots du jeu.
- Fonctions **courtes**, qui font **une seule chose**. Au-delà de ~50 lignes, se demander s'il faut découper.
- Fichiers **d'une seule responsabilité**. Au-delà de ~300 lignes, envisager de découper.
- Pas de code dupliqué : si un bout de code existe déjà, le réutiliser ou l'extraire dans une fonction commune.
- Pas de code mort, pas de code commenté « au cas où », pas de `console.log` de debug dans une PR.

### Modularité

- Suivre **[docs/architecture.md](docs/architecture.md)** : un module = un dossier, une porte d'entrée (`index.ts`), un `README.md`, des tests autonomes.
- Séparer **simulation**, **entrées** et **affichage** ; communiquer entre briques par **événements**, jamais par import direct.
- Pas de `if (id === '...')` dans un système : le comportement propre à un contenu vient de ses données.
- Une fonction qui peut échouer renvoie `{ ok: true }` ou `{ ok: false, why: '...' }`, et l'interface affiche la raison au joueur.

### Règles de la simulation (repris de GRINTA)

- **Déterministe** : tout le hasard passe par `Rng` (`src/sim/core/rng.ts`) avec une graine. **Jamais `Math.random()` dans `src/sim`.** Pas de `Date.now()` non plus : le temps vient du pas de simulation.
  Même graine + mêmes choix = même partie : c'est ce qui rend les bugs reproductibles et les tests fiables.
- **Pas de valeurs en dur** : vitesses, dégâts, durées, probabilités… vont dans `src/sim/core/config.ts` (`TUNING`, groupé par module), avec un commentaire sur leur rôle.
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

| Fichier                | Contenu                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `README.md`            | ce qu'est le jeu, installer, lancer en local                                                                             |
| `docs/README.md`       | le sommaire de la documentation                                                                                          |
| `docs/architecture.md` | **le développement modulaire (LEGO)** : couches, modules, systèmes, composants, événements, registres, recettes          |
| `docs/conventions.md`  | **le nommage** : fichiers, fonctions, types, événements, ids, glossaire                                                  |
| `docs/GDD.md`          | le game design : concept, boucle de jeu, règles                                                                          |
| `docs/decisions.md`    | les décisions importantes : date, choix, alternatives, raison                                                            |
| `docs/features.md`     | toutes les fonctionnalités par bloc, la répartition, l'avancement (cocher les cases au fil des issues)                   |
| `docs/git.md`          | le guide des branches et des PR, pas à pas                                                                               |
| `docs/style.md`        | **l'identité visuelle** : palette, tailles, blocs de prompt, chaîne de génération. À lire avant toute génération d'image |
| `docs/deploiement.md`  | les Workers, les environnements, les secrets (noms seulement, jamais les valeurs)                                        |
| `CHANGELOG.md`         | le journal des modifications : **une ligne par PR**, dans « Non publié »                                                 |
| `docs/roadmap.md`      | les étapes du jeu et leurs cases à cocher : **cochées à chaque issue fermée**                                            |

- Avant de toucher à un système, **lire sa doc**. Si elle est fausse ou manquante, la corriger.

## 7. Vérifications avant une PR

À faire passer **avant chaque PR** :

```bash
npm run check     # lint (règles d'architecture) + cycles + tests + build : tout doit passer
npm run dev       # le jeu se lance et la fonctionnalité marche en jouant
```

La même vérification tourne **automatiquement sur chaque PR** (GitHub Actions) : une PR rouge ne se merge pas.

Liste de contrôle :

- [ ] Branche à jour avec `main`, sans conflit
- [ ] Tests et build qui passent ; tests ajoutés pour la nouvelle logique de `src/sim`
- [ ] Testé en jouant, sur ordinateur et sur mobile si l'interface change
- [ ] Pas de `Math.random()` ni de Phaser dans `src/sim`, pas de valeur d'équilibrage en dur
- [ ] Test LEGO réussi (voir `docs/architecture.md`, section 10) et noms conformes à `docs/conventions.md`
- [ ] `npm run lint` et `npm run check:cycles` passent
- [ ] Anciennes sauvegardes toujours chargeables
- [ ] Pas de secret, pas de log de debug, pas de code mort
- [ ] Doc à jour si le comportement change
- [ ] **`CHANGELOG.md`** : une ligne dans « Non publié », sous la bonne rubrique, avec le numéro d'issue
- [ ] **`docs/roadmap.md`** et **`docs/features.md`** : cases de l'issue cochées
- [ ] Description de PR complète (`Closes #n`, comment tester, ce qui n'est pas vérifié)

## 8. Déploiement et environnements

| Environnement  | Comment                                      | Pour quoi                    |
| -------------- | -------------------------------------------- | ---------------------------- |
| **Local**      | `npm run dev`                                | développer                   |
| **Preview**    | automatique, une URL par branche / PR        | tester une PR avant le merge |
| **Production** | automatique au merge sur `main`              | le jeu en ligne              |
| **Admin**      | Worker séparé, protégé par Cloudflare Access | gérer le jeu en ligne        |

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
- Générer une image sans suivre [docs/style.md](docs/style.md) : prompt assemblé à partir de ses blocs, références de la bible jointes, ligne ajoutée au registre.
- Contenus protégés : pas de noms, personnages, musiques ou visuels de jeux, marques ou personnes réels.

## 10. Commandes

```bash
npm install            # installer les dépendances (après un clone ou un pull qui change package.json)
npm run dev            # lancer le jeu en local (http://localhost:5173)
npm test               # tests (Vitest)
npm run test:watch     # tests en continu pendant qu'on code
npm run lint           # règles de code et d'architecture (ESLint)
npm run check:cycles   # dépendances circulaires (madge)
npm run build          # vérifier les types et compiler (dist/)
npm run check          # tout ce qui précède : à lancer avant chaque PR
npm run format         # formater tout le code (Prettier)
gh issue list          # voir les tâches
gh pr list             # voir les Pull Requests ouvertes
gh pr checks           # voir l'état des vérifications d'une PR
```

Outils des visuels (plus tard) : voir [scripts/art/README.md](scripts/art/README.md).
