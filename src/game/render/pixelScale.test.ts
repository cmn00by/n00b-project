import { describe, expect, it } from 'vitest'
import { choosePixelScale, describePixelScale } from './pixelScale'

describe('choosePixelScale', () => {
  it('garde une scène d’environ 540 pixels de haut en automatique', () => {
    expect(choosePixelScale('auto', 1080)).toBe(2)
    expect(choosePixelScale('auto', 1440)).toBe(3)
    expect(choosePixelScale('auto', 768)).toBe(1)
  })

  it('ne descend jamais sous 1 ni ne dépasse 4 en automatique', () => {
    expect(choosePixelScale('auto', 300)).toBe(1)
    expect(choosePixelScale('auto', 4320)).toBe(4)
  })

  it('respecte une taille fixe choisie', () => {
    expect(choosePixelScale(3, 1080)).toBe(3)
    expect(choosePixelScale(1, 2160)).toBe(1)
  })
})

describe('describePixelScale', () => {
  it('dit si le choix est automatique', () => {
    expect(describePixelScale('auto', 2)).toBe('Pixels : automatique (×2)')
    expect(describePixelScale(3, 3)).toBe('Pixels : ×3')
  })
})
