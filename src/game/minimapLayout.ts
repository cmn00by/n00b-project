// Ce que montre la mini-carte : la couleur de chaque case, le cadrage autour du joueur, et où placer chaque repère.
// Expose : MINIMAP_TILE_COLORS, minimapColorOf(), MinimapFrame, frameMinimap(), MinimapDot, placeOnMinimap().
// Pourquoi : des règles pures, testées sans navigateur ; hud/minimapView.ts ne fait que les dessiner. La carte est toujours nord en haut,
// centrée sur le joueur ; un repère hors du cadre (l'objectif d'une mission, par exemple) est ramené au bord, dans sa direction.

/** La couleur de chaque type de case sur la mini-carte (couleurs de la palette, docs/style.md). Un type inconnu prend la couleur du sol. */
export const MINIMAP_TILE_COLORS: Readonly<Record<string, string>> = {
  road: '#565a6e',
  sidewalk: '#bdb4a6',
  grass: '#5db65a',
  building: '#3e4152',
  plaza: '#dcd4c4',
  water: '#3e9be0',
  sand: '#e3b676',
  dock: '#8e5b36',
  parking: '#6f7489',
  showroom: '#3a86ff',
  garage: '#8e5ce0',
  workshop: '#f28c28',
}
const DEFAULT_COLOR = '#9c9389'

export function minimapColorOf(tileKindId: string): string {
  return MINIMAP_TILE_COLORS[tileKindId] ?? DEFAULT_COLOR
}

/** Le morceau de la carte affiché, en cases : coin haut gauche et taille. Il reste dans la carte quand le joueur est près d'un bord. */
export interface MinimapFrame {
  left: number
  top: number
  size: number
}

/** Le cadre de `viewTiles` × `viewTiles` cases centré sur le joueur (position en px), gardé dans la carte. */
export function frameMinimap(playerX: number, playerY: number, tileSize: number, mapWidth: number, mapHeight: number, viewTiles: number): MinimapFrame {
  const size = Math.min(viewTiles, mapWidth, mapHeight)
  const clamp = (value: number, max: number) => Math.min(Math.max(0, value), max - size)
  return { left: clamp(playerX / tileSize - size / 2, mapWidth), top: clamp(playerY / tileSize - size / 2, mapHeight), size }
}

/** Un point sur la mini-carte, de 0 à 1 dans chaque sens ; `isOnEdge` : il est hors du cadre et a été ramené au bord. */
export interface MinimapDot {
  x: number
  y: number
  isOnEdge: boolean
}

/** Où dessiner un point du monde (en px) dans le cadre. Hors du cadre, il est ramené au bord le long de la ligne qui part du centre. */
export function placeOnMinimap(worldX: number, worldY: number, tileSize: number, frame: MinimapFrame): MinimapDot {
  const x = (worldX / tileSize - frame.left) / frame.size
  const y = (worldY / tileSize - frame.top) / frame.size
  if (x >= 0 && x <= 1 && y >= 0 && y <= 1) return { x, y, isOnEdge: false }
  // Ramené au bord : on raccourcit le vecteur depuis le centre jusqu'à toucher le cadre.
  const dx = x - 0.5
  const dy = y - 0.5
  const scale = 0.5 / Math.max(Math.abs(dx), Math.abs(dy))
  return { x: 0.5 + dx * scale, y: 0.5 + dy * scale, isOnEdge: true }
}
