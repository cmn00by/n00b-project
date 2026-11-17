// Ce qu'on peint au sol : la texture de chaque case, les marquages des routes, les passages piétons, les bordures de trottoir, les rivages.
// Expose : GroundTile, Segment, GroundLayout, computeGroundLayout().
// Pourquoi : la carte ne dit que « route », « trottoir »… ; l'affichage en déduit les détails qui rendent la ville crédible :
// des tirets entre les deux voies, des passages piétons à chaque carrefour, des plaques d'égout ici et là, des fleurs dans l'herbe.
// Pur calcul, sans three.js : testé dans Node. Les variations viennent d'un hasard stable (toujours la même ville).

import type { TileMap } from '../../sim/core'
import type { TileTexture } from '../assets'
import { hashToUnit } from '../hash'

/** Une case de sol à peindre : sa texture, et un quart de tour éventuel. */
export interface GroundTile {
  tileX: number
  tileY: number
  texture: TileTexture
  isRotated: boolean
}

/** Un trait, en pixels. */
export interface Segment {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface GroundLayout {
  tiles: GroundTile[]
  /** Les tirets blancs entre les deux voies d'une route. */
  laneDashes: Segment[]
  /** Les bordures entre trottoir et route. */
  curbs: Segment[]
  /** Les rivages : bords de l'eau contre la terre (on y dessine de l'écume). */
  shores: Segment[]
}

/** La texture de chaque type de case (hors route et eau, traitées à part). */
const TEXTURE_BY_KIND: Readonly<Record<string, TileTexture>> = {
  sidewalk: 'trottoir',
  grass: 'herbe',
  plaza: 'paves',
  sand: 'sable',
  dock: 'ponton',
  parking: 'parking',
  building: 'paves',
  showroom: 'paves',
  garage: 'paves',
}

/** Part des cases d'herbe fleuries, et des cases de route avec une plaque d'égout. */
const FLOWER_RATE = 0.12
const MANHOLE_RATE = 0.04
/** Longueur d'un tiret de marquage, en px. */
const DASH_LENGTH = 14

export function computeGroundLayout(map: TileMap): GroundLayout {
  const size = map.tileSize
  const kindAt = (tileX: number, tileY: number): string => (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height ? '' : (map.tileKindIds[tileY * map.width + tileX] ?? ''))
  const isRoad = (tileX: number, tileY: number): boolean => kindAt(tileX, tileY) === 'road'

  /** Combien de cases de route d'affilée, à travers cette case, dans une direction. */
  const run = (tileX: number, tileY: number, dx: number, dy: number): number => {
    let length = 1
    for (let step = 1; isRoad(tileX + dx * step, tileY + dy * step); step++) length++
    for (let step = 1; isRoad(tileX - dx * step, tileY - dy * step); step++) length++
    return length
  }
  // Un carrefour : la route s'étend loin dans les deux directions (une route fait 2 cases de large).
  const isIntersection = (tileX: number, tileY: number): boolean => isRoad(tileX, tileY) && run(tileX, tileY, 1, 0) > 2 && run(tileX, tileY, 0, 1) > 2

  const layout: GroundLayout = { tiles: [], laneDashes: [], curbs: [], shores: [] }
  const neighbors = [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
  ]
  /** Le bord commun entre une case et sa voisine, en pixels. */
  const sharedEdge = (tileX: number, tileY: number, dx: number, dy: number): Segment => {
    const left = tileX * size
    const top = tileY * size
    if (dy === -1) return { x1: left, y1: top, x2: left + size, y2: top }
    if (dy === 1) return { x1: left, y1: top + size, x2: left + size, y2: top + size }
    if (dx === -1) return { x1: left, y1: top, x2: left, y2: top + size }
    return { x1: left + size, y1: top, x2: left + size, y2: top + size }
  }

  for (let tileY = 0; tileY < map.height; tileY++) {
    for (let tileX = 0; tileX < map.width; tileX++) {
      const kind = kindAt(tileX, tileY)

      if (kind === 'water') {
        for (const { dx, dy } of neighbors) {
          const other = kindAt(tileX + dx, tileY + dy)
          if (other !== '' && other !== 'water') layout.shores.push(sharedEdge(tileX, tileY, dx, dy))
        }
        continue // l'eau n'est pas peinte : la couche d'eau animée se voit à travers
      }

      if (kind === 'road') {
        if (isIntersection(tileX, tileY)) {
          layout.tiles.push({ tileX, tileY, texture: 'asphalte', isRotated: false })
          continue
        }
        // Un passage piéton juste avant chaque carrefour. Les bandes sont dans le sens de la circulation.
        const isNextToVerticalCrossing = isIntersection(tileX, tileY - 1) || isIntersection(tileX, tileY + 1)
        const isNextToHorizontalCrossing = isIntersection(tileX - 1, tileY) || isIntersection(tileX + 1, tileY)
        if (isNextToVerticalCrossing || isNextToHorizontalCrossing) {
          layout.tiles.push({ tileX, tileY, texture: 'passage-pieton', isRotated: isNextToVerticalCrossing })
          continue
        }
        const texture = hashToUnit(tileX, tileY, 1) < MANHOLE_RATE ? 'plaque-egout' : 'asphalte'
        layout.tiles.push({ tileX, tileY, texture, isRotated: false })
        // Les tirets entre les deux voies : sur le bord commun aux deux cases d'une route de 2 de large.
        const x = tileX * size
        const y = tileY * size
        if (run(tileX, tileY, 0, 1) === 2 && isRoad(tileX, tileY + 1)) {
          layout.laneDashes.push({ x1: x + (size - DASH_LENGTH) / 2, y1: y + size, x2: x + (size + DASH_LENGTH) / 2, y2: y + size })
        }
        if (run(tileX, tileY, 1, 0) === 2 && isRoad(tileX + 1, tileY)) {
          layout.laneDashes.push({ x1: x + size, y1: y + (size - DASH_LENGTH) / 2, x2: x + size, y2: y + (size + DASH_LENGTH) / 2 })
        }
        continue
      }

      if (kind === 'sidewalk') {
        for (const { dx, dy } of neighbors) if (isRoad(tileX + dx, tileY + dy)) layout.curbs.push(sharedEdge(tileX, tileY, dx, dy))
      }

      let texture = TEXTURE_BY_KIND[kind] ?? 'gravier'
      if (texture === 'herbe' && hashToUnit(tileX, tileY, 2) < FLOWER_RATE) texture = 'herbe-fleurs'
      layout.tiles.push({ tileX, tileY, texture, isRotated: false })
    }
  }
  return layout
}
