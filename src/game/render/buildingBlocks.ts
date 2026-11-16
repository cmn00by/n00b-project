// Les immeubles de la carte, regroupés en blocs rectangulaires, avec une hauteur.
// Expose : BuildingBlock, findBuildingBlocks().
// Pourquoi : pour le relief (essai #26), un immeuble doit être dessiné d'un seul tenant (un toit, quatre façades), et non case par case :
// sinon on verrait des murs entre deux cases du même immeuble. Ce calcul ne dépend pas de Phaser : il se teste dans Node.
// La hauteur est provisoire (déduite de la position) : elle viendra des données de la carte quand l'essai sera validé.

import type { TileMap } from '../../sim/core'

/** Un immeuble : un rectangle de cases, en pixels, et sa hauteur en pixels. */
export interface BuildingBlock {
  x: number
  y: number
  width: number
  height: number
  elevation: number
}

/** Les hauteurs possibles d'un immeuble, en pixels (environ 1, 2 et 3 étages). */
const ELEVATIONS_PX = [26, 44, 62]

/**
 * Regroupe les cases dont le type est `tileKindId` en rectangles : on prend la plus longue suite de cases sur une ligne,
 * puis on l'étend vers le bas tant que la ligne suivante a exactement la même suite. Chaque case appartient à un seul bloc.
 */
export function findBuildingBlocks(map: TileMap, tileKindId = 'building'): BuildingBlock[] {
  const isBuilding = (tileX: number, tileY: number): boolean => map.tileKindIds[tileY * map.width + tileX] === tileKindId
  const taken = new Array<boolean>(map.width * map.height).fill(false)
  const blocks: BuildingBlock[] = []

  for (let tileY = 0; tileY < map.height; tileY++) {
    for (let tileX = 0; tileX < map.width; tileX++) {
      if (taken[tileY * map.width + tileX] || !isBuilding(tileX, tileY)) continue

      let runWidth = 0
      while (tileX + runWidth < map.width && isBuilding(tileX + runWidth, tileY) && !taken[tileY * map.width + tileX + runWidth]) runWidth++

      let runHeight = 1
      const rowMatches = (row: number): boolean => {
        for (let dx = 0; dx < runWidth; dx++) if (!isBuilding(tileX + dx, row) || taken[row * map.width + tileX + dx]) return false
        return true
      }
      while (tileY + runHeight < map.height && rowMatches(tileY + runHeight)) runHeight++

      for (let dy = 0; dy < runHeight; dy++) for (let dx = 0; dx < runWidth; dx++) taken[(tileY + dy) * map.width + tileX + dx] = true
      // Hauteur provisoire, toujours la même pour un immeuble donné : on varie d'un immeuble à l'autre pour donner du rythme à la rue.
      const elevation = ELEVATIONS_PX[(tileX * 7 + tileY * 13 + runWidth * 3) % ELEVATIONS_PX.length] ?? ELEVATIONS_PX[0] ?? 0
      blocks.push({ x: tileX * map.tileSize, y: tileY * map.tileSize, width: runWidth * map.tileSize, height: runHeight * map.tileSize, elevation })
    }
  }
  return blocks
}
