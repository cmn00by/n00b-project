import { describe, expect, it } from 'vitest'
import { readPressedKeys } from './physicalKeys'

const NONE = { up: false, down: false, left: false, right: false, run: false }

describe('readPressedKeys', () => {
  it('ne détecte rien quand aucune touche n’est tenue', () => {
    expect(readPressedKeys(new Set())).toEqual(NONE)
  })

  it('lit la rangée W-A-S-D par position : la même sur QWERTY et sur AZERTY', () => {
    // Sur un AZERTY, la touche Z est à la place physique KeyW, et Q à la place KeyA.
    expect(readPressedKeys(new Set(['KeyW']))).toEqual({ ...NONE, up: true })
    expect(readPressedKeys(new Set(['KeyA']))).toEqual({ ...NONE, left: true })
    expect(readPressedKeys(new Set(['KeyS']))).toEqual({ ...NONE, down: true })
    expect(readPressedKeys(new Set(['KeyD']))).toEqual({ ...NONE, right: true })
  })

  it('ignore les lettres qui ne sont pas à ces places (Z et Q d’un QWERTY, W et A d’un AZERTY)', () => {
    // KeyZ est la touche Z d'un QWERTY, et KeyQ la touche Q : elles ne déplacent personne.
    expect(readPressedKeys(new Set(['KeyZ', 'KeyQ']))).toEqual(NONE)
  })

  it('garde les flèches', () => {
    const held = new Set(['ArrowUp', 'ArrowLeft'])
    expect(readPressedKeys(held)).toEqual({ ...NONE, up: true, left: true })
  })

  it('fait courir avec Maj gauche ou droite', () => {
    expect(readPressedKeys(new Set(['ShiftLeft']))).toEqual({ ...NONE, run: true })
    expect(readPressedKeys(new Set(['ShiftRight']))).toEqual({ ...NONE, run: true })
  })

  it('combine plusieurs touches tenues', () => {
    expect(readPressedKeys(new Set(['KeyD', 'KeyS', 'ShiftLeft']))).toEqual({ up: false, down: true, left: false, right: true, run: true })
  })
})
