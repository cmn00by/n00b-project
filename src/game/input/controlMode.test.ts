import { describe, expect, it } from 'vitest'
import { chooseStartMode, parseControlsOverride, switchMode } from './controlMode'

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
