import { describe, expect, it } from 'vitest'
import { TUNING, createTestWorld, spawnEntity } from '../../core'
import { computeLaunchVelocity, findMovingVehicles, findNearestWalkableTile, findVehicleHit, stepFlight } from './impact'
import type { MovingVehicle } from './impact'
import { makeTestMap } from './testMap'

const T = TUNING.pedestrians
const CAR: MovingVehicle = { id: 9, x: 100, y: 100, width: 40, height: 20, vx: 300, vy: 0 }

describe('findVehicleHit', () => {
  it('touche un piéton qui est sous la carrosserie, avec la vitesse et la direction du véhicule', () => {
    expect(findVehicleHit(110, 100, [CAR], T)).toEqual({ vehicleId: 9, speed: 300, directionX: 1, directionY: 0 })
  })

  it('ne touche pas un piéton à côté', () => {
    expect(findVehicleHit(100, 130, [CAR], T)).toBeUndefined()
    expect(findVehicleHit(170, 100, [CAR], T)).toBeUndefined()
  })

  it('ne touche pas quand on est pile au bord : on peut se coller à un véhicule', () => {
    const edge = CAR.x + (CAR.width + T.bodySize) / 2
    expect(findVehicleHit(edge, 100, [CAR], T)).toBeUndefined()
  })

  it('ne touche personne quand il roule moins vite que le seuil', () => {
    expect(findVehicleHit(110, 100, [{ ...CAR, vx: T.hitMinSpeed - 1 }], T)).toBeUndefined()
    expect(findVehicleHit(110, 100, [{ ...CAR, vx: T.hitMinSpeed + 1 }], T)).toBeDefined()
  })

  it('donne la direction du déplacement, y compris en diagonale', () => {
    const hit = findVehicleHit(100, 100, [{ ...CAR, vx: 150, vy: -200 }], T)
    expect(hit?.speed).toBeCloseTo(250)
    expect(hit?.directionX).toBeCloseTo(0.6)
    expect(hit?.directionY).toBeCloseTo(-0.8)
  })
})

describe('computeLaunchVelocity', () => {
  const hit = (speed: number) => ({ vehicleId: 1, speed, directionX: 0, directionY: -1 })

  it('part dans le sens du véhicule', () => {
    const { vx, vy } = computeLaunchVelocity(hit(200), T)
    expect(vx).toBeCloseTo(0)
    expect(vy).toBeLessThan(0)
  })

  it('part plus fort quand le véhicule va plus vite', () => {
    expect(Math.abs(computeLaunchVelocity(hit(250), T).vy)).toBeGreaterThan(Math.abs(computeLaunchVelocity(hit(150), T).vy))
  })

  it('dévie de côté avec le tirage de côté, d’autant plus qu’il est grand, sans changer la force', () => {
    const straight = computeLaunchVelocity(hit(200), T, { side: 0, power: 0 })
    const right = computeLaunchVelocity(hit(200), T, { side: 1, power: 0 })
    const left = computeLaunchVelocity(hit(200), T, { side: -1, power: 0 })
    expect(Math.abs(straight.vx)).toBeCloseTo(0)
    expect(right.vx * left.vx).toBeLessThan(0)
    expect(Math.abs(right.vx)).toBeGreaterThan(10)
    expect(Math.sqrt(right.vx ** 2 + right.vy ** 2)).toBeCloseTo(Math.sqrt(straight.vx ** 2 + straight.vy ** 2))
    expect(Math.abs(computeLaunchVelocity(hit(200), T, { side: 0.5, power: 0 }).vx)).toBeLessThan(Math.abs(right.vx))
  })

  it('part plus ou moins fort avec le tirage de force', () => {
    const weak = Math.abs(computeLaunchVelocity(hit(200), T, { side: 0, power: -1 }).vy)
    const strong = Math.abs(computeLaunchVelocity(hit(200), T, { side: 0, power: 1 }).vy)
    expect(strong).toBeGreaterThan(weak)
  })

  it('sans écart (réglages à 0), les tirages ne changent rien', () => {
    const none = { ...T, launchSpread: 0, launchPowerJitter: 0 }
    expect(computeLaunchVelocity(hit(200), none, { side: 1, power: 1 })).toEqual(computeLaunchVelocity(hit(200), none, { side: 0, power: 0 }))
  })

  it('reste entre le minimum et le maximum', () => {
    expect(Math.abs(computeLaunchVelocity(hit(T.hitMinSpeed), T).vy)).toBeCloseTo(T.launchMinSpeed)
    expect(Math.abs(computeLaunchVelocity(hit(5000), T).vy)).toBeCloseTo(T.launchMaxSpeed)
    expect(Math.abs(computeLaunchVelocity(hit(5000), T, { side: 0, power: 1 }).vy)).toBeCloseTo(T.launchMaxSpeed)
    expect(Math.abs(computeLaunchVelocity(hit(T.hitMinSpeed), T, { side: 0, power: -1 }).vy)).toBeCloseTo(T.launchMinSpeed)
  })
})

