// La machine à états d'un piéton : se promener, s'arrêter, remarquer, fuir.
// Expose : PEDESTRIAN_STATES, advanceState().
// Pourquoi : un état est un simple texte stocké dans le composant pedestrian. Une nouvelle réaction (colère, curiosité, filmer : issue #31) sera un état de plus
// ici, sans toucher au noyau. La fuite l'emporte sur tout, puis la durée de chaque état s'écoule pas après pas.

import type { Pedestrian } from '../../core'
import type { Reaction } from './reaction'
import { secondsToSteps } from './stepTime'
import type { PedestrianTuning } from './tuning'

export const PEDESTRIAN_STATES = {
  walking: 'walking', // se promène de case de trottoir en case de trottoir
  pausing: 'pausing', // s'est arrêté un moment
  noticing: 'noticing', // a remarqué quelqu'un qui fonce sur lui : il s'arrête et le regarde
  fleeing: 'fleeing', // s'enfuit, plus vite que quand il se promène
} as const

type StateFields = Pick<Pedestrian, 'state' | 'stateStepsLeft'>

const WALKING: StateFields = { state: PEDESTRIAN_STATES.walking, stateStepsLeft: 0 }

/** L'état d'un piéton au pas suivant, d'après sa réaction à ce qui fonce sur lui. À appeler une fois par pas. */
export function advanceState(current: StateFields, reaction: Reaction, tuning: PedestrianTuning): StateFields {
  // Fuir l'emporte sur tout, et chaque pas où ça fonce encore sur lui remet le chronomètre de fuite à zéro.
  if (reaction === 'flee') return { state: PEDESTRIAN_STATES.fleeing, stateStepsLeft: secondsToSteps(tuning.fleeSeconds) }
  // Une fois la peur passée, il continue de fuir jusqu'à la fin de son chronomètre.
  if (current.state === PEDESTRIAN_STATES.fleeing) return countDown(current)
  if (reaction === 'notice') return { state: PEDESTRIAN_STATES.noticing, stateStepsLeft: secondsToSteps(tuning.noticeSeconds) }
  if (current.state === PEDESTRIAN_STATES.noticing || current.state === PEDESTRIAN_STATES.pausing) return countDown(current)
  return WALKING
}

/** Le temps de l'état s'écoule d'un pas ; à zéro, le piéton reprend sa promenade. */
function countDown(current: StateFields): StateFields {
  const stepsLeft = current.stateStepsLeft - 1
  return stepsLeft <= 0 ? WALKING : { state: current.state, stateStepsLeft: stepsLeft }
}
