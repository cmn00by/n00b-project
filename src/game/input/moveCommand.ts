// La traduction des touches tenues en commande de déplacement.
// Expose : PressedKeys, toMoveCommand().
// Pourquoi : cette partie ne dépend pas du navigateur, donc elle se teste dans Node. Clavier, manette ou tactile
// finiront tous par produire la même commande 'player:move' : la simulation ne sait pas d'où elle vient.

import type { Command, EntityId } from '../../sim/core'

/** Les touches de déplacement actuellement tenues. */
export interface PressedKeys {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  run: boolean
}

/** La commande de déplacement correspondant aux touches tenues, ou undefined si le joueur ne demande aucune direction. */
export function toMoveCommand(entityId: EntityId, pressed: PressedKeys): Command | undefined {
  const directionX = Number(pressed.right) - Number(pressed.left)
  const directionY = Number(pressed.down) - Number(pressed.up)
  if (directionX === 0 && directionY === 0) return undefined
  return { type: 'player:move', entityId, directionX, directionY, isRunning: pressed.run }
}
