// Les pas d'un piéton touché par un véhicule : être projeté, rester au sol, et revenir sur le trottoir.
// Expose : ImpactContext, startFlight(), updateLaunched(), updateDown(), updateReturning().
// Pourquoi : les règles du choc sont dans impact.ts (pures) ; ici on les applique au composant du piéton, et on annonce le choc (pedestrian:hit).
// Il ne touche pas au véhicule : le choc est un dessin animé, pas une collision. L'enchaînement : projeté (launched) → au sol (down) → il se relève et râle (angry,
// avec les autres réactions) → s'il est hors du trottoir, il revient (returning) puis reprend sa promenade.

import { despawnEntity, getTileCenter } from '../../core'
import type { EntityWith, TileMap, World } from '../../core'
import { computeLaunchVelocity, findNearestWalkableTile, stepFlight } from './impact'
import type { VehicleHit } from './impact'
import { computeAngleOf, computeHeadingToward, moveToward } from './movement'
import { PEDESTRIAN_STATES } from './stateMachine'
import { secondsToSteps } from './stepTime'
import type { PedestrianTuning } from './tuning'

export interface ImpactContext {
  world: World
  map: TileMap
  tuning: PedestrianTuning
  /** La durée d'un pas, en secondes. */
  dt: number
}

type PedestrianEntity = EntityWith<'pedestrian' | 'position'>

/** Le piéton est touché : il part en vol dans le sens du véhicule. Le véhicule, lui, n'est pas touché. */
export function startFlight(context: ImpactContext, entity: PedestrianEntity, hit: VehicleHit): void {
  const { pedestrian } = entity
  pedestrian.state = PEDESTRIAN_STATES.launched
  pedestrian.stateStepsLeft = secondsToSteps(context.tuning.launchSeconds)
  pedestrian.flight = computeLaunchVelocity(hit, context.tuning)
  // Il oublie la case qu'il visait : après le choc, il choisira un trottoir.
  delete pedestrian.targetTile
  context.world.events.emit('pedestrian:hit', { entityId: entity.id, vehicleId: hit.vehicleId, impactSpeed: hit.speed })
}

/** Un pas de vol ; à la fin du vol, il est au sol. */
export function updateLaunched(context: ImpactContext, entity: PedestrianEntity): void {
  const { map, tuning, dt } = context
  const { pedestrian, position } = entity
  const moved = stepFlight(map, position, pedestrian.flight ?? { vx: 0, vy: 0 }, pedestrian.stateStepsLeft, dt, tuning)
  position.x = moved.x
  position.y = moved.y
  pedestrian.flight = { vx: moved.vx, vy: moved.vy }
  pedestrian.stateStepsLeft -= 1
  if (pedestrian.stateStepsLeft > 0) return
  delete pedestrian.flight
  pedestrian.state = PEDESTRIAN_STATES.down
  pedestrian.stateStepsLeft = secondsToSteps(tuning.downSeconds)
}

/** Un pas au sol ; quand il se relève, il râle. */
export function updateDown(context: ImpactContext, entity: PedestrianEntity): void {
  const { pedestrian } = entity
  pedestrian.stateStepsLeft -= 1
  if (pedestrian.stateStepsLeft > 0) return
  pedestrian.state = PEDESTRIAN_STATES.angry
  pedestrian.stateStepsLeft = secondsToSteps(context.tuning.angrySeconds)
}

/** Un pas de retour vers le trottoir le plus proche ; arrivé, il reprend sa promenade. Aucun trottoir assez près : il quitte la ville. */
export function updateReturning(context: ImpactContext, entity: PedestrianEntity, walkSpeed: number): void {
  const { world, map, tuning, dt } = context
  const { pedestrian, position } = entity
  if (pedestrian.targetTile === undefined) {
    pedestrian.targetTile = findNearestWalkableTile(map, position.x, position.y, tuning)
    if (pedestrian.targetTile === undefined) {
      despawnEntity(world, entity.id)
      return
    }
  }
  const target = getTileCenter(map, pedestrian.targetTile)
  pedestrian.heading = computeHeadingToward(position.x, position.y, target.x, target.y)
  const moved = moveToward(position.x, position.y, target.x, target.y, walkSpeed * dt)
  position.x = moved.x
  position.y = moved.y
  position.angle = computeAngleOf(pedestrian.heading)
  if (!moved.arrived) return
  delete pedestrian.targetTile
  pedestrian.state = PEDESTRIAN_STATES.walking
  pedestrian.stateStepsLeft = 0
}
