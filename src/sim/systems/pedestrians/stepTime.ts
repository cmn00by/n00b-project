// La conversion de secondes en pas de simulation.
// Pourquoi : les fiches et les réglages sont en secondes (faciles à comprendre et à modifier), la simulation compte en pas.
import { STEPS_PER_SECOND } from '../../core'

/** Le nombre de pas de simulation que dure un temps en secondes (au moins 1). */
export function secondsToSteps(seconds: number): number {
  return Math.max(1, Math.round(seconds * STEPS_PER_SECOND))
}
