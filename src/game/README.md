# game : l'affichage (three.js) et les entrées

La ville est construite en **vraie 3D**, puis **dessinée en basse résolution** (1 pixel de scène = 3 pixels d'écran, touche P) et agrandie sans lissage :
tous les éléments partagent la même grille de pixels. Aucune règle de jeu ici : elles vivent dans `src/sim`. Voir [docs/architecture.md](../../docs/architecture.md), section 9.

Le point d'entrée est `src/main.ts` : il crée la simulation, l'affichage et la boucle de jeu (pas fixe + interpolation).

| Dossier / fichier                             | Rôle                                                                                                                                                                 |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `render/ground.ts`                            | le sol peint une fois dans une texture (règles : `groundLayout.ts`), l'eau animée dessous                                                                            |
| `render/buildings.ts`                         | les immeubles en boîtes : toit généré, façades dessinées par le code (`facadeLayout.ts`), fenêtres allumées la nuit ; blocs : `buildingBlocks.ts`                    |
| `render/decor.ts`                             | la déco en découpes debout, à l'échelle, ombres au sol, feuillage qui ondule, halos des lampadaires                                                                  |
| `render/actors.ts`                            | le joueur et les voitures en voxel, interpolés entre deux pas                                                                                                        |
| `render/pedestrianActors.ts`                  | les piétons en blocs, qui marchent, s'arrêtent, se retournent, avec la pastille « ! » de la fuite (modèle, pose, apparence : `pedestrian*.ts`)                       |
| `render/lighting.ts`                          | soleil et ombres dures, ciel, nuit, lampadaires proches en vraies lumières, phares                                                                                   |
| `render/camera.ts`                            | la caméra de biais, calée sur la grille de pixels (touche C : inclinaison)                                                                                           |
| `render/textures.ts`                          | le chargement des textures, toutes « pixel net » (`pixelTexture()`)                                                                                                  |
| `decor/`                                      | où poser la déco (`placeDecor`) et à quelle taille (`propStyles`, à l'échelle du jeu)                                                                                |
| `input/`                                      | clavier, doigts (`touchInput.ts`) ; touches → commandes (`moveCommand.ts`, `driveCommand.ts`)                                                                        |
| `assets.ts`                                   | la liste de toutes les textures                                                                                                                                      |
| `constants.ts`, `hash.ts`, `fixedStepLoop.ts` | constantes d'affichage, hasard d'affichage stable, boucle à pas fixe                                                                                                 |
| `hud/`                                        | l'interface en HTML/CSS par-dessus le jeu : le HUD (santé, recherche, argent : `hudModel.ts` testé, `hudView.ts`) et les commandes tactiles (`touchControlsView.ts`) |
| `fx/`                                         | à venir : effets (qui écoutent les événements)                                                                                                                       |

Les règles pures (`groundLayout`, `buildingBlocks`, `facadeLayout`, `placeDecor`, `moveCommand`, `driveCommand`, `fixedStepLoop`) sont **testées dans Node**.
