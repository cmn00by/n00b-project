// Le clavier : lit les touches par leur POSITION physique (KeyboardEvent.code), pas par leur lettre.
// Expose : createKeyboard(), Keyboard.
// Pourquoi : la même rangée de touches déplace le joueur sur tous les claviers (ZQSD en AZERTY, WASD en QWERTY), comme le propose l'issue #21.
// Il produit des états de touches : moveCommand.ts et driveCommand.ts les traduisent en commandes.

import type { DriveKeys } from './driveCommand'
import type { PressedKeys } from './moveCommand'

const CODES = {
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  run: ['ShiftLeft', 'ShiftRight'],
  handbrake: ['Space'],
  interact: ['KeyE', 'Enter', 'NumpadEnter'],
} as const

export interface Keyboard {
  readPressedKeys(): PressedKeys
  readDriveKeys(): DriveKeys
  /** Vrai une seule fois par appui sur la touche d'interaction. */
  consumeInteract(): boolean
  /** Appelle `action` à chaque appui sur la touche (code physique), pour les bascules d'affichage (nuit, caméra…). */
  onPress(code: string, action: () => void): void
}

export function createKeyboard(target: Window): Keyboard {
  const held = new Set<string>()
  const pressActions = new Map<string, Array<() => void>>()
  let isInteractPending = false
  const gameCodes = new Set<string>(Object.values(CODES).flat())

  target.addEventListener('keydown', (event) => {
    // Les flèches et Espace ne doivent pas faire défiler la page.
    if (gameCodes.has(event.code)) event.preventDefault()
    if (event.repeat) return
    held.add(event.code)
    if ((CODES.interact as readonly string[]).includes(event.code)) isInteractPending = true
    for (const action of pressActions.get(event.code) ?? []) action()
  })
  target.addEventListener('keyup', (event) => held.delete(event.code))
  // La fenêtre perd le focus : on lâche tout (sinon une touche resterait « enfoncée »).
  target.addEventListener('blur', () => held.clear())

  const isDown = (codes: readonly string[]): boolean => codes.some((code) => held.has(code))
  return {
    readPressedKeys: () => ({ up: isDown(CODES.up), down: isDown(CODES.down), left: isDown(CODES.left), right: isDown(CODES.right), run: isDown(CODES.run) }),
    readDriveKeys: () => ({ up: isDown(CODES.up), down: isDown(CODES.down), left: isDown(CODES.left), right: isDown(CODES.right), handbrake: isDown(CODES.handbrake) }),
    consumeInteract() {
      const wasPending = isInteractPending
      isInteractPending = false
      return wasPending
    },
    onPress(code, action) {
      pressActions.set(code, [...(pressActions.get(code) ?? []), action])
    },
  }
}
