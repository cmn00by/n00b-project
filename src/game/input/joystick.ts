// La logique du joystick virtuel : où est le pouce, et quelles directions ça demande.
// Expose : readJoystickKeys(), clampToRadius().
// Pourquoi : cette partie ne dépend pas de Phaser, donc elle se teste dans Node. Le joystick produit les mêmes touches (haut, bas, gauche, droite)
// que le clavier : toMoveCommand les traduit ensuite en commande, la simulation ne sait pas d'où elle vient.

import type { PressedKeys } from './moveCommand'

/** Les quatre directions d'un joystick (le bouton « courir » est à part). */
export type JoystickKeys = Pick<PressedKeys, 'up' | 'down' | 'left' | 'right'>

/** Tangente de 22,5° : sépare les 8 secteurs d'un joystick (4 directions + 4 diagonales). */
const TAN_HALF_SECTOR = Math.SQRT2 - 1

const NO_DIRECTION: JoystickKeys = { up: false, down: false, left: false, right: false }

/**
 * Les directions demandées par un pouce, d'après son déplacement (en pixels) depuis le point où il a touché l'écran.
 * Sous la zone morte, rien ne bouge. Au-delà, le joystick donne 8 directions : les 4 axes et les 4 diagonales.
 */
export function readJoystickKeys(offsetX: number, offsetY: number, deadZone: number): JoystickKeys {
  if (offsetX * offsetX + offsetY * offsetY <= deadZone * deadZone) return NO_DIRECTION
  const absX = Math.abs(offsetX)
  const absY = Math.abs(offsetY)
  // Un axe compte dès que le pouce n'est pas presque aligné sur l'autre : plus petit que ~22° d'écart, on ne tourne pas.
  const isHorizontal = absX > absY * TAN_HALF_SECTOR
  const isVertical = absY > absX * TAN_HALF_SECTOR
  return {
    up: isVertical && offsetY < 0,
    down: isVertical && offsetY > 0,
    left: isHorizontal && offsetX < 0,
    right: isHorizontal && offsetX > 0,
  }
}

/** Le déplacement du pouce, ramené dans le cercle du joystick : la manette dessinée ne sort jamais de sa base. */
export function clampToRadius(offsetX: number, offsetY: number, radius: number): { x: number; y: number } {
  const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY)
  if (distance <= radius) return { x: offsetX, y: offsetY }
  const scale = radius / distance
  return { x: offsetX * scale, y: offsetY * scale }
}
