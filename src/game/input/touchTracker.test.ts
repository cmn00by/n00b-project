import { describe, expect, it } from 'vitest'
import { TOUCH_CONTROLS } from '../constants'
import { createTouchTracker } from './touchTracker'
import { getActionButtonCenter, getInteractButtonCenter } from './touchLayout'

const WIDTH = 800
const HEIGHT = 400
const NO_KEYS = { up: false, down: false, left: false, right: false }

describe('joystick', () => {
  it('ne demande aucune direction tant qu’aucun doigt n’est posé', () => {
    expect(createTouchTracker().readJoystickKeys()).toEqual(NO_KEYS)
  })

  it('ne bouge pas sous la zone morte, puis va dans la direction du pouce', () => {
    const tracker = createTouchTracker()
    tracker.press(1, 100, 200, WIDTH, HEIGHT)
    tracker.move(1, 100 + TOUCH_CONTROLS.deadZone - 1, 200)
    expect(tracker.readJoystickKeys()).toEqual(NO_KEYS)
    tracker.move(1, 100 + 40, 200)
    expect(tracker.readJoystickKeys()).toEqual({ ...NO_KEYS, right: true })
    tracker.move(1, 100 - 30, 200 - 30)
    expect(tracker.readJoystickKeys()).toEqual({ ...NO_KEYS, left: true, up: true })
  })

  it('est flottant : son centre est l’endroit où le pouce s’est posé', () => {
    const tracker = createTouchTracker()
    tracker.press(1, 300, 120, WIDTH, HEIGHT)
    expect(tracker.readState().joystick).toEqual({ baseX: 300, baseY: 120, thumbX: 300, thumbY: 120 })
  })

  it('ramène la manette dessinée dans le cercle, sans changer les directions', () => {
    const tracker = createTouchTracker()
    tracker.press(1, 100, 200, WIDTH, HEIGHT)
    tracker.move(1, 100 + 500, 200)
    const joystick = tracker.readState().joystick
    expect(joystick?.thumbX).toBeCloseTo(100 + TOUCH_CONTROLS.joystickRadius)
    expect(joystick?.thumbY).toBeCloseTo(200)
    expect(tracker.readJoystickKeys()).toEqual({ ...NO_KEYS, right: true })
  })

  it('s’arrête quand le doigt se lève', () => {
    const tracker = createTouchTracker()
    tracker.press(1, 100, 200, WIDTH, HEIGHT)
    tracker.move(1, 160, 200)
    tracker.release(1)
    expect(tracker.readJoystickKeys()).toEqual(NO_KEYS)
    expect(tracker.readState().joystick).toBeUndefined()
  })

  it('ignore un deuxième doigt sur le joystick', () => {
    const tracker = createTouchTracker()
    tracker.press(1, 100, 200, WIDTH, HEIGHT)
    tracker.press(2, 200, 300, WIDTH, HEIGHT)
    tracker.move(2, 300, 300)
    expect(tracker.readJoystickKeys()).toEqual(NO_KEYS)
    tracker.move(1, 160, 200)
    expect(tracker.readJoystickKeys()).toEqual({ ...NO_KEYS, right: true })
  })

  it('ne laisse pas un deuxième doigt reprendre le joystick quand le premier se lève', () => {
    const tracker = createTouchTracker()
    tracker.press(1, 100, 200, WIDTH, HEIGHT)
    tracker.press(2, 200, 300, WIDTH, HEIGHT)
    tracker.move(2, 300, 300)
    tracker.release(1)
    expect(tracker.readJoystickKeys()).toEqual(NO_KEYS)
    expect(tracker.readState().joystick).toBeUndefined()
  })

  it('garde le joystick même si le doigt glisse sur la moitié droite ou sur un bouton', () => {
    const tracker = createTouchTracker()
    tracker.press(1, 390, 200, WIDTH, HEIGHT)
    tracker.move(1, 700, 200)
    expect(tracker.readJoystickKeys()).toEqual({ ...NO_KEYS, right: true })
    expect(tracker.isActionHeld()).toBe(false)
  })
})

