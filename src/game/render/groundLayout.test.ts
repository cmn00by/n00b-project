import { describe, expect, it } from 'vitest'
import type { TileMap } from '../../sim/core'
import { computeGroundLayout } from './groundLayout'

/** '=' route, '.' trottoir, ',' herbe, '~' eau. Cases de 10 px. */
function mapOf(rows: string[]): TileMap {
  const kinds: Record<string, string> = { '=': 'road', '.': 'sidewalk', ',': 'grass', '~': 'water' }
  const tileKindIds = rows.flatMap((row) => [...row].map((character) => kinds[character] ?? 'building'))
  return { mapId: 't', width: rows[0]?.length ?? 0, height: rows.length, tileSize: 10, tileKindIds, solid: tileKindIds.map(() => false) }
}

/** Un carrefour : une route horizontale (lignes 3-4) croise une route verticale (colonnes 3-4). */
const CROSSROADS = mapOf(['...==...', '...==...', '...==...', '========', '========', '...==...', '...==...', '...==...'])

describe('computeGroundLayout', () => {
  it('peint une case pour chaque case de la carte, sauf l’eau', () => {
    const layout = computeGroundLayout(mapOf([',,~', ',,~']))
    expect(layout.tiles).toHaveLength(4)
  })

  it('pose des passages piétons juste avant le carrefour, dans le bon sens', () => {
    const crossings = computeGroundLayout(CROSSROADS).tiles.filter((tile) => tile.texture === 'passage-pieton')
    expect(crossings.map((tile) => `${tile.tileX},${tile.tileY}`).sort()).toEqual(['2,3', '2,4', '3,2', '3,5', '4,2', '4,5', '5,3', '5,4'].sort())
    expect(crossings.find((tile) => tile.tileX === 3 && tile.tileY === 2)?.isRotated).toBe(true) // route verticale
    expect(crossings.find((tile) => tile.tileX === 2 && tile.tileY === 3)?.isRotated).toBe(false) // route horizontale
  })

  it('trace des tirets entre les deux voies, mais pas dans le carrefour', () => {
    const dashes = computeGroundLayout(CROSSROADS).laneDashes
    expect(dashes.length).toBeGreaterThan(0)
    // Tirets de la route horizontale : sur la limite entre les lignes 3 et 4 (y = 40), hors du carrefour (x de 30 à 50).
    const horizontal = dashes.filter((dash) => dash.y1 === 40 && dash.y2 === 40)
    expect(horizontal.length).toBeGreaterThan(0)
    expect(horizontal.every((dash) => dash.x2 <= 30 || dash.x1 >= 50)).toBe(true)
  })

  it('dessine les bordures entre trottoir et route', () => {
    expect(computeGroundLayout(mapOf(['..', '=='])).curbs).toEqual([
      { x1: 0, y1: 10, x2: 10, y2: 10 },
      { x1: 10, y1: 10, x2: 20, y2: 10 },
    ])
  })

  it("trace le rivage entre l'eau et la terre", () => {
    expect(computeGroundLayout(mapOf([',~'])).shores).toEqual([{ x1: 10, y1: 0, x2: 10, y2: 10 }])
  })

  it('donne toujours la même ville', () => {
    expect(computeGroundLayout(CROSSROADS)).toEqual(computeGroundLayout(CROSSROADS))
  })
})
