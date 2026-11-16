// Toutes les clés d'assets du jeu, déclarées à un seul endroit (docs/conventions.md, section 12).
// Expose : TILE_TEXTURES, ROOF_TEXTURES, PROP_TEXTURES, tileKey(), roofKey(), propKey(), preloadAssets().
// Les images viennent de public/assets (générées selon docs/style.md, voir docs/registre-visuels.md).
import type Phaser from 'phaser'

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

export const tileKey = (name: TileTexture): string => `tile:${name}`
export const roofKey = (name: RoofTexture): string => `roof:${name}`
export const propKey = (name: PropTexture): string => `prop:${name}`

/** Charge toutes les images (à appeler dans le preload de la première scène). */
export function preloadAssets(scene: Phaser.Scene): void {
  for (const name of TILE_TEXTURES) scene.load.image(tileKey(name), `assets/tiles/${name}.png`)
  for (const name of ROOF_TEXTURES) scene.load.image(roofKey(name), `assets/roofs/${name}.png`)
  for (const name of PROP_TEXTURES) scene.load.image(propKey(name), `assets/props/${name}.png`)
}
