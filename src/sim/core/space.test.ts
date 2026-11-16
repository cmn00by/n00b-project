import { describe, expect, it } from 'vitest'
import { spawnEntity } from './entities'
import { createTileMap } from './map'
import type { TileKindDef } from './map'
import { createRegistry } from './registry'
import { findSolidOverlaps, isSpaceClear } from './space'
import { createTestWorld, loadMap } from './world'

const TILE_KINDS = createRegistry<TileKindDef>('Type de case', [
  { id: 'floor', isSolid: false },
  { id: 'wall', isSolid: true },
])

function createWorldWithBox() {
  const world = createTestWorld()
  const box = spawnEntity(world, 'prop', { position: { x: 50, y: 50, angle: 0 }, body: { width: 20, height: 20, isSolid: true } })
  return { world, box }
}

describe('findSolidOverlaps', () => {
  it('trouve une entité solide qui chevauche le rectangle', () => {
    const { world, box } = createWorldWithBox()
    expect(findSolidOverlaps(world, 60, 50, 10, 10)).toEqual([box.id])
  })

  it('ne compte pas un simple contact de bord', () => {
    const { world } = createWorldWithBox()
    expect(findSolidOverlaps(world, 65, 50, 10, 10)).toEqual([]) // la caisse s'arrête à x = 60, le rectangle commence à 60
  })

  it('ignore les entités listées, les corps non solides et les entités sans corps', () => {
    const { world, box } = createWorldWithBox()
    spawnEntity(world, 'prop', { position: { x: 50, y: 50, angle: 0 }, body: { width: 20, height: 20, isSolid: false } })
    spawnEntity(world, 'prop', { position: { x: 50, y: 50, angle: 0 } })
    expect(findSolidOverlaps(world, 50, 50, 10, 10, [box.id])).toEqual([])
  })
})

describe('isSpaceClear', () => {
  it('tient compte des murs de la carte et des entités solides', () => {
    const { world } = createWorldWithBox()
    loadMap(
      world,
      createTileMap(
        { id: 'm', name: 'M', tileSize: 10, rows: ['#.........', ...Array(9).fill('..........')], legend: { '.': 'floor', '#': 'wall' }, spawns: { player: { tileX: 1, tileY: 0 } } },
        TILE_KINDS,
      ),
    )
    expect(isSpaceClear(world, 85, 85, 10, 10)).toBe(true)
    expect(isSpaceClear(world, 5, 5, 6, 6)).toBe(false) // le mur
    expect(isSpaceClear(world, 50, 50, 6, 6)).toBe(false) // la caisse
  })

  it('fonctionne sans carte', () => {
    const { world } = createWorldWithBox()
    expect(isSpaceClear(world, -500, -500, 10, 10)).toBe(true)
  })
})
