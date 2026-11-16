// Objectif « ramasser » : au lieu, le joueur prend l'objet ; il le porte ensuite jusqu'à sa livraison.
// Expose : pickupObjective.

import type { MissionObjectiveDef } from '../../../core'
import type { ObjectiveHandler } from './objective'
import { isAtObjectivePlace } from './reach'

export const pickupObjective: ObjectiveHandler<Extract<MissionObjectiveDef, { type: 'pickup' }>> = {
  tryComplete(context) {
    if (!isAtObjectivePlace(context)) return false
    context.active.carriedItems.push(context.objective.item)
    return true
  },
}
