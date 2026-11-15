// La boucle à pas fixe côté affichage : combien de pas de simulation jouer à chaque image affichée.
// Expose : createFixedStepLoop().
// Pourquoi : l'écran tourne à 60, 144 Hz ou moins selon la machine, mais la simulation avance toujours à 30 pas par seconde,
// pour donner le même résultat partout. À chaque image, on joue autant de pas que le temps écoulé en demande,
// puis on renvoie la part du pas suivant déjà écoulée (alpha) pour que l'affichage interpole entre deux pas et reste fluide.

export interface FixedStepLoop {
  /**
   * Joue les pas de simulation dus pour `deltaSeconds` écoulées (en appelant `runStep` pour chacun).
   * Renvoie alpha, de 0 à 1 : la part du pas suivant déjà écoulée, pour l'interpolation de l'affichage.
   */
  advance(deltaSeconds: number, runStep: () => void): number
}

/**
 * @param stepSeconds durée d'un pas de simulation, en secondes
 * @param maxStepsPerFrame plafond de pas par image : si la machine saccade (onglet en arrière-plan, gros ralentissement),
 *   on abandonne le retard au lieu de s'épuiser à le rattraper.
 */
export function createFixedStepLoop(stepSeconds: number, maxStepsPerFrame = 5): FixedStepLoop {
  let accumulatedSeconds = 0

  return {
    advance(deltaSeconds, runStep) {
      accumulatedSeconds += deltaSeconds
      let stepsPlayed = 0
      while (accumulatedSeconds >= stepSeconds && stepsPlayed < maxStepsPerFrame) {
        runStep()
        accumulatedSeconds -= stepSeconds
        stepsPlayed += 1
      }
      if (accumulatedSeconds >= stepSeconds) accumulatedSeconds = 0
      return accumulatedSeconds / stepSeconds
    },
  }
}