describe('bouton d’action', () => {
  it('est tenu tant que le doigt est posé dessus', () => {
    const tracker = createTouchTracker()
    const button = getActionButtonCenter(WIDTH, HEIGHT)
    expect(tracker.isActionHeld()).toBe(false)
    tracker.press(5, button.x, button.y, WIDTH, HEIGHT)
    expect(tracker.isActionHeld()).toBe(true)
    expect(tracker.readState().isActionHeld).toBe(true)
    tracker.release(5)
    expect(tracker.isActionHeld()).toBe(false)
  })

  it('se tient en même temps que le joystick, avec deux doigts', () => {
    const tracker = createTouchTracker()
    const button = getActionButtonCenter(WIDTH, HEIGHT)
    tracker.press(1, 100, 200, WIDTH, HEIGHT)
    tracker.press(2, button.x, button.y, WIDTH, HEIGHT)
    tracker.move(1, 160, 200)
    expect(tracker.readJoystickKeys()).toEqual({ ...NO_KEYS, right: true })
    expect(tracker.isActionHeld()).toBe(true)
    tracker.release(1)
    expect(tracker.isActionHeld()).toBe(true)
  })

  it('reste tenu si le doigt glisse hors du bouton', () => {
    const tracker = createTouchTracker()
    const button = getActionButtonCenter(WIDTH, HEIGHT)
    tracker.press(2, button.x, button.y, WIDTH, HEIGHT)
    tracker.move(2, 10, 10)
    expect(tracker.isActionHeld()).toBe(true)
  })
})

describe('bouton « E »', () => {
  it('ne compte qu’un appui, une seule fois, même si le doigt reste posé', () => {
    const tracker = createTouchTracker()
    const button = getInteractButtonCenter(WIDTH, HEIGHT)
    expect(tracker.consumeInteract()).toBe(false)
    tracker.press(3, button.x, button.y, WIDTH, HEIGHT)
    expect(tracker.readState().isInteractHeld).toBe(true)
    expect(tracker.consumeInteract()).toBe(true)
    expect(tracker.consumeInteract()).toBe(false)
    tracker.release(3)
    expect(tracker.consumeInteract()).toBe(false)
  })

  it('compte chaque nouvel appui', () => {
    const tracker = createTouchTracker()
    const button = getInteractButtonCenter(WIDTH, HEIGHT)
    tracker.press(3, button.x, button.y, WIDTH, HEIGHT)
    expect(tracker.consumeInteract()).toBe(true)
    tracker.release(3)
    tracker.press(4, button.x, button.y, WIDTH, HEIGHT)
    expect(tracker.consumeInteract()).toBe(true)
  })
})

describe('cas limites', () => {
  it('ignore un doigt posé hors de toute commande', () => {
    const tracker = createTouchTracker()
    tracker.press(9, WIDTH * 0.6, 50, WIDTH, HEIGHT)
    expect(tracker.readState()).toEqual({ joystick: undefined, isActionHeld: false, isInteractHeld: false })
  })

  it('ne casse pas sur un doigt inconnu', () => {
    const tracker = createTouchTracker()
    expect(() => {
      tracker.move(42, 1, 1)
      tracker.release(42)
    }).not.toThrow()
  })

  it('lâche tout d’un coup, y compris un appui sur « E » pas encore lu', () => {
    const tracker = createTouchTracker()
    const action = getActionButtonCenter(WIDTH, HEIGHT)
    const interact = getInteractButtonCenter(WIDTH, HEIGHT)
    tracker.press(1, 100, 200, WIDTH, HEIGHT)
    tracker.press(2, action.x, action.y, WIDTH, HEIGHT)
    tracker.press(3, interact.x, interact.y, WIDTH, HEIGHT)
    tracker.releaseAll()
    expect(tracker.readState()).toEqual({ joystick: undefined, isActionHeld: false, isInteractHeld: false })
    expect(tracker.consumeInteract()).toBe(false)
  })

  it('un même doigt qui se repose change simplement de position', () => {
    const tracker = createTouchTracker()
    tracker.press(1, 100, 200, WIDTH, HEIGHT)
    tracker.press(1, 150, 250, WIDTH, HEIGHT)
    expect(tracker.readState().joystick?.baseX).toBe(150)
  })
})
