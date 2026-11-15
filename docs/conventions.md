# Conventions de nommage

Un nom bien choisi évite de lire le code pour comprendre ce qu'il fait.
Ce document fixe **une seule façon de nommer chaque chose**. Quand on hésite, on suit l'exemple le plus proche ici.

La structure des modules est décrite dans [architecture.md](architecture.md), le nommage des visuels dans [style.md](style.md#9-nommage-et-rangement).

## Sommaire

1. [La langue](#1-la-langue)
2. [Le tableau récapitulatif](#2-le-tableau-récapitulatif)
3. [Dossiers et fichiers](#3-dossiers-et-fichiers)
4. [Fonctions](#4-fonctions)
5. [Variables et paramètres](#5-variables-et-paramètres)
6. [Types](#6-types)
7. [Constantes et réglages](#7-constantes-et-réglages)
8. [Identifiants de contenu](#8-identifiants-de-contenu)
9. [Événements et commandes](#9-événements-et-commandes)
10. [Systèmes, composants, renderers](#10-systèmes-composants-renderers)
11. [Tests](#11-tests)
12. [Phaser](#12-phaser)
13. [Les mots du jeu (glossaire)](#13-les-mots-du-jeu-glossaire)

---

## 1. La langue

| Quoi                                                                              | Langue                         | Exemple                                        |
| --------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------- |
| **Code** : noms de fichiers de code, fonctions, variables, types, événements, ids | **anglais**                    | `wantedSystem`, `vehicle:crashed`, `mamie-car` |
| **Commentaires** du code                                                          | **français**                   | `// le joueur garde 3 frames d'invincibilité`  |
| **Textes affichés** au joueur                                                     | **français**, dans `src/data/` | `name: 'La Mamie'`                             |
| **Docs**, issues, PR, commits                                                     | **français**                   | `feat: ajoute la police`                       |
| **Fichiers d'assets**                                                             | **français**, sans accent      | `poubelle-casse.png` (voir `style.md`)         |

**Pourquoi l'anglais dans le code** : Phaser, TypeScript et toutes les docs techniques sont en anglais ; un mélange `getVitesse()` est plus dur à lire.
On utilise **le glossaire** (section 13) pour toujours traduire un mot du jeu de la même façon.

## 2. Le tableau récapitulatif

| Élément                             | Style                                      | Exemple                                        |
| ----------------------------------- | ------------------------------------------ | ---------------------------------------------- |
| Dossier                             | `camelCase`                                | `systems/`, `wanted/`, `npcTypes/`             |
| Fichier de code (module, fonctions) | `camelCase.ts`                             | `wantedLevel.ts`, `rng.ts`                     |
| Fichier qui exporte **une** classe  | `PascalCase.ts`                            | `CityScene.ts`                                 |
| Fichier de test                     | `<fichier>.test.ts` à côté du code         | `wantedLevel.test.ts`                          |
| Fonction                            | `camelCase`, **commence par un verbe**     | `computeWantedLevel()`                         |
| Variable, paramètre                 | `camelCase`, **un nom**                    | `maxSpeed`, `vehicleId`                        |
| Booléen                             | `is` / `has` / `can` / `should` + adjectif | `isDriving`, `hasKey`, `canEnter`              |
| Type, interface, classe             | `PascalCase`                               | `VehicleDef`, `World`                          |
| Type d'union de textes              | `PascalCase`, valeurs en `kebab-case`      | `type Mood = 'calm' \| 'scared' \| 'angry'`    |
| Constante globale                   | `UPPER_SNAKE_CASE`                         | `TILE_SIZE`, `SYSTEM_ORDER`                    |
| Liste de registre                   | `UPPER_SNAKE_CASE` au pluriel              | `VEHICLES`, `MISSIONS`                         |
| Clé de `TUNING`                     | `camelCase`, groupée par module            | `TUNING.wanted.decayPerSecond`                 |
| Id de contenu                       | `kebab-case`                               | `'mamie-car'`, `'livraison-pizza'`             |
| Événement                           | `'domaine:fait-au-passe'`                  | `'vehicle:crashed'`                            |
| Commande                            | `'domaine:verbe'`                          | `'vehicle:enter'`                              |
| Système                             | `<nom>System`                              | `drivingSystem`                                |
| Renderer                            | `<nom>Renderer`                            | `vehicleRenderer`                              |
| Scène Phaser                        | `<Nom>Scene`                               | `CityScene`, `HudScene`                        |
| Clé d'asset                         | nom du fichier sans extension              | `'mamie-car-abime'`                            |
| Branche Git                         | `<type>/<n°issue>-<description>`           | `feature/7-deplacement-a-pied` (voir `git.md`) |

## 3. Dossiers et fichiers

- **Un fichier = une responsabilité**, et son nom la dit : `policeSpawner.ts` fait apparaître la police, rien d'autre.
- **Pas de fichiers fourre-tout** : `utils.ts`, `helpers.ts`, `misc.ts`, `stuff.ts` sont interdits. Une fonction utile à plusieurs modules va dans `core/` avec un nom précis (`core/math/vec2.ts`).
- **Pas de répétition du dossier dans le nom** : `wanted/level.ts` plutôt que `wanted/wantedLevel.ts` est accepté, mais **le fichier principal** porte le nom complet pour être trouvable : `wanted/wantedSystem.ts`.
- **`index.ts`** ne contient **que des exports** (pas de logique).
- Pluriel pour un dossier qui **contient plusieurs choses du même genre** : `systems/`, `vehicles/`, `missions/`. Singulier pour un module : `wanted/`, `driving/`.

## 4. Fonctions

Une fonction **commence par un verbe** qui dit ce qu'elle fait. Les verbes ont **un sens fixe** dans tout le projet :

| Verbe                   | Sens                                                  | Effet sur l'état   | Exemple                                   |
| ----------------------- | ----------------------------------------------------- | ------------------ | ----------------------------------------- |
| `create…`               | fabrique et renvoie un nouvel objet                   | aucun              | `createWorld()`, `createVehicle(def)`     |
| `spawn…`                | crée une entité **dans le monde**                     | ajoute             | `spawnPedestrian(world, pos)`             |
| `despawn…` / `remove…`  | retire une entité du monde                            | retire             | `despawnFarEntities(world)`               |
| `get…`                  | lit une valeur **qui existe**, rapide                 | aucun              | `getVehicle(world, id)`                   |
| `find…`                 | cherche, **peut ne rien trouver** (`undefined`)       | aucun              | `findNearestCar(world, pos)`              |
| `compute…`              | calcule une valeur (souvent coûteux)                  | aucun              | `computeWantedLevel(heat)`                |
| `is…` / `has…` / `can…` | répond oui ou non                                     | aucun              | `canEnterVehicle(world, playerId, carId)` |
| `set…`                  | remplace une valeur                                   | modifie            | `setWantedLevel(world, 2)`                |
| `update…`               | fait évoluer selon le temps                           | modifie            | `updateTraffic(world, dt)`                |
| `apply…`                | applique un effet                                     | modifie            | `applyDamage(world, id, 20)`              |
| `try…`                  | tente une action **du joueur**, renvoie `{ ok, why }` | modifie si réussi  | `tryEnterVehicle(world, playerId)`        |
| `handle…`               | réagit à un événement                                 | selon              | `handleCrash(world, event)`               |
| `load…` / `save…`       | lit / écrit un stockage                               | I/O                | `loadSave(slot)`                          |
| `validate…`             | vérifie des données, renvoie les erreurs              | aucun              | `validateVehicles(VEHICLES)`              |
| `to…` / `from…`         | convertit                                             | aucun              | `toTileCoords(pos)`                       |
| `draw…` / `render…`     | affiche (côté `game` uniquement)                      | aucun sur le monde | `drawMinimap(scene, world)`               |

**Règles**

- **Les fonctions de lecture** (`get`, `find`, `compute`, `is`, `can`) **ne modifient jamais rien**.
- **Les fonctions de la simulation reçoivent `world` en premier paramètre** : `applyDamage(world, id, amount)`.
- Au-delà de **3 paramètres**, passer un objet : `spawnVehicle(world, { modelId, position, color })`.
- Pas d'abréviations, sauf celles de la liste : `id`, `pos` (position), `dt` (delta de temps), `rng`, `fx`, `npc`, `ui`, `hud`, `max`, `min`.

## 5. Variables et paramètres

- Un **nom**, pas un verbe : `speed`, `nearestCar`, `missionReward`.
- **L'unité dans le nom** quand ce n'est pas évident : `durationSeconds`, `distancePx`, `angleRad`, `cooldownSteps`.
- Les identifiants d'entité finissent par `Id` : `vehicleId`, `driverId`. L'entité elle-même n'a pas de suffixe : `vehicle`.
- Les listes au **pluriel** : `pedestrians`, `vehicleIds`.
- Les dictionnaires disent **ce qui mène à quoi** : `spriteByModelId`, `rewardByMission`.
- Les booléens se lisent comme une question : `isVisible`, `hasWitness`, pas `visible` ni `witness`.

## 6. Types

- `PascalCase`, **sans préfixe** `I` ni `T` : `World`, pas `IWorld`.
- Les définitions de contenu (ce qui est dans `src/data`) finissent par **`Def`** : `VehicleDef`, `MissionDef`, `NpcTypeDef`.
- Les composants portent le **nom du composant** en `PascalCase` : composant `wanted` → type `Wanted`.
- Les données d'un événement : `<Nom>Event` si on doit les nommer : `VehicleCrashedEvent`.
- Les ids typés pour éviter les mélanges : `type EntityId = number`, `type VehicleModelId = string`.
- Préférer les **unions de textes** aux `enum` : `type Mood = 'calm' | 'scared' | 'angry'`.

## 7. Constantes et réglages

- Constante **fixe** du programme : `UPPER_SNAKE_CASE`, dans le module qui l'utilise ou dans `core` : `TILE_SIZE = 32`, `STEPS_PER_SECOND = 30`.
- **Réglage d'équilibrage** (qu'on voudra ajuster) : **dans `TUNING`**, jamais en constante éparpillée.
- `TUNING` est **groupé par module**, avec le **même nom que le dossier du module**, et chaque valeur est commentée avec son unité :

```ts
export const TUNING = {
  walking: {
    walkSpeed: 60, // px par seconde
    runSpeed: 110, // px par seconde
  },
  wanted: {
    decayPerSecond: 0.05, // points de recherche perdus par seconde hors de vue
    levelThresholds: [1, 3, 6],
  },
}
```

## 8. Identifiants de contenu

- `kebab-case`, en **français** quand c'est un nom propre au jeu, sans accent : `'mamie-car'`, `'livraison-pizza'`, `'gege-docker'`.
- **Un id ne change jamais** une fois dans une sauvegarde (il sert à la relire). Pour renommer : ajouter une migration.
- Le **fichier de données** porte le nom de l'id en `camelCase` : `'livraison-pizza'` → `livraisonPizza.ts`.
- Le **visuel** associé reprend l'id : `mamie-car.png`, `gege-docker-fache.png`.

## 9. Événements et commandes

|              | Événement                                                            | Commande                                                 |
| ------------ | -------------------------------------------------------------------- | -------------------------------------------------------- |
| Ce que c'est | **un fait** qui vient d'arriver                                      | **une demande** d'un joueur                              |
| Forme        | `'domaine:fait-au-passe'`                                            | `'domaine:verbe'`                                        |
| Exemples     | `'vehicle:crashed'`, `'mission:completed'`, `'wanted:level-changed'` | `'vehicle:enter'`, `'player:punch'`, `'player:interact'` |
| Déclaré dans | `core/events.ts`                                                     | `core/commands.ts`                                       |

- Le **domaine** est le nom du module ou de l'entité concernée, au singulier : `vehicle`, `player`, `mission`, `wanted`, `crime`.
- Le fait est en anglais, au **participe passé**, en `kebab-case` : `crashed`, `level-changed`, `entered`.

## 10. Systèmes, composants, renderers

| Élément              | Nom                     | Fichier                               | Exemple                               |
| -------------------- | ----------------------- | ------------------------------------- | ------------------------------------- |
| Module de simulation | nom du domaine          | `src/sim/systems/<nom>/`              | `wanted/`                             |
| Système              | `<nom>System`           | `<nom>System.ts`                      | `wantedSystem` dans `wantedSystem.ts` |
| Id du système        | `'<nom>'` en kebab-case |                                       | `id: 'wanted'`                        |
| Composant            | nom court au singulier  | déclaré dans `core/components.ts`     | `wanted`, `vehicle`, `health`         |
| Renderer             | `<entité>Renderer`      | `src/game/render/<entité>Renderer.ts` | `vehicleRenderer`                     |
| Effet visuel         | `<nom>Fx`               | `src/game/fx/<nom>Fx.ts`              | `sparksFx`                            |
| Widget d'interface   | `<Nom>Widget`           | `src/game/hud/<Nom>Widget.ts`         | `WantedWidget`                        |

## 11. Tests

- Le fichier de test est **à côté** du fichier testé : `wantedLevel.ts` → `wantedLevel.test.ts`.
- `describe` porte le nom de la fonction ou du système ; `it` est **une phrase en français** qui décrit le comportement :

```ts
describe('computeWantedLevel', () => {
  it('passe au niveau 2 après trois délits vus', () => { ... })
  it('ne descend jamais sous zéro', () => { ... })
})
```

- Les mondes de test viennent de `createTestWorld()` avec une **graine fixe**.

## 12. Phaser

- **Scènes** : `<Nom>Scene`, une scène = un rôle : `BootScene` (chargement), `CityScene` (le monde), `HudScene` (l'interface), `MenuScene`.
- **Clés d'assets** : le nom du fichier sans extension (`'mamie-car'`), déclarées **une seule fois** dans `src/game/assets.ts` (`ASSET_KEYS`).
  Jamais de chaîne `'mamie-car'` écrite à la main ailleurs.
- **Animations** : `'<clé>:<action>-<direction>'` : `'joueur:walk-down'`, `'gege-docker:idle-left'`.
- **Calques Tiled** : `kebab-case` en anglais, documentés dans `docs/carte.md` : `ground`, `collisions`, `spawns`, `roads`, `zones`.

## 13. Les mots du jeu (glossaire)

Pour qu'un même concept porte **toujours le même nom** dans le code. Ajouter un mot ici avant de l'utiliser.

| Dans le jeu (français)                | Dans le code (anglais)        | À ne **pas** utiliser                      |
| ------------------------------------- | ----------------------------- | ------------------------------------------ |
| Joueur                                | `player`                      | `hero`, `user`                             |
| Piéton (PNJ à pied)                   | `pedestrian`                  | `npc` pour un piéton, `civilian`, `walker` |
| PNJ (tout personnage non joueur)      | `npc`                         | `ai`, `bot`                                |
| Personnage nommé (donneur de mission) | `contact`                     | `quest giver`, `boss`                      |
| Véhicule                              | `vehicle`                     | `car` pour un véhicule en général          |
| Modèle de véhicule                    | `vehicleModel` (`VehicleDef`) | `carType`                                  |
| Conducteur                            | `driver`                      | `pilot`                                    |
| Trafic                                | `traffic`                     | `cars`                                     |
| Objet du décor                        | `prop`                        | `object`, `item`                           |
| Objet ramassable                      | `item`                        | `pickup`, `loot`                           |
| Recherche (police)                    | `wanted`                      | `heat`, `alert`                            |
| Délit                                 | `crime`                       | `offense`                                  |
| Mission                               | `mission`                     | `quest`, `job`                             |
| Objectif de mission                   | `objective`                   | `goal`, `task`                             |
| Quartier                              | `district`                    | `zone` (réservé aux zones Tiled), `area`   |
| Planque                               | `hideout`                     | `safehouse`, `base`                        |
| Argent                                | `money`                       | `cash`, `gold`                             |
| Réputation                            | `reputation`                  | `rep`, `respect`                           |
| Réplique d'un PNJ                     | `bark`                        | `line`, `shout`                            |
| Dialogue (avec portrait)              | `dialogue`                    | `conversation`, `talk`                     |
| Dégâts                                | `damage`                      | `dmg`, `hurt`                              |
| Santé                                 | `health`                      | `hp`, `life`                               |
| Pas de simulation                     | `step`                        | `tick`, `frame`                            |
| Réglages d'équilibrage                | `TUNING`                      | `config`, `settings`                       |
