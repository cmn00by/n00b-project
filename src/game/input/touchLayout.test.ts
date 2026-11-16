import { describe, expect, it } from 'vitest'
import { TOUCH_CONTROLS } from '../constants'
import { findTouchRole, getActionButtonCenter, getInteractButtonCenter, getJoystickHintCenter, isInsideCircle } from './touchLayout'

const WIDTH = 800
const HEIGHT = 400

describe('isInsideCircle', () => {
  it('est vrai dans le cercle et sur son bord, faux au-delà', () => {
    expect(isInsideCircle(0, 0, 0, 0, 5)).toBe(true)
    expect(isInsideCircle(3, 4, 0, 0, 5)).toBe(true)
    expect(isInsideCircle(4, 4, 0, 0, 5)).toBe(false)
  })
})

describe('getActionButtonCenter', () => {
  it('place le bouton en bas à droite, à la marge du bord', () => {
    const center = getActionButtonCenter(WIDTH, HEIGHT)
    expect(center.x).toBe(WIDTH - TOUCH_CONTROLS.margin - TOUCH_CONTROLS.actionButtonRadius)
    expect(center.y).toBe(HEIGHT - TOUCH_CONTROLS.margin - TOUCH_CONTROLS.actionButtonRadius)
  })
})

describe('getInteractButtonCenter', () => {
  it('place le bouton « E » juste au-dessus du bouton d’action, dans la même colonne, sans le toucher', () => {
    const action = getActionButtonCenter(WIDTH, HEIGHT)
    const interact = getInteractButtonCenter(WIDTH, HEIGHT)
    expect(interact.x).toBe(action.x)
    expect(interact.y).toBeLessThan(action.y)
    const distance = action.y - interact.y
    expect(distance).toBe(TOUCH_CONTROLS.actionButtonRadius + TOUCH_CONTROLS.buttonGap + TOUCH_CONTROLS.interactButtonRadius)
    expect(distance).toBeGreaterThan(TOUCH_CONTROLS.actionButtonRadius + TOUCH_CONTROLS.interactButtonRadius)
  })

  it('reste dans l’écran sur un petit téléphone en paysage', () => {
    const interact = getInteractButtonCenter(640, 320)
    expect(interact.y - TOUCH_CONTROLS.interactButtonRadius).toBeGreaterThan(0)
  })
})

describe('getJoystickHintCenter', () => {
  it('place le repère en bas à gauche', () => {
    const center = getJoystickHintCenter(HEIGHT)
    expect(center.x).toBe(TOUCH_CONTROLS.margin + TOUCH_CONTROLS.joystickRadius)
    expect(center.y).toBe(HEIGHT - TOUCH_CONTROLS.margin - TOUCH_CONTROLS.joystickRadius)
  })
})

describe('findTouchRole', () => {
  it('donne le joystick à un doigt posé sur la moitié gauche', () => {
    expect(findTouchRole(100, 200, WIDTH, HEIGHT)).toBe('joystick')
    expect(findTouchRole(WIDTH / 2 - 1, 10, WIDTH, HEIGHT)).toBe('joystick')
  })

  it('donne « action » à un doigt posé sur le bouton d’action, même un peu à côté', () => {
    const button = getActionButtonCenter(WIDTH, HEIGHT)
    expect(findTouchRole(button.x, button.y, WIDTH, HEIGHT)).toBe('action')
    expect(findTouchRole(button.x - TOUCH_CONTROLS.actionButtonRadius * 1.2, button.y, WIDTH, HEIGHT)).toBe('action')
  })

  it('donne « interact » à un doigt posé sur le bouton « E »', () => {
    const button = getInteractButtonCenter(WIDTH, HEIGHT)
    expect(findTouchRole(button.x, button.y, WIDTH, HEIGHT)).toBe('interact')
  })

  it('ne donne rien à un doigt sur la moitié droite, hors des boutons', () => {
    expect(findTouchRole(WIDTH * 0.6, 50, WIDTH, HEIGHT)).toBeUndefined()
  })

  it('suit la taille de l’écran : les boutons restent en bas à droite après un redimensionnement', () => {
    const action = getActionButtonCenter(1200, 600)
    const interact = getInteractButtonCenter(1200, 600)
    expect(findTouchRole(action.x, action.y, 1200, 600)).toBe('action')
    expect(findTouchRole(interact.x, interact.y, 1200, 600)).toBe('interact')
  })
})
