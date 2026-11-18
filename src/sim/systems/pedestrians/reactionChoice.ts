// Le choix de la réaction d'un piéton qui remarque quelqu'un qui fonce sur lui : regarder, s'approcher, filmer ou râler.
// Expose : WATCH_STATES, WatchState, isWatchState(), chooseWatchState(), chooseGetUpState().
// Pourquoi : deux piétons face au même événement ne font pas la même chose. Le choix se tire au hasard (Rng) selon les poids de la fiche de son type,
// donc c'est configurable en données. Un piéton ne choisit qu'une fois, au moment où il remarque : il ne change pas d'avis à chaque pas.

import type { Rng, ReactionWeights } from '../../core'

/** Les états où un piéton « regarde » ce qui l'a remarqué, dans l'ordre où les poids de la fiche sont tirés. */
export const WATCH_STATES = ['noticing', 'curious', 'filming', 'angry'] as const
export type WatchState = (typeof WATCH_STATES)[number]

export function isWatchState(state: string): state is WatchState {
  return (WATCH_STATES as readonly string[]).includes(state)
}

/** Tire une réaction : chaque état a une chance proportionnelle à son poids. Un poids à 0 n'est jamais tiré. */
export function chooseWatchState(weights: ReactionWeights, rng: Rng): WatchState {
  const byState: Record<WatchState, number> = { noticing: weights.stare, curious: weights.curious, filming: weights.filming, angry: weights.angry }
  const total = WATCH_STATES.reduce((sum, state) => sum + byState[state], 0)
  let roll = rng.nextFloat() * total
  for (const state of WATCH_STATES) {
    if (byState[state] <= 0) continue
    if (roll < byState[state]) return state
    roll -= byState[state]
  }
  // Seulement si l'arrondi a épuisé la liste : on rend le dernier état possible.
  return [...WATCH_STATES].reverse().find((state) => byState[state] > 0) ?? 'noticing'
}

/**
 * La réaction d'un piéton qui se relève après un choc : les mêmes poids que pour remarquer, sauf la curiosité (il n'y a plus rien vers quoi s'approcher).
 * Un type qui ne ferait QUE de la curiosité râle, plutôt que de rester sans réaction.
 */
export function chooseGetUpState(weights: ReactionWeights, rng: Rng): WatchState {
  if (weights.stare + weights.filming + weights.angry <= 0) return 'angry'
  return chooseWatchState({ ...weights, curious: 0 }, rng)
}
