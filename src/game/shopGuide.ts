// Ce que le joueur voit de la concession, du garage et de l'atelier : leurs repères sur la carte, et le panneau de choix quand il s'y trouve.
// Expose : ShopUiAction, ShopChoice, ShopPanel, ShopGuide, WorkshopMenu, ShopContent, SLOT_NAMES, describeShops().
// Pourquoi : une règle pure, testée sans navigateur. Elle lit l'état de la simulation et les fiches (concessions, garages, modèles), et propose des choix
// sous forme de commandes : l'interface n'a qu'à envoyer la commande choisie. La simulation (brique garage) revérifie tout et peut refuser.

import { DEFAULT_PLACE_RADIUS_TILES, TUNING, findEntitiesWith, getTileCenter } from '../sim/core'
import { VEHICLE_PART_SLOTS } from '../sim/core'
import type {
  Command,
  DealershipDef,
  EntityId,
  EntityWith,
  GarageDef,
  MissionPlace,
  Registry,
  TileMap,
  VehicleCustomization,
  VehicleDef,
  VehiclePartDef,
  VehiclePartSlot,
  WorkshopDef,
  World,
} from '../sim/core'
import { formatMoney } from './hud'
import { toPlaceMarker } from './placeMarker'
import type { PlaceMarker } from './placeMarker'

/** Ce qu'un choix change dans l'interface seulement (sans rien demander à la simulation) : ouvrir un emplacement de l'atelier, revenir, essayer une pièce. */
export type ShopUiAction = { kind: 'open-slot'; slot: VehiclePartSlot } | { kind: 'back' } | { kind: 'preview'; partId: string }

/** Un choix du panneau : son texte, un détail (prix, état), et la commande à envoyer ou l'action d'interface ; sans l'une ni l'autre, le choix est grisé. */
export interface ShopChoice {
  label: string
  detail: string
  command?: Command
  uiAction?: ShopUiAction
}

/** Où en est le joueur dans le menu de l'atelier : l'emplacement ouvert, et la pièce qu'il essaie. État d'interface, pas de simulation. */
export interface WorkshopMenu {
  slot?: VehiclePartSlot
  previewPartId?: string
}

/** Les noms des emplacements, dans l'ordre des touches 1 à 9. */
export const SLOT_NAMES: Readonly<Record<VehiclePartSlot, string>> = {
  paint: 'Peinture',
  stripes: 'Bandes',
  wheels: 'Jantes',
  spoiler: 'Aileron',
  roof: 'Toit',
  bumper: 'Pare-chocs',
  neon: 'Néons',
  engine: 'Moteur',
  tires: 'Pneus',
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
  /** À l'atelier : la voiture à montrer (elle tourne), avec la pièce essayée. */
  showcase?: { vehicleId: EntityId; preview?: VehicleCustomization }
}

export interface ShopContent {
  vehicles: Registry<VehicleDef>
  dealerships: Registry<DealershipDef>
  garages: Registry<GarageDef>
  workshops: Registry<WorkshopDef>
  parts: Registry<VehiclePartDef>
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

function workshopPanel(player: EntityWith<'position'>, def: WorkshopDef, customization: VehicleCustomization, parts: Registry<VehiclePartDef>, menu: WorkshopMenu): ShopPanel {
  const money = player.wallet?.money ?? 0
  const partName = (partId: string | undefined) => (partId === undefined ? 'd’origine' : (parts.find(partId)?.name ?? partId))
  if (menu.slot === undefined) {
    return {
      title: def.name,
      hint: `Ton argent : ${formatMoney(money)} · choisis ce que tu veux changer`,
      choices: VEHICLE_PART_SLOTS.map((slot) => ({ label: SLOT_NAMES[slot], detail: partName(customization[slot]), uiAction: { kind: 'open-slot', slot } })),
    }
  }
  const slot = menu.slot
  const choices: ShopChoice[] = parts.all
    .filter((part) => part.slot === slot)
    .map((part) => {
      const isInstalled = customization[slot] === part.id
      const isTried = menu.previewPartId === part.id
      const canPay = money >= part.price
      if (isInstalled) return { label: part.name, detail: 'installée' }
      // Premier appui : on essaie (la voiture la porte) ; second appui : on achète.
      if (!isTried) return { label: part.name, detail: `${formatMoney(part.price)} · essayer`, uiAction: { kind: 'preview', partId: part.id } }
      return {
        label: part.name,
        detail: canPay ? `${formatMoney(part.price)} · acheter` : `${formatMoney(part.price)} (trop cher)`,
        command: canPay ? { type: 'workshop:install', entityId: player.id, workshopId: def.id, partId: part.id } : undefined,
      }
    })
  if (customization[slot] !== undefined) choices.push({ label: 'Remettre d’origine', detail: 'gratuit', command: { type: 'workshop:remove', entityId: player.id, workshopId: def.id, slot } })
  choices.push({ label: '← Retour', detail: '0 ou Échap', uiAction: { kind: 'back' } })
  return { title: `${def.name} · ${SLOT_NAMES[slot]}`, hint: `Ton argent : ${formatMoney(money)} · un appui pour essayer, un second pour acheter`, choices }
}

/** Les repères des concessions, garages et ateliers de la carte, et le panneau du lieu où se trouve le joueur : à pied à la concession et au garage, au volant à l'atelier. */
export function describeShops(world: World, player: EntityWith<'position'>, content: ShopContent, menu: WorkshopMenu = {}): ShopGuide {
  const map = world.map
  if (map === undefined) return { markers: [] }
  const dealerships = content.dealerships.all.filter((def) => def.mapId === map.mapId)
  const garages = content.garages.all.filter((def) => def.mapId === map.mapId)
  const workshops = content.workshops.all.filter((def) => def.mapId === map.mapId)
  const markers = [
    ...workshops.map((def) => toPlaceMarker(`workshop:${def.id}`, 'workshop', def.place, map)),
    ...dealerships.map((def) => toPlaceMarker(`dealership:${def.id}`, 'dealership', def.place, map)),
    ...garages.map((def) => toPlaceMarker(`garage:${def.id}`, 'garage', def.place, map)),
  ]
  if (player.driver !== undefined) {
    const workshop = workshops.find((def) => isAtPlace(player, def.place, map))
    const car = findEntitiesWith(world, ['vehicle']).find((vehicle) => vehicle.id === player.driver?.vehicleId)
    if (workshop === undefined || car === undefined) return { markers }
    const customization = car.vehicle.customization ?? {}
    const tried = menu.previewPartId === undefined ? undefined : content.parts.find(menu.previewPartId)
    return {
      markers,
      panel: workshopPanel(player, workshop, customization, content.parts, menu),
      showcase: { vehicleId: car.id, preview: tried === undefined ? undefined : { ...customization, [tried.slot]: tried.id } },
    }
  }
  const dealership = dealerships.find((def) => isAtPlace(player, def.place, map))
  if (dealership !== undefined) return { markers, panel: dealershipPanel(player, dealership, content.vehicles) }
  const garage = garages.find((def) => isAtPlace(player, def.place, map))
  if (garage !== undefined) return { markers, panel: garagePanel(world, player, garage, content.vehicles, map) }
  return { markers }
}
