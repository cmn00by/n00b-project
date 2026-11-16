// Les touches de déplacement par position physique sur le clavier.
// Expose : PHYSICAL_KEY_CODES, readPressedKeys().
// Pourquoi : on lit KeyboardEvent.code (la place de la touche) et non la lettre imprimée dessus. La rangée W-A-S-D d'un QWERTY
// et la rangée Z-Q-S-D d'un AZERTY sont aux mêmes places : la même rangée déplace le joueur sur tous les claviers,
// sans que W ou A déplacent aussi le joueur sur un AZERTY. Cette partie ne dépend pas de Phaser, donc elle se teste dans Node.

import type { PressedKeys } from './moveCommand'

/** Les places de touches associées à chaque action (valeurs de KeyboardEvent.code). */
export const PHYSICAL_KEY_CODES = {
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  run: ['ShiftLeft', 'ShiftRight'],
} as const satisfies Record<keyof PressedKeys, readonly string[]>

/** Les touches de déplacement tenues, d'après l'ensemble des places de touches actuellement enfoncées. */
export function readPressedKeys(heldCodes: ReadonlySet<string>): PressedKeys {
  const isAnyHeld = (codes: readonly string[]): boolean => codes.some((code) => heldCodes.has(code))
  return {
    up: isAnyHeld(PHYSICAL_KEY_CODES.up),
    down: isAnyHeld(PHYSICAL_KEY_CODES.down),
    left: isAnyHeld(PHYSICAL_KEY_CODES.left),
    right: isAnyHeld(PHYSICAL_KEY_CODES.right),
    run: isAnyHeld(PHYSICAL_KEY_CODES.run),
  }
}
