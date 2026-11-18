// Le pas d'un piéton : être projeté par un véhicule, réagir à ce qui fonce sur lui, changer d'état, puis marcher, regarder, approcher ou fuir.
// Expose : StepContext, updatePedestrian().
// Pourquoi : c'est la seule fonction qui modifie un piéton. Elle assemble les morceaux purs (réaction, états, choix de case, déplacement) ;
// les règles elles-mêmes sont dans ces fichiers, testés à part.

import { getTileCenter } from '../../core'
import type { EntityWith, NpcTypeDef, TileMap, World } from '../../core'
import { findVehicleHit } from './impact'
import type { MovingVehicle } from './impact'
import { startFlight, updateDown, updateLaunched, updateReturning } from './impactStep'
import { computeAngleOf, computeHeadingToward, moveToward } from './movement'
import { computePauseSteps } from './personality'
import { decideReaction } from './reaction'
import type { Reaction, Threat } from './reaction'
import { chooseWatchState, isWatchState } from './reactionChoice'
import { PEDESTRIAN_STATES, advanceState } from './stateMachine'
import { chooseApproachTile, chooseFleeTile, chooseNextTile, getTileAt, isWalkableTile } from './tiles'
import type { TileStep } from './tiles'
import type { PedestrianTuning } from './tuning'

export interface StepContext {
  world: World
  map: TileMap
  tuning: PedestrianTuning
  threats: readonly Threat[]
  /** Les véhicules qui roulent : l'un d'eux peut projeter un piéton. */
  vehicles: readonly MovingVehicle[]
  /** La durée d'un pas, en secondes. */
  dt: number
}

type PedestrianEntity = EntityWith<'pedestrian' | 'position'>

const SEVERITY: Readonly<Record<Reaction, number>> = { ignore: 0, notice: 1, flee: 2 }

/** La réaction la plus forte parmi tout ce qui peut lui faire peur, et ce qui la cause (undefined s'il n'ignore pas tout). */
function findStrongestReaction(entity: PedestrianEntity, threats: readonly Threat[], tuning: PedestrianTuning): { reaction: Reaction; threat: Threat | undefined } {
  let strongest: { reaction: Reaction; threat: Threat | undefined } = { reaction: 'ignore', threat: undefined }
  for (const threat of threats) {
    const reaction = decideReaction(entity.position.x, entity.position.y, entity.pedestrian.courage, threat, tuning)
    if (SEVERITY[reaction] > SEVERITY[strongest.reaction]) strongest = { reaction, threat }
  }
  return strongest
}

/**
 * Un piéton attend derrière un autre qui est trop près de lui, mais seulement derrière ceux qui ont un id plus petit :
 * deux piétons face à face ne s'attendent donc jamais l'un l'autre (le plus ancien passe, l'autre patiente un instant).
 */
function isHeldBackByOther(entity: PedestrianEntity, others: readonly PedestrianEntity[], tuning: PedestrianTuning): boolean {
  return others.some((other) => {
    if (other.id >= entity.id) return false
    return Math.sqrt((other.position.x - entity.position.x) ** 2 + (other.position.y - entity.position.y) ** 2) < tuning.minSeparation
  })
}

/** Choisit la case à viser : loin de ce qui fait peur quand il fuit, sinon la suite de sa promenade. Renvoie false s'il est coincé. */
function chooseTarget(context: StepContext, entity: PedestrianEntity, threat: Threat | undefined): boolean {
  const { world, map, tuning } = context
  const { pedestrian, position } = entity
  const tile = getTileAt(map, position.x, position.y)
  const isFleeing = pedestrian.state === PEDESTRIAN_STATES.fleeing
  const isCurious = pedestrian.state === PEDESTRIAN_STATES.curious
  let step: TileStep | undefined
  if (isFleeing && threat !== undefined) step = chooseFleeTile(map, tile, threat, world.rng, tuning)
  else if (isCurious && threat !== undefined) step = chooseApproachTile(map, tile, threat, world.rng, tuning)
  else step = chooseNextTile(map, tile, pedestrian.heading, world.rng, tuning)
  if (step === undefined) return false
  pedestrian.targetTile = { tileX: step.tileX, tileY: step.tileY }
  pedestrian.heading = step.heading
  return true
}

