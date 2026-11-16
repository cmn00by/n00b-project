// La mise en page des commandes tactiles : où sont les boutons, et à quoi sert chaque endroit de l'écran.
// Expose : getActionButtonCenter(), getInteractButtonCenter(), getJoystickHintCenter(), findTouchRole(), isInsideCircle().
// Pourquoi : cette partie ne dépend pas du navigateur, donc elle se teste dans Node. L'affichage et la lecture des doigts utilisent les mêmes positions
// (en pixels de la fenêtre). À droite, deux boutons l'un au-dessus de l'autre : « E » (monter, descendre) au-dessus du bouton d'action.

import { TOUCH_CONTROLS } from '../constants'

/** À quoi sert un doigt qui se pose à un endroit de l'écran. */
export type TouchRole = 'joystick' | 'action' | 'interact'

/** Le bouton d'action (« courir » à pied, « frein à main » en voiture) est en bas à droite de l'écran. */
export function getActionButtonCenter(screenWidth: number, screenHeight: number): { x: number; y: number } {
  const offset = TOUCH_CONTROLS.margin + TOUCH_CONTROLS.actionButtonRadius
  return { x: screenWidth - offset, y: screenHeight - offset }
}

/** Le bouton « E » est juste au-dessus du bouton d'action. */
export function getInteractButtonCenter(screenWidth: number, screenHeight: number): { x: number; y: number } {
  const action = getActionButtonCenter(screenWidth, screenHeight)
  return { x: action.x, y: action.y - TOUCH_CONTROLS.actionButtonRadius - TOUCH_CONTROLS.buttonGap - TOUCH_CONTROLS.interactButtonRadius }
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

/** Un doigt sur un bouton le tient (ou l'actionne) ; ailleurs, sur la moitié gauche de l'écran, il pilote le joystick ; ailleurs, il ne fait rien. */
export function findTouchRole(x: number, y: number, screenWidth: number, screenHeight: number): TouchRole | undefined {
  // Zone de toucher un peu plus large que le bouton dessiné : un pouce n'est pas précis.
  const action = getActionButtonCenter(screenWidth, screenHeight)
  if (isInsideCircle(x, y, action.x, action.y, TOUCH_CONTROLS.actionButtonRadius * TOUCH_CONTROLS.buttonGrab)) return 'action'
  const interact = getInteractButtonCenter(screenWidth, screenHeight)
  if (isInsideCircle(x, y, interact.x, interact.y, TOUCH_CONTROLS.interactButtonRadius * TOUCH_CONTROLS.buttonGrab)) return 'interact'
  if (x < screenWidth / 2) return 'joystick'
  return undefined
}
