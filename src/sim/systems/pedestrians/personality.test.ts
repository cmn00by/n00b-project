import { describe, expect, it } from 'vitest'
import { STEPS_PER_SECOND, createRng } from '../../core'
import type { NpcTypeDef } from '../../core'
import { computePauseSteps, createPedestrian } from './personality'
import { TEST_LOOK } from './testLook'

const TYPE: NpcTypeDef = {
  id: 'passant',
  name: 'Passant',
  look: TEST_LOOK,
  walkSpeed: 40,
  fleeSpeed: 90,
  courage: { min: 0.2, max: 0.8 },
  patience: { min: 0.1, max: 0.9 },
  pauseSeconds: { min: 1, max: 5 },
  reactionWeights: { stare: 1, curious: 1, filming: 1, angry: 1 },
}

describe('createPedestrian', () => {
  it('naît en train de se promener, avec le type de sa fiche', () => {
    const pedestrian = createPedestrian(TYPE, createRng(1))
    expect(pedestrian.typeId).toBe('passant')
    expect(pedestrian.state).toBe('walking')
    expect(pedestrian.heading).toEqual({ x: 0, y: 0 })
  })

  it('tire courage et patience dans les plages de son type', () => {
    const rng = createRng(3)
    for (let index = 0; index < 200; index++) {
      const { courage, patience } = createPedestrian(TYPE, rng)
      expect(courage).toBeGreaterThanOrEqual(0.2)
      expect(courage).toBeLessThanOrEqual(0.8)
      expect(patience).toBeGreaterThanOrEqual(0.1)
      expect(patience).toBeLessThanOrEqual(0.9)
    }
  })

  it('donne des personnalités différentes à des piétons d’un même type', () => {
    const rng = createRng(5)
    const courages = new Set(Array.from({ length: 20 }, () => createPedestrian(TYPE, rng).courage))
    expect(courages.size).toBeGreaterThan(10)
  })

  it('donne les mêmes piétons avec la même graine', () => {
    expect(createPedestrian(TYPE, createRng(9))).toEqual(createPedestrian(TYPE, createRng(9)))
  })

  it('reste dans une plage réduite à une seule valeur', () => {
    const fixed = { ...TYPE, courage: { min: 0.5, max: 0.5 } }
    expect(createPedestrian(fixed, createRng(2)).courage).toBe(0.5)
  })
})

describe('computePauseSteps', () => {
  it('fait une pause courte pour un impatient et longue pour un patient', () => {
    expect(computePauseSteps(TYPE, 0)).toBe(1 * STEPS_PER_SECOND)
    expect(computePauseSteps(TYPE, 1)).toBe(5 * STEPS_PER_SECOND)
    expect(computePauseSteps(TYPE, 0.5)).toBe(3 * STEPS_PER_SECOND)
  })

  it('dure toujours au moins un pas', () => {
    expect(computePauseSteps({ ...TYPE, pauseSeconds: { min: 0, max: 0 } }, 0.5)).toBe(1)
  })
})
