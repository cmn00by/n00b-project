import { describe, expect, it } from 'vitest'
import { createSimulation, createTestWorld, spawnEntity, validateSystems } from '../core'
import { SYSTEMS } from './index'

describe('SYSTEMS', () => {
  it('ne contient que des systèmes valides (ids uniques, en kebab-case)', () => {
    expect(validateSystems(SYSTEMS)).toEqual([])
  })

  it('enregistre la brique des piétons', () => {
    expect(SYSTEMS.map((system) => system.id)).toContain('pedestrians')
  })

  it('enregistre le moteur de missions', () => {
    expect(SYSTEMS.map((system) => system.id)).toContain('missions')
  })

  it('tourne sans la brique des piétons (test LEGO) : retirer sa ligne ne casse rien', () => {
    const world = createTestWorld()
    spawnEntity(world, 'player', { position: { x: 100, y: 100, angle: 0 } })
    const simulation = createSimulation(
      world,
      SYSTEMS.filter((system) => system.id !== 'pedestrians'),
    )
    expect(() => simulation.step()).not.toThrow()
  })
})
