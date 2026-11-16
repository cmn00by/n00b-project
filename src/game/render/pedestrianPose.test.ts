import { describe, expect, it } from 'vitest'
import { computeYaw, turnToward } from './pedestrianPose'

describe('computeYaw', () => {
  it('regarde vers le haut de la carte (-y) sans tourner', () => {
    expect(computeYaw(0, -1)).toBeCloseTo(0)
  })

  it('regarde vers les quatre directions', () => {
    expect(computeYaw(1, 0)).toBeCloseTo(-Math.PI / 2)
    expect(computeYaw(-1, 0)).toBeCloseTo(Math.PI / 2)
    expect(Math.abs(computeYaw(0, 1))).toBeCloseTo(Math.PI)
  })
})

describe('turnToward', () => {
  it('arrive pile sur la cible quand elle est à portée', () => {
    expect(turnToward(0, 0.1, 0.5)).toBe(0.1)
  })

  it('ne tourne que d’un pas quand la cible est loin', () => {
    expect(turnToward(0, 2, 0.5)).toBeCloseTo(0.5)
    expect(turnToward(0, -2, 0.5)).toBeCloseTo(-0.5)
  })

  it('prend le chemin le plus court, en passant par l’arrière', () => {
    // De 170° vers -170° : 20° par la gauche, pas 340° par la droite.
    const degrees = (value: number) => (value * Math.PI) / 180
    expect(turnToward(degrees(170), degrees(-170), degrees(5))).toBeCloseTo(degrees(175))
    expect(turnToward(degrees(-170), degrees(170), degrees(5))).toBeCloseTo(degrees(-175))
  })

  it('finit par atteindre la cible en plusieurs pas', () => {
    let yaw = 0
    for (let step = 0; step < 20; step++) yaw = turnToward(yaw, 3, 0.4)
    expect(yaw).toBe(3)
  })

  it('reste immobile quand il regarde déjà la cible', () => {
    expect(turnToward(1.2, 1.2, 0.5)).toBe(1.2)
  })
})
