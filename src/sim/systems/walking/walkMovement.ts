// Le calcul du déplacement à pied pour un pas de simulation.
// Expose : computeWalkOffset().
// Pourquoi : on normalise la direction pour qu'aller en diagonale ne soit pas plus rapide qu'aller tout droit.
// On utilise Math.sqrt (résultat exact, identique partout) et non Math.hypot : la simulation doit donner
// exactement les mêmes nombres sur toutes les machines, condition de la coop.

import { TUNING } from '../../core'

/** Ce que le joueur demande pour ce pas : une direction (de -1 à 1 par axe) et s'il court. */
export interface WalkInput {
  directionX: number
  directionY: number
  isRunning: boolean
}

/** De combien de pixels le joueur se déplace sur chaque axe pendant `dt` secondes. */
export function computeWalkOffset(input: WalkInput, dt: number): { dx: number; dy: number } {
  const length = Math.sqrt(input.directionX * input.directionX + input.directionY * input.directionY)
  if (length === 0) return { dx: 0, dy: 0 }

  const speed = input.isRunning ? TUNING.walking.runSpeed : TUNING.walking.walkSpeed
  const distance = speed * dt
  return { dx: (input.directionX / length) * distance, dy: (input.directionY / length) * distance }
}
