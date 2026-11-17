import { describe, expect, it } from 'vitest'
import { createTileMap, validateDealershipDef, validateDealershipPlaces, validateDefs, validateGaragePlaces } from '../../sim/core'
import { DEALERSHIPS } from '../dealerships'
import { MAP_REGISTRY } from '../maps'
import { TILE_KIND_REGISTRY } from '../tileKinds'
import { VEHICLE_REGISTRY } from '../vehicles'
import { GARAGES } from './index'

const mapOf = (mapId: string) => createTileMap(MAP_REGISTRY.get(mapId), TILE_KIND_REGISTRY)

describe('DEALERSHIPS', () => {
  it('ne contient que des concessions valides (modèles qui existent, prix entiers positifs)', () => {
    expect(validateDefs('Concession', DEALERSHIPS, (def) => validateDealershipDef(def, VEHICLE_REGISTRY))).toEqual([])
  })

  it('place chaque concession sur une carte qui existe, sur des cases libres', () => {
    for (const def of DEALERSHIPS) expect(validateDealershipPlaces(def, mapOf(def.mapId))).toEqual([])
  })
})

describe('GARAGES', () => {
  it('ne contient que des garages valides, placés sur des cases libres', () => {
    expect(validateDefs('Garage', GARAGES)).toEqual([])
    for (const def of GARAGES) expect(validateGaragePlaces(def, mapOf(def.mapId))).toEqual([])
  })

  it('reste en JSON pur', () => {
    for (const def of [...GARAGES, ...DEALERSHIPS]) expect(JSON.parse(JSON.stringify(def))).toEqual(def)
  })
})
