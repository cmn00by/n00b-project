import { describe, expect, it } from 'vitest'
import { clampToRadius, readJoystickKeys } from './joystick'

const DEAD_ZONE = 10
const NONE = { up: false, down: false, left: false, right: false }

describe('readJoystickKeys', () => {
  it('ne demande rien quand le pouce est dans la zone morte', () => {
    expect(readJoystickKeys(0, 0, DEAD_ZONE)).toEqual(NONE)
    expect(readJoystickKeys(7, 7, DEAD_ZONE)).toEqual(NONE)
    expect(readJoystickKeys(10, 0, DEAD_ZONE)).toEqual(NONE)
  })

  it('donne les 4 directions quand le pouce est sur un axe', () => {
    expect(readJoystickKeys(30, 0, DEAD_ZONE)).toEqual({ ...NONE, right: true })
    expect(readJoystickKeys(-30, 0, DEAD_ZONE)).toEqual({ ...NONE, left: true })
    expect(readJoystickKeys(0, 30, DEAD_ZONE)).toEqual({ ...NONE, down: true })
    expect(readJoystickKeys(0, -30, DEAD_ZONE)).toEqual({ ...NONE, up: true })
  })

  it('donne les 4 diagonales quand le pouce est entre deux axes', () => {
    expect(readJoystickKeys(30, 30, DEAD_ZONE)).toEqual({ ...NONE, right: true, down: true })
    expect(readJoystickKeys(-30, 30, DEAD_ZONE)).toEqual({ ...NONE, left: true, down: true })
    expect(readJoystickKeys(30, -30, DEAD_ZONE)).toEqual({ ...NONE, right: true, up: true })
    expect(readJoystickKeys(-30, -30, DEAD_ZONE)).toEqual({ ...NONE, left: true, up: true })
  })

  it('ne tourne pas en diagonale quand le pouce est presque aligné sur un axe', () => {
    // Un pouce qui dérive un peu vers le bas en poussant à droite reste « droite » : environ 11° d'écart.
    expect(readJoystickKeys(30, 6, DEAD_ZONE)).toEqual({ ...NONE, right: true })
    expect(readJoystickKeys(6, -30, DEAD_ZONE)).toEqual({ ...NONE, up: true })
  })

  it('passe en diagonale à partir de ~22° d’écart', () => {
    expect(readJoystickKeys(30, 14, DEAD_ZONE)).toEqual({ ...NONE, right: true, down: true })
  })

  it('donne le même résultat quelle que soit la distance, une fois la zone morte passée', () => {
    expect(readJoystickKeys(12, 0, DEAD_ZONE)).toEqual(readJoystickKeys(400, 0, DEAD_ZONE))
  })
})

describe('clampToRadius', () => {
  it('laisse le pouce tel quel dans le cercle', () => {
    expect(clampToRadius(3, 4, 10)).toEqual({ x: 3, y: 4 })
  })

  it('ramène le pouce sur le bord du cercle en gardant sa direction', () => {
    const clamped = clampToRadius(60, 80, 10)
    expect(clamped.x).toBeCloseTo(6)
    expect(clamped.y).toBeCloseTo(8)
  })
})
