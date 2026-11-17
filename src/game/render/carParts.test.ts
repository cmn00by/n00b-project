import { describe, expect, it } from 'vitest'
import { createRegistry } from '../../sim/core'
import type { VehiclePartDef } from '../../sim/core'
import { describeCarLook } from './carParts'

const PARTS = createRegistry<VehiclePartDef>('Pièce', [
  { id: 'rose', name: 'Rose', slot: 'paint', price: 60, color: '#ff6fa8' },
  { id: 'neons', name: 'Néons', slot: 'neon', price: 120, color: '#3a86ff' },
  { id: 'pneus', name: 'Pneus', slot: 'tires', price: 100, stats: { grip: 1.1 } },
])

describe('describeCarLook', () => {
  it('donne la couleur de chaque pièce visible, et ignore les pièces sans couleur ou inconnues', () => {
    expect(describeCarLook({ paint: 'rose', neon: 'neons', tires: 'pneus', spoiler: 'disparu' }, PARTS)).toEqual({ paint: 0xff6fa8, neon: 0x3a86ff })
  })

  it('ne donne rien pour une voiture d’origine', () => {
    expect(describeCarLook(undefined, PARTS)).toEqual({})
  })
})
