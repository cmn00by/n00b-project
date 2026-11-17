// Un repère sur la carte : un lieu à montrer au joueur (départ de mission, objectif, concession, garage).
// Expose : PlaceMarker, PlaceMarkerKind, toPlaceMarker().
// Pourquoi : les guides (missionGuide, shopGuide) disent quoi montrer, l'affichage (render/placeMarkers.ts) le dessine. Ce type est leur langage commun.

import { DEFAULT_PLACE_RADIUS_TILES } from '../sim/core'
import type { MissionPlace, TileMap } from '../sim/core'

/** La sorte de lieu : elle fixe la couleur du repère. */
export type PlaceMarkerKind = 'start' | 'objective' | 'dealership' | 'garage'

/** Un repère, en coordonnées de la simulation (px). `key` est unique et stable d'une image à l'autre. */
export interface PlaceMarker {
  key: string
  kind: PlaceMarkerKind
  x: number
  y: number
  radius: number
}

/** Le repère d'un lieu de la carte (une case et un rayon en cases). */
export function toPlaceMarker(key: string, kind: PlaceMarkerKind, place: MissionPlace, map: TileMap): PlaceMarker {
  return {
    key,
    kind,
    x: (place.tileX + 0.5) * map.tileSize,
    y: (place.tileY + 0.5) * map.tileSize,
    radius: (place.radiusTiles ?? DEFAULT_PLACE_RADIUS_TILES) * map.tileSize,
  }
}
