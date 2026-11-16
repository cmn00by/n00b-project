// Objectif « aller à » : le joueur est dans le lieu, arrivé comme demandé (à pied, au volant, ou peu importe).
// Expose : reachObjective, isAtObjectivePlace().

import type { MissionObjectiveDef } from '../../../core'
import { isInsidePlace, isTravelSatisfied } from './places'
import type { ObjectiveContext, ObjectiveHandler } from './objective'

/** Le joueur est-il au lieu de l'objectif, arrivé comme demandé ? Partagé par toutes les sortes d'objectifs qui ont un lieu. */
export function isAtObjectivePlace({ player, objective, map }: ObjectiveContext): boolean {
  return isInsidePlace(player.position.x, player.position.y, objective.place, map) && isTravelSatisfied(objective.travel, player.driver !== undefined)
}

export const reachObjective: ObjectiveHandler<Extract<MissionObjectiveDef, { type: 'reach' }>> = {
  tryComplete: (context) => isAtObjectivePlace(context),
}
