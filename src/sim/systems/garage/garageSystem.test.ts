// Les tests de la brique garage : elle tourne seule, avec le noyau et aucun autre système (test LEGO). Le joueur est déplacé à la main.
import { describe, expect, it } from 'vitest'
import { TUNING, createRegistry, createSimulation, createTestWorld, loadMap, spawnEntity, spawnVehicleEntity } from '../../core'
import type { Command, DealershipDef, GarageDef, TileMap, VehicleDef } from '../../core'
import { createGarageSystem } from './garageSystem'

const TILE = 32
/** 20 × 6 cases libres, et un mur en (10, 0). */
const MAP: TileMap = (() => {
  const solid = Array<boolean>(120).fill(false)
  solid[10] = true
  return { mapId: 'test', width: 20, height: 6, tileSize: TILE, tileKindIds: Array<string>(120).fill('road'), solid }
})()

const CAR: VehicleDef = { id: 'auto', name: 'Auto', width: 26, length: 46, maxSpeed: 200, maxReverseSpeed: 60, acceleration: 100, braking: 200, turnRate: 2, grip: 6, handbrakeGrip: 1 }
const DEALERSHIP: DealershipDef = {
  id: 'concession',
  name: 'Concession',
  mapId: 'test',
  place: { tileX: 2, tileY: 1 },
  delivery: { tileX: 2, tileY: 4, facing: 'right' },
  offers: [{ modelId: 'auto', price: 100 }],
}
const GARAGE: GarageDef = { id: 'garage', name: 'Garage', mapId: 'test', place: { tileX: 15, tileY: 1 }, parking: { tileX: 15, tileY: 4, facing: 'right' } }

const center = (tile: number) => (tile + 0.5) * TILE

function createScene() {
  const world = createTestWorld()
  loadMap(world, MAP)
  const player = spawnEntity(world, 'player', { position: { x: center(2), y: center(1), angle: 0 }, wallet: { money: 300 } })
  const system = createGarageSystem({ vehicles: createRegistry('Véhicule', [CAR]), dealerships: createRegistry('Concession', [DEALERSHIP]), garages: createRegistry('Garage', [GARAGE]) })
  const simulation = createSimulation(world, [system])
  const events: string[] = []
  world.events.on('garage:bought', (data) => events.push(`bought ${data.modelId} ${data.price}`))
  world.events.on('garage:stored', (data) => events.push(`stored ${data.modelId} stolen=${data.wasStolen}`))
  world.events.on('garage:taken-out', (data) => events.push(`taken-out ${data.modelId}`))
  world.events.on('garage:refused', (data) => events.push(`refused ${data.action}: ${data.why}`))
  const moveTo = (tileX: number, tileY: number) => {
    player.position!.x = center(tileX)
    player.position!.y = center(tileY)
  }
  const buy = (): Command => ({ type: 'dealership:buy', entityId: player.id, dealershipId: 'concession', modelId: 'auto' })
  const storeCommand = (): Command => ({ type: 'garage:store', entityId: player.id, garageId: 'garage' })
  const takeOut = (vehicleKey: number): Command => ({ type: 'garage:take-out', entityId: player.id, garageId: 'garage', vehicleKey })
  const vehicles = () => Object.values(world.entities).filter((entity) => entity.vehicle !== undefined)
  return { world, player, simulation, events, moveTo, buy, storeCommand, takeOut, vehicles }
}

describe('garageSystem : la concession', () => {
  it('vend une voiture : elle est payée, livrée sur la place et appartient au joueur', () => {
    const { player, simulation, events, buy, vehicles } = createScene()
    simulation.step([buy()])
    expect(player.wallet?.money).toBe(200)
    expect(events).toEqual(['bought auto 100'])
    const [car] = vehicles()
    expect(car?.position).toMatchObject({ x: center(2), y: center(4) })
    expect(car?.vehicle).toMatchObject({ ownerId: player.id, ownedKey: 1 })
    expect(player.vehicleCollection?.vehicles).toEqual([{ key: 1, modelId: 'auto', entityId: car?.id }])
  })

  it('refuse sans rien prendre quand il manque de l’argent', () => {
    const { player, simulation, events, buy, vehicles } = createScene()
    player.wallet = { money: 50 }
    simulation.step([buy()])
    expect(player.wallet.money).toBe(50)
    expect(vehicles()).toHaveLength(0)
    expect(events).toEqual(['refused buy: pas assez d’argent'])
  })

  it('refuse, avant de payer, quand la place de livraison est occupée', () => {
    const { world, player, simulation, events, buy } = createScene()
    spawnVehicleEntity(world, CAR, center(2), center(4), 'right')
    simulation.step([buy()])
    expect(player.wallet?.money).toBe(300)
    expect(events).toEqual(['refused buy: la place de livraison est occupée'])
  })

  it('refuse loin de la concession, ou au volant', () => {
    const { player, simulation, events, moveTo, buy } = createScene()
    moveTo(8, 1)
    simulation.step([buy()])
    moveTo(2, 1)
    player.driver = { vehicleId: 99, storedBody: { width: 24, height: 24, isSolid: true } }
    simulation.step([buy()])
    expect(events).toEqual(['refused buy: il faut entrer à pied dans la concession', 'refused buy: il faut entrer à pied dans la concession'])
    expect(player.wallet?.money).toBe(300)
  })
})

