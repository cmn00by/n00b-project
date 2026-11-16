// Où poser la déco dans la ville, d'après les types de case de la carte.
// Expose : DecorItem, placeDecor().
// Pourquoi : décorer à la main une ville entière serait long ; on décrit des règles (des arbres dans l'herbe, un lampadaire régulièrement
// le long des trottoirs, une fontaine au centre de la place, des parasols sur la plage…) et le placement en découle, toujours identique.
// C'est de l'affichage seulement : la déco ne bloque pas encore le passage (elle deviendra des objets de la simulation avec le bloc
// « environnement interactif » de docs/features.md). Pur calcul, sans Phaser : testé dans Node.

import type { TileMap } from '../../sim/core'
import type { PropTexture } from '../assets'
import { hashToUnit } from '../hash'

/** Un élément de déco posé dans le monde, centré sur (x, y), en pixels. */
export interface DecorItem {
  prop: PropTexture
  x: number
  y: number
}

/** Tous les combien de cases un lampadaire, le long des trottoirs. */
const LAMP_SPACING = 5

export function placeDecor(map: TileMap): DecorItem[] {
  const size = map.tileSize
  const kindAt = (tileX: number, tileY: number): string => (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height ? '' : (map.tileKindIds[tileY * map.width + tileX] ?? ''))
  const neighbors = (tileX: number, tileY: number): string[] => [kindAt(tileX, tileY - 1), kindAt(tileX + 1, tileY), kindAt(tileX, tileY + 1), kindAt(tileX - 1, tileY)]
  const center = (tileX: number, tileY: number) => ({ x: (tileX + 0.5) * size, y: (tileY + 0.5) * size })
  const items: DecorItem[] = []
  const put = (prop: PropTexture, x: number, y: number) => items.push({ prop, x, y })

  for (let tileY = 0; tileY < map.height; tileY++) {
    for (let tileX = 0; tileX < map.width; tileX++) {
      const kind = kindAt(tileX, tileY)
      const around = neighbors(tileX, tileY)
      const roll = hashToUnit(tileX, tileY, 7)
      const { x, y } = center(tileX, tileY)
      // Un léger décalage, pour que la déco ne paraisse pas alignée sur la grille.
      const jitterX = (hashToUnit(tileX, tileY, 8) - 0.5) * size * 0.4
      const jitterY = (hashToUnit(tileX, tileY, 9) - 0.5) * size * 0.4

      if (kind === 'grass') {
        // Les arbres ont besoin de place : pas contre un immeuble, une route ou l'eau.
        const hasRoom = around.every((other) => other === 'grass' || other === 'sidewalk' || other === 'plaza' || other === '')
        if (hasRoom && roll < 0.17) put(roll < 0.12 ? 'arbre' : 'arbre-automne', x + jitterX, y + jitterY)
        else if (roll < 0.25) put('buisson', x + jitterX, y + jitterY)
        else if (around.includes('water') && roll < 0.4) put('rocher', x + jitterX, y + jitterY)
        else if (hasRoom && roll < 0.29) put('parterre', x, y)
      } else if (kind === 'sidewalk') {
        const roadSide = [
          { dx: 0, dy: -1 },
          { dx: 1, dy: 0 },
          { dx: 0, dy: 1 },
          { dx: -1, dy: 0 },
        ].find(({ dx, dy }) => kindAt(tileX + dx, tileY + dy) === 'road')
        if (roadSide !== undefined && (tileX + tileY) % LAMP_SPACING === 0) {
          // Le lampadaire se tient au bord du trottoir, côté route.
          put('lampadaire', x + roadSide.dx * size * 0.32, y + roadSide.dy * size * 0.32)
        } else if (roadSide !== undefined && roll < 0.03) put('bouche-incendie', x + roadSide.dx * size * 0.3, y + roadSide.dy * size * 0.3)
        else if (roadSide === undefined && roll < 0.05) put('poubelle', x + jitterX, y + jitterY)
        else if (roadSide === undefined && roll < 0.08) put('plante', x + jitterX, y + jitterY)
      } else if (kind === 'sand') {
        const nearWater = around.includes('water')
        if (!nearWater && roll < 0.07) put('parasol', x + jitterX, y + jitterY)
        else if (!nearWater && roll < 0.12) put('palmier', x + jitterX, y + jitterY)
        else if (nearWater && roll < 0.06) put('rocher', x + jitterX, y)
      } else if (kind === 'parking' && roll < 0.04) {
        put('cone', x + jitterX, y + jitterY)
      }
    }
  }

  placePlazaFurniture(map, kindAt, put)
  return items
}

/** Sur chaque grande place : une fontaine au centre, des bancs autour, des parterres aux angles. */
function placePlazaFurniture(map: TileMap, kindAt: (tileX: number, tileY: number) => string, put: (prop: PropTexture, x: number, y: number) => void): void {
  const size = map.tileSize
  const seen = new Set<number>()
  for (let tileY = 0; tileY < map.height; tileY++) {
    for (let tileX = 0; tileX < map.width; tileX++) {
      if (kindAt(tileX, tileY) !== 'plaza' || seen.has(tileY * map.width + tileX)) continue
      // Toute la place, de proche en proche.
      const stack = [[tileX, tileY]]
      let minX = tileX
      let maxX = tileX
      let minY = tileY
      let maxY = tileY
      let count = 0
      while (stack.length > 0) {
        const [cx = 0, cy = 0] = stack.pop() ?? []
        const index = cy * map.width + cx
        if (seen.has(index) || kindAt(cx, cy) !== 'plaza') continue
        seen.add(index)
        count++
        minX = Math.min(minX, cx)
        maxX = Math.max(maxX, cx)
        minY = Math.min(minY, cy)
        maxY = Math.max(maxY, cy)
        stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1])
      }
      if (count < 16) continue
      const centerX = ((minX + maxX + 1) / 2) * size
      const centerY = ((minY + maxY + 1) / 2) * size
      put('fontaine', centerX, centerY)
      for (const [dx, dy] of [
        [0, -1.9],
        [0, 1.9],
        [-2.4, 0],
        [2.4, 0],
      ] as const) {
        put('banc', centerX + dx * size, centerY + dy * size)
      }
      for (const [dx, dy] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ] as const) {
        put('parterre', centerX + dx * 3.6 * size, centerY + dy * 1.6 * size)
      }
    }
  }
}
