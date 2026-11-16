// Le clavier : lit les touches tenues.
// Expose : createKeyboardInput().
// Pourquoi : flèches, ZQSD (clavier français) et WASD (clavier anglais) déplacent le joueur ou conduisent, Maj fait courir,
// Espace tire le frein à main, E ou Entrée servent à interagir (monter dans une voiture, en descendre).
// Cette brique ne décide de rien : elle lit les touches, et moveCommand.ts / driveCommand.ts les traduisent en commandes.

import Phaser from 'phaser'
import type { DriveKeys } from './driveCommand'
import type { PressedKeys } from './moveCommand'

const { KeyCodes } = Phaser.Input.Keyboard

/** Les touches associées à chaque action. */
const KEY_CODES_BY_ACTION = {
  up: [KeyCodes.UP, KeyCodes.Z, KeyCodes.W],
  down: [KeyCodes.DOWN, KeyCodes.S],
  left: [KeyCodes.LEFT, KeyCodes.Q, KeyCodes.A],
  right: [KeyCodes.RIGHT, KeyCodes.D],
  run: [KeyCodes.SHIFT],
  handbrake: [KeyCodes.SPACE],
  interact: [KeyCodes.E, KeyCodes.ENTER],
} as const

export interface KeyboardInput {
  /** Les touches de déplacement tenues à cet instant. */
  readPressedKeys(): PressedKeys
  /** Les touches de conduite tenues à cet instant. */
  readDriveKeys(): DriveKeys
  /** Vrai une seule fois par appui sur la touche d'interaction (même tenue longtemps), puis faux jusqu'au prochain appui. */
  consumeInteract(): boolean
}

export function createKeyboardInput(scene: Phaser.Scene): KeyboardInput {
  const keyboard = scene.input.keyboard
  if (keyboard === null) throw new Error('Le clavier est indisponible sur cet appareil')

  // Phaser empêche au passage la page de défiler quand on appuie sur une flèche.
  const keysByAction = {
    up: KEY_CODES_BY_ACTION.up.map((code) => keyboard.addKey(code)),
    down: KEY_CODES_BY_ACTION.down.map((code) => keyboard.addKey(code)),
    left: KEY_CODES_BY_ACTION.left.map((code) => keyboard.addKey(code)),
    right: KEY_CODES_BY_ACTION.right.map((code) => keyboard.addKey(code)),
    run: KEY_CODES_BY_ACTION.run.map((code) => keyboard.addKey(code)),
    handbrake: KEY_CODES_BY_ACTION.handbrake.map((code) => keyboard.addKey(code)),
  }

  // L'interaction est un appui, pas une touche tenue : on retient qu'il a eu lieu, et le prochain pas de simulation le consomme.
  let isInteractPending = false
  for (const code of KEY_CODES_BY_ACTION.interact) {
    keyboard.addKey(code).on('down', () => {
      isInteractPending = true
    })
  }
  const isAnyDown = (keys: Phaser.Input.Keyboard.Key[]): boolean => keys.some((key) => key.isDown)

  return {
    readPressedKeys() {
      return {
        up: isAnyDown(keysByAction.up),
        down: isAnyDown(keysByAction.down),
        left: isAnyDown(keysByAction.left),
        right: isAnyDown(keysByAction.right),
        run: isAnyDown(keysByAction.run),
      }
    },
    readDriveKeys() {
      return {
        up: isAnyDown(keysByAction.up),
        down: isAnyDown(keysByAction.down),
        left: isAnyDown(keysByAction.left),
        right: isAnyDown(keysByAction.right),
        handbrake: isAnyDown(keysByAction.handbrake),
      }
    },
    consumeInteract() {
      const wasPending = isInteractPending
      isInteractPending = false
      return wasPending
    },
  }
}
