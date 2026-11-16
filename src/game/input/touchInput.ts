// Le tactile : suit les doigts posés sur l'écran et en fait des touches, comme le clavier.
// Expose : createTouchInput(), TouchInput, TouchState.
// Pourquoi : un doigt sur la moitié gauche pilote un joystick qui apparaît sous le pouce, un autre sur le bouton « courir » le tient.
// Chaque doigt est suivi par son identifiant : on peut avancer et courir en même temps. Cette brique ne décide de rien :
// elle lit les doigts, joystick.ts les traduit en directions et moveCommand.ts en commande.

import Phaser from 'phaser'
import { TOUCH_CONTROLS } from '../constants'
import { clampToRadius, readJoystickKeys } from './joystick'
import type { PressedKeys } from './moveCommand'
import { findTouchRole } from './touchLayout'

/** Ce que l'affichage a besoin de savoir : où est le joystick (s'il y a un doigt dessus) et si « courir » est tenu. */
export interface TouchState {
  /** Le joystick tenu : son centre (là où le pouce s'est posé) et la position de la manette, ramenée dans le cercle. */
  joystick: { baseX: number; baseY: number; thumbX: number; thumbY: number } | undefined
  isRunHeld: boolean
}

export interface TouchInput {
  /** Les touches de déplacement demandées par les doigts à cet instant. */
  readPressedKeys(): PressedKeys
  /** L'état à afficher. */
  readState(): TouchState
}

export interface TouchInputOptions {
  /** Vrai pour que la souris pilote aussi les commandes : sert à tester le tactile sur un PC sans écran tactile. */
  acceptMouse: boolean
  /** Appelé à chaque doigt qui se pose : le jeu passe alors en mode tactile. */
  onTouch: () => void
}

/** Les doigts peuvent être jusqu'à 3 à toucher l'écran en même temps : joystick, « courir », et un de rechange. */
const EXTRA_POINTERS = 2

interface JoystickFinger {
  pointerId: number
  baseX: number
  baseY: number
  offsetX: number
  offsetY: number
}

export function createTouchInput(scene: Phaser.Scene, options: TouchInputOptions): TouchInput {
  scene.input.addPointer(EXTRA_POINTERS)

  let joystick: JoystickFinger | undefined
  let runPointerId: number | undefined

  const accepts = (pointer: Phaser.Input.Pointer): boolean => pointer.wasTouch || options.acceptMouse

  const onPointerDown = (pointer: Phaser.Input.Pointer): void => {
    if (!accepts(pointer)) return
    options.onTouch()
    const role = findTouchRole(pointer.x, pointer.y, scene.scale.width, scene.scale.height)
    if (role === 'joystick' && joystick === undefined) {
      joystick = { pointerId: pointer.id, baseX: pointer.x, baseY: pointer.y, offsetX: 0, offsetY: 0 }
    } else if (role === 'run' && runPointerId === undefined) {
      runPointerId = pointer.id
    }
  }

  const onPointerMove = (pointer: Phaser.Input.Pointer): void => {
    if (joystick === undefined || pointer.id !== joystick.pointerId) return
    joystick.offsetX = pointer.x - joystick.baseX
    joystick.offsetY = pointer.y - joystick.baseY
  }

  const onPointerUp = (pointer: Phaser.Input.Pointer): void => {
    if (joystick !== undefined && pointer.id === joystick.pointerId) joystick = undefined
    if (pointer.id === runPointerId) runPointerId = undefined
  }

  // Si la page perd le focus ou si les doigts quittent l'écran sans qu'on reçoive leur relâchement, le joueur ne doit pas continuer tout seul.
  const releaseAll = (): void => {
    joystick = undefined
    runPointerId = undefined
  }

  scene.input.on('pointerdown', onPointerDown)
  scene.input.on('pointermove', onPointerMove)
  scene.input.on('pointerup', onPointerUp)
  scene.input.on('pointerupoutside', onPointerUp)
  scene.input.on('gameout', releaseAll)
  scene.game.events.on(Phaser.Core.Events.BLUR, releaseAll)
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.input.off('pointerdown', onPointerDown)
    scene.input.off('pointermove', onPointerMove)
    scene.input.off('pointerup', onPointerUp)
    scene.input.off('pointerupoutside', onPointerUp)
    scene.input.off('gameout', releaseAll)
    scene.game.events.off(Phaser.Core.Events.BLUR, releaseAll)
  })

  return {
    readPressedKeys() {
      const directions = joystick === undefined ? { up: false, down: false, left: false, right: false } : readJoystickKeys(joystick.offsetX, joystick.offsetY, TOUCH_CONTROLS.deadZone)
      return { ...directions, run: runPointerId !== undefined }
    },
    readState() {
      if (joystick === undefined) return { joystick: undefined, isRunHeld: runPointerId !== undefined }
      const thumb = clampToRadius(joystick.offsetX, joystick.offsetY, TOUCH_CONTROLS.joystickRadius)
      return {
        joystick: { baseX: joystick.baseX, baseY: joystick.baseY, thumbX: joystick.baseX + thumb.x, thumbY: joystick.baseY + thumb.y },
        isRunHeld: runPointerId !== undefined,
      }
    },
  }
}
