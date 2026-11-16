import { describe, expect, it } from 'vitest'
import { TOUCH_CONTROLS } from '../constants'
import { findTouchRole, getJoystickHintCenter, getRunButtonCenter, isInsideCircle } from './touchLayout'

const WIDTH = 800
const HEIGHT = 400

describe('isInsideCircle', () => {
  it('est vrai dans le cercle et sur son bord, faux au-delà', () => {
    expect(isInsideCircle(0, 0, 0, 0, 5)).toBe(true)
    expect(isInsideCircle(3, 4, 0, 0, 5)).toBe(true)
    expect(isInsideCircle(4, 4, 0, 0, 5)).toBe(false)
  })
})

describe('getRunButtonCenter', () => {
  it('place le bouton en bas à droite, à la marge du bord', () => {
    const center = getRunButtonCenter(WIDTH, HEIGHT)
    expect(center.x).toBe(WIDTH - TOUCH_CONTROLS.margin - TOUCH_CONTROLS.runButtonRadius)
    expect(center.y).toBe(HEIGHT - TOUCH_CONTROLS.margin - TOUCH_CONTROLS.runButtonRadius)
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

  it('donne « courir » à un doigt posé sur le bouton, même un peu à côté', () => {
    const button = getRunButtonCenter(WIDTH, HEIGHT)
    expect(findTouchRole(button.x, button.y, WIDTH, HEIGHT)).toBe('run')
    expect(findTouchRole(button.x - TOUCH_CONTROLS.runButtonRadius * 1.2, button.y, WIDTH, HEIGHT)).toBe('run')
  })

  it('ne donne rien à un doigt sur la moitié droite, hors du bouton', () => {
    expect(findTouchRole(WIDTH * 0.6, 50, WIDTH, HEIGHT)).toBeUndefined()
  })

  it('suit la taille de l’écran : le bouton reste en bas à droite après un redimensionnement', () => {
    const button = getRunButtonCenter(1200, 600)
    expect(findTouchRole(button.x, button.y, 1200, 600)).toBe('run')
  })
})
