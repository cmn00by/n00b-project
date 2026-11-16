// La carte : la grille de cases de la ville, et ce qui bloque le passage.
// Expose : TileKindDef, TileCoords, MapDef, TileMap, validateMapDef(), createTileMap(), isSolidTile(), isAreaFree(), getTileCenter().
// (Ranger la carte dans le monde : loadMap(), dans world.ts.)
// Pourquoi : la carte est décrite en données (src/data/maps), sous forme de lignes de caractères faciles à lire et à modifier.
// Le noyau la transforme en une grille simple (des tableaux de textes et de booléens) rangée dans le monde : elle se sauvegarde
// et s'envoie sur le réseau telle quelle, et n'importe quelle brique peut savoir si un endroit est libre, sans connaître Phaser.
// Plus tard, un chargeur de cartes Tiled produira la même TileMap : rien d'autre ne changera.

import type { ContentDef, Registry } from './registry'

/** Un type de case (route, trottoir, bâtiment…) : sa seule règle, pour l'instant, est de bloquer ou non le passage. */
export interface TileKindDef extends ContentDef {
  isSolid: boolean
}

/** Une case de la grille, repérée par sa colonne et sa ligne (à partir de 0, en haut à gauche). */
export interface TileCoords {
  tileX: number
  tileY: number
}

/** Une carte décrite en données. */
export interface MapDef extends ContentDef {
  /** Le nom affiché (en français). */
  name: string
  /** La taille d'une case, en pixels. */
  tileSize: number
  /** Une ligne de caractères par rangée de cases, de haut en bas. Toutes les lignes ont la même longueur. */
  rows: readonly string[]
  /** Ce que veut dire chaque caractère : l'id d'un type de case. */
  legend: Readonly<Record<string, string>>
  /** Les points d'apparition, en cases. */
  spawns: { player: TileCoords }
}

/** La carte chargée dans le monde : une grille lue ligne par ligne (index = tileY * width + tileX). */
export interface TileMap {
  mapId: string
  /** Largeur et hauteur, en cases. */
  width: number
  height: number
  /** Taille d'une case, en pixels. */
  tileSize: number
  /** L'id du type de chaque case. */
  tileKindIds: string[]
  /** Si chaque case bloque le passage. */
  solid: boolean[]
}

/**
 * Vérifie une carte et renvoie les erreurs trouvées (vide si tout va bien) : grille rectangulaire, caractères connus,
 * légende qui pointe vers des types de case existants, point d'apparition dans la carte et sur une case libre.
 */
export function validateMapDef(def: MapDef, tileKinds: Registry<TileKindDef>): string[] {
  const errors: string[] = []
  const width = def.rows[0]?.length ?? 0
  if (def.rows.length === 0 || width === 0) return ['la grille est vide']
  if (!Number.isInteger(def.tileSize) || def.tileSize <= 0) errors.push('tileSize doit être un entier positif')

  for (const [character, tileKindId] of Object.entries(def.legend)) {
    if (character.length !== 1) errors.push(`légende : '${character}' doit être un seul caractère`)
    if (!tileKinds.has(tileKindId)) errors.push(`légende : '${character}' pointe vers le type de case inconnu '${tileKindId}'`)
  }

  def.rows.forEach((row, tileY) => {
    if (row.length !== width) errors.push(`ligne ${tileY} : ${row.length} cases au lieu de ${width}`)
    for (const character of new Set(row)) {
      if (def.legend[character] === undefined) errors.push(`ligne ${tileY} : caractère '${character}' absent de la légende`)
    }
  })

  const { tileX, tileY } = def.spawns.player
  const spawnRow = def.rows[tileY]
  if (spawnRow === undefined || tileX < 0 || tileX >= width) {
    errors.push(`apparition du joueur (${tileX}, ${tileY}) hors de la carte`)
  } else {
    const kind = tileKinds.find(def.legend[spawnRow[tileX] ?? ''] ?? '')
    if (kind?.isSolid) errors.push(`apparition du joueur (${tileX}, ${tileY}) sur une case qui bloque le passage`)
  }

  return errors
}

/** Transforme une carte décrite en données en grille prête pour la simulation. Lève une erreur si la carte est invalide. */
export function createTileMap(def: MapDef, tileKinds: Registry<TileKindDef>): TileMap {
  const errors = validateMapDef(def, tileKinds)
  if (errors.length > 0) throw new Error(`Carte '${def.id}' invalide :\n${errors.join('\n')}`)

  const tileKindIds: string[] = []
  const solid: boolean[] = []
  for (const row of def.rows) {
    for (const character of row) {
      const kind = tileKinds.get(def.legend[character] ?? '')
      tileKindIds.push(kind.id)
      solid.push(kind.isSolid)
    }
  }
  return { mapId: def.id, width: def.rows[0]?.length ?? 0, height: def.rows.length, tileSize: def.tileSize, tileKindIds, solid }
}

/** Si la case bloque le passage. En dehors de la carte, tout bloque : on ne sort pas de la ville. */
export function isSolidTile(map: TileMap, tileX: number, tileY: number): boolean {
  if (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) return true
  return map.solid[tileY * map.width + tileX] ?? true
}

/**
 * Si un rectangle centré sur (centerX, centerY), en pixels, ne touche aucune case qui bloque le passage.
 * Un bord qui tombe pile sur la limite d'une case ne compte pas comme un chevauchement : on peut longer un mur.
 */
export function isAreaFree(map: TileMap, centerX: number, centerY: number, width: number, height: number): boolean {
  const firstTileX = Math.floor((centerX - width / 2) / map.tileSize)
  const lastTileX = Math.ceil((centerX + width / 2) / map.tileSize) - 1
  const firstTileY = Math.floor((centerY - height / 2) / map.tileSize)
  const lastTileY = Math.ceil((centerY + height / 2) / map.tileSize) - 1
  for (let tileY = firstTileY; tileY <= lastTileY; tileY++) {
    for (let tileX = firstTileX; tileX <= lastTileX; tileX++) {
      if (isSolidTile(map, tileX, tileY)) return false
    }
  }
  return true
}

/** Le centre d'une case, en pixels. */
export function getTileCenter(map: TileMap, coords: TileCoords): { x: number; y: number } {
  return { x: (coords.tileX + 0.5) * map.tileSize, y: (coords.tileY + 0.5) * map.tileSize }
}
