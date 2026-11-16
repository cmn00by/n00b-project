import { describe, expect, it } from 'vitest'
import { STEP_SECONDS, TUNING } from '../../core'
import type { VehicleDef } from '../../core'
import { NO_INPUT, computeBodySize, computeVelocity, steerHeading } from './vehiclePhysics'
import type { DriveInput, VehicleMotion } from './vehiclePhysics'

const CAR: VehicleDef = { id: 'test-car', name: 'Test', width: 20, length: 40, maxSpeed: 300, maxReverseSpeed: 60, acceleration: 200, braking: 400, turnRate: 3, grip: 8, handbrakeGrip: 1 }
const dt = STEP_SECONDS

/** Fait rouler une voiture pendant `steps` pas avec la même commande ; renvoie son état final. */
function drive(start: VehicleMotion, input: DriveInput, steps: number): VehicleMotion {
  let motion = start
  for (let i = 0; i < steps; i++) {
    const heading = steerHeading(motion, input, CAR, dt)
    motion = { ...motion, headingX: heading.x, headingY: heading.y }
    motion = { ...motion, ...computeVelocity(motion, input, CAR, dt) }
  }
  return motion
}

const stopped: VehicleMotion = { vx: 0, vy: 0, headingX: 0, headingY: -1 }
const gas: DriveInput = { throttle: 1, steer: 0, isHandbraking: false }
const speedOf = (motion: VehicleMotion): number => Math.sqrt(motion.vx * motion.vx + motion.vy * motion.vy)

describe('computeVelocity', () => {
  it('accélère dans le sens du nez, jusqu’à la vitesse maximale', () => {
    const oneSecond = drive(stopped, gas, 30)
    expect(oneSecond.vy).toBeCloseTo(-200)
    expect(oneSecond.vx).toBe(0)
    expect(speedOf(drive(stopped, gas, 300))).toBeCloseTo(CAR.maxSpeed)
  })

  it('freine avant de passer en marche arrière, et plafonne la marche arrière', () => {
    const fast = drive(stopped, gas, 30)
    const braking = drive(fast, { ...NO_INPUT, throttle: -1 }, 5)
    expect(braking.vy).toBeLessThan(0) // roule encore en avant
    expect(-braking.vy).toBeLessThan(-fast.vy)
    const reversing = drive(fast, { ...NO_INPUT, throttle: -1 }, 120)
    expect(reversing.vy).toBeCloseTo(CAR.maxReverseSpeed) // recule (vers le bas), à la vitesse maximale arrière
  })

  it('ralentit tout seul quand on lâche l’accélérateur, jusqu’à l’arrêt complet', () => {
    const fast = drive(stopped, gas, 30)
    expect(speedOf(drive(fast, NO_INPUT, 10))).toBeLessThan(speedOf(fast))
    expect(drive(fast, NO_INPUT, 300)).toMatchObject({ vx: 0, vy: 0 })
  })
})

describe('steerHeading', () => {
  it('ne tourne pas à l’arrêt', () => {
    expect(steerHeading(stopped, { ...NO_INPUT, steer: 1 }, CAR, dt)).toEqual({ x: 0, y: -1 })
  })

  it('tourne à droite en roulant, en gardant un cap de longueur 1', () => {
    const turned = drive(drive(stopped, gas, 30), { ...gas, steer: 1 }, 10)
    expect(turned.headingX).toBeGreaterThan(0.5)
    expect(Math.sqrt(turned.headingX ** 2 + turned.headingY ** 2)).toBeCloseTo(1, 10)
  })

  it('inverse la direction en marche arrière', () => {
    const reversing = drive(stopped, { ...NO_INPUT, throttle: -1 }, 30)
    expect(drive(reversing, { throttle: -1, steer: 1, isHandbraking: false }, 10).headingX).toBeLessThan(0)
  })
})

describe('dérapage', () => {
  /** Le glissement de côté juste après un virage serré : la part de la vitesse perpendiculaire au nez. */
  function slideAfterTurn(isHandbraking: boolean): number {
    const fast = drive(stopped, gas, 60)
    const turned = drive(fast, { throttle: 1, steer: 1, isHandbraking }, 12)
    return Math.abs(turned.vx * -turned.headingY + turned.vy * turned.headingX)
  }

  it('glisse un peu dans un virage, et beaucoup plus au frein à main', () => {
    const normal = slideAfterTurn(false)
    expect(normal).toBeGreaterThan(0)
    expect(slideAfterTurn(true)).toBeGreaterThan(normal * 2)
  })

  it("l'adhérence remet la voiture dans l'axe quand on arrête de tourner", () => {
    const turned = drive(drive(stopped, gas, 60), { ...gas, steer: 1 }, 12)
    const straight = drive(turned, gas, 30)
    expect(Math.abs(straight.vx * -straight.headingY + straight.vy * straight.headingX)).toBeLessThan(0.5)
  })
})

describe('computeBodySize', () => {
  it('donne la largeur et la longueur selon le sens du nez', () => {
    expect(computeBodySize(CAR, 0, -1)).toEqual({ width: 20, height: 40 })
    expect(computeBodySize(CAR, 1, 0)).toEqual({ width: 40, height: 20 })
  })

  it('englobe la voiture en diagonale', () => {
    const size = computeBodySize(CAR, Math.SQRT1_2, -Math.SQRT1_2)
    expect(size.width).toBeCloseTo(60 * Math.SQRT1_2)
    expect(size.height).toBeCloseTo(60 * Math.SQRT1_2)
  })
})

describe('réglages', () => {
  it('lit le seuil de braquage dans TUNING.driving', () => {
    expect(TUNING.driving.fullTurnSpeed).toBeGreaterThan(0)
  })
})
