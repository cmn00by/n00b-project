# core : le noyau de la simulation

Le « plateau LEGO » sur lequel toutes les briques s'emboîtent. Petit, stable, très testé. Plan complet : [docs/architecture.md](../../../docs/architecture.md), sections 4 à 8.

| Fichier         | Rôle                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `rng.ts`        | `createRng(seed)` : le hasard déterministe (jamais `Math.random()`)                                                                   |
| `config.ts`     | `TUNING` (réglages groupés par module), `STEPS_PER_SECOND`, `STEP_SECONDS`                                                            |
| `components.ts` | les types de composants (`position`, `velocity`, `body`, `sprite`, `lastFreePosition`, `vehicle`, `driver`, `pedestrian`) et `Entity` |
| `world.ts`      | `World` (l'état complet, dont la carte `map`), `createWorld(seed)`, `createTestWorld()`, `loadMap()`                                  |
| `space.ts`      | `isSpaceClear`, `findSolidOverlaps` : un endroit est-il libre de murs et d'entités solides ?                                          |
| `map.ts`        | `MapDef` (carte en données), `TileMap` (grille), `createTileMap`, `validateMapDef`, `isSolidTile`, `isAreaFree`, `getTileCenter`      |
| `npcType.ts`    | `NpcTypeDef` (fiche d'un type de PNJ, données pures pour le futur panneau admin), `validateNpcTypeDef`                                |
| `entities.ts`   | `spawnEntity`, `despawnEntity`, `findEntity`, `getEntity`, `findEntitiesWith`                                                         |
| `events.ts`     | le bus d'événements typé et le catalogue `GameEvents`                                                                                 |
| `commands.ts`   | le catalogue `GameCommands` (`player:move`…) et `findCommands`                                                                        |
| `registry.ts`   | `createRegistry` et `validateDefs` pour les contenus en données                                                                       |
| `system.ts`     | le contrat `System`, `SYSTEM_ORDER`, `sortSystems`, `validateSystems`                                                                 |
| `step.ts`       | `createSimulation(world, systems)` : prépare les systèmes, puis `simulation.step(commands)`                                           |
| `index.ts`      | la seule porte d'entrée : les autres modules n'importent que `core`, jamais un fichier interne                                        |

## Ajouter sans modifier

Les seuls changements courants du noyau sont des **ajouts** : un type de composant (`components.ts`), un événement (`GameEvents`), une commande (`GameCommands`), un réglage (`TUNING`).
Modifier le reste se fait dans une **PR dédiée**, relue par les deux, avec une ligne dans [docs/decisions.md](../../../docs/decisions.md).

## Règles (vérifiées par `npm run lint`)

- n'importe **rien** d'autre du projet (ni `systems`, ni `data`, ni `game`) ;
- pas de three.js, pas de navigateur, pas de `Math.random()` ni de `Date.now()` ;
- `Math.sqrt` plutôt que `Math.hypot`, et pas de `Math.atan2`, `sin` ou `cos` dont la dernière décimale peut changer d'un navigateur à l'autre : le résultat doit être identique partout (coop) ;
- les autres modules l'importent **uniquement** par `core/index.ts`.
