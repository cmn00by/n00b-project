import { describe, expect, it } from 'vitest'
import { createRegistry } from './registry'
import type { VehicleDef } from './registry'
import { PART_STAT_MAX, applyVehicleParts, validateVehiclePartDef } from './vehiclePart'
import type { VehiclePartDef } from './vehiclePart'

const CAR: VehicleDef = { id: 'auto', name: 'Auto', width: 26, length: 46, maxSpeed: 200, maxReverseSpeed: 60, acceleration: 100, braking: 200, turnRate: 2, grip: 6, handbrakeGrip: 1 }
const PARTS = createRegistry<VehiclePartDef>('Pièce', [
  { id: 'rose', name: 'Rose', slot: 'paint', price: 60, color: '#ff6fa8' },
  { id: 'moteur', name: 'Moteur', slot: 'engine', price: 200, stats: { maxSpeed: 1.5, acceleration: 1.2 } },
  { id: 'pneus', name: 'Pneus', slot: 'tires', price: 100, stats: { maxSpeed: 1.5, grip: 0.8 } },
])

describe('applyVehicleParts', () => {
  it('rend le modèle tel quel sans pièce, ou avec des pièces qui ne changent pas les réglages', () => {
    expect(applyVehicleParts(CAR, undefined, PARTS)).toBe(CAR)
    expect(applyVehicleParts(CAR, { paint: 'rose' }, PARTS)).toEqual(CAR)
  })

  it('multiplie les réglages par ceux des pièces, sans dépasser la borne', () => {
    const tuned = applyVehicleParts(CAR, { engine: 'moteur', tires: 'pneus' }, PARTS)
    expect(tuned.acceleration).toBeCloseTo(120)
    expect(tuned.grip).toBeCloseTo(4.8)
    // 1,5 × 1,5 = 2,25 : ramené à la borne.
    expect(tuned.maxSpeed).toBeCloseTo(200 * PART_STAT_MAX)
  })

  it('ignore une pièce retirée des données', () => {
    expect(applyVehicleParts(CAR, { engine: 'disparue' }, PARTS)).toEqual(CAR)
  })
})

describe('validateVehiclePartDef', () => {
  it('refuse un prix à virgule, une couleur invalide et un multiplicateur hors bornes', () => {
    const errors = validateVehiclePartDef({ id: 'x', name: 'X', slot: 'engine', price: 9.5, color: 'rouge', stats: { maxSpeed: 3 } })
    expect(errors).toHaveLength(3)
  })
})
