// L'affichage des commandes tactiles : le joystick sous le pouce gauche, le bouton d'action et le bouton « E », en HTML/CSS par-dessus le jeu.
// Expose : TouchControlsView, createTouchControlsView().
// Pourquoi : l'interface est en HTML (docs/decisions.md), pas dans la scène 3D. Rien ici ne reçoit de toucher : tout est « pointer-events: none », la lecture des doigts se fait
// dans input/touchInput.ts sur la fenêtre entière. Les positions viennent de touchLayout.ts, les mêmes que pour la lecture des doigts : ce qu'on voit est ce qu'on touche.

import { TOUCH_CONTROLS, TOUCH_STYLE } from '../constants'
import { getActionButtonCenter, getInteractButtonCenter, getJoystickHintCenter } from '../input/touchLayout'
import type { TouchState } from '../input'

export interface TouchControlsView {
  /** À appeler à chaque image : place le joystick et allume les boutons tenus. N'écrit dans la page que ce qui a changé. */
  update(state: TouchState, options: { isDriving: boolean; screenWidth: number; screenHeight: number }): void
  /** Montre ou cache les commandes (cachées avec un clavier). */
  setVisible(isVisible: boolean): void
}

/** Un rond placé par son centre, avec son texte. Il ne reçoit aucun toucher. */
function createCircle(radius: number, parent: HTMLElement): HTMLDivElement {
  const circle = document.createElement('div')
  circle.style.cssText = [
    'position:absolute',
    'left:0',
    'top:0',
    `width:${radius * 2}px`,
    `height:${radius * 2}px`,
    'box-sizing:border-box',
    `border:3px solid ${TOUCH_STYLE.line}`,
    'border-radius:50%',
    `background:${TOUCH_STYLE.fill}`,
    `color:${TOUCH_STYLE.line}`,
    'font:bold 13px monospace',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'user-select:none',
    '-webkit-user-select:none',
    'pointer-events:none',
  ].join(';')
  parent.appendChild(circle)
  return circle
}

function placeCircle(circle: HTMLElement, centerX: number, centerY: number, radius: number): void {
  circle.style.transform = `translate(${Math.round(centerX - radius)}px, ${Math.round(centerY - radius)}px)`
}

function paintButton(button: HTMLElement, isHeld: boolean): void {
  button.style.background = isHeld ? TOUCH_STYLE.pressedFill : TOUCH_STYLE.fill
  button.style.color = isHeld ? TOUCH_STYLE.pressedText : TOUCH_STYLE.line
}

export function createTouchControlsView(parent: HTMLElement): TouchControlsView {
  const root = document.createElement('div')
  root.style.cssText = 'position:fixed;inset:0;z-index:10;pointer-events:none;display:none'
  parent.appendChild(root)

  const joystickBase = createCircle(TOUCH_CONTROLS.joystickRadius, root)
  const joystickThumb = createCircle(TOUCH_CONTROLS.joystickRadius * 0.45, root)
  joystickThumb.style.background = TOUCH_STYLE.line
  const actionButton = createCircle(TOUCH_CONTROLS.actionButtonRadius, root)
  const interactButton = createCircle(TOUCH_CONTROLS.interactButtonRadius, root)
  interactButton.textContent = 'E'

  // Ce qui est déjà écrit dans la page : on ne le réécrit pas à chaque image.
  let lastPaint = ''

  return {
    setVisible(isVisible) {
      root.style.display = isVisible ? 'block' : 'none'
      lastPaint = ''
    },

    update(state, { isDriving, screenWidth, screenHeight }) {
      const paint = JSON.stringify([state, isDriving, screenWidth, screenHeight])
      if (paint === lastPaint) return
      lastPaint = paint

      // Le joystick : un simple repère en bas à gauche tant qu'aucun doigt n'est posé, puis il apparaît sous le pouce.
      const hint = getJoystickHintCenter(screenHeight)
      const base = state.joystick === undefined ? hint : { x: state.joystick.baseX, y: state.joystick.baseY }
      const thumb = state.joystick === undefined ? hint : { x: state.joystick.thumbX, y: state.joystick.thumbY }
      placeCircle(joystickBase, base.x, base.y, TOUCH_CONTROLS.joystickRadius)
      placeCircle(joystickThumb, thumb.x, thumb.y, TOUCH_CONTROLS.joystickRadius * 0.45)
      const opacity = String(state.joystick === undefined ? TOUCH_STYLE.hintOpacity : TOUCH_STYLE.heldOpacity)
      joystickBase.style.opacity = opacity
      joystickThumb.style.opacity = opacity

      const action = getActionButtonCenter(screenWidth, screenHeight)
      placeCircle(actionButton, action.x, action.y, TOUCH_CONTROLS.actionButtonRadius)
      actionButton.textContent = isDriving ? 'FREIN' : 'COURIR'
      paintButton(actionButton, state.isActionHeld)

      const interact = getInteractButtonCenter(screenWidth, screenHeight)
      placeCircle(interactButton, interact.x, interact.y, TOUCH_CONTROLS.interactButtonRadius)
      paintButton(interactButton, state.isInteractHeld)
    },
  }
}
