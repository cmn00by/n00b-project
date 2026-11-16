// Les commandes tactiles : une scène posée par-dessus la ville, avec sa propre caméra fixe (sans zoom ni suivi du joueur).
// Rôle : lire les doigts, dessiner le joystick et le bouton « courir », et dire à la ville quand un doigt se pose.
// Cette scène ne décide d'aucune règle du jeu : la ville lui demande les touches tenues et les traduit en commande.
import Phaser from 'phaser'
import { createTouchControlsView } from '../hud'
import type { TouchControlsView } from '../hud'
import { createTouchInput } from '../input'
import type { PressedKeys, TouchInput } from '../input'

export const TOUCH_CONTROLS_SCENE_KEY = 'TouchControlsScene'
/** Évènement émis par la scène quand un doigt se pose : la ville passe alors en mode tactile. */
export const TOUCH_USED_EVENT = 'touch-used'

export interface TouchControlsSceneData {
  /** Vrai pour que la souris pilote aussi les commandes (test du tactile sur PC). */
  acceptMouse: boolean
}

const NO_KEYS: PressedKeys = { up: false, down: false, left: false, right: false, run: false }

export class TouchControlsScene extends Phaser.Scene {
  private touchInput: TouchInput | undefined
  private view: TouchControlsView | undefined
  private isControlsVisible = false

  constructor() {
    super(TOUCH_CONTROLS_SCENE_KEY)
  }

  create(data: TouchControlsSceneData) {
    this.touchInput = createTouchInput(this, { acceptMouse: data.acceptMouse, onTouch: () => this.events.emit(TOUCH_USED_EVENT) })
    this.view = createTouchControlsView(this)
    this.view.setVisible(this.isControlsVisible)
  }

  override update() {
    if (this.touchInput === undefined || this.view === undefined || !this.isControlsVisible) return
    this.view.draw(this.touchInput.readState(), this.scale.width, this.scale.height)
  }

  /** Les touches de déplacement demandées par les doigts à cet instant. */
  readPressedKeys(): PressedKeys {
    return this.touchInput?.readPressedKeys() ?? NO_KEYS
  }

  /** Affiche ou cache le joystick et le bouton. Les doigts restent suivis même cachés, pour savoir quand repasser en mode tactile. */
  setControlsVisible(isVisible: boolean) {
    this.isControlsVisible = isVisible
    this.view?.setVisible(isVisible)
  }
}
