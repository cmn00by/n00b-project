// La liste des modèles de véhicules. Ajouter un véhicule = un fichier de données (réglages et silhouette `look`) + une ligne ici.
import { STEP_SECONDS, VEHICLE_EXTRAS, createRegistry } from '../../sim/core'
import type { VehicleDef } from '../../sim/core'
import { cityBus } from './cityBus'
import { cityCar } from './cityCar'
import { golfCart } from './golfCart'
import { limousine } from './limousine'
import { pickup } from './pickup'
import { policeCar } from './policeCar'
import { taxi } from './taxi'
import { deliveryVan } from './deliveryVan'
import { mamieCar } from './mamieCar'
import { sportsCar } from './sportsCar'

export const VEHICLES: VehicleDef[] = [mamieCar, deliveryVan, sportsCar, golfCart, cityCar, pickup, taxi, limousine, cityBus, policeCar]

export const VEHICLE_REGISTRY = createRegistry('Véhicule', VEHICLES)

/** Le plus grand déplacement permis en un pas : au-delà, une voiture pourrait sauter un mur d'une case (32 px). */
const MAX_STEP_DISTANCE_PX = 16
/** La largeur maximale d'un véhicule : il doit tenir dans une ruelle d'une case (32 px). */
const MAX_WIDTH_PX = 30

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
  if (def.width > MAX_WIDTH_PX) errors.push(`width trop grande : plus de ${MAX_WIDTH_PX} px, le véhicule ne tiendrait pas dans une rue d'une case`)
  const look = def.look
  if (look === undefined) return errors
  const isColor = (value: string) => /^#[0-9a-f]{6}$/i.test(value)
  if (!isColor(look.color) || (look.cabinColor !== undefined && !isColor(look.cabinColor))) errors.push('look : couleur invalide')
  if (!(look.bodyHeight > 0)) errors.push('look : bodyHeight doit être positive')
  if (look.cabin.length < 0 || look.cabin.length > 1 || Math.abs(look.cabin.offset) + look.cabin.length / 2 > 0.5 || look.cabin.height < 0) errors.push('look : l’habitacle doit tenir sur la caisse')
  for (const extra of look.extras ?? []) if (!(VEHICLE_EXTRAS as readonly string[]).includes(extra)) errors.push(`look : accessoire inconnu '${extra}'`)
  return errors
}
