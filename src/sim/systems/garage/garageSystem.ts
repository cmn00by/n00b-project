// La concession, le garage et l'atelier : acheter un véhicule, le ranger, le ressortir, le personnaliser.
// Expose : createGarageSystem().
// Pourquoi : l'aspect matériel du jeu (bloc 19). Les véhicules d'un joueur sont une liste de données simples (vehicleCollection) : chacun est soit dans la ville
// (son entité), soit rangé dans un garage. Les concessions, les garages et les modèles sont des données reçues à la création : cette brique n'en connaît aucun par son nom.
// L'achat est payé par spendMoney (noyau) dans le même pas : soit la voiture est livrée et payée, soit rien ne se passe.

import { SYSTEM_ORDER, TUNING, despawnEntity, findCommands, findEntitiesWith, findEntity, getTileCenter, isSpaceClear, spawnVehicleEntity, spendMoney } from '../../core'
import type { DealershipDef, Entity, EntityWith, GarageDef, ParkingSpot, Registry, System, VehicleCollection, VehicleDef, VehiclePartDef, VehiclePartSlot, WorkshopDef, World } from '../../core'
import { isAtPlace, isNearSpot } from './places'

type Player = EntityWith<'position'>
type Action = 'buy' | 'store' | 'take-out' | 'install' | 'remove'

function collectionOf(player: Entity): VehicleCollection {
  player.vehicleCollection ??= { nextKey: 1, vehicles: [] }
  return player.vehicleCollection
}

/** La place est-elle libre pour ce modèle (ni mur, ni voiture, ni piéton) ? */
function isSpotClear(world: World, def: VehicleDef, spot: ParkingSpot): boolean {
  if (world.map === undefined) return false
  const center = getTileCenter(world.map, spot)
  const isVertical = spot.facing === 'up' || spot.facing === 'down'
  return isSpaceClear(world, center.x, center.y, isVertical ? def.width : def.length, isVertical ? def.length : def.width)
}

/** Fait apparaître un véhicule sur une place, si elle est libre. */
function spawnOnSpot(world: World, def: VehicleDef, spot: ParkingSpot): Entity | undefined {
  if (world.map === undefined || !isSpotClear(world, def, spot)) return undefined
  const center = getTileCenter(world.map, spot)
  return spawnVehicleEntity(world, def, center.x, center.y, spot.facing)
}

export interface GarageContent {
  vehicles: Registry<VehicleDef>
  dealerships: Registry<DealershipDef>
  garages: Registry<GarageDef>
  workshops: Registry<WorkshopDef>
  parts: Registry<VehiclePartDef>
}