describe('garageSystem : le garage', () => {
  it('range la voiture garée devant, puis la ressort sur la place', () => {
    const { world, player, simulation, events, moveTo, buy, storeCommand, takeOut, vehicles } = createScene()
    simulation.step([buy()])
    // Le joueur amène sa voiture devant le garage.
    const car = vehicles()[0]!
    car.position!.x = center(15)
    car.position!.y = center(4)
    moveTo(15, 1)
    simulation.step([storeCommand()])
    expect(vehicles()).toHaveLength(0)
    expect(player.vehicleCollection?.vehicles).toEqual([{ key: 1, modelId: 'auto', storedIn: 'garage' }])
    simulation.step([takeOut(1)])
    const [outside] = vehicles()
    expect(outside?.position).toMatchObject({ x: center(15), y: center(4) })
    expect(outside?.vehicle?.ownerId).toBe(player.id)
    expect(player.vehicleCollection?.vehicles[0]).toEqual({ key: 1, modelId: 'auto', entityId: outside?.id })
    expect(events).toEqual(['bought auto 100', 'stored auto stolen=false', 'taken-out auto'])
    expect(world.stepCount).toBe(3)
  })

  it('garde un véhicule volé : rangé, il devient au joueur', () => {
    const { world, player, simulation, events, moveTo, storeCommand } = createScene()
    spawnVehicleEntity(world, CAR, center(15), center(4), 'right')
    moveTo(15, 1)
    simulation.step([storeCommand()])
    expect(events).toEqual(['stored auto stolen=true'])
    expect(player.vehicleCollection?.vehicles).toEqual([{ key: 1, modelId: 'auto', storedIn: 'garage' }])
  })

  it('ne range ni un véhicule trop loin, ni un véhicule occupé, ni celui d’un autre joueur', () => {
    const { world, simulation, events, moveTo, storeCommand } = createScene()
    spawnVehicleEntity(world, CAR, center(8), center(4), 'right')
    const occupied = spawnVehicleEntity(world, CAR, center(15), center(4), 'right')
    occupied.vehicle!.driverId = 42
    moveTo(15, 1)
    simulation.step([storeCommand()])
    occupied.vehicle!.driverId = undefined
    occupied.vehicle!.ownerId = 77
    simulation.step([storeCommand()])
    expect(events).toEqual(['refused store: aucun véhicule garé devant le garage', 'refused store: aucun véhicule garé devant le garage'])
  })

  it('refuse de ranger quand le garage est plein', () => {
    const { world, player, simulation, events, moveTo, storeCommand } = createScene()
    player.vehicleCollection = { nextKey: 10, vehicles: Array.from({ length: TUNING.garage.capacity }, (_, index) => ({ key: index + 1, modelId: 'auto', storedIn: 'garage' })) }
    spawnVehicleEntity(world, CAR, center(15), center(4), 'right')
    moveTo(15, 1)
    simulation.step([storeCommand()])
    expect(events).toEqual(['refused store: le garage est plein'])
  })

  it('refuse de sortir un véhicule quand la place est prise, ou qui n’est pas dans ce garage', () => {
    const { world, player, simulation, events, moveTo, takeOut } = createScene()
    player.vehicleCollection = { nextKey: 2, vehicles: [{ key: 1, modelId: 'auto', storedIn: 'garage' }] }
    spawnVehicleEntity(world, CAR, center(15), center(4), 'right')
    moveTo(15, 1)
    simulation.step([takeOut(1), takeOut(5)])
    expect(events).toEqual(['refused take-out: la place devant le garage est occupée', 'refused take-out: ce véhicule n’est pas dans ce garage'])
    expect(player.vehicleCollection.vehicles[0]?.storedIn).toBe('garage')
  })

  it('oublie l’entité d’un véhicule à soi qui a disparu de la ville', () => {
    const { world, player, simulation, buy, vehicles } = createScene()
    simulation.step([buy()])
    delete world.entities[vehicles()[0]!.id]
    simulation.step()
    expect(player.vehicleCollection?.vehicles).toEqual([{ key: 1, modelId: 'auto' }])
  })
})
