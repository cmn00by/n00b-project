// Constantes d'affichage partagées par les scènes et les renderers.

/** Taille d'une case de la grille, en pixels (docs/style.md, section 2). */
export const TILE_SIZE = 32

/** Zoom de la caméra : toujours un entier pour que les pixels restent nets (docs/style.md : échelle ×2 ou ×3). */
export const CAMERA_ZOOM = 2

/** Graine de la partie. Fixe pendant le prototype pour que deux lancements donnent la même partie ; une graine variable viendra avec les nouvelles parties. */
export const GAME_SEED = 2026

/** Couleurs provisoires (formes de couleur du prototype), tirées de la palette de docs/style.md. */
export const COLORS = {
  player: 0xffd23f, // jaune : les couleurs vives sont réservées à ce qui doit attirer l'œil
  outline: 0x2b1e3a, // contour
  text: '#fff8ec', // blanc chaud
} as const

/** Couleur provisoire de chaque type de case (id de src/data/tileKinds), tirée de la palette, en attendant les tuiles (#4). */
export const TILE_COLORS: Readonly<Record<string, number>> = {
  road: 0x565a6e, // asphalte
  sidewalk: 0xbdb4a6, // béton
  grass: 0x5db65a, // herbe
  building: 0xc9533f, // tuile de toit
}

/** Couleur d'une case dont le type n'a pas (encore) de couleur : un rose voyant, pour qu'on la remarque. */
export const MISSING_TILE_COLOR = 0xff6fa8

/** Bordure des toits : un ton plus sombre, pour distinguer les bâtiments voisins. */
export const BUILDING_EDGE_COLOR = 0x9e3b33
