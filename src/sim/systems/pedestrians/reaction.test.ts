import { describe, expect, it } from 'vitest'
import { TUNING } from '../../core'
import { computeFleeDistance, decideReaction } from './reaction'
import type { Threat } from './reaction'

const T = TUNING.pedestrians

// Le piéton est en (100, 0). La menace arrive de la gauche, en courant vers lui.
function runningTowardPedestrian(distance: number, speed = TUNING.walking.runSpeed): Threat {
  return { x: 100 - distance, y: 0, directionX: 1, directionY: 0, speed }
}

describe('computeFleeDistance', () => {
  it('fuit de loin quand on est peureux et de près quand on est courageux', () => {
    expect(computeFleeDistance(0, T)).toBe(T.fleeDistanceMax)
    expect(computeFleeDistance(1, T)).toBe(T.fleeDistanceMin)
    expect(computeFleeDistance(0.5, T)).toBeCloseTo((T.fleeDistanceMax + T.fleeDistanceMin) / 2)
  })
})

describe('decideReaction', () => {
  it('ignore ce qui est loin', () => {
    expect(decideReaction(100, 0, 0.5, runningTowardPedestrian(T.noticeDistance + 10), T)).toBe('ignore')
  })

  it('remarque ce qui fonce sur lui de loin, sans encore fuir', () => {
    expect(decideReaction(100, 0, 0.5, runningTowardPedestrian(T.noticeDistance - 5), T)).toBe('notice')
  })

  it('fuit quand ça fonce sur lui de près', () => {
    expect(decideReaction(100, 0, 0.5, runningTowardPedestrian(20), T)).toBe('flee')
  })

  it('ignore un joueur qui marche : ça ne fait pas peur', () => {
    expect(decideReaction(100, 0, 0, runningTowardPedestrian(10, TUNING.walking.walkSpeed), T)).toBe('ignore')
  })

  it('ignore ce qui court en s’éloignant de lui', () => {
    const awayFromPedestrian: Threat = { x: 80, y: 0, directionX: -1, directionY: 0, speed: TUNING.walking.runSpeed }
    expect(decideReaction(100, 0, 0.5, awayFromPedestrian, T)).toBe('ignore')
  })

  it('ignore ce qui passe à côté sans foncer vers lui', () => {
    const passingBy: Threat = { x: 80, y: 0, directionX: 0, directionY: 1, speed: TUNING.walking.runSpeed }
    expect(decideReaction(100, 0, 0.5, passingBy, T)).toBe('ignore')
  })

  it('un peureux fuit à une distance où un courageux se contente de regarder', () => {
    const threat = runningTowardPedestrian((T.fleeDistanceMin + T.fleeDistanceMax) / 2)
    expect(decideReaction(100, 0, 0, threat, T)).toBe('flee')
    expect(decideReaction(100, 0, 1, threat, T)).toBe('notice')
  })

  it('fuit quand la menace est exactement sur lui', () => {
    expect(decideReaction(100, 0, 1, { x: 100, y: 0, directionX: 0, directionY: 0, speed: TUNING.walking.runSpeed }, T)).toBe('flee')
  })

  it('compte une direction en diagonale (vecteur non unitaire)', () => {
    const diagonal: Threat = { x: 80, y: -20, directionX: 1, directionY: 1, speed: TUNING.walking.runSpeed }
    expect(decideReaction(100, 0, 0.5, diagonal, T)).toBe('flee')
  })
})
