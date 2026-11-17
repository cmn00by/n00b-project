// Ce que le joueur voit de la concession et du garage : leurs repères sur la carte, et le panneau de choix quand il s'y trouve.
// Expose : ShopChoice, ShopPanel, ShopGuide, describeShops().
// Pourquoi : une règle pure, testée sans navigateur. Elle lit l'état de la simulation et les fiches (concessions, garages, modèles), et propose des choix
// sous forme de commandes : l'interface n'a qu'à envoyer la commande choisie. La simulation (brique garage) revérifie tout et peut refuser.

import { DEFAULT_PLACE_RADIUS_TILES, TUNING, findEntitiesWith, getTileCenter } from '../sim/core'
import type { Command, DealershipDef, EntityWith, GarageDef, MissionPlace, Registry, TileMap, VehicleDef, World } from '../sim/core'
import { formatMoney } from './hud'
import { toPlaceMarker } from './placeMarker'
import type { PlaceMarker } from './placeMarker'

/** Un choix du panneau : son texte, un détail (prix, état) et la commande à envoyer ; absente si le choix est grisé. */
export interface ShopChoice {
  label: string
  detail: string
  command?: Command
}

export interface ShopPanel {
  title: string
  /** Une ligne d'aide sous le titre (l'argent du joueur, ou comment faire). */
  hint: string
  choices: ShopChoice[]
}

export interface ShopGuide {
  markers: PlaceMarker[]
  panel?: ShopPanel
}

export interface ShopContent {
  vehicles: Registry<VehicleDef>
  dealerships: Registry<DealershipDef>
  garages: Registry<GarageDef>
}

const isWithin = (x: number, y: number, center: { x: number; y: number }, radius: number): boolean => {
  const dx = x - center.x
  const dy = y - center.y
  return dx * dx + dy * dy <= radius * radius
}
const isAtPlace = (player: EntityWith<'position'>, place: MissionPlace, map: TileMap): boolean =>
  isWithin(player.position.x, player.position.y, getTileCenter(map, place), (place.radiusTiles ?? DEFAULT_PLACE_RADIUS_TILES) * map.tileSize)
const nameOf = (vehicles: Registry<VehicleDef>, modelId: string): string => vehicles.find(modelId)?.name ?? modelId

function dealershipPanel(player: EntityWith<'position'>, def: DealershipDef, vehicles: Registry<VehicleDef>): ShopPanel {
  const money = player.wallet?.money ?? 0
  return {
    title: def.name,
    hint: `Ton argent : ${formatMoney(money)} · la voiture t'attend au parking`,
    choices: def.offers.map((offer) => ({
      label: nameOf(vehicles, offer.modelId),
      detail: money >= offer.price ? formatMoney(offer.price) : `${formatMoney(offer.price)} (trop cher)`,
      command: money >= offer.price ? { type: 'dealership:buy', entityId: player.id, dealershipId: def.id, modelId: offer.modelId } : undefined,
    })),
  }
}

function garagePanel(world: World, player: EntityWith<'position'>, def: GarageDef, vehicles: Registry<VehicleDef>, map: TileMap): ShopPanel {
  const choices: ShopChoice[] = []
  // Un véhicule libre garé devant (le sien, ou un véhicule volé) peut être rangé.
  const spot = getTileCenter(map, def.parking)
  const parked = findEntitiesWith(world, ['position', 'vehicle']).find(
    (vehicle) =>
      vehicle.vehicle.driverId === undefined &&
      (vehicle.vehicle.ownerId === undefined || vehicle.vehicle.ownerId === player.id) &&
      isWithin(vehicle.position.x, vehicle.position.y, spot, TUNING.garage.parkingRadiusTiles * map.tileSize),
  )
  const stored = (player.vehicleCollection?.vehicles ?? []).filter((owned) => owned.storedIn === def.id)
  if (parked !== undefined) {
    const isFull = stored.length >= TUNING.garage.capacity
    choices.push({
      label: `Ranger ${nameOf(vehicles, parked.vehicle.modelId)}`,
      detail: isFull ? 'garage plein' : parked.vehicle.ownerId === undefined ? 'volée : elle sera à toi' : 'garée devant',
      command: isFull ? undefined : { type: 'garage:store', entityId: player.id, garageId: def.id },
    })
  }
  for (const owned of stored) {
    choices.push({ label: `Sortir ${nameOf(vehicles, owned.modelId)}`, detail: 'rangée ici', command: { type: 'garage:take-out', entityId: player.id, garageId: def.id, vehicleKey: owned.key } })
  }
  return {
    title: def.name,
    hint: `${stored.length}/${TUNING.garage.capacity} places · gare une voiture devant, descends, et range-la`,
    choices,
  }
}

/** Les repères des concessions et garages de la carte, et le panneau du lieu où se trouve le joueur (à pied seulement). */
export function describeShops(world: World, player: EntityWith<'position'>, content: ShopContent): ShopGuide {
  const map = world.map
  if (map === undefined) return { markers: [] }
  const dealerships = content.dealerships.all.filter((def) => def.mapId === map.mapId)
  const garages = content.garages.all.filter((def) => def.mapId === map.mapId)
  const markers = [
    ...dealerships.map((def) => toPlaceMarker(`dealership:${def.id}`, 'dealership', def.place, map)),
    ...garages.map((def) => toPlaceMarker(`garage:${def.id}`, 'garage', def.place, map)),
  ]
  if (player.driver !== undefined) return { markers }
  const dealership = dealerships.find((def) => isAtPlace(player, def.place, map))
  if (dealership !== undefined) return { markers, panel: dealershipPanel(player, dealership, content.vehicles) }
  const garage = garages.find((def) => isAtPlace(player, def.place, map))
  if (garage !== undefined) return { markers, panel: garagePanel(world, player, garage, content.vehicles, map) }
  return { markers }
}
