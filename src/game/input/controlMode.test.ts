import { describe, expect, it } from 'vitest'
import { chooseStartMode, mergePressedKeys, parseControlsOverride, switchMode } from './controlMode'

const NONE = { up: false, down: false, left: false, right: false, run: false }

describe('parseControlsOverride', () => {
  it('lit le mode forcé dans l’adresse', () => {
    expect(parseControlsOverride('?controls=touch')).toBe('touch')
    expect(parseControlsOverride('?controls=keyboard')).toBe('keyboard')
    expect(parseControlsOverride('?foo=1&controls=touch')).toBe('touch')
  })

  it('ne force rien sans réglage ou avec une valeur inconnue', () => {
    expect(parseControlsOverride('')).toBeUndefined()
    expect(parseControlsOverride('?foo=1')).toBeUndefined()
    expect(parseControlsOverride('?controls=manette')).toBeUndefined()
  })
})

describe('chooseStartMode', () => {
  it('démarre en tactile sur un appareil dont le pointeur principal est le doigt', () => {
    expect(chooseStartMode(undefined, true)).toBe('touch')
  })

  it('démarre au clavier sur un appareil avec souris', () => {
    expect(chooseStartMode(undefined, false)).toBe('keyboard')
  })

  it('obéit au mode forcé, quel que soit l’appareil', () => {
    expect(chooseStartMode('touch', false)).toBe('touch')
    expect(chooseStartMode('keyboard', true)).toBe('keyboard')
  })
})

describe('switchMode', () => {
  it('suit la dernière entrée utilisée', () => {
    expect(switchMode('touch', undefined)).toBe('touch')
    expect(switchMode('keyboard', undefined)).toBe('keyboard')
  })

  it('reste sur le mode forcé, même si une autre entrée est utilisée', () => {
    expect(switchMode('keyboard', 'touch')).toBe('touch')
    expect(switchMode('touch', 'keyboard')).toBe('keyboard')
  })
})

describe('mergePressedKeys', () => {
  it('ne demande rien quand aucune source ne demande rien', () => {
    expect(mergePressedKeys(NONE, NONE)).toEqual(NONE)
  })

  it('garde ce que demande chaque source', () => {
    const keyboard = { ...NONE, right: true }
    const touch = { ...NONE, down: true, run: true }
    expect(mergePressedKeys(keyboard, touch)).toEqual({ ...NONE, right: true, down: true, run: true })
  })

  it('ne change pas quand les deux sources demandent la même chose', () => {
    const keys = { ...NONE, up: true }
    expect(mergePressedKeys(keys, keys)).toEqual(keys)
  })
})
