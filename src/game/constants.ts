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

/** Couleur provisoire de chaque modèle de véhicule (id de src/data/vehicles), d'après la bible visuelle, en attendant les sprites (#4). */
export const VEHICLE_COLORS: Readonly<Record<string, number>> = {
  'mamie-car': 0x8ed4b4, // vert menthe pastel
  'delivery-van': 0xf2efe6, // blanc
  'sports-car': 0xffd23f, // jaune vif
}

/** Couleur d'un véhicule dont le modèle n'a pas (encore) de couleur. */
export const MISSING_VEHICLE_COLOR = 0xff6fa8

/** Pare-brise : il montre où est l'avant de la voiture. */
export const WINDSHIELD_COLOR = 0x3e4152

/** Au volant, la caméra regarde devant la voiture : de combien de secondes de trajet, et au plus de combien de pixels. */
export const CAMERA_LOOKAHEAD_SECONDS = 0.3
export const CAMERA_LOOKAHEAD_MAX_PX = 110
/** Vitesse à laquelle la caméra rejoint ce point d'avance (plus grand = plus vif). */
export const CAMERA_LOOKAHEAD_SMOOTHING = 3

/** Relief des immeubles (essai #26) : hauteur de la caméra au-dessus de la ville, en px. Plus bas = façades plus penchées. */
export const RELIEF_EYE_HEIGHT_PX = 420
/** Ombre portée des immeubles : décalage par pixel de hauteur (soleil en haut à gauche, docs/style.md), couleur et opacité. */
export const SHADOW_OFFSET_PER_PX = { x: 0.55, y: 0.35 }
export const SHADOW_COLOR = 0x3a2f5b
export const SHADOW_ALPHA = 0.45
/** Teinte des façades selon leur côté (multiplie la couleur du toit) : le côté au soleil est plus clair. */
export const WALL_SHADES = { north: 0.62, south: 0.82, west: 0.9, east: 0.7 } as const
