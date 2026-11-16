import { describe, expect, it } from 'vitest'
import type { TileMap } from '../../sim/core'
import { findBuildingBlocks } from './buildingBlocks'

/** Une carte de test à partir de lignes : '#' = bâtiment, '.' = trottoir. Cases de 10 px. */
function mapOf(rows: string[]): TileMap {
  const tileKindIds = rows.flatMap((row) => [...row].map((character) => (character === '#' ? 'building' : 'sidewalk')))
  return { mapId: 't', width: rows[0]?.length ?? 0, height: rows.length, tileSize: 10, tileKindIds, solid: tileKindIds.map((id) => id === 'building') }
}

describe('findBuildingBlocks', () => {
  it('regroupe un immeuble rectangulaire en un seul bloc', () => {
    const blocks = findBuildingBlocks(mapOf(['......', '.###..', '.###..', '......']))
    expect(blocks).toHaveLength(1)
    expect(blocks[0]).toMatchObject({ x: 10, y: 10, width: 30, height: 20 })
  })

  it('sépare deux immeubles séparés par une ruelle', () => {
    expect(findBuildingBlocks(mapOf(['##.##', '##.##']))).toHaveLength(2)
  })

  it('découpe une forme en L en rectangles, sans compter une case deux fois', () => {
    const blocks = findBuildingBlocks(mapOf(['###', '#..', '#..']))
    const area = blocks.reduce((total, block) => total + (block.width / 10) * (block.height / 10), 0)
    expect(area).toBe(5)
  })

  it('donne à chaque immeuble une hauteur positive, toujours la même', () => {
    const map = mapOf(['##.#', '##.#'])
    const first = findBuildingBlocks(map)
    expect(first.every((block) => block.elevation > 0)).toBe(true)
    expect(findBuildingBlocks(map)).toEqual(first)
  })

  it('ne trouve rien sur une carte sans bâtiment', () => {
    expect(findBuildingBlocks(mapOf(['...', '...']))).toEqual([])
  })
})