export function createGarageSystem({ vehicles, dealerships, garages, workshops, parts }: GarageContent): System {
  const refuse = (world: World, player: Player, action: Action, why: string) => world.events.emit('garage:refused', { entityId: player.id, action, why })

  function buy(world: World, player: Player, dealershipId: string, modelId: string) {
    const dealership = dealerships.find(dealershipId)
    const map = world.map
    if (dealership === undefined || map === undefined || dealership.mapId !== map.mapId) return refuse(world, player, 'buy', 'cette concession n’existe pas ici')
    if (player.driver !== undefined || !isAtPlace(player, dealership.place, map)) return refuse(world, player, 'buy', 'il faut entrer à pied dans la concession')
    const offer = dealership.offers.find((candidate) => candidate.modelId === modelId)
    const def = vehicles.find(modelId)
    if (offer === undefined || def === undefined) return refuse(world, player, 'buy', 'ce modèle n’est pas en vente ici')
    // On vérifie la place avant de payer : on ne paie jamais une voiture qui ne peut pas être livrée.
    if (!isSpotClear(world, def, dealership.delivery)) return refuse(world, player, 'buy', 'la place de livraison est occupée')
    if (!spendMoney(world, player, offer.price, `vehicle:${modelId}`)) return refuse(world, player, 'buy', 'pas assez d’argent')
    const vehicle = spawnOnSpot(world, def, dealership.delivery)
    if (vehicle?.vehicle === undefined) return
    const collection = collectionOf(player)
    const key = collection.nextKey++
    collection.vehicles.push({ key, modelId, entityId: vehicle.id })
    vehicle.vehicle.ownerId = player.id
    vehicle.vehicle.ownedKey = key
    world.events.emit('garage:bought', { entityId: player.id, dealershipId, modelId, price: offer.price, vehicleId: vehicle.id })
  }

  function store(world: World, player: Player, garageId: string) {
    const garage = garages.find(garageId)
    const map = world.map
    if (garage === undefined || map === undefined || garage.mapId !== map.mapId) return refuse(world, player, 'store', 'ce garage n’existe pas ici')
    if (player.driver !== undefined || !isAtPlace(player, garage.place, map)) return refuse(world, player, 'store', 'il faut descendre de voiture devant le garage')
    const collection = collectionOf(player)
    if (collection.vehicles.filter((owned) => owned.storedIn === garageId).length >= TUNING.garage.capacity) return refuse(world, player, 'store', 'le garage est plein')
    // Le véhicule libre le plus proche de la place devant le garage.
    const spotCenter = getTileCenter(map, garage.parking)
    let nearest: { vehicle: EntityWith<'position' | 'vehicle'>; distanceSquared: number } | undefined
    for (const vehicle of findEntitiesWith(world, ['position', 'vehicle'])) {
      if (vehicle.vehicle.driverId !== undefined || !isNearSpot(vehicle, garage.parking, map)) continue
      // Le véhicule d'un autre joueur ne se range pas chez soi.
      if (vehicle.vehicle.ownerId !== undefined && vehicle.vehicle.ownerId !== player.id) continue
      const dx = vehicle.position.x - spotCenter.x
      const dy = vehicle.position.y - spotCenter.y
      const distanceSquared = dx * dx + dy * dy
      if (nearest === undefined || distanceSquared < nearest.distanceSquared) nearest = { vehicle, distanceSquared }
    }
    if (nearest === undefined) return refuse(world, player, 'store', 'aucun véhicule garé devant le garage')

    const { vehicle } = nearest
    const wasStolen = vehicle.vehicle.ownerId === undefined
    let owned = collection.vehicles.find((candidate) => candidate.key === vehicle.vehicle.ownedKey && vehicle.vehicle.ownerId === player.id)
    if (owned === undefined) {
      owned = { key: collection.nextKey++, modelId: vehicle.vehicle.modelId }
      collection.vehicles.push(owned)
    }
    owned.storedIn = garageId
    delete owned.entityId
    // Ses pièces partent au garage avec lui.
    if (vehicle.vehicle.customization !== undefined) owned.customization = vehicle.vehicle.customization
    despawnEntity(world, vehicle.id)
    world.events.emit('garage:stored', { entityId: player.id, garageId, modelId: owned.modelId, vehicleKey: owned.key, wasStolen })
  }

  function takeOut(world: World, player: Player, garageId: string, vehicleKey: number) {
    const garage = garages.find(garageId)
    const map = world.map
    if (garage === undefined || map === undefined || garage.mapId !== map.mapId) return refuse(world, player, 'take-out', 'ce garage n’existe pas ici')
    if (player.driver !== undefined || !isAtPlace(player, garage.place, map)) return refuse(world, player, 'take-out', 'il faut être à pied devant le garage')
    const owned = collectionOf(player).vehicles.find((candidate) => candidate.key === vehicleKey && candidate.storedIn === garageId)
    const def = owned === undefined ? undefined : vehicles.find(owned.modelId)
    if (owned === undefined || def === undefined) return refuse(world, player, 'take-out', 'ce véhicule n’est pas dans ce garage')
    const vehicle = spawnOnSpot(world, def, garage.parking)
    if (vehicle?.vehicle === undefined) return refuse(world, player, 'take-out', 'la place devant le garage est occupée')
    vehicle.vehicle.ownerId = player.id
    vehicle.vehicle.ownedKey = owned.key
    if (owned.customization !== undefined) vehicle.vehicle.customization = owned.customization
    delete owned.customization
    delete owned.storedIn
    owned.entityId = vehicle.id
    world.events.emit('garage:taken-out', { entityId: player.id, garageId, modelId: owned.modelId, vehicleKey: owned.key, vehicleId: vehicle.id })
  }

  /** La voiture que le joueur conduit, s'il est au volant dans l'atelier. */
  function carInWorkshop(world: World, player: Player, workshopId: string, action: Action): EntityWith<'vehicle'> | undefined {
    const workshop = workshops.find(workshopId)
    const map = world.map
    if (workshop === undefined || map === undefined || workshop.mapId !== map.mapId) return void refuse(world, player, action, 'cet atelier n’existe pas ici')
    const car = player.driver === undefined ? undefined : findEntity(world, player.driver.vehicleId)
    if (car?.vehicle === undefined || !isAtPlace(player, workshop.place, map)) return void refuse(world, player, action, 'il faut entrer au volant dans l’atelier')
    return car as EntityWith<'vehicle'>
  }

  function install(world: World, player: Player, workshopId: string, partId: string) {
    const car = carInWorkshop(world, player, workshopId, 'install')
    if (car === undefined) return
    const part = parts.find(partId)
    if (part === undefined) return refuse(world, player, 'install', 'cette pièce n’existe pas')
    if (car.vehicle.customization?.[part.slot] === partId) return refuse(world, player, 'install', 'cette pièce est déjà installée')
    if (!spendMoney(world, player, part.price, `part:${partId}`)) return refuse(world, player, 'install', 'pas assez d’argent')
    car.vehicle.customization = { ...car.vehicle.customization, [part.slot]: partId }
    world.events.emit('workshop:installed', { entityId: player.id, vehicleId: car.id, partId, price: part.price })
  }

  function remove(world: World, player: Player, workshopId: string, slot: VehiclePartSlot) {
    const car = carInWorkshop(world, player, workshopId, 'remove')
    if (car === undefined) return
    if (car.vehicle.customization?.[slot] === undefined) return refuse(world, player, 'remove', 'c’est déjà d’origine')
    const customization = { ...car.vehicle.customization }
    delete customization[slot]
    car.vehicle.customization = customization
    world.events.emit('workshop:removed', { entityId: player.id, vehicleId: car.id, slot })
  }

  return {
    id: 'garage',
    order: SYSTEM_ORDER.rules,
    step(world) {
      const playerOf = (entityId: number): Player | undefined => {
        const entity = findEntity(world, entityId)
        return entity?.kind === 'player' && entity.position !== undefined ? (entity as Player) : undefined
      }
      for (const command of findCommands(world.commands, 'dealership:buy')) {
        const player = playerOf(command.entityId)
        if (player !== undefined) buy(world, player, command.dealershipId, command.modelId)
      }
      for (const command of findCommands(world.commands, 'garage:store')) {
        const player = playerOf(command.entityId)
        if (player !== undefined) store(world, player, command.garageId)
      }
      for (const command of findCommands(world.commands, 'garage:take-out')) {
        const player = playerOf(command.entityId)
        if (player !== undefined) takeOut(world, player, command.garageId, command.vehicleKey)
      }
      for (const command of findCommands(world.commands, 'workshop:install')) {
        const player = playerOf(command.entityId)
        if (player !== undefined) install(world, player, command.workshopId, command.partId)
      }
      for (const command of findCommands(world.commands, 'workshop:remove')) {
        const player = playerOf(command.entityId)
        if (player !== undefined) remove(world, player, command.workshopId, command.slot)
      }
      // Un véhicule à soi qui a disparu de la ville (détruit, plus tard) ne reste pas « dans la ville » dans la collection.
      for (const player of findEntitiesWith(world, ['position', 'vehicleCollection'])) {
        for (const owned of player.vehicleCollection.vehicles) if (owned.entityId !== undefined && findEntity(world, owned.entityId) === undefined) delete owned.entityId
      }
    },
  }
}
