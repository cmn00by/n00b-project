# Architecture : le jeu en briques LEGO

Ce document explique **comment le code est découpé** pour qu'on puisse ajouter une fonctionnalité **comme on ajoute une brique LEGO** :
on la fabrique à part, on l'emboîte à un endroit prévu, et **rien d'autre ne bouge**.

Les noms (fichiers, fonctions, types, événements) suivent [conventions.md](conventions.md).

## Sommaire

1. [Le principe en une image](#1-le-principe-en-une-image)
2. [Les couches et le sens des dépendances](#2-les-couches-et-le-sens-des-dépendances)
3. [Le module : la brique de base](#3-le-module--la-brique-de-base)
4. [Le noyau (`core`)](#4-le-noyau-core)
5. [Les systèmes](#5-les-systèmes)
6. [Les entités et leurs composants](#6-les-entités-et-leurs-composants)
7. [Les événements : comment les briques se parlent](#7-les-événements--comment-les-briques-se-parlent)
8. [Les contenus en données (registres)](#8-les-contenus-en-données-registres)
9. [L'affichage, les entrées et le son](#9-laffichage-les-entrées-et-le-son)
10. [Recettes : ajouter une brique](#10-recettes--ajouter-une-brique)
11. [Les garde-fous automatiques](#11-les-garde-fous-automatiques)
12. [Ce qui est interdit](#12-ce-qui-est-interdit)

---

## 1. Le principe en une image

```
                    ┌──────────────────────── src/sim (le jeu, sans three.js) ───────────────────────┐
                    │                                                                                │
 clavier ─► input ─►│ commandes ─► ┌─────────────┐   step()   ┌──────────────────────────────────┐   │
 manette            │              │    core     │ ─────────► │ systèmes (briques)               │   │
 tactile            │              │ world, rng, │            │ movement · driving · pedestrians │   │
                    │              │ events, ... │ ◄───────── │ traffic · wanted · missions · …  │   │
                    │              └─────────────┘  état +    └──────────────────────────────────┘   │
                    │                     ▲          événements            ▲                         │
                    │                     │                                │ lit                     │
                    │              src/data : missions, véhicules, dialogues… (registres)           │
                    └─────────────────────┼────────────────────────────────────────────────────────┘
                                          │ lit l'état + écoute les événements
                    ┌─────────────────────┴──────── src/game (three.js) ───────────────────────────────┐
                    │ renderers (une brique par type d'entité) · fx · audio · hud                     │
                    └─────────────────────────────────────────────────────────────────────────────────┘
```

**Trois idées à retenir :**

1. **Un noyau stable** (`core`) qu'on ne modifie presque jamais.
2. **Des briques** (systèmes, renderers, contenus) qui **s'enregistrent** dans le noyau et **ne se connaissent pas entre elles**.
3. **Des événements** pour qu'une brique réagisse à une autre sans l'importer.

Conséquence : **ajouter la police ne touche pas au code de la conduite.** Supprimer une brique ne casse pas les autres.

## 2. Les couches et le sens des dépendances

```
src/game  ──►  src/sim/systems  ──►  src/sim/core
    │                │                    ▲
    └────────────────┴──► src/data ───────┘   (les données utilisent les types du noyau)
```

| Couche              | Peut importer                               | Ne doit **jamais** importer                        |
| ------------------- | ------------------------------------------- | -------------------------------------------------- |
| `src/sim/core`      | rien d'autre du projet                      | `systems`, `data`, `game`, three.js, le navigateur |
| `src/sim/systems/*` | `core`, `data`                              | **un autre système**, `game`, three.js             |
| `src/data`          | les **types** de `core`                     | `systems`, `game`                                  |
| `src/game`          | `core`, `systems` (leur `index.ts`), `data` | l'intérieur d'un module (voir 3)                   |
| `src/net` (V2)      | `core`                                      | `game`                                             |
| `worker/`           | `core`, `systems`, `data` (pour la coop)    | `game`, three.js                                   |

Ces règles sont **vérifiées automatiquement** (section 11) : une PR qui les enfreint ne passe pas.

## 3. Le module : la brique de base

Un **module** est un **dossier** qui fait **une seule chose** et expose **une seule porte d'entrée** : son `index.ts`.

```
src/sim/systems/wanted/          ← le module « recherche de police »
  index.ts                       ← LA porte d'entrée : ce que les autres ont le droit d'utiliser
  wantedSystem.ts                ← le système (enregistré dans le noyau)
  wantedLevel.ts                 ← logique interne (calcul du niveau)
  policeSpawner.ts               ← logique interne (apparition des agents)
  types.ts                       ← les types propres au module
  wantedSystem.test.ts           ← les tests du module
  README.md                      ← à quoi sert le module, ce qu'il lit, écrit, émet et écoute
```

**Les règles du module**

1. **On n'importe que par l'`index.ts`.** `import { wantedSystem } from '../wanted'` ✅, `import { computeLevel } from '../wanted/wantedLevel'` ❌.
   L'intérieur d'un module peut être réorganisé librement sans casser personne.
2. **L'`index.ts` n'exporte que le nécessaire** : le système, ses types publics, éventuellement quelques fonctions de lecture (`getWantedLevel`).
3. **Un module a son `README.md`** court, avec cette fiche :

```markdown
# wanted : la recherche de police

Fait monter et descendre la jauge de recherche du joueur, et fait apparaître la police.

- **Lit** : composants `position`, `wanted` ; événements `crime:witnessed`
- **Écrit** : composant `wanted`, entités de police
- **Émet** : `wanted:level-changed`, `wanted:lost`
- **Réglages** : `TUNING.wanted`
- **Dépend de** : core uniquement
```

4. **Un module se teste seul** : ses tests créent un petit monde avec `createTestWorld()` (fourni par `core`) et n'ont besoin d'aucun autre système.
5. **Un module fait moins de ~500 lignes au total.** Au-delà, il fait sans doute deux choses : le découper.

## 4. Le noyau (`core`)

Le noyau fournit le « plateau LEGO » sur lequel tout s'emboîte. Il est **petit, stable, très testé**.

```
src/sim/core/
  index.ts         la porte d'entrée
  world.ts         World : l'état complet du jeu, createWorld(), createTestWorld()
  entities.ts      créer, supprimer, retrouver des entités ; requêtes par composants
  components.ts    la liste des types de composants (section 6)
  system.ts        le contrat System et l'ordre d'exécution
  events.ts        le bus d'événements typé (section 7)
  commands.ts      les commandes des joueurs
  registry.ts      les registres de contenus (section 8)
  rng.ts           le hasard déterministe
  config.ts        TUNING : les réglages
  step.ts          createSimulation(world, systems) : prépare les systèmes ; simulation.step(commands) fait avancer le monde d'un pas
```

**Modifier `core` est exceptionnel.** Ça se fait dans une **PR dédiée**, relue par les deux, avec une ligne dans `decisions.md`.
Ajouter un **type de composant**, d'**événement** ou de **commande** est le seul changement courant : ce sont des ajouts, pas des modifications.

## 5. Les systèmes

Un **système** est une brique de règles du jeu : il s'exécute à chaque pas de simulation.

### Le contrat

Tout système respecte la même forme :

```ts
// src/sim/core/system.ts
export interface System {
  id: string // identifiant unique, en kebab-case : 'wanted'
  order: number // ordre d'exécution (voir le tableau ci-dessous)
  init?(world: World): void // une fois, à la création du monde
  step(world: World, dt: number): void // à chaque pas
}
```

```ts
// src/sim/systems/wanted/wantedSystem.ts
export const wantedSystem: System = {
  id: 'wanted',
  order: SYSTEM_ORDER.rules,
  init(world) {
    world.events.on('crime:witnessed', (e) => raiseWanted(world, e))
  },
  step(world, dt) {
    decayWanted(world, dt)
    spawnPolice(world)
  },
}
```

### L'enregistrement : une ligne

```ts
// src/sim/systems/index.ts : la SEULE liste de tous les systèmes du jeu
export const SYSTEMS: System[] = [
  inputSystem,
  movementSystem,
  drivingSystem,
  collisionSystem,
  pedestrianSystem,
  wantedSystem, // ← ajouter la police = ajouter cette ligne
  missionSystem,
]
```

Le noyau trie la liste par `order` et appelle chaque système. **Retirer une ligne désactive la brique sans rien casser** (pratique pour chercher un bug).

### L'ordre d'exécution

| `SYSTEM_ORDER` | Valeur | Rôle                                    | Exemples                          |
| -------------- | ------ | --------------------------------------- | --------------------------------- |
| `input`        | 100    | appliquer les commandes des joueurs     | input                             |
| `ai`           | 200    | décisions des PNJ                       | pedestrians, traffic, police-ai   |
| `physics`      | 300    | déplacements                            | walking, driving                  |
| `collision`    | 350    | collisions, après tous les déplacements | collision                         |
| `rules`        | 400    | règles du jeu                           | wanted, damage, missions, economy |
| `cleanup`      | 900    | nettoyage                               | despawn, events flush             |

Deux systèmes dans la même tranche ne doivent pas dépendre l'un de l'autre.

## 6. Les entités et leurs composants

Une **entité** (joueur, voiture, piéton, poubelle…) est **un identifiant et des composants**.
Un **composant** est un **petit paquet de données sans logique**. Un système agit sur toutes les entités qui ont les composants qui l'intéressent.

```ts
// une voiture garée
{
  id: 42,
  kind: 'vehicle',
  position: { x: 320, y: 128, angle: 0 },
  body: { width: 32, height: 64, mass: 1200 },
  vehicle: { modelId: 'mamie-car', speed: 0, damage: 0 },
  sprite: { key: 'mamie-car' },
}
```

| Composant          | Données                                  | Utilisé par       |
| ------------------ | ---------------------------------------- | ----------------- |
| `position`         | x, y, angle                              | presque tout      |
| `velocity`         | vx, vy                                   | movement, driving |
| `body`             | taille, masse, solide ou non             | collision         |
| `health`           | points de vie                            | damage            |
| `driver`           | véhicule conduit, corps mis de côté      | driving           |
| `vehicle`          | modèle, cap (vecteur), conducteur        | driving, traffic  |
| `pedestrian`       | type, état d'IA, humeur                  | pedestrians       |
| `wanted`           | niveau, minuteur                         | wanted            |
| `interactable`     | action proposée (« monter », « parler ») | input, hud        |
| `sprite`           | clé d'affichage                          | game uniquement   |
| `lastFreePosition` | dernière position hors des murs          | collision         |

**Pourquoi c'est LEGO** : pour rendre une poubelle destructible, on lui **ajoute** le composant `health`. Le système de dégâts s'en occupe tout seul, sans une ligne de code en plus.

**Règles**

- Un composant contient **des données simples** (nombres, textes, identifiants), **jamais de fonction ni d'objet d'affichage (three.js)**. Ainsi l'état complet se sauvegarde et s'envoie sur le réseau tel quel.
- Une entité référence une autre entité **par son `id`**, jamais par un pointeur direct.
- Les types de composants sont déclarés dans `core/components.ts`. En ajouter un est un **ajout** permis.

## 7. Les événements : comment les briques se parlent

Les systèmes ne s'importent **jamais** entre eux. Pour réagir à ce qui se passe ailleurs, ils passent par le **bus d'événements**.

```ts
// le système de conduite annonce un choc
world.events.emit('vehicle:crashed', { vehicleId: 42, speed: 180, targetId: 7 })

// le système de dégâts réagit, sans connaître la conduite
world.events.on('vehicle:crashed', (e) => applyCrashDamage(world, e))

// le système de recherche aussi, s'il y a un témoin
world.events.on('vehicle:crashed', (e) => maybeReportCrime(world, e))

// côté affichage : étincelles et bruit de tôle
events.on('vehicle:crashed', (e) => fx.play('sparks', e))
```

**Le catalogue des événements** est **un seul fichier typé**, `core/events.ts` : nom, données transportées, qui l'émet.

```ts
export interface GameEvents {
  'vehicle:crashed': { vehicleId: EntityId; speed: number; targetId?: EntityId }
  'vehicle:entered': { vehicleId: EntityId; driverId: EntityId }
  'crime:witnessed': { crime: CrimeType; position: Vec2; witnessId: EntityId }
  'wanted:level-changed': { level: number; previous: number }
  'mission:completed': { missionId: string; reward: number }
}
```

**Règles**

- Un événement décrit **un fait passé** (`vehicle:crashed`), pas un ordre (`damage-vehicle`).
- Les données d'un événement sont **simples** et **suffisantes** : l'écouteur ne doit pas avoir à fouiller dans un autre module.
- Un écouteur ne doit **pas supposer** qu'un autre écouteur existe : chaque brique fonctionne seule.
- Le nouvel événement est ajouté au catalogue, et à la fiche `README.md` du module qui l'émet.

## 8. Les contenus en données (registres)

Tout ce qui est **du contenu** (véhicules, missions, types de piétons, objets, répliques, boutiques) vit dans `src/data/`,
sous forme de **données**, et est enregistré dans un **registre** du noyau.

```ts
// src/data/vehicles/mamieCar.ts
export const mamieCar: VehicleDef = {
  id: 'mamie-car',
  name: 'La Mamie',
  sprite: 'mamie-car',
  size: { width: 32, height: 64 },
  maxSpeed: 140,
  acceleration: 0.6,
  grip: 0.9,
  mass: 900,
}

// src/data/vehicles/index.ts : la liste des véhicules du jeu
export const VEHICLES: VehicleDef[] = [mamieCar, deliveryVan, sportsCar, golfCart]
```

**Ajouter une voiture = un fichier de données + une ligne dans la liste.** Aucun système n'est modifié.

**Règles**

- Chaque contenu a un **`id` unique** en kebab-case ; le code le référence **par cet `id`**.
- Chaque type de contenu a son **type TypeScript** (`VehicleDef`, `MissionDef`, `PropDef`…) dans `core/registry.ts`, et une **fonction de validation**
  lancée par les tests : ids en double, référence vers un sprite ou un id inexistant, valeur hors bornes → le test échoue.
- Les nombres d'équilibrage **propres à un contenu** vont dans ses données ; les réglages **généraux** vont dans `TUNING`.

### Une brique qui a du contenu : le registre en paramètre

Quand le comportement d'une brique dépend de contenus (ici les types de PNJ), la brique **ne connaît aucun contenu par son nom** et ne les importe pas :
`SYSTEMS` lui passe le **registre** quand il la crée.

```ts
// src/sim/systems/index.ts
export const SYSTEMS: System[] = [walkingSystem, drivingSystem, collisionSystem, createPedestriansSystem(NPC_TYPE_REGISTRY)]
```

Ajouter un type de PNJ = un fichier dans `src/data/npcTypes` + une ligne dans sa liste ; la brique `pedestrians` n'est pas touchée.
Pour que l'admin puisse les éditer, un contenu est du **JSON pur** : nombres, textes et listes, **aucune fonction**.
Ce qui est purement visuel (couleurs, accessoire, taille) vit dans une **recette** du contenu (`look`) ; l'affichage en tire l'apparence de chaque instance d'après son id,
sans rien demander à la simulation.

## 9. L'affichage, les entrées et le son

L'affichage utilise **three.js** et suit **les mêmes principes LEGO** (décision : [decisions.md](decisions.md)).

**Le rendu pixel art** : la ville est construite en vraie 3D, **dessinée en basse résolution** (1 pixel de scène = 3 pixels d'écran)
puis agrandie sans lissage. Toutes les textures sont réglées « pixel net » (`pixelTexture()`), et la caméra est **calée sur la grille de pixels**
pour que la ville ne « nage » pas quand elle bouge.

- **Modules d'affichage** (`src/game/render/`) : un module par sujet (`ground`, `buildings`, `decor`, `actors`, `lighting`, `camera`), créé par une fonction
  `create<Nom>()` qui renvoie un objet avec ses méthodes (`update()`…). Ils lisent l'état du monde et dessinent. **Ils ne modifient jamais l'état du monde.**
- **Règles pures** à part : ce qu'on dessine (où poser un passage piéton, une fenêtre, un arbre) est calculé par des fonctions sans three.js
  (`groundLayout`, `buildingBlocks`, `facadeLayout`, `decor/placeDecor`), **testées dans Node**. Le module three.js ne fait que les afficher.
- **Interpolation** : la simulation avance à 30 pas par seconde ; l'affichage retient l'état d'avant chaque pas et dessine entre les deux (`actors.rememberStates()`).
- **Lumières** : une **réserve fixe** de lumières, déplacées d'une image à l'autre (three.js recompile ses shaders si on en ajoute ou en retire en jeu).
- **Effets et sons** : ils **écoutent les événements** (`vehicle:crashed` → étincelles + son). Ajouter un effet ne touche ni la simulation ni les autres effets.
- **Entrées** : chaque périphérique (clavier, manette, tactile) est une brique qui produit des **commandes** ; la simulation ne sait pas d'où elles viennent.
  Le clavier lit la **position physique** des touches (ZQSD = WASD).
- **Interface (HUD)** : en **HTML et CSS** par-dessus la scène (texte net à toutes les tailles) ; chaque widget (santé, argent, recherche, mini-carte) lit l'état.

## 10. Recettes : ajouter une brique

### Ajouter un système (exemple : la météo)

1. Créer `src/sim/systems/weather/` avec `index.ts`, `weatherSystem.ts`, `weatherSystem.test.ts`, `README.md`.
2. Si besoin : ajouter un composant ou un événement (`weather:changed`) au noyau, et des réglages `TUNING.weather`.
3. Ajouter `weatherSystem` à la liste `SYSTEMS`.
4. Côté affichage : un effet qui écoute `weather:changed`.
5. **Aucun autre système n'est modifié.** Si on a envie d'en modifier un, c'est qu'il faut un événement à la place.

### Ajouter un véhicule

1. Générer les visuels selon [style.md](style.md).
2. Créer `src/data/vehicles/<nom>.ts` et l'ajouter à `VEHICLES`.
3. `npm test` vérifie l'id, le sprite et les bornes.

### Ajouter une mission

1. Écrire la mission en données dans `src/data/missions/` (format dans `docs/missions.md`).
2. L'ajouter à la liste `MISSIONS`.
3. Si elle a besoin d'un **nouveau type d'objectif** : l'ajouter au module `missions`, comme une brique d'objectif enregistrée dans son registre interne.

### Ajouter un type d'objet interactif

1. Données dans `src/data/props/`, avec les composants voulus (`health` pour le rendre destructible, `interactable` pour l'utiliser).
2. Si l'interaction est nouvelle : une commande ou un événement, et un petit système qui s'en occupe.

### Avant d'ouvrir la PR : le test LEGO

- [ ] Ma brique est dans **son propre dossier**, avec son `index.ts`, ses tests et son `README.md`.
- [ ] Je n'ai **modifié aucun autre système** ; seulement **ajouté** (une ligne de registre, un événement, un composant, un réglage).
- [ ] Si je retire ma ligne d'enregistrement, **le jeu fonctionne toujours**.
- [ ] Mes tests passent **sans les autres systèmes**.

Si une case ne peut pas être cochée, l'expliquer dans la PR.

## 11. Les garde-fous automatiques

À mettre en place avec le socle (issue #2), pour que les règles ne reposent pas sur la mémoire :

| Outil                                                                                 | Ce qu'il vérifie                                                                                                               | Commande               |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| **ESLint** + règles d'imports (`no-restricted-imports` ou `eslint-plugin-boundaries`) | le sens des dépendances (section 2), les imports uniquement par `index.ts`, pas de three.js ni de `Math.random` dans `src/sim` | `npm run lint`         |
| **madge**                                                                             | aucune dépendance circulaire                                                                                                   | `npm run check:cycles` |
| **TypeScript strict**                                                                 | les types des composants, événements et contenus                                                                               | `npm run build`        |
| **Tests de registres**                                                                | ids uniques, références valides, bornes                                                                                        | `npm test`             |
| **Test de déterminisme**                                                              | même graine + mêmes commandes = même monde                                                                                     | `npm test`             |

Une GitHub Action lancera `lint`, `check:cycles`, `test` et `build` sur chaque PR : **une PR rouge ne se merge pas.**

## 12. Ce qui est interdit

- Un système qui **importe un autre système**.
- Importer **l'intérieur** d'un module au lieu de son `index.ts`.
- Une **dépendance circulaire**.
- **three.js, le DOM, `Math.random()` ou `Date.now()`** dans `src/sim`.
- Une **variable globale** ou un singleton qui garde de l'état hors de `World`.
- Une **fonction ou un objet three.js dans un composant**.
- **Modifier le noyau** pour ajouter du contenu, ou sans PR dédiée.
- Un **`if (id === 'mamie-car')`** dans un système : le comportement particulier d'un contenu passe par ses données.
- Un renderer, un effet ou un widget qui **modifie l'état** du monde.
