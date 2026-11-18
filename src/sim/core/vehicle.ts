// Faire apparaître un véhicule, et la taille de son corps selon son cap.
// Expose : computeVehicleBodySize(), spawnVehicleEntity().
// Pourquoi : plusieurs briques créent des véhicules (driving pour ceux garés au départ, garage pour ceux qu'on achète ou qu'on sort du garage).
// Comme une brique n'en importe jamais une autre, la recette commune vit dans le noyau. La fiche du modèle (VehicleDef) est fournie par l'appelant.

import { spawnEntity } from './entities'
import type { Entity } from './components'
import { facingToHeading } from './map'
import type { Facing } from './map'
import type { VehicleDef } from './registry'
import type { World } from './world'

/** La taille du rectangle (aligné sur la grille) qui contient la voiture tournée selon son cap : c'est son corps pour les collisions. */
export function computeVehicleBodySize(def: VehicleDef, headingX: number, headingY: number): { width: number; height: number } {
  const ax = Math.abs(headingX)
  const ay = Math.abs(headingY)
  return { width: ax * def.length + ay * def.width, height: ay * def.length + ax * def.width }
}

/** Crée un véhicule à l'arrêt, du modèle donné, centré sur (x, y), le nez tourné vers `facing`. */
export function spawnVehicleEntity(world: World, def: VehicleDef, x: number, y: number, facing: Facing): Entity {
  const heading = facingToHeading(facing)
  const size = computeVehicleBodySize(def, heading.x, heading.y)
  return spawnEntity(world, 'vehicle', {
    position: { x, y, angle: 0 },
    velocity: { vx: 0, vy: 0 },
    body: { width: size.width, height: size.height, isSolid: true },
    vehicle: { modelId: def.id, headingX: heading.x, headingY: heading.y },
  })
}
