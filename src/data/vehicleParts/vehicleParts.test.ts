import { describe, expect, it } from 'vitest'
import { VEHICLE_PART_SLOTS, createTileMap, validateDefs, validateVehiclePartDef, validateWorkshopPlaces } from '../../sim/core'
import { MAP_REGISTRY } from '../maps'
import { TILE_KIND_REGISTRY } from '../tileKinds'
import { WORKSHOPS } from '../workshops'
import { VEHICLE_PARTS } from './index'

describe('VEHICLE_PARTS', () => {
  it('ne contient que des pièces valides (ids uniques, prix entiers, multiplicateurs bornés)', () => {
    expect(validateDefs('Pièce', VEHICLE_PARTS, validateVehiclePartDef)).toEqual([])
  })

  it('propose au moins une pièce pour chacun des neuf emplacements', () => {
    for (const slot of VEHICLE_PART_SLOTS) expect(VEHICLE_PARTS.some((part) => part.slot === slot)).toBe(true)
  })

  it('reste en JSON pur', () => {
    for (const part of VEHICLE_PARTS) expect(JSON.parse(JSON.stringify(part))).toEqual(part)
  })
})

describe('WORKSHOPS', () => {
  it('place chaque atelier sur une carte qui existe, sur une case libre', () => {
    expect(validateDefs('Atelier', WORKSHOPS)).toEqual([])
    for (const def of WORKSHOPS) expect(validateWorkshopPlaces(def, createTileMap(MAP_REGISTRY.get(def.mapId), TILE_KIND_REGISTRY))).toEqual([])
  })
})
