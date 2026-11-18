// Faire apparaître un véhicule garé dans le monde, d'après l'id de son modèle.
// Expose : spawnVehicle().

import { spawnVehicleEntity } from '../../core'
import type { Entity, Facing, World } from '../../core'
import { VEHICLE_REGISTRY } from '../../../data/vehicles'

/** Crée un véhicule à l'arrêt, du modèle donné, centré sur (x, y), le nez tourné vers `facing`. */
export function spawnVehicle(world: World, modelId: string, x: number, y: number, facing: Facing): Entity {
  return spawnVehicleEntity(world, VEHICLE_REGISTRY.get(modelId), x, y, facing)
}