/** Avance vers la case visée. Arrivé, il s'arrête parfois un moment (selon sa patience), sinon il choisira sa case suivante au pas d'après. */
function walk(context: StepContext, entity: PedestrianEntity, type: NpcTypeDef): void {
  const { world, map, tuning, dt } = context
  const { pedestrian, position } = entity
  const isFleeing = pedestrian.state === PEDESTRIAN_STATES.fleeing
  if (pedestrian.targetTile === undefined) return
  const target = getTileCenter(map, pedestrian.targetTile)
  const moved = moveToward(position.x, position.y, target.x, target.y, (isFleeing ? type.fleeSpeed : type.walkSpeed) * dt)
  position.x = moved.x
  position.y = moved.y
  position.angle = computeAngleOf(pedestrian.heading)
  if (!moved.arrived) return

  delete pedestrian.targetTile
  // Seul celui qui se promène s'arrête de lui-même : un curieux qui arrive reste dans son état.
  if (pedestrian.state === PEDESTRIAN_STATES.walking && world.rng.rollChance(tuning.pauseChance)) {
    pedestrian.state = PEDESTRIAN_STATES.pausing
    pedestrian.stateStepsLeft = computePauseSteps(type, pedestrian.patience)
  }
}

/** Un curieux continue d'approcher tant qu'il est plus loin que sa distance d'arrêt de ce qui l'intrigue. */
function isStillApproaching(position: { x: number; y: number }, threat: Threat | undefined, tuning: PedestrianTuning): boolean {
  if (threat === undefined) return false
  return Math.sqrt((threat.x - position.x) ** 2 + (threat.y - position.y) ** 2) > tuning.curiousStopDistance
}

/** Un pas de vie d'un piéton. */
export function updatePedestrian(context: StepContext, entity: PedestrianEntity, type: NpcTypeDef, others: readonly PedestrianEntity[]): void {
  const { world, map, tuning, threats } = context
  const { pedestrian, position } = entity

  // Un piéton en vol ou au sol ne réagit à rien : il subit son choc. Sinon, un véhicule qui roule et le touche le projette, quoi qu'il fasse.
  if (pedestrian.state === PEDESTRIAN_STATES.launched) return updateLaunched(context, entity)
  if (pedestrian.state === PEDESTRIAN_STATES.down) return updateDown(context, entity, type)
  const hit = findVehicleHit(position.x, position.y, context.vehicles, tuning)
  if (hit !== undefined) return startFlight(context, entity, hit)
  if (pedestrian.state === PEDESTRIAN_STATES.returning) return updateReturning(context, entity, type.walkSpeed)

  const scare = findStrongestReaction(entity, threats, tuning)
  const wasFleeing = pedestrian.state === PEDESTRIAN_STATES.fleeing
  // Il ne choisit sa réaction (regarder, s'approcher, filmer, râler) qu'au moment où il remarque : le hasard n'est tiré que ce pas-là.
  const startsWatching = scare.reaction === 'notice' && !wasFleeing && !isWatchState(pedestrian.state)
  const watchState = startsWatching ? chooseWatchState(type.reactionWeights, world.rng) : PEDESTRIAN_STATES.noticing
  const next = advanceState(pedestrian, scare.reaction, tuning, watchState)
  pedestrian.state = next.state
  pedestrian.stateStepsLeft = next.stateStepsLeft
  if (!wasFleeing && pedestrian.state === PEDESTRIAN_STATES.fleeing) {
    world.events.emit('pedestrian:scared', { entityId: entity.id })
    // Il vise une nouvelle case, à l'opposé du danger, au lieu de finir son chemin.
    delete pedestrian.targetTile
  }

  // Revenu à la promenade mais hors d'un trottoir (après un choc) : il rejoint d'abord le trottoir le plus proche.
  const tile = getTileAt(map, position.x, position.y)
  if (pedestrian.state === PEDESTRIAN_STATES.walking && !isWalkableTile(map, tile.tileX, tile.tileY, tuning)) {
    pedestrian.state = PEDESTRIAN_STATES.returning
    return
  }

  if (isWatchState(pedestrian.state)) {
    // Un curieux s'approche encore tant qu'il n'est pas assez près ; les autres s'arrêtent et se tournent vers ce qui fonce sur eux (sans changer la direction de leur promenade).
    const isApproaching = pedestrian.state === PEDESTRIAN_STATES.curious && isStillApproaching(position, scare.threat, tuning)
    if (!isApproaching) {
      if (scare.threat !== undefined) position.angle = computeAngleOf(computeHeadingToward(position.x, position.y, scare.threat.x, scare.threat.y))
      return
    }
  }
  if (pedestrian.state === PEDESTRIAN_STATES.pausing) return

  if (pedestrian.targetTile === undefined && !chooseTarget(context, entity, scare.threat)) return
  if (pedestrian.state === PEDESTRIAN_STATES.walking && isHeldBackByOther(entity, others, tuning)) return
  walk(context, entity, type)
}
