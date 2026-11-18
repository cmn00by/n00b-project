// Le choc d'un véhicule contre un piéton : qui est touché, où il est projeté, et où il retourne ensuite.
// Expose : MovingVehicle, VehicleHit, LaunchRolls, findMovingVehicles(), findVehicleHit(), computeLaunchVelocity(), stepFlight(), findNearestWalkableTile().
// Pourquoi : les piétons n'ont pas de corps solide (la brique collision ne les voit pas) : sans cela une voiture les traverserait. Ici, un véhicule qui roule
// les projette à la façon d'un dessin animé : il vole dans le sens du véhicule, s'arrête contre un mur, reste au sol, puis revient sur le trottoir.
// La brique lit seulement des composants (position, velocity, body, vehicle) : elle ne connaît pas la conduite. Fonctions pures, testées dans Node.

import { findEntitiesWith, getTileCenter, isAreaFree } from '../../core'
import type { EntityId, TileMap, World } from '../../core'
import { getTileAt, isWalkableTile } from './tiles'
import type { PedestrianTuning } from './tuning'

/** Un véhicule vu par les piétons : sa place, la taille de sa carrosserie et sa vitesse. */
export interface MovingVehicle {
  id: EntityId
  x: number
  y: number
  width: number
  height: number
  vx: number
  vy: number
}

/** Ce qui a touché un piéton : le véhicule, sa vitesse et sa direction (vecteur de longueur 1). */
export interface VehicleHit {
  vehicleId: EntityId
  speed: number
  directionX: number
  directionY: number
}

/** Les véhicules de la ville qui roulent (un véhicule sans corps ou à l'arrêt ne touche personne). */
export function findMovingVehicles(world: World): MovingVehicle[] {
  const vehicles: MovingVehicle[] = []
  for (const entity of findEntitiesWith(world, ['position', 'velocity', 'vehicle', 'body'])) {
    if (entity.velocity.vx === 0 && entity.velocity.vy === 0) continue
    vehicles.push({ id: entity.id, x: entity.position.x, y: entity.position.y, width: entity.body.width, height: entity.body.height, vx: entity.velocity.vx, vy: entity.velocity.vy })
  }
  return vehicles
}

/** Le véhicule qui touche le piéton, s'il roule assez vite (le premier de la liste s'il y en a plusieurs). Toucher pile le bord ne compte pas. */
export function findVehicleHit(x: number, y: number, vehicles: readonly MovingVehicle[], tuning: PedestrianTuning): VehicleHit | undefined {
  for (const vehicle of vehicles) {
    const speed = Math.sqrt(vehicle.vx ** 2 + vehicle.vy ** 2)
    if (speed < tuning.hitMinSpeed) continue
    const isOverlapping = Math.abs(vehicle.x - x) * 2 < vehicle.width + tuning.bodySize && Math.abs(vehicle.y - y) * 2 < vehicle.height + tuning.bodySize
    if (isOverlapping) return { vehicleId: vehicle.id, speed, directionX: vehicle.vx / speed, directionY: vehicle.vy / speed }
  }
  return undefined
}

/** Deux tirages au hasard, chacun de -1 à 1 : de quel côté et de combien le vol dévie du sens du véhicule, et s'il part plus ou moins fort. 0 et 0 : pile dans son sens, à force normale. */
export interface LaunchRolls {
  side: number
  power: number
}

/**
 * La vitesse de départ du piéton projeté : celle du véhicule en proportion, avec un petit écart de force (`launchPowerJitter`), mais jamais moins que `launchMinSpeed`
 * ni plus que `launchMaxSpeed`. La direction dévie un peu (`launchSpread`) de côté. Sans trigonométrie (déterminisme) : on ajoute un peu de la perpendiculaire.
 */
export function computeLaunchVelocity(hit: VehicleHit, tuning: PedestrianTuning, rolls: LaunchRolls = { side: 0, power: 0 }): { vx: number; vy: number } {
  const wanted = hit.speed * tuning.launchSpeedFactor * (1 + rolls.power * tuning.launchPowerJitter)
  const speed = Math.min(tuning.launchMaxSpeed, Math.max(tuning.launchMinSpeed, wanted))
  const deviation = rolls.side * tuning.launchSpread
  const directionX = hit.directionX - hit.directionY * deviation
  const directionY = hit.directionY + hit.directionX * deviation
  const length = Math.sqrt(directionX ** 2 + directionY ** 2)
  return { vx: (directionX / length) * speed, vy: (directionY / length) * speed }
}

/**
 * Un pas de vol : le piéton avance, s'arrête contre un mur (axe par axe, il glisse le long), et sa vitesse décroît pour tomber à zéro à la fin du vol.
 * `stepsLeft` est le nombre de pas de vol qui restent, ce pas compris. Renvoie la nouvelle position et la nouvelle vitesse.
 */
export function stepFlight(
  map: TileMap,
  position: { x: number; y: number },
  flight: { vx: number; vy: number },
  stepsLeft: number,
  dt: number,
  tuning: PedestrianTuning,
): { x: number; y: number; vx: number; vy: number } {
  const size = tuning.bodySize
  let { x, y } = position
  let { vx, vy } = flight
  if (isAreaFree(map, x + vx * dt, y, size, size)) x += vx * dt
  else vx = 0
  if (isAreaFree(map, x, y + vy * dt, size, size)) y += vy * dt
  else vy = 0
  const keep = stepsLeft > 1 ? (stepsLeft - 1) / stepsLeft : 0
  return { x, y, vx: vx * keep, vy: vy * keep }
}

/** Le trottoir le plus proche (le centre de sa case) dans la distance de recherche, ou undefined s'il n'y en a pas. */
export function findNearestWalkableTile(map: TileMap, x: number, y: number, tuning: PedestrianTuning): { tileX: number; tileY: number } | undefined {
  const origin = getTileAt(map, x, y)
  const reach = tuning.returnSearchTiles
  let best: { tileX: number; tileY: number } | undefined
  let bestDistance = Infinity
  for (let tileY = origin.tileY - reach; tileY <= origin.tileY + reach; tileY++) {
    for (let tileX = origin.tileX - reach; tileX <= origin.tileX + reach; tileX++) {
      if (!isWalkableTile(map, tileX, tileY, tuning)) continue
      const center = getTileCenter(map, { tileX, tileY })
      const distance = (center.x - x) ** 2 + (center.y - y) ** 2
      if (distance < bestDistance) {
        bestDistance = distance
        best = { tileX, tileY }
      }
    }
  }
  return best
}
