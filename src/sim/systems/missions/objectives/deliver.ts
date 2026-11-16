// Objectif « livrer » : au lieu, le joueur remet l'objet qu'il porte. Sans l'objet, rien ne se passe.
// Expose : deliverObjective.

import type { MissionObjectiveDef } from '../../../core'
import type { ObjectiveHandler } from './objective'
import { isAtObjectivePlace } from './reach'

export const deliverObjective: ObjectiveHandler<Extract<MissionObjectiveDef, { type: 'deliver' }>> = {
  tryComplete(context) {
    const itemIndex = context.active.carriedItems.indexOf(context.objective.item)
    if (itemIndex === -1 || !isAtObjectivePlace(context)) return false
    context.active.carriedItems.splice(itemIndex, 1)
    return true
  },
}
