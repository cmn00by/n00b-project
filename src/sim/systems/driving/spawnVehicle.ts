// Faire apparaître un véhicule garé dans le monde.
// Expose : spawnVehicle().

import { facingToHeading, spawnEntity } from '../../core'
import type { Entity, Facing, World } from '../../core'
import { VEHICLE_REGISTRY } from '../../../data/vehicles'
import { computeBodySize } from './vehiclePhysics'

/** Crée un véhicule à l'arrêt, du modèle donné, centré sur (x, y), le nez tourné vers `facing`. */
export function spawnVehicle(world: World, modelId: string, x: number, y: number, facing: Facing): Entity {
  const def = VEHICLE_REGISTRY.get(modelId)
  const heading = facingToHeading(facing)
  const size = computeBodySize(def, heading.x, heading.y)
  return spawnEntity(world, 'vehicle', {
    position: { x, y, angle: 0 },
    velocity: { vx: 0, vy: 0 },
    body: { width: size.width, height: size.height, isSolid: true },
    vehicle: { modelId, headingX: heading.x, headingY: heading.y },
  })
}
