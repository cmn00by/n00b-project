import { describe, expect, it } from 'vitest'
import { computeVehicleBodySize, createTileMap, facingToHeading, getTileCenter, isAreaFree, validateDefs, validateMapDef } from '../../sim/core'
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

  it('gare chaque véhicule sur une place assez grande, sans qu’il en touche un autre', () => {
    for (const def of MAPS) {
      const map = createTileMap(def, TILE_KIND_REGISTRY)
      const rectangles = (def.spawns.vehicles ?? []).map((spawn) => {
        const model = VEHICLE_REGISTRY.get(spawn.modelId)
        const heading = facingToHeading(spawn.facing)
        const size = computeVehicleBodySize(model, heading.x, heading.y)
        const center = getTileCenter(map, spawn)
        return { id: `${spawn.modelId} (${spawn.tileX}, ${spawn.tileY})`, ...center, ...size }
      })
      for (const rect of rectangles) {
        expect(isAreaFree(map, rect.x, rect.y, rect.width, rect.height), `${rect.id} touche un mur`).toBe(true)
        for (const other of rectangles) {
          if (other === rect) continue
          const overlaps = Math.abs(rect.x - other.x) * 2 < rect.width + other.width && Math.abs(rect.y - other.y) * 2 < rect.height + other.height
          expect(overlaps, `${rect.id} touche ${other.id}`).toBe(false)
        }
      }
    }
  })

  it('se charge en grille pour la simulation', () => {
    for (const def of MAPS) expect(() => createTileMap(def, TILE_KIND_REGISTRY)).not.toThrow()
  })
})
