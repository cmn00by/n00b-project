import { describe, expect, it } from 'vitest'
import { createRng } from './rng'

function drawFloats(seed: number, count: number): number[] {
  const rng = createRng(seed)
  return Array.from({ length: count }, () => rng.nextFloat())
}

describe('createRng', () => {
  it('donne la même suite de nombres avec la même graine', () => {
    expect(drawFloats(42, 20)).toEqual(drawFloats(42, 20))
  })

  it('donne des suites différentes avec des graines différentes', () => {
    expect(drawFloats(1, 10)).not.toEqual(drawFloats(2, 10))
  })

  it('reprend exactement la suite après getState()', () => {
    const original = createRng(7)
    for (let i = 0; i < 5; i++) original.nextFloat()
    const resumed = createRng(7, original.getState())
    expect(resumed.nextFloat()).toBe(original.nextFloat())
    expect(resumed.nextInt(0, 1000)).toBe(original.nextInt(0, 1000))
  })
})

describe('nextFloat', () => {
  it('reste dans [0, 1[', () => {
    for (const value of drawFloats(3, 1000)) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe('nextInt', () => {
  it('reste dans les bornes et atteint les deux extrémités', () => {
    const rng = createRng(5)
    const values = Array.from({ length: 500 }, () => rng.nextInt(3, 6))
    expect(Math.min(...values)).toBe(3)
    expect(Math.max(...values)).toBe(6)
  })

  it('renvoie toujours la valeur quand min = max', () => {
    expect(createRng(1).nextInt(4, 4)).toBe(4)
  })
})

describe('rollChance', () => {
  it('ne réussit jamais à 0 et réussit toujours à 1', () => {
    const rng = createRng(9)
    for (let i = 0; i < 200; i++) {
      expect(rng.rollChance(0)).toBe(false)
      expect(rng.rollChance(1)).toBe(true)
    }
  })
})

describe('pickOne', () => {
  it('choisit un élément de la liste', () => {
    const rng = createRng(11)
    const items = ['a', 'b', 'c']
    for (let i = 0; i < 100; i++) expect(items).toContain(rng.pickOne(items))
  })

  it('refuse une liste vide', () => {
    expect(() => createRng(1).pickOne([])).toThrow()
  })
})
