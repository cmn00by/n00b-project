import { describe, expect, it } from 'vitest'
import { createTileMap, validateDefs, validateMapDef } from '../../sim/core'
import { TILE_KIND_REGISTRY, TILE_KINDS } from '../tileKinds'
import { VEHICLE_REGISTRY } from '../vehicles'
import { MAPS } from './index'

describe('TILE_KINDS', () => {
  it('ne contient que des types de case valides (ids uniques, en kebab-case)', () => {
    expect(validateDefs('Type de case', TILE_KINDS)).toEqual([])
  })
})

describe('MAPS', () => {
  it('ne contient que des cartes valides', () => {
    expect(validateDefs('Carte', MAPS, (def) => validateMapDef(def, TILE_KIND_REGISTRY))).toEqual([])
  })

  it('ne gare que des modèles de véhicules qui existent', () => {
    for (const def of MAPS) for (const spawn of def.spawns.vehicles ?? []) expect(VEHICLE_REGISTRY.has(spawn.modelId), spawn.modelId).toBe(true)
  })

  it('se charge en grille pour la simulation', () => {
    for (const def of MAPS) expect(() => createTileMap(def, TILE_KIND_REGISTRY)).not.toThrow()
  })
})
