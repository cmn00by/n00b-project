import { describe, expect, it } from 'vitest'
import { FLOOR_HEIGHT_PX, computeFacadeWindows } from './facadeLayout'

describe('computeFacadeWindows', () => {
  it('met une rangée de fenêtres par étage', () => {
    const { windows } = computeFacadeWindows(96, FLOOR_HEIGHT_PX * 3, false)
    expect(new Set(windows.map((window) => window.floor))).toEqual(new Set([0, 1, 2]))
  })

  it('garde les fenêtres à l’intérieur de la façade', () => {
    const { windows } = computeFacadeWindows(70, 100, true)
    for (const window of windows) {
      expect(window.x).toBeGreaterThanOrEqual(0)
      expect(window.x + window.width).toBeLessThanOrEqual(70)
      expect(window.y).toBeGreaterThanOrEqual(0)
      expect(window.y + window.height).toBeLessThanOrEqual(100)
    }
  })

  it('laisse la place d’une porte au rez-de-chaussée, posée au sol', () => {
    const { windows, door } = computeFacadeWindows(96, 66, true)
    expect((door?.y ?? 0) + (door?.height ?? 0)).toBe(66)
    expect(windows.filter((window) => window.floor === 0)).toHaveLength(Math.floor(96 / 16) - 1)
  })

  it('a toujours au moins une fenêtre, même sur une petite façade', () => {
    expect(computeFacadeWindows(10, 10, false).windows).toHaveLength(1)
  })
})
