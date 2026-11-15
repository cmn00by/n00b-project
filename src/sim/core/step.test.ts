import { describe, expect, it } from 'vitest'
import { STEP_SECONDS } from './config'
import { findCommands } from './commands'
import type { Command } from './commands'
import { findEntitiesWith, spawnEntity } from './entities'
import { createSimulation } from './step'
import { SYSTEM_ORDER } from './system'
import type { System } from './system'
import { createTestWorld, createWorld } from './world'
import type { World } from './world'

/** Un système de test : pousse chaque entité de façon aléatoire, puis selon les commandes reçues. */
const jostleSystem: System = {
  id: 'jostle',
  order: SYSTEM_ORDER.physics,
  step(world) {
    for (const entity of findEntitiesWith(world, ['position'])) {
      entity.position.x += world.rng.nextInt(-3, 3)
    }
    for (const command of findCommands(world.commands, 'player:move')) {
      const entity = world.entities[command.entityId]
      if (entity?.position) entity.position.y += command.directionY
    }
  },
}

function createCrowdedWorld(seed: number): World {
  const world = createWorld(seed)
  for (let index = 0; index < 5; index++) spawnEntity(world, 'pedestrian', { position: { x: index * 10, y: 0, angle: 0 } })
  return world
}

function takeSnapshot(world: World): string {
  return JSON.stringify({ entities: world.entities, stepCount: world.stepCount, rngState: world.rng.getState() })
}

function playScenario(seed: number, stepCount: number): string {
  const simulation = createSimulation(createCrowdedWorld(seed), [jostleSystem])
  for (let index = 0; index < stepCount; index++) {
    const commands: Command[] = index % 3 === 0 ? [{ type: 'player:move', entityId: 2, directionX: 0, directionY: 1, isRunning: false }] : []
    simulation.step(commands)
  }
  return takeSnapshot(simulation.world)
}

describe('déterminisme', () => {
  it('donne exactement le même monde avec la même graine et les mêmes commandes', () => {
    expect(playScenario(42, 100)).toBe(playScenario(42, 100))
  })

  it('donne un monde différent avec une autre graine', () => {
    expect(playScenario(42, 100)).not.toBe(playScenario(43, 100))
  })
})

describe('createSimulation', () => {
  it('appelle init une seule fois par système, au moment de la création', () => {
    const calls: string[] = []
    const system: System = { id: 'alpha', order: 100, init: () => calls.push('init'), step: () => calls.push('step') }
    const simulation = createSimulation(createTestWorld(), [system])
    expect(calls).toEqual(['init'])
    simulation.step()
    simulation.step()
    expect(calls).toEqual(['init', 'step', 'step'])
  })

  it('lève une erreur quand deux systèmes ont le même id', () => {
    const first: System = { id: 'walking', order: 300, step() {} }
    const second: System = { id: 'walking', order: 400, step() {} }
    expect(() => createSimulation(createTestWorld(), [first, second])).toThrow("Système 'walking' : id en double")
  })
})

describe('step', () => {
  it("exécute les systèmes dans l'ordre de leur tranche, quel que soit l'ordre de la liste", () => {
    const calls: string[] = []
    const rules: System = { id: 'rules-one', order: SYSTEM_ORDER.rules, step: () => calls.push('rules') }
    const input: System = { id: 'input-one', order: SYSTEM_ORDER.input, step: () => calls.push('input') }
    const physics: System = { id: 'physics-one', order: SYSTEM_ORDER.physics, step: () => calls.push('physics') }
    createSimulation(createTestWorld(), [rules, input, physics]).step()
    expect(calls).toEqual(['input', 'physics', 'rules'])
  })

  it("donne à chaque système la durée fixe d'un pas", () => {
    const durations: number[] = []
    const system: System = { id: 'timer', order: 100, step: (_world, dt) => durations.push(dt) }
    createSimulation(createTestWorld(), [system]).step()
    expect(durations).toEqual([STEP_SECONDS])
  })

  it('met les commandes du pas à disposition des systèmes, puis les retire', () => {
    const seen: number[] = []
    const system: System = { id: 'reader', order: 100, step: (world) => seen.push(world.commands.length) }
    const simulation = createSimulation(createTestWorld(), [system])
    simulation.step([{ type: 'player:move', entityId: 1, directionX: 1, directionY: 0, isRunning: false }])
    expect(seen).toEqual([1])
    expect(simulation.world.commands).toEqual([])
    simulation.step()
    expect(seen).toEqual([1, 0])
  })

  it('compte les pas et annonce chaque pas terminé par un événement', () => {
    const simulation = createSimulation(createTestWorld(), [])
    const announced: number[] = []
    simulation.world.events.on('world:stepped', (event) => announced.push(event.stepCount))
    simulation.step()
    simulation.step()
    simulation.step()
    expect(simulation.world.stepCount).toBe(3)
    expect(announced).toEqual([1, 2, 3])
  })

  it('fonctionne sans aucun système', () => {
    expect(() => createSimulation(createTestWorld(), []).step()).not.toThrow()
  })
})
