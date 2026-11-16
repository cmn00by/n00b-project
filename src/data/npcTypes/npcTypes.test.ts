import { describe, expect, it } from 'vitest'
import { validateDefs, validateNpcTypeDef } from '../../sim/core'
import { NPC_TYPES, NPC_TYPE_REGISTRY } from './index'

describe('NPC_TYPES', () => {
  it('ne contient que des types de PNJ valides (ids uniques, valeurs dans les bornes)', () => {
    expect(validateDefs('Type de PNJ', NPC_TYPES, validateNpcTypeDef)).toEqual([])
  })

  it('contient au moins deux types, qui ne se comportent pas pareil', () => {
    expect(NPC_TYPES.length).toBeGreaterThanOrEqual(2)
    const walkSpeeds = new Set(NPC_TYPES.map((type) => type.walkSpeed))
    expect(walkSpeeds.size).toBe(NPC_TYPES.length)
  })

  it('se retrouve par id dans le registre', () => {
    expect(NPC_TYPE_REGISTRY.get('passant').name).toBe('Passant')
    expect(NPC_TYPE_REGISTRY.find('inconnu')).toBeUndefined()
  })
})
