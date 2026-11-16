// La mise en page des commandes tactiles : où est le bouton « courir », et à quoi sert chaque endroit de l'écran.
// Expose : getRunButtonCenter(), getJoystickHintCenter(), findTouchRole(), isInsideCircle().
// Pourquoi : cette partie ne dépend pas de Phaser, donc elle se teste dans Node. L'affichage et la lecture des doigts utilisent les mêmes positions.

import { TOUCH_CONTROLS } from '../constants'

/** À quoi sert un doigt qui se pose à un endroit de l'écran. */
export type TouchRole = 'joystick' | 'run'

/** Le bouton « courir » est en bas à droite de l'écran. */
export function getRunButtonCenter(screenWidth: number, screenHeight: number): { x: number; y: number } {
  const offset = TOUCH_CONTROLS.margin + TOUCH_CONTROLS.runButtonRadius
  return { x: screenWidth - offset, y: screenHeight - offset }
}

/** Là où on affiche le repère du joystick tant qu'aucun doigt n'est posé : en bas à gauche. Le vrai joystick apparaît sous le pouce. */
export function getJoystickHintCenter(screenHeight: number): { x: number; y: number } {
  const offset = TOUCH_CONTROLS.margin + TOUCH_CONTROLS.joystickRadius
  return { x: offset, y: screenHeight - offset }
}

export function isInsideCircle(x: number, y: number, centerX: number, centerY: number, radius: number): boolean {
  const dx = x - centerX
  const dy = y - centerY
  return dx * dx + dy * dy <= radius * radius
}

/** Un doigt sur le bouton « courir » le tient ; ailleurs, sur la moitié gauche de l'écran, il pilote le joystick ; ailleurs, il ne fait rien. */
export function findTouchRole(x: number, y: number, screenWidth: number, screenHeight: number): TouchRole | undefined {
  const runButton = getRunButtonCenter(screenWidth, screenHeight)
  // Zone de toucher un peu plus large que le bouton dessiné : un pouce n'est pas précis.
  if (isInsideCircle(x, y, runButton.x, runButton.y, TOUCH_CONTROLS.runButtonRadius * TOUCH_CONTROLS.runButtonGrab)) return 'run'
  if (x < screenWidth / 2) return 'joystick'
  return undefined
}
