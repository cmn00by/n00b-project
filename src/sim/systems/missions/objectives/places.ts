// Les lieux des missions : le joueur est-il dans le rayon d'un lieu, et arrivé de la bonne façon ?
// Expose : isInsidePlace(), isTravelSatisfied().

import { DEFAULT_PLACE_RADIUS_TILES } from '../../../core'
import type { MissionPlace, MissionTravelMode, TileMap } from '../../../core'

/** Le point (en px) est-il dans le rayon du lieu ? Le rayon est compté depuis le centre de la case, en cases. Pas de racine carrée : on compare les carrés. */
export function isInsidePlace(x: number, y: number, place: MissionPlace, map: TileMap): boolean {
  const centerX = (place.tileX + 0.5) * map.tileSize
  const centerY = (place.tileY + 0.5) * map.tileSize
  const radius = (place.radiusTiles ?? DEFAULT_PLACE_RADIUS_TILES) * map.tileSize
  const dx = x - centerX
  const dy = y - centerY
  return dx * dx + dy * dy <= radius * radius
}

/** Le joueur arrive-t-il comme l'objectif le demande (à pied, au volant, ou peu importe) ? */
export function isTravelSatisfied(travel: MissionTravelMode | undefined, isDriving: boolean): boolean {
  if (travel === 'foot') return !isDriving
  if (travel === 'vehicle') return isDriving
  return true
}
