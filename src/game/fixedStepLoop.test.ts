import { describe, expect, it } from 'vitest'
import { createFixedStepLoop } from './fixedStepLoop'

const STEP = 1 / 30

function countSteps(loop: ReturnType<typeof createFixedStepLoop>, deltaSeconds: number): { steps: number; alpha: number } {
  let steps = 0
  const alpha = loop.advance(deltaSeconds, () => (steps += 1))
  return { steps, alpha }
}

describe('createFixedStepLoop', () => {
  it("ne joue aucun pas tant qu'un pas entier n'est pas écoulé", () => {
    const loop = createFixedStepLoop(STEP)
    expect(countSteps(loop, STEP / 2).steps).toBe(0)
  })

  it('joue un pas quand un pas entier est écoulé', () => {
    expect(countSteps(createFixedStepLoop(STEP), STEP).steps).toBe(1)
  })

  it('cumule les petites durées : 60 images par seconde donnent un pas toutes les deux images', () => {
    const loop = createFixedStepLoop(STEP)
    const stepsPerFrame = Array.from({ length: 6 }, () => countSteps(loop, 1 / 60).steps)
    expect(stepsPerFrame.reduce((total, steps) => total + steps, 0)).toBe(3)
  })

  it("joue plusieurs pas quand l'image a pris du retard", () => {
    expect(countSteps(createFixedStepLoop(STEP), STEP * 3.5).steps).toBe(3)
  })

  it('renvoie la part du pas suivant déjà écoulée', () => {
    const { alpha } = countSteps(createFixedStepLoop(STEP), STEP * 1.25)
    expect(alpha).toBeCloseTo(0.25)
  })

  it('plafonne le nombre de pas par image et abandonne le retard', () => {
    const loop = createFixedStepLoop(STEP, 5)
    const first = countSteps(loop, 10)
    expect(first.steps).toBe(5)
    expect(first.alpha).toBe(0)
    expect(countSteps(loop, 0).steps).toBe(0)
  })
})
