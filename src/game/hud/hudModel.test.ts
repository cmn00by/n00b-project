import { describe, expect, it } from 'vitest'
import { computeHearts, computeStars, formatMoney } from './hudModel'

describe('computeHearts', () => {
  it('donne un cœur par point de vie maximum, pleins puis vides', () => {
    expect(computeHearts(3, 5)).toEqual([true, true, true, false, false])
    expect(computeHearts(5, 5)).toEqual([true, true, true, true, true])
    expect(computeHearts(0, 3)).toEqual([false, false, false])
  })

  it('ne déborde jamais du maximum ni ne descend sous zéro', () => {
    expect(computeHearts(9, 3)).toEqual([true, true, true])
    expect(computeHearts(-2, 3)).toEqual([false, false, false])
  })

  it('arrondit une santé fractionnaire vers le bas : un demi-cœur ne compte pas', () => {
    expect(computeHearts(2.9, 4)).toEqual([true, true, false, false])
  })

  it('résiste aux valeurs absurdes', () => {
    expect(computeHearts(Number.NaN, 3)).toEqual([false, false, false])
    expect(computeHearts(2, Number.NaN)).toEqual([])
    expect(computeHearts(2, -1)).toEqual([])
    expect(computeHearts(Number.POSITIVE_INFINITY, 2)).toEqual([false, false])
  })
})

describe('computeStars', () => {
  it('allume autant d’étoiles que le niveau de recherche, sur trois', () => {
    expect(computeStars(0, 3)).toEqual([false, false, false])
    expect(computeStars(1, 3)).toEqual([true, false, false])
    expect(computeStars(3, 3)).toEqual([true, true, true])
  })

  it('ne dépasse pas le niveau maximum', () => {
    expect(computeStars(5, 3)).toEqual([true, true, true])
  })
})

describe('formatMoney', () => {
  it('écrit l’argent en euros', () => {
    expect(formatMoney(0)).toBe('0 €')
    expect(formatMoney(120)).toBe('120 €')
  })

  it('sépare les milliers par une espace', () => {
    expect(formatMoney(1250)).toBe('1 250 €')
    expect(formatMoney(1234567)).toBe('1 234 567 €')
    expect(formatMoney(100000)).toBe('100 000 €')
  })

  it('écrit une dette avec un signe moins', () => {
    expect(formatMoney(-45)).toBe('-45 €')
    expect(formatMoney(-12500)).toBe('-12 500 €')
  })

  it('ignore les centimes et les valeurs invalides', () => {
    expect(formatMoney(99.9)).toBe('99 €')
    expect(formatMoney(Number.NaN)).toBe('0 €')
    expect(formatMoney(Number.POSITIVE_INFINITY)).toBe('0 €')
  })
})
