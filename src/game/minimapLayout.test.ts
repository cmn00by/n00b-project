import { describe, expect, it } from 'vitest'
import { frameMinimap, minimapColorOf, placeOnMinimap } from './minimapLayout'

describe('minimapColorOf', () => {
  it('donne une couleur par type de case, et une couleur de sol par défaut', () => {
    expect(minimapColorOf('water')).toBe('#3e9be0')
    expect(minimapColorOf('inconnu')).toBe('#9c9389')
  })
})

describe('frameMinimap', () => {
  it('centre le cadre sur le joueur', () => {
    expect(frameMinimap(50 * 32, 40 * 32, 32, 112, 76, 24)).toEqual({ left: 38, top: 28, size: 24 })
  })

  it('garde le cadre dans la carte près d’un bord', () => {
    expect(frameMinimap(16, 16, 32, 112, 76, 24)).toEqual({ left: 0, top: 0, size: 24 })
    expect(frameMinimap(111 * 32, 75 * 32, 32, 112, 76, 24)).toEqual({ left: 88, top: 52, size: 24 })
  })

  it('montre toute une petite carte', () => {
    expect(frameMinimap(100, 100, 32, 10, 8, 24)).toEqual({ left: 0, top: 0, size: 8 })
  })
})

describe('placeOnMinimap', () => {
  const frame = { left: 10, top: 10, size: 20 }

  it('place un point du cadre', () => {
    expect(placeOnMinimap(20 * 32, 15 * 32, 32, frame)).toEqual({ x: 0.5, y: 0.25, isOnEdge: false })
  })

  it('ramène au bord, dans sa direction, un point hors du cadre', () => {
    expect(placeOnMinimap(60 * 32, 20 * 32, 32, frame)).toEqual({ x: 1, y: 0.5, isOnEdge: true })
    const corner = placeOnMinimap(-100 * 32, -100 * 32, 32, frame)
    expect(corner.isOnEdge).toBe(true)
    expect(corner.x).toBeCloseTo(0)
    expect(corner.y).toBeCloseTo(0)
  })
})
