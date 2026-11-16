// La liste des modèles de véhicules. Ajouter un véhicule = un fichier de données + une ligne ici (+ une couleur provisoire dans src/game/constants.ts).
import { STEP_SECONDS, createRegistry } from '../../sim/core'
import type { VehicleDef } from '../../sim/core'
import { deliveryVan } from './deliveryVan'
import { mamieCar } from './mamieCar'
import { sportsCar } from './sportsCar'

export const VEHICLES: VehicleDef[] = [mamieCar, deliveryVan, sportsCar]

export const VEHICLE_REGISTRY = createRegistry('Véhicule', VEHICLES)

/** Le plus grand déplacement permis en un pas : au-delà, une voiture pourrait sauter un mur d'une case (32 px). */
const MAX_STEP_DISTANCE_PX = 16

/** Les vérifications propres aux véhicules (lancées par les tests) : valeurs positives, cohérentes, et pas trop rapides pour les collisions. */
export function checkVehicleDef(def: VehicleDef): string[] {
  const errors: string[] = []
  const positives = {
    width: def.width,
    length: def.length,
    maxSpeed: def.maxSpeed,
    maxReverseSpeed: def.maxReverseSpeed,
    acceleration: def.acceleration,
    braking: def.braking,
    turnRate: def.turnRate,
    grip: def.grip,
    handbrakeGrip: def.handbrakeGrip,
  }
  for (const [name, value] of Object.entries(positives)) if (!(value > 0)) errors.push(`${name} doit être positif`)
  if (def.length < def.width) errors.push('length doit être au moins égale à width (le nez pointe dans la longueur)')
  if (def.handbrakeGrip >= def.grip) errors.push('handbrakeGrip doit être plus bas que grip (sinon le frein à main ne fait pas déraper)')
  if (def.maxSpeed * STEP_SECONDS > MAX_STEP_DISTANCE_PX) errors.push(`maxSpeed trop élevée : plus de ${MAX_STEP_DISTANCE_PX} px par pas, la voiture pourrait traverser un mur`)
  return errors
}
