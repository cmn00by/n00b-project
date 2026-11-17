// La concession et le garage décrits en données : où ils sont sur la carte, ce qu'on y vend, où l'on y gare.
// Expose : ParkingSpot, DealershipOffer, DealershipDef, GarageDef, validateDealershipDef(), validateGaragePlaces(), validateDealershipPlaces().
// Pourquoi : comme les missions, ce sont UNIQUEMENT des données (textes, cases, prix) : ajouter une concession ou changer un prix ne touche pas au code.
// La brique garage les lit sans en connaître aucun par son nom.

import { DEFAULT_PLACE_RADIUS_TILES } from './mission'
import type { MissionPlace } from './mission'
import type { Facing, TileMap } from './map'
import type { ContentDef, Registry, VehicleDef } from './registry'

/** Une place de stationnement : la case où apparaît le véhicule, et le sens de son nez. */
export interface ParkingSpot {
  tileX: number
  tileY: number
  facing: Facing
}

/** Un modèle vendu, et son prix en euros entiers. */
export interface DealershipOffer {
  modelId: string
  price: number
}

/** Une concession : on s'y présente à pied, on choisit, on paie, la voiture attend sur la place de livraison. */
export interface DealershipDef extends ContentDef {
  name: string
  mapId: string
  /** Là où le joueur doit se tenir pour acheter (un repère le signale). */
  place: MissionPlace
  /** Là où apparaît la voiture achetée. */
  delivery: ParkingSpot
  offers: DealershipOffer[]
}

/** Un garage : on y range un véhicule garé devant, et on en ressort un. */
export interface GarageDef extends ContentDef {
  name: string
  mapId: string
  /** Là où le joueur doit se tenir (un repère le signale). */
  place: MissionPlace
  /** La place devant le garage : on y gare le véhicule à ranger, et c'est là que ressort un véhicule. */
  parking: ParkingSpot
}

/** Vérifie une concession sans sa carte : au moins une offre, des modèles qui existent, des prix entiers positifs, pas de modèle en double. */
export function validateDealershipDef(def: DealershipDef, vehicles: Registry<VehicleDef>): string[] {
  const errors: string[] = []
  if (def.offers.length === 0) errors.push('il faut au moins une offre')
  const seen = new Set<string>()
  for (const offer of def.offers) {
    if (!vehicles.has(offer.modelId)) errors.push(`le modèle '${offer.modelId}' n'existe pas`)
    if (seen.has(offer.modelId)) errors.push(`le modèle '${offer.modelId}' est proposé deux fois`)
    seen.add(offer.modelId)
    if (!Number.isInteger(offer.price) || offer.price <= 0) errors.push(`le prix de '${offer.modelId}' doit être un nombre entier d'euros, positif`)
  }
  return errors
}

function checkTile(label: string, tile: { tileX: number; tileY: number }, map: TileMap): string[] {
  if (tile.tileX < 0 || tile.tileY < 0 || tile.tileX >= map.width || tile.tileY >= map.height) return [`${label} : la case (${tile.tileX}, ${tile.tileY}) est hors de la carte`]
  return map.solid[tile.tileY * map.width + tile.tileX] === true ? [`${label} : la case (${tile.tileX}, ${tile.tileY}) est un obstacle`] : []
}

function checkPlaces(def: { mapId: string; place: MissionPlace }, spotLabel: string, spot: ParkingSpot, map: TileMap): string[] {
  const errors: string[] = []
  if (def.mapId !== map.mapId) errors.push(`se trouve sur '${def.mapId}', pas sur '${map.mapId}'`)
  if ((def.place.radiusTiles ?? DEFAULT_PLACE_RADIUS_TILES) <= 0) errors.push('le rayon du lieu doit être positif')
  return [...errors, ...checkTile('lieu', def.place, map), ...checkTile(spotLabel, spot, map)]
}

/** Vérifie que le lieu et la place de livraison d'une concession sont dans la carte, sur des cases libres. */
export function validateDealershipPlaces(def: DealershipDef, map: TileMap): string[] {
  return checkPlaces(def, 'livraison', def.delivery, map)
}

/** Vérifie que le lieu et la place d'un garage sont dans la carte, sur des cases libres. */
export function validateGaragePlaces(def: GarageDef, map: TileMap): string[] {
  return checkPlaces(def, 'place', def.parking, map)
}
