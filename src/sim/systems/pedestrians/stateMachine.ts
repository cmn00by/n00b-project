// La machine à états d'un piéton : se promener, s'arrêter, remarquer (regarder, être curieux, filmer, râler), fuir, être projeté puis revenir.
// Expose : PEDESTRIAN_STATES, advanceState().
// Pourquoi : un état est un simple texte stocké dans le composant pedestrian ; une réaction de plus est un état de plus ici, sans toucher au noyau.
// La fuite l'emporte sur tout, puis la durée de chaque état s'écoule pas après pas. Quelle réaction un piéton choisit quand il remarque est décidé à part (reactionChoice.ts).

import type { Pedestrian } from '../../core'
import type { Reaction } from './reaction'
import { isWatchState } from './reactionChoice'
import type { WatchState } from './reactionChoice'
import { secondsToSteps } from './stepTime'
import type { PedestrianTuning } from './tuning'

export const PEDESTRIAN_STATES = {
  walking: 'walking', // se promène de case de trottoir en case de trottoir
  pausing: 'pausing', // s'est arrêté un moment
  noticing: 'noticing', // a remarqué quelqu'un qui fonce sur lui : il s'arrête et le regarde
  curious: 'curious', // s'approche de ce qui l'intrigue, puis regarde
  filming: 'filming', // s'arrête et filme avec son téléphone
  angry: 'angry', // s'arrête et proteste (sans coups)
  fleeing: 'fleeing', // s'enfuit, plus vite que quand il se promène
  launched: 'launched', // projeté par un véhicule : il vole dans le sens du véhicule
  down: 'down', // au sol après l'atterrissage, avant de se relever et de râler
  returning: 'returning', // hors du trottoir (après un choc) : il rejoint le trottoir le plus proche
} as const

type StateFields = Pick<Pedestrian, 'state' | 'stateStepsLeft'>

const WALKING: StateFields = { state: PEDESTRIAN_STATES.walking, stateStepsLeft: 0 }

/** Combien de temps dure un état où il regarde, en pas. */
function computeWatchSteps(state: WatchState, tuning: PedestrianTuning): number {
  const seconds = { noticing: tuning.noticeSeconds, curious: tuning.curiousSeconds, filming: tuning.filmingSeconds, angry: tuning.angrySeconds }[state]
  return secondsToSteps(seconds)
}

/**
 * L'état d'un piéton au pas suivant, d'après sa réaction à ce qui fonce sur lui. À appeler une fois par pas.
 * `watchState` est la réaction choisie s'il vient de remarquer quelque chose (par défaut il regarde simplement) ;
 * s'il regarde déjà, il garde sa réaction tant que ça continue de foncer sur lui.
 */
export function advanceState(current: StateFields, reaction: Reaction, tuning: PedestrianTuning, watchState: WatchState = PEDESTRIAN_STATES.noticing): StateFields {
  // Fuir l'emporte sur tout, et chaque pas où ça fonce encore sur lui remet le chronomètre de fuite à zéro.
  if (reaction === 'flee') return { state: PEDESTRIAN_STATES.fleeing, stateStepsLeft: secondsToSteps(tuning.fleeSeconds) }
  // Une fois la peur passée, il continue de fuir jusqu'à la fin de son chronomètre.
  if (current.state === PEDESTRIAN_STATES.fleeing) return countDown(current)
  if (reaction === 'notice') {
    const state = isWatchState(current.state) ? current.state : watchState
    return { state, stateStepsLeft: computeWatchSteps(state, tuning) }
  }
  if (isWatchState(current.state) || current.state === PEDESTRIAN_STATES.pausing) return countDown(current)
  return WALKING
}

/** Le temps de l'état s'écoule d'un pas ; à zéro, le piéton reprend sa promenade. */
function countDown(current: StateFields): StateFields {
  const stepsLeft = current.stateStepsLeft - 1
  return stepsLeft <= 0 ? WALKING : { state: current.state, stateStepsLeft: stepsLeft }
}
