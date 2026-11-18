import { describe, expect, it } from 'vitest'
import { PEDESTRIAN_VIEW } from '../constants'
import { computeArmAngles, computeYaw, turnToward } from './pedestrianPose'

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

describe('computeArmAngles', () => {
  it('balance les bras en sens inverse quand il marche', () => {
    expect(computeArmAngles('walking', 0.5, 0, PEDESTRIAN_VIEW)).toEqual([-0.5, 0.5])
    expect(computeArmAngles('fleeing', 0.9, 3, PEDESTRIAN_VIEW)).toEqual([-0.9, 0.9])
  })

  it('tend le bras droit pour filmer, et laisse tomber l’autre, quoi que fasse le balancement', () => {
    expect(computeArmAngles('filming', 0.7, 1.3, PEDESTRIAN_VIEW)).toEqual([0, PEDESTRIAN_VIEW.filmArmAngle])
  })

  it('lève les deux bras quand il râle, en les secouant en sens inverse', () => {
    const [left, right] = computeArmAngles('angry', 0, 0.1, PEDESTRIAN_VIEW)
    expect(left).toBeGreaterThan(Math.PI / 2)
    expect(right).toBeGreaterThan(Math.PI / 2)
    expect(left - PEDESTRIAN_VIEW.angryArmAngle).toBeCloseTo(-(right - PEDESTRIAN_VIEW.angryArmAngle))
  })

  it('secoue les bras : ils ne restent pas figés au cours du temps', () => {
    const first = computeArmAngles('angry', 0, 0.05, PEDESTRIAN_VIEW)
    const later = computeArmAngles('angry', 0, 0.15, PEDESTRIAN_VIEW)
    expect(first[0]).not.toBeCloseTo(later[0])
  })
})
