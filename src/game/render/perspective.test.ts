import { describe, expect, it } from 'vitest'
import { isWallFacingCamera, projectRaised } from './perspective'

const camera = { x: 100, y: 100 }

describe('projectRaised', () => {
  it('ne déplace pas un point au sol', () => {
    expect(projectRaised({ x: 300, y: 50 }, 0, camera, 400)).toEqual({ x: 300, y: 50 })
  })

  it('ne déplace pas un point sous la caméra', () => {
    expect(projectRaised({ x: 100, y: 100 }, 60, camera, 400)).toEqual({ x: 100, y: 100 })
  })

  it("écarte un point en hauteur du centre, d'autant plus qu'il est haut", () => {
    const low = projectRaised({ x: 200, y: 100 }, 20, camera, 400)
    const high = projectRaised({ x: 200, y: 100 }, 60, camera, 400)
    expect(low.x).toBeGreaterThan(200)
    expect(high.x).toBeGreaterThan(low.x)
    expect(high.y).toBe(100)
  })
})

describe('isWallFacingCamera', () => {
  const block = { x: 200, y: 200, width: 64, height: 64 }

  it('montre les façades tournées vers la caméra, et cache les autres', () => {
    const above = { x: 230, y: 50 }
    expect(isWallFacingCamera('north', block, above)).toBe(true)
    expect(isWallFacingCamera('south', block, above)).toBe(false)
    expect(isWallFacingCamera('west', block, above)).toBe(false)
    expect(isWallFacingCamera('east', block, above)).toBe(false)
    const southEast = { x: 400, y: 400 }
    expect(isWallFacingCamera('south', block, southEast)).toBe(true)
    expect(isWallFacingCamera('east', block, southEast)).toBe(true)
  })
})
