import { describe, expect, it } from 'vitest'
import type { TileMap } from '../../sim/core'
import { createTileMap } from '../../sim/core'
import { MAP_REGISTRY } from '../../data/maps'
import { TILE_KIND_REGISTRY } from '../../data/tileKinds'
import { PROP_TEXTURES } from '../assets'
import { placeDecor } from './placeDecor'
import { PROP_STYLES } from './propStyles'

const town: TileMap = createTileMap(MAP_REGISTRY.get('test-town'), TILE_KIND_REGISTRY)
const tileKindAt = (x: number, y: number): string => town.tileKindIds[Math.floor(y / town.tileSize) * town.width + Math.floor(x / town.tileSize)] ?? ''

describe('placeDecor (ville de test)', () => {
  const decor = placeDecor(town)

  it('décore la ville : des arbres, des lampadaires, une fontaine, des parasols', () => {
    const count = (prop: string) => decor.filter((item) => item.prop === prop).length
    expect(count('arbre') + count('arbre-automne')).toBeGreaterThan(10)
    expect(count('lampadaire')).toBeGreaterThan(20)
    expect(count('fontaine')).toBe(1)
    expect(count('parasol')).toBeGreaterThan(0)
  })

  it('met la fontaine sur la place et les lampadaires sur les trottoirs', () => {
    for (const item of decor) {
      if (item.prop === 'fontaine') expect(tileKindAt(item.x, item.y)).toBe('plaza')
      if (item.prop === 'lampadaire') expect(tileKindAt(item.x, item.y)).toBe('sidewalk')
    }
  })

  it('ne pose rien dans un immeuble ni dans l’eau', () => {
    for (const item of decor) expect(['building', 'water']).not.toContain(tileKindAt(item.x, item.y))
  })

  it('donne toujours la même déco', () => {
    expect(placeDecor(town)).toEqual(decor)
  })
})

describe('PROP_STYLES', () => {
  it('donne une taille à chaque élément de déco, à l’échelle du jeu (plus petit que 2 cases)', () => {
    for (const prop of PROP_TEXTURES) {
      expect(PROP_STYLES[prop].size).toBeGreaterThan(0)
      expect(PROP_STYLES[prop].size).toBeLessThanOrEqual(64)
    }
  })
})
