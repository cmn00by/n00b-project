import { describe, expect, it } from 'vitest'
import { PEDESTRIAN_VIEW } from '../constants'
import { computeFallPose, computeFallVariant } from './pedestrianFall'
import type { FallVariant } from './pedestrianFall'

const TIMING = { launchSeconds: 0.7, downSeconds: 1.2 }
const BACK: FallVariant = { spinDirection: 1, turns: 1, lying: 1 }
const BELLY: FallVariant = { spinDirection: -1, turns: 2, lying: -1 }

describe('computeFallVariant', () => {
  it('est stable pour un même piéton', () => {
    expect(computeFallVariant(42, PEDESTRIAN_VIEW)).toEqual(computeFallVariant(42, PEDESTRIAN_VIEW))
  })

  it('reste dans les valeurs permises et varie d’un piéton à l’autre', () => {
    const variants = Array.from({ length: 60 }, (_, id) => computeFallVariant(id, PEDESTRIAN_VIEW))
    for (const variant of variants) {
      expect([-1, 1]).toContain(variant.spinDirection)
      expect([-1, 1]).toContain(variant.lying)
      expect(variant.turns).toBeGreaterThanOrEqual(1)
      expect(variant.turns).toBeLessThanOrEqual(PEDESTRIAN_VIEW.maxSpinTurns)
    }
    expect(new Set(variants.map((variant) => variant.spinDirection)).size).toBe(2)
    expect(new Set(variants.map((variant) => variant.lying)).size).toBe(2)
    expect(new Set(variants.map((variant) => variant.turns)).size).toBe(PEDESTRIAN_VIEW.maxSpinTurns)
  })
})

describe('computeFallPose', () => {
  it('ne change rien aux autres états', () => {
    expect(computeFallPose('walking', 0.3, TIMING, BACK, PEDESTRIAN_VIEW)).toEqual({ pitch: 0, lift: 0, shift: 0 })
  })

  it('commence debout, au sol', () => {
    const pose = computeFallPose('launched', TIMING.launchSeconds, TIMING, BACK, PEDESTRIAN_VIEW)
    expect(pose.pitch).toBeCloseTo(0)
    expect(pose.lift).toBeCloseTo(0)
  })

  it('monte en arc : le plus haut au milieu du vol', () => {
    const mid = computeFallPose('launched', TIMING.launchSeconds / 2, TIMING, { ...BACK, turns: 2 }, PEDESTRIAN_VIEW)
    const early = computeFallPose('launched', TIMING.launchSeconds * 0.9, TIMING, BACK, PEDESTRIAN_VIEW)
    expect(mid.lift).toBeGreaterThan(PEDESTRIAN_VIEW.arcHeight * 0.5)
    expect(mid.lift).toBeGreaterThan(early.lift)
  })

  it('culbute dans le sens de sa variante, et d’autant plus qu’il fait de tours', () => {
    const half = TIMING.launchSeconds / 2
    expect(computeFallPose('launched', half, TIMING, BACK, PEDESTRIAN_VIEW).pitch).toBeGreaterThan(0)
    expect(computeFallPose('launched', half, TIMING, BELLY, PEDESTRIAN_VIEW).pitch).toBeLessThan(0)
    expect(Math.abs(computeFallPose('launched', half, TIMING, BELLY, PEDESTRIAN_VIEW).pitch)).toBeGreaterThan(Math.abs(computeFallPose('launched', half, TIMING, BACK, PEDESTRIAN_VIEW).pitch))
  })

  it('arrive allongé, posé au sol : sur le dos (pitch +π/2) ou sur le ventre (-π/2) selon sa variante', () => {
    for (const variant of [BACK, BELLY]) {
      const landed = computeFallPose('launched', 0, TIMING, variant, PEDESTRIAN_VIEW)
      expect(Math.abs(Math.sin(landed.pitch))).toBeCloseTo(1)
      expect(Math.sign(Math.sin(landed.pitch))).toBe(variant.lying)
      // Son corps allongé est posé : milieu à pivotHeight - lyingDrop au-dessus du sol (le décalage garde le point de pivot en place).
      expect(landed.lift).toBeCloseTo(PEDESTRIAN_VIEW.pivotHeight - PEDESTRIAN_VIEW.lyingDrop)
    }
  })

  it('reste allongé au sol, immobile', () => {
    const first = computeFallPose('down', TIMING.downSeconds, TIMING, BACK, PEDESTRIAN_VIEW)
    const later = computeFallPose('down', TIMING.downSeconds / 2, TIMING, BACK, PEDESTRIAN_VIEW)
    expect(first).toEqual(later)
    expect(first.pitch).toBeCloseTo(Math.PI / 2)
  })

  it('est continu entre la fin du vol et le début du temps au sol', () => {
    const endOfFlight = computeFallPose('launched', 0, TIMING, BELLY, PEDESTRIAN_VIEW)
    const startOfDown = computeFallPose('down', TIMING.downSeconds, TIMING, BELLY, PEDESTRIAN_VIEW)
    expect(Math.sin(endOfFlight.pitch)).toBeCloseTo(Math.sin(startOfDown.pitch))
    expect(Math.cos(endOfFlight.pitch)).toBeCloseTo(Math.cos(startOfDown.pitch))
    expect(endOfFlight.lift).toBeCloseTo(startOfDown.lift)
    expect(endOfFlight.shift).toBeCloseTo(startOfDown.shift)
  })

  it('se redresse à la fin du temps au sol et finit debout', () => {
    const half = computeFallPose('down', PEDESTRIAN_VIEW.getUpSeconds / 2, TIMING, BACK, PEDESTRIAN_VIEW)
    const end = computeFallPose('down', 0, TIMING, BACK, PEDESTRIAN_VIEW)
    expect(half.pitch).toBeCloseTo(Math.PI / 4)
    expect(end.pitch).toBeCloseTo(0)
    expect(end.lift).toBeCloseTo(0)
    expect(end.shift).toBeCloseTo(0)
  })
})
