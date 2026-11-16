import { describe, expect, it } from 'vitest'
import { snapToPixelGrid } from './camera3d'

describe('snapToPixelGrid', () => {
  it('arrondit au multiple de la taille d’un pixel', () => {
    expect(snapToPixelGrid(10.4, 1.5)).toBe(10.5)
    expect(snapToPixelGrid(10.8, 1.5)).toBe(10.5)
    expect(snapToPixelGrid(11.3, 1.5)).toBe(12)
  })

  it('ne touche à rien si la taille est nulle', () => {
    expect(snapToPixelGrid(3.7, 0)).toBe(3.7)
  })
})
