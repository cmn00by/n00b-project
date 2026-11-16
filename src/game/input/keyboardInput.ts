// Le clavier : suit les touches tenues, repérées par leur place physique sur le clavier.
// Expose : createKeyboardInput().
// Pourquoi : la rangée W-A-S-D d'un QWERTY et Z-Q-S-D d'un AZERTY déplacent le joueur, les flèches aussi, Maj le fait courir.
// Cette brique ne décide de rien : elle suit les touches, physicalKeys.ts les lit et moveCommand.ts les traduit en commande.

import Phaser from 'phaser'
import type { PressedKeys } from './moveCommand'
import { readPressedKeys } from './physicalKeys'

const { KeyCodes } = Phaser.Input.Keyboard

/** Les flèches font défiler la page web : on empêche ce défilement pendant qu'on joue. */
const CAPTURED_KEY_CODES = [KeyCodes.UP, KeyCodes.DOWN, KeyCodes.LEFT, KeyCodes.RIGHT]

export interface KeyboardInput {
  /** Les touches de déplacement tenues à cet instant. */
  readPressedKeys(): PressedKeys
}

export function createKeyboardInput(scene: Phaser.Scene): KeyboardInput {
  const keyboard = scene.input.keyboard
  if (keyboard === null) throw new Error('Le clavier est indisponible sur cet appareil')

  keyboard.addCapture(CAPTURED_KEY_CODES)

  // Les places de touches actuellement enfoncées (valeurs de KeyboardEvent.code, comme 'KeyW').
  const heldCodes = new Set<string>()
  const onKeyDown = (event: KeyboardEvent): void => {
    heldCodes.add(event.code)
  }
  const onKeyUp = (event: KeyboardEvent): void => {
    heldCodes.delete(event.code)
  }
  // Si la fenêtre perd le focus pendant qu'une touche est tenue, on ne reçoit jamais son relâchement : sans ça le joueur continuerait d'avancer tout seul.
  const onBlur = (): void => {
    heldCodes.clear()
  }

  keyboard.on('keydown', onKeyDown)
  keyboard.on('keyup', onKeyUp)
  scene.game.events.on(Phaser.Core.Events.BLUR, onBlur)
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    keyboard.off('keydown', onKeyDown)
    keyboard.off('keyup', onKeyUp)
    scene.game.events.off(Phaser.Core.Events.BLUR, onBlur)
  })

  return {
    readPressedKeys() {
      return readPressedKeys(heldCodes)
    },
  }
}
