// La traduction des touches tenues en commande de conduite.
// Expose : DriveKeys, toDriveCommand().
// Pourquoi : comme moveCommand.ts, cette partie ne dépend pas du navigateur et se teste dans Node.
// Haut : accélérer · Bas : freiner puis reculer · Gauche/Droite : tourner · Espace : frein à main.

import type { Command, EntityId } from '../../sim/core'

/** Les touches de conduite actuellement tenues. */
export interface DriveKeys {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  handbrake: boolean
}

/** La commande de conduite du conducteur `driverId`, ou undefined s'il ne touche à rien (la voiture roule alors en roue libre). */
export function toDriveCommand(driverId: EntityId, keys: DriveKeys): Command | undefined {
  const throttle = Number(keys.up) - Number(keys.down)
  const steer = Number(keys.right) - Number(keys.left)
  if (throttle === 0 && steer === 0 && !keys.handbrake) return undefined
  return { type: 'vehicle:drive', entityId: driverId, throttle, steer, isHandbraking: keys.handbrake }
}
