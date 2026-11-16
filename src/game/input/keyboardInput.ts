// Le clavier : lit les touches tenues.
// Expose : createKeyboardInput().
// Pourquoi : flèches, ZQSD (clavier français) et WASD (clavier anglais) déplacent le joueur, Maj le fait courir.
// Cette brique ne décide de rien : elle lit les touches, et moveCommand.ts les traduit en commande.

import Phaser from 'phaser'
import type { PressedKeys } from './moveCommand'

const { KeyCodes } = Phaser.Input.Keyboard

/** Les touches associées à chaque action. */
const KEY_CODES_BY_ACTION = {
  up: [KeyCodes.UP, KeyCodes.Z, KeyCodes.W],
  down: [KeyCodes.DOWN, KeyCodes.S],
  left: [KeyCodes.LEFT, KeyCodes.Q, KeyCodes.A],
  right: [KeyCodes.RIGHT, KeyCodes.D],
  run: [KeyCodes.SHIFT],
} as const

export interface KeyboardInput {
  /** Les touches de déplacement tenues à cet instant. */
  readPressedKeys(): PressedKeys
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
  }
}
