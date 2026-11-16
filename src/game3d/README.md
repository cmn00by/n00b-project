# game3d : essai d'affichage en 3D (three.js), en pixel art

**Un essai**, sur la page `three.html`, à comparer avec le jeu Phaser (`index.html`). La simulation est **la même** : seules les briques d'affichage changent.

La scène est construite en vraie 3D, puis **dessinée en basse résolution** (1 pixel de scène = 3 pixels de fenêtre, touche P) et agrandie sans lissage :
tous les éléments partagent la même grille de pixels, quels que soient leur taille, leur rotation ou leur distance.

| Fichier                              | Rôle                                                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `main.ts`                            | point d'entrée : rendu basse résolution, simulation, boucle à pas fixe, touches N (nuit), C (caméra), P (pixels) |
| `textures3d.ts`                      | chargement des textures, réglées « pixel net »                                                                   |
| `camera3d.ts`                        | caméra de biais qui suit la cible, calée sur la grille de pixels (sinon la ville « nage »)                       |
| `ground3d.ts`                        | le sol peint une fois (mêmes règles que `game/render/groundLayout.ts`), l'eau animée dessous                     |
| `buildings3d.ts` + `facadeLayout.ts` | immeubles en boîtes : toit généré, façades dessinées par le code, fenêtres allumées la nuit                      |
| `decor3d.ts`                         | déco en découpes debout, à l'échelle (`game/decor`), ombres au sol, feuillage, halos des lampadaires             |
| `actors3d.ts`                        | joueur et voitures en style voxel, interpolés entre deux pas                                                     |
| `lighting3d.ts`                      | soleil et ombres dures, ciel, nuit, lampadaires proches en vraies lumières, phares                               |
| `keyboard3d.ts`                      | clavier par position physique (ZQSD = WASD)                                                                      |

Il réutilise les parties sans Phaser de `src/game` (règles du sol et de la déco, commandes, boucle à pas fixe, constantes).
