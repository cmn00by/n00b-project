// Toutes les clés d'assets du jeu, déclarées à un seul endroit (docs/conventions.md, section 12).
// Expose : TILE_TEXTURES, ROOF_TEXTURES, PROP_TEXTURES et leurs types. Le chargement est dans render/textures.ts.
// Les images viennent de public/assets (générées selon docs/style.md, voir docs/registre-visuels.md).
/** Les textures de sol, 32 × 32 px (public/assets/tiles). */
export const TILE_TEXTURES = [
  'asphalte',
  'asphalte-tirets',
  'asphalte-ligne-jaune',
  'passage-pieton',
  'trottoir',
  'trottoir-bordure',
  'herbe',
  'herbe-fleurs',
  'paves',
  'sable',
  'eau',
  'ponton',
  'gravier',
  'terre',
  'parking',
  'plaque-egout',
] as const

/** Les toits vus de dessus, 64 × 64 px, étirés sur chaque immeuble (public/assets/roofs). */
export const ROOF_TEXTURES = [
  'tuiles-rouges',
  'ardoise',
  'zinc',
  'beton-clim',
  'gravier-ventilation',
  'jardin',
  'piscine',
  'panneaux-solaires',
  'verrieres',
  'goudron-cheminee',
  'terrasse-barbecue',
  'tuiles-roses',
  'chateau-eau',
  'verre',
  'paraboles',
  'linge',
] as const

/** La déco des rues et des parcs (public/assets/props). */
export const PROP_TEXTURES = [
  'arbre',
  'arbre-automne',
  'palmier',
  'buisson',
  'parterre',
  'banc',
  'lampadaire',
  'poubelle',
  'fontaine',
  'table-pique-nique',
  'parasol',
  'bouche-incendie',
  'cone',
  'rocher',
  'haie',
  'plante',
] as const

export type TileTexture = (typeof TILE_TEXTURES)[number]
export type RoofTexture = (typeof ROOF_TEXTURES)[number]
export type PropTexture = (typeof PROP_TEXTURES)[number]
