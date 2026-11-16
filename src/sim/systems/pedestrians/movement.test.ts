import { describe, expect, it } from 'vitest'
import { computeAngleOf, computeHeadingToward, moveToward } from './movement'

describe('moveToward', () => {
  it('avance de la distance demandée en ligne droite', () => {
    expect(moveToward(0, 0, 10, 0, 3)).toEqual({ x: 3, y: 0, arrived: false })
    const diagonal = moveToward(0, 0, 3, 4, 2.5)
    expect(diagonal.x).toBeCloseTo(1.5)
    expect(diagonal.y).toBeCloseTo(2)
    expect(diagonal.arrived).toBe(false)
  })

  it('arrive pile sur le point sans le dépasser', () => {
    expect(moveToward(0, 0, 2, 0, 5)).toEqual({ x: 2, y: 0, arrived: true })
    expect(moveToward(0, 0, 5, 0, 5)).toEqual({ x: 5, y: 0, arrived: true })
  })

  it('reste sur place s’il y est déjà', () => {
    expect(moveToward(4, 4, 4, 4, 1)).toEqual({ x: 4, y: 4, arrived: true })
  })
})

describe('computeAngleOf', () => {
  it('donne l’angle de chaque direction', () => {
    expect(computeAngleOf({ x: 1, y: 0 })).toBe(0)
    expect(computeAngleOf({ x: -1, y: 0 })).toBe(Math.PI)
    expect(computeAngleOf({ x: 0, y: 1 })).toBe(Math.PI / 2)
    expect(computeAngleOf({ x: 0, y: -1 })).toBe(-Math.PI / 2)
    expect(computeAngleOf({ x: 0, y: 0 })).toBe(0)
  })
})

describe('computeHeadingToward', () => {
  it('choisit l’axe le plus marqué', () => {
    expect(computeHeadingToward(0, 0, 10, 3)).toEqual({ x: 1, y: 0 })
    expect(computeHeadingToward(0, 0, -10, 3)).toEqual({ x: -1, y: 0 })
    expect(computeHeadingToward(0, 0, 2, 9)).toEqual({ x: 0, y: 1 })
    expect(computeHeadingToward(0, 0, 2, -9)).toEqual({ x: 0, y: -1 })
  })
})
