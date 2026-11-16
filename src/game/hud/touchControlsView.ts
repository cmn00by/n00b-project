// L'affichage des commandes tactiles : le joystick sous le pouce et le bouton « courir ».
// Expose : createTouchControlsView(), TouchControlsView.
// Pourquoi : il dessine l'état des doigts sans rien décider. Formes de couleur provisoires, en attendant les visuels (#4).
// Les tailles sont en pixels d'écran : les commandes ne suivent ni le zoom ni les mouvements de la caméra du jeu.

import Phaser from 'phaser'
import { COLORS, TOUCH_CONTROLS } from '../constants'
import { getJoystickHintCenter, getRunButtonCenter } from '../input'
import type { TouchState } from '../input'

export interface TouchControlsView {
  /** Dessine les commandes pour l'écran actuel. À appeler à chaque image. */
  draw(state: TouchState, screenWidth: number, screenHeight: number): void
  setVisible(isVisible: boolean): void
}

/** Transparence : les commandes se voient sans cacher le jeu. */
const IDLE_ALPHA = 0.25
const ACTIVE_ALPHA = 0.55
const OUTLINE_WIDTH_PX = 3
const THUMB_RADIUS_RATIO = 0.45

export function createTouchControlsView(scene: Phaser.Scene): TouchControlsView {
  const graphics = scene.add.graphics()
  const runLabel = scene.add.text(0, 0, 'COURIR', { fontFamily: 'monospace', fontSize: '14px', color: COLORS.text }).setOrigin(0.5)

  const drawJoystick = (state: TouchState, screenHeight: number): void => {
    const radius = TOUCH_CONTROLS.joystickRadius
    // Sans doigt posé, un repère faible montre où poser le pouce ; sinon le joystick est centré là où le pouce s'est posé.
    const hint = getJoystickHintCenter(screenHeight)
    const base = state.joystick === undefined ? hint : { x: state.joystick.baseX, y: state.joystick.baseY }
    graphics.lineStyle(OUTLINE_WIDTH_PX, COLORS.outline, state.joystick === undefined ? IDLE_ALPHA : ACTIVE_ALPHA)
    graphics.fillStyle(COLORS.outline, IDLE_ALPHA)
    graphics.fillCircle(base.x, base.y, radius)
    graphics.strokeCircle(base.x, base.y, radius)
    if (state.joystick === undefined) return
    graphics.fillStyle(COLORS.player, ACTIVE_ALPHA + 0.2)
    graphics.fillCircle(state.joystick.thumbX, state.joystick.thumbY, radius * THUMB_RADIUS_RATIO)
  }

  const drawRunButton = (state: TouchState, screenWidth: number, screenHeight: number): void => {
    const center = getRunButtonCenter(screenWidth, screenHeight)
    graphics.fillStyle(state.isRunHeld ? COLORS.player : COLORS.outline, state.isRunHeld ? ACTIVE_ALPHA + 0.2 : IDLE_ALPHA)
    graphics.fillCircle(center.x, center.y, TOUCH_CONTROLS.runButtonRadius)
    graphics.lineStyle(OUTLINE_WIDTH_PX, COLORS.outline, state.isRunHeld ? ACTIVE_ALPHA : IDLE_ALPHA)
    graphics.strokeCircle(center.x, center.y, TOUCH_CONTROLS.runButtonRadius)
    runLabel.setPosition(center.x, center.y)
  }

  return {
    draw(state, screenWidth, screenHeight) {
      graphics.clear()
      drawJoystick(state, screenHeight)
      drawRunButton(state, screenWidth, screenHeight)
    },
    setVisible(isVisible) {
      graphics.setVisible(isVisible)
      runLabel.setVisible(isVisible)
    },
  }
}
