import { describe, expect, it } from 'vitest'
import { createRegistry, createSimulation, createTestWorld, createTileMap, createWorld, loadMap, spawnEntity, STEPS_PER_SECOND } from '../../core'
import type { Command, Entity, Simulation, TileKindDef, World } from '../../core'
import { collisionSystem } from '../collision'
import { drivingSystem } from './drivingSystem'
import { spawnVehicle } from './spawnVehicle'

const TILE_KINDS = createRegistry<TileKindDef>('Type de case', [
  { id: 'floor', isSolid: false },
  { id: 'wall', isSolid: true },
])

/** Un parking de 20 × 12 cases de 32 px, entouré par le bord de la carte. */
function loadParking(world: World): void {
  const rows = Array.from({ length: 12 }, () => '....................')
  loadMap(world, createTileMap({ id: 'parking', name: 'Parking', tileSize: 32, rows, legend: { '.': 'floor', '#': 'wall' }, spawns: { player: { tileX: 1, tileY: 1 } } }, TILE_KINDS))
}

function createScene(world: World = createTestWorld()): { simulation: Simulation; player: Entity; car: Entity } {
  loadParking(world)
  const simulation = createSimulation(world, [drivingSystem, collisionSystem])
  const car = spawnVehicle(world, 'mamie-car', 320, 192, 'up')
  const player = spawnEntity(world, 'player', { position: { x: 290, y: 192, angle: 0 }, body: { width: 24, height: 24, isSolid: true } })
  return { simulation, player, car }
}

const interact = (player: Entity): Command => ({ type: 'player:interact', entityId: player.id })
const driveCommand = (player: Entity, throttle: number, steer = 0, isHandbraking = false): Command => ({ type: 'vehicle:drive', entityId: player.id, throttle, steer, isHandbraking })

function stepFor(simulation: Simulation, seconds: number, commands: () => Command[]): void {
  for (let i = 0; i < seconds * STEPS_PER_SECOND; i++) simulation.step(commands())
}

describe('monter et descendre', () => {
  it('monte dans la voiture proche : le corps du joueur est mis de côté et il suit la voiture', () => {
    const { simulation, player, car } = createScene()
    const entered: number[] = []
    simulation.world.events.on('vehicle:entered', (event) => entered.push(event.vehicleId))
    simulation.step([interact(player)])
    expect(player.driver?.vehicleId).toBe(car.id)
    expect(player.body).toBeUndefined()
    expect(car.vehicle?.driverId).toBe(player.id)
    expect(entered).toEqual([car.id])
  })

  it('refuse de monter dans une voiture trop loin', () => {
    const { simulation, player } = createScene()
    player.position = { x: 100, y: 100, angle: 0 }
    simulation.step([interact(player)])
    expect(player.driver).toBeUndefined()
  })

  it('descend sur le côté, sur une place libre, et retrouve son corps', () => {
    const { simulation, player, car } = createScene()
    simulation.step([interact(player)])
    simulation.step([interact(player)])
    expect(player.driver).toBeUndefined()
    expect(player.body).toEqual({ width: 24, height: 24, isSolid: true })
    expect(car.vehicle?.driverId).toBeUndefined()
    expect(player.position?.x).toBeLessThan(car.position?.x ?? 0) // côté gauche, le nez pointant vers le haut
  })

  it('refuse de descendre quand tout est bouché autour de la voiture', () => {
    const { simulation, player } = createScene()
    simulation.step([interact(player)])
    const blockers: Array<[number, number]> = [
      [270, 192],
      [370, 192],
      [320, 130],
      [320, 254],
    ]
    for (const [x, y] of blockers) spawnEntity(simulation.world, 'prop', { position: { x, y, angle: 0 }, body: { width: 40, height: 40, isSolid: true } })
    simulation.step([interact(player)])
    expect(player.driver).toBeDefined()
  })
})

describe('conduire', () => {
  it('avance quand on accélère, et le conducteur suit', () => {
    const { simulation, player, car } = createScene()
    simulation.step([interact(player)])
    stepFor(simulation, 0.5, () => [driveCommand(player, 1)])
    expect(car.position?.y).toBeLessThan(192)
    expect(player.position).toMatchObject({ x: car.position?.x, y: car.position?.y })
  })

  it("une voiture sans conducteur n'obéit à personne", () => {
    const { simulation, player, car } = createScene()
    stepFor(simulation, 0.5, () => [driveCommand(player, 1)])
    expect(car.position).toMatchObject({ x: 320, y: 192 })
  })

  it('tourne et change la taille de son corps en conséquence', () => {
    const { simulation, player, car } = createScene()
    simulation.step([interact(player)])
    stepFor(simulation, 0.4, () => [driveCommand(player, 1)])
    stepFor(simulation, 0.6, () => [driveCommand(player, 1, 1)])
    expect(car.vehicle?.headingX).toBeGreaterThan(0.5)
    expect(car.body?.width).toBeGreaterThan(26)
  })

  it("s'arrête contre le bord de la carte, et perd sa vitesse", () => {
    const { simulation, player, car } = createScene()
    const impacts: number[] = []
    simulation.world.events.on('entity:blocked', (event) => event.entityId === car.id && impacts.push(event.impactSpeed))
    simulation.step([interact(player)])
    stepFor(simulation, 4, () => [driveCommand(player, 1)])
    expect(car.position?.y).toBeCloseTo(23, 0) // le haut de la voiture (46 de long) touche le bord
    expect(car.velocity?.vy).toBeCloseTo(0, 0)
    expect(impacts.length).toBeGreaterThan(0)
  })

  it('ne traverse pas une autre voiture', () => {
    const { simulation, player, car } = createScene()
    const other = spawnVehicle(simulation.world, 'delivery-van', 320, 60, 'left')
    simulation.step([interact(player)])
    stepFor(simulation, 3, () => [driveCommand(player, 1)])
    const carTop = (car.position?.y ?? 0) - (car.body?.height ?? 0) / 2
    const otherBottom = (other.position?.y ?? 0) + (other.body?.height ?? 0) / 2
    expect(carTop).toBeGreaterThanOrEqual(otherBottom)
  })
})

describe('déterminisme', () => {
  it('même graine et mêmes commandes : exactement le même trajet', () => {
    function run(): string {
      const { simulation, player, car } = createScene(createWorld(7))
      simulation.step([interact(player)])
      for (let i = 0; i < 240; i++) simulation.step([driveCommand(player, i % 50 < 35 ? 1 : -1, (i % 30) / 15 - 1, i % 40 > 30)])
      return JSON.stringify([car.position, car.velocity, car.vehicle])
    }
    expect(run()).toBe(run())
  })
})
