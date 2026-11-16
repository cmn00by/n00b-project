import { describe, expect, it } from 'vitest'
import { validateDefs } from '../../sim/core'
import type { VehicleDef } from '../../sim/core'
import { VEHICLES, checkVehicleDef } from './index'

describe('VEHICLES', () => {
  it('ne contient que des véhicules valides', () => {
    expect(validateDefs('Véhicule', VEHICLES, checkVehicleDef)).toEqual([])
  })
})

describe('checkVehicleDef', () => {
  const base: VehicleDef = { id: 'x', name: 'X', width: 20, length: 40, maxSpeed: 200, maxReverseSpeed: 50, acceleration: 100, braking: 200, turnRate: 2, grip: 5, handbrakeGrip: 1 }

  it('refuse un véhicule trop rapide pour les collisions', () => {
    expect(checkVehicleDef({ ...base, maxSpeed: 900 })).toContain('maxSpeed trop élevée : plus de 16 px par pas, la voiture pourrait traverser un mur')
  })

  it('refuse un frein à main qui ne fait pas déraper', () => {
    expect(checkVehicleDef({ ...base, handbrakeGrip: 5 })).toContain('handbrakeGrip doit être plus bas que grip (sinon le frein à main ne fait pas déraper)')
  })
})
