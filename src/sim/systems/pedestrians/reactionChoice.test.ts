import { describe, expect, it } from 'vitest'
import { createRng } from '../../core'
import { WATCH_STATES, chooseGetUpState, chooseWatchState, isWatchState } from './reactionChoice'
import type { WatchState } from './reactionChoice'

function countChoices(weights: { stare: number; curious: number; filming: number; angry: number }, times: number, seed = 1) {
  const rng = createRng(seed)
  const counts: Record<WatchState, number> = { noticing: 0, curious: 0, filming: 0, angry: 0 }
  for (let index = 0; index < times; index++) counts[chooseWatchState(weights, rng)] += 1
  return counts
}

describe('chooseWatchState', () => {
  it('ne choisit jamais une réaction dont le poids est 0', () => {
    const counts = countChoices({ stare: 0, curious: 1, filming: 0, angry: 1 }, 2000)
    expect(counts.noticing).toBe(0)
    expect(counts.filming).toBe(0)
    expect(counts.curious).toBeGreaterThan(0)
    expect(counts.angry).toBeGreaterThan(0)
  })

  it('choisit toujours la seule réaction possible', () => {
    expect(countChoices({ stare: 0, curious: 0, filming: 5, angry: 0 }, 200).filming).toBe(200)
  })

  it('respecte le rapport des poids', () => {
    const counts = countChoices({ stare: 1, curious: 0, filming: 3, angry: 0 }, 8000)
    expect(counts.filming / counts.noticing).toBeGreaterThan(2.6)
    expect(counts.filming / counts.noticing).toBeLessThan(3.4)
  })

  it('donne le même résultat avec la même graine', () => {
    const weights = { stare: 1, curious: 1, filming: 1, angry: 1 }
    expect(countChoices(weights, 500, 7)).toEqual(countChoices(weights, 500, 7))
  })

  it('fait varier les réactions : avec des poids égaux, tout le monde est tiré', () => {
    const counts = countChoices({ stare: 1, curious: 1, filming: 1, angry: 1 }, 2000)
    for (const state of WATCH_STATES) expect(counts[state]).toBeGreaterThan(300)
  })
})

describe('isWatchState', () => {
  it('reconnaît les états où on regarde, et seulement eux', () => {
    for (const state of WATCH_STATES) expect(isWatchState(state)).toBe(true)
    for (const state of ['walking', 'pausing', 'fleeing']) expect(isWatchState(state)).toBe(false)
  })
})

describe('chooseGetUpState', () => {
  it('ne choisit jamais la curiosité : il n’y a plus rien vers quoi s’approcher', () => {
    const rng = createRng(3)
    for (let index = 0; index < 500; index++) expect(chooseGetUpState({ stare: 1, curious: 5, filming: 1, angry: 1 }, rng)).not.toBe('curious')
  })

  it('râle quand son type ne fait que de la curiosité', () => {
    expect(chooseGetUpState({ stare: 0, curious: 1, filming: 0, angry: 0 }, createRng(1))).toBe('angry')
  })

  it('respecte les autres poids', () => {
    const rng = createRng(4)
    const counts: Record<string, number> = { noticing: 0, filming: 0, angry: 0 }
    for (let index = 0; index < 3000; index++) {
      const state = chooseGetUpState({ stare: 1, curious: 3, filming: 2, angry: 0 }, rng)
      counts[state] = (counts[state] ?? 0) + 1
    }
    expect(counts.angry).toBe(0)
    expect(counts.filming ?? 0).toBeGreaterThan((counts.noticing ?? 0) * 1.6)
  })
})