describe('stepFlight', () => {
  const OPEN = makeTestMap(['rrrrrrrrrr', 'rrrrrrrrrr', 'rrrrrrrrrr'])
  const STEPS = 21
  const DT = 1 / 30

  it('avance dans le sens du vol puis ralentit jusqu’à l’arrêt au dernier pas', () => {
    let position = { x: 60, y: 48 }
    let flight = { vx: 300, vy: 0 }
    const speeds: number[] = []
    for (let stepsLeft = STEPS; stepsLeft >= 1; stepsLeft--) {
      const next = stepFlight(OPEN, position, flight, stepsLeft, DT, T)
      speeds.push(next.vx)
      position = { x: next.x, y: next.y }
      flight = { vx: next.vx, vy: next.vy }
    }
    expect(position.x).toBeGreaterThan(60 + 60)
    expect(speeds[speeds.length - 1]).toBe(0)
    for (let index = 1; index < speeds.length; index++) expect(speeds[index]).toBeLessThanOrEqual(speeds[index - 1] ?? 0)
  })

  it('s’arrête contre un mur sans le traverser', () => {
    const walled = makeTestMap(['rrrrr#rrrr', 'rrrrr#rrrr', 'rrrrr#rrrr'])
    let position = { x: 140, y: 48 }
    let flight = { vx: 300, vy: 0 }
    for (let stepsLeft = STEPS; stepsLeft >= 1; stepsLeft--) {
      const next = stepFlight(walled, position, flight, stepsLeft, DT, T)
      position = { x: next.x, y: next.y }
      flight = { vx: next.vx, vy: next.vy }
    }
    expect(position.x).toBeLessThanOrEqual(5 * 32 - T.bodySize / 2)
    expect(position.x).toBeGreaterThan(140)
  })

  it('glisse le long d’un mur quand il le frôle en diagonale', () => {
    const walled = makeTestMap(['rrrrrrrrrr', 'rrrrrrrrrr', '##########'])
    const next = stepFlight(walled, { x: 150, y: 50 }, { vx: 200, vy: 300 }, 10, DT, T)
    expect(next.x).toBeGreaterThan(150)
    expect(next.vy).toBe(0)
    expect(next.y).toBe(50)
  })

  it('ne sort pas de la carte', () => {
    const next = stepFlight(OPEN, { x: 10, y: 48 }, { vx: -300, vy: 0 }, 10, DT, T)
    expect(next.x).toBeGreaterThanOrEqual(T.bodySize / 2 - 0.001)
  })
})

describe('findNearestWalkableTile', () => {
  const STREET = makeTestMap(['rrrrrrrrrr', 'rrrrrrrrrr', 'ssssssssss'])

  it('trouve le trottoir le plus proche', () => {
    expect(findNearestWalkableTile(STREET, 100, 20, T)).toEqual({ tileX: 3, tileY: 2 })
  })

  it('renvoie la case où il est déjà s’il est sur un trottoir', () => {
    expect(findNearestWalkableTile(STREET, 100, 80, T)).toEqual({ tileX: 3, tileY: 2 })
  })

  it('renvoie undefined quand aucun trottoir n’est dans la distance de recherche', () => {
    expect(findNearestWalkableTile(makeTestMap(['rrrrrrrrrr', 'rrrrrrrrrr']), 100, 20, T)).toBeUndefined()
  })
})

describe('findMovingVehicles', () => {
  const vehicle = (vx: number, vy: number, hasBody = true) => ({
    position: { x: 50, y: 60, angle: 0 },
    velocity: { vx, vy },
    vehicle: { modelId: 'test', headingX: 1, headingY: 0 },
    ...(hasBody ? { body: { width: 40, height: 20, isSolid: true } } : {}),
  })

  it('liste les véhicules qui roulent, avec leur carrosserie', () => {
    const world = createTestWorld()
    const car = spawnEntity(world, 'vehicle', vehicle(120, -30))
    expect(findMovingVehicles(world)).toEqual([{ id: car.id, x: 50, y: 60, width: 40, height: 20, vx: 120, vy: -30 }])
  })

  it('ignore un véhicule à l’arrêt, un véhicule sans corps et une entité qui n’est pas un véhicule', () => {
    const world = createTestWorld()
    spawnEntity(world, 'vehicle', vehicle(0, 0))
    spawnEntity(world, 'vehicle', vehicle(100, 0, false))
    spawnEntity(world, 'prop', { position: { x: 0, y: 0, angle: 0 }, velocity: { vx: 200, vy: 0 }, body: { width: 10, height: 10, isSolid: true } })
    expect(findMovingVehicles(world)).toEqual([])
  })
})
