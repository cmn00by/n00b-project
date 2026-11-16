// Les sortes d'objectifs que le moteur sait suivre, une par fichier. Ajouter une sorte = un fichier + une ligne ici (et son type dans sim/core/mission.ts).
import type { MissionObjectiveDef, MissionObjectiveType } from '../../../core'
import { deliverObjective } from './deliver'
import type { ObjectiveContext, ObjectiveHandler } from './objective'
import { pickupObjective } from './pickup'
import { reachObjective } from './reach'

export { isInsidePlace } from './places'

const HANDLERS: { [K in MissionObjectiveType]: ObjectiveHandler<Extract<MissionObjectiveDef, { type: K }>> } = {
  reach: reachObjective,
  pickup: pickupObjective,
  deliver: deliverObjective,
}

/** Demande à la sorte d'objectif voulue si l'objectif est rempli. */
export function tryCompleteObjective(context: ObjectiveContext): boolean {
  const handler = HANDLERS[context.objective.type] as ObjectiveHandler
  return handler.tryComplete(context)
}
