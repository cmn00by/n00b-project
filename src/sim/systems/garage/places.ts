// Les lieux de la concession et du garage : le joueur y est-il, un véhicule est-il garé devant ?
// Expose : isAtPlace(), isNearSpot().

import { DEFAULT_PLACE_RADIUS_TILES, TUNING, getTileCenter } from '../../core'
import type { EntityWith, MissionPlace, ParkingSpot, TileMap } from '../../core'

const isWithin = (x: number, y: number, centerX: number, centerY: number, radius: number): boolean => {
  const dx = x - centerX
  const dy = y - centerY
  return dx * dx + dy * dy <= radius * radius
}

/** L'entité est-elle dans le rayon du lieu (en cases, depuis le centre de sa case) ? */
export function isAtPlace(entity: EntityWith<'position'>, place: MissionPlace, map: TileMap): boolean {
  const center = getTileCenter(map, place)
  return isWithin(entity.position.x, entity.position.y, center.x, center.y, (place.radiusTiles ?? DEFAULT_PLACE_RADIUS_TILES) * map.tileSize)
}

/** Le véhicule est-il garé assez près de la place (TUNING.garage.parkingRadiusTiles) ? */
export function isNearSpot(entity: EntityWith<'position'>, spot: ParkingSpot, map: TileMap): boolean {
  const center = getTileCenter(map, spot)
  return isWithin(entity.position.x, entity.position.y, center.x, center.y, TUNING.garage.parkingRadiusTiles * map.tileSize)
}
