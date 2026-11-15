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
  gridLine: 0x3a2f5b, // ombre : lignes de repère du sol
  text: '#fff8ec', // blanc chaud
} as const
