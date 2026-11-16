// Monter dans un véhicule et en descendre.
// Expose : tryEnterVehicle(), tryExitVehicle().
// Pourquoi : quand on monte, le corps du joueur est mis de côté (il est dans la voiture : il ne doit ni gêner la voiture, ni être percuté) ;
// quand on descend, on le pose à côté de la voiture, sur une place libre. Les actions du joueur renvoient { ok, why } : l'interface pourra dire pourquoi c'est impossible.

import { TUNING, findEntitiesWith, findEntity, isSpaceClear } from '../../core'
import type { EntityId, World } from '../../core'
import { VEHICLE_REGISTRY } from '../../../data/vehicles'

export type ActionResult = { ok: true } | { ok: false; why: string }

/** Monte dans le véhicule libre le plus proche, s'il est assez près. */
export function tryEnterVehicle(world: World, playerId: EntityId): ActionResult {
  const player = findEntity(world, playerId)
  if (player?.position === undefined || player.body === undefined) return { ok: false, why: 'personne pour monter' }
  if (player.driver !== undefined) return { ok: false, why: 'déjà au volant' }

  let nearest: { id: EntityId; distanceSquared: number } | undefined
  for (const vehicle of findEntitiesWith(world, ['position', 'vehicle'])) {
    if (vehicle.vehicle.driverId !== undefined) continue
    const dx = vehicle.position.x - player.position.x
    const dy = vehicle.position.y - player.position.y
    const distanceSquared = dx * dx + dy * dy
    if (nearest === undefined || distanceSquared < nearest.distanceSquared) nearest = { id: vehicle.id, distanceSquared }
  }
  const maxDistance = TUNING.driving.enterDistance
  if (nearest === undefined || nearest.distanceSquared > maxDistance * maxDistance) return { ok: false, why: 'aucun véhicule à portée' }

  const vehicle = findEntity(world, nearest.id)
  if (vehicle?.vehicle === undefined || vehicle.position === undefined) return { ok: false, why: 'véhicule introuvable' }
  player.driver = { vehicleId: vehicle.id, storedBody: player.body }
  delete player.body
  vehicle.vehicle.driverId = player.id
  player.position.x = vehicle.position.x
  player.position.y = vehicle.position.y
  world.events.emit('vehicle:entered', { vehicleId: vehicle.id, driverId: player.id })
  return { ok: true }
}

/** Descend du véhicule : on se pose à gauche, sinon à droite, devant, puis derrière ; impossible si tout est bouché. */
export function tryExitVehicle(world: World, playerId: EntityId): ActionResult {
  const player = findEntity(world, playerId)
  if (player?.position === undefined || player.driver === undefined) return { ok: false, why: 'pas au volant' }
  const vehicle = findEntity(world, player.driver.vehicleId)
  if (vehicle?.position === undefined || vehicle.vehicle === undefined) return { ok: false, why: 'véhicule introuvable' }

  const def = VEHICLE_REGISTRY.get(vehicle.vehicle.modelId)
  const body = player.driver.storedBody
  const { headingX, headingY } = vehicle.vehicle
  const gap = TUNING.driving.exitGap
  const side = def.width / 2 + gap + Math.max(body.width, body.height) / 2
  const end = def.length / 2 + gap + Math.max(body.width, body.height) / 2
  // Le flanc gauche est l'opposé du flanc droit (-headingY, headingX).
  const candidates = [
    { x: vehicle.position.x + headingY * side, y: vehicle.position.y - headingX * side },
    { x: vehicle.position.x - headingY * side, y: vehicle.position.y + headingX * side },
    { x: vehicle.position.x + headingX * end, y: vehicle.position.y + headingY * end },
    { x: vehicle.position.x - headingX * end, y: vehicle.position.y - headingY * end },
  ]
  const spot = candidates.find((candidate) => isSpaceClear(world, candidate.x, candidate.y, body.width, body.height, [player.id]))
  if (spot === undefined) return { ok: false, why: 'aucune place pour descendre' }

  player.body = body
  delete player.driver
  delete vehicle.vehicle.driverId
  player.position.x = spot.x
  player.position.y = spot.y
  // On pose le joueur : la brique collision repart de cette position, sans chercher à le ramener à l'ancienne.
  player.lastFreePosition = { x: spot.x, y: spot.y }
  world.events.emit('vehicle:exited', { vehicleId: vehicle.id, driverId: player.id })
  return { ok: true }
}
