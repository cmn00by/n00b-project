// La personnalité d'un piéton : tirée au hasard dans les plages de son type à sa naissance.
// Expose : createPedestrian(), computePauseSteps().
// Pourquoi : deux piétons d'un même type ne réagissent pas pareil (l'un fuit de loin, l'autre reste planté à regarder). Tout le hasard passe par Rng.

import type { NpcTypeDef, NumberRange, Pedestrian, Rng } from '../../core'
import { secondsToSteps } from './stepTime'

function rollInRange(range: NumberRange, rng: Rng): number {
  return range.min + (range.max - range.min) * rng.nextFloat()
}

/** Un piéton qui vient de naître : il se promène, avec le courage et la patience tirés dans les plages de son type. */
export function createPedestrian(type: NpcTypeDef, rng: Rng): Pedestrian {
  return {
    typeId: type.id,
    state: 'walking',
    stateStepsLeft: 0,
    courage: rollInRange(type.courage, rng),
    patience: rollInRange(type.patience, rng),
    heading: { x: 0, y: 0 },
  }
}

/** La durée d'une pause, en pas : le bas de la plage du type pour un impatient (patience 0), le haut pour un patient (patience 1). */
export function computePauseSteps(type: NpcTypeDef, patience: number): number {
  const seconds = type.pauseSeconds.min + (type.pauseSeconds.max - type.pauseSeconds.min) * patience
  return secondsToSteps(seconds)
}
