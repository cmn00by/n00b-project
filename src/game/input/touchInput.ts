// Le tactile : écoute les doigts posés sur la fenêtre et en fait des touches, comme le clavier.
// Expose : createTouchInput(), TouchInput.
// Pourquoi : un doigt sur la moitié gauche pilote un joystick qui apparaît sous le pouce, un autre sur le bouton d'action le tient, un autre appuie sur « E ».
// Ce module ne fait que brancher les événements du navigateur (Pointer Events : le même code pour un doigt, un stylet ou une souris) sur le suivi de touchTracker.ts.
// Il ne décide de rien : joystick.ts traduit les doigts en directions, moveCommand.ts et driveCommand.ts en commandes.

import type { DriveKeys } from './driveCommand'
import type { PressedKeys } from './moveCommand'
import { createTouchTracker } from './touchTracker'
import type { TouchState } from './touchTracker'

export interface TouchInput {
  /** Les touches de déplacement à pied demandées par les doigts à cet instant (le bouton d'action fait « courir »). */
  readPressedKeys(): PressedKeys
  /** Les touches de conduite demandées par les doigts à cet instant (le bouton d'action fait « frein à main »). */
  readDriveKeys(): DriveKeys
  /** Vrai une seule fois par appui sur « E ». */
  consumeInteract(): boolean
  /** L'état à afficher : joystick et boutons. */
  readState(): TouchState
  /** Active ou coupe la lecture des doigts. Coupée, les doigts ne commandent rien et tout est lâché. */
  setEnabled(isEnabled: boolean): void
  /** Appelle `action` à chaque fois qu'un doigt (vrai toucher) se pose, même coupé : sert à passer en mode tactile. */
  onTouchUsed(action: () => void): void
}

export function createTouchInput(target: Window): TouchInput {
  const tracker = createTouchTracker()
  const touchUsedActions: Array<() => void> = []
  let isEnabled = false

  target.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch') for (const action of touchUsedActions) action()
    if (isEnabled) tracker.press(event.pointerId, event.clientX, event.clientY, target.innerWidth, target.innerHeight)
  })
  target.addEventListener('pointermove', (event) => {
    if (isEnabled) tracker.move(event.pointerId, event.clientX, event.clientY)
  })
  // Un toucher interrompu (appel, geste du système) lâche le doigt comme s'il s'était levé : jamais de joystick « coincé ».
  const releasePointer = (event: PointerEvent) => tracker.release(event.pointerId)
  target.addEventListener('pointerup', releasePointer)
  target.addEventListener('pointercancel', releasePointer)
  target.addEventListener('blur', () => tracker.releaseAll())

  return {
    readPressedKeys: () => ({ ...tracker.readJoystickKeys(), run: tracker.isActionHeld() }),
    readDriveKeys: () => ({ ...tracker.readJoystickKeys(), handbrake: tracker.isActionHeld() }),
    consumeInteract: () => tracker.consumeInteract(),
    readState: () => tracker.readState(),
    setEnabled(newIsEnabled) {
      isEnabled = newIsEnabled
      if (!isEnabled) tracker.releaseAll()
    },
    onTouchUsed(action) {
      touchUsedActions.push(action)
    },
  }
}
