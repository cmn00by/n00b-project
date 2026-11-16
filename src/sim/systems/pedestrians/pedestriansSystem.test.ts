import { describe, expect, it } from 'vitest'
import { TUNING, createRegistry, createSimulation, createTestWorld, findEntitiesWith, loadMap, spawnEntity } from '../../core'
import type { Command, NpcTypeDef, Simulation, World } from '../../core'
import { createPedestriansSystem } from './pedestriansSystem'
import { makeTestMap } from './testMap'
import { createPedestrian } from './personality'
import { getTileAt } from './tiles'

const PASSANT: NpcTypeDef = {
  id: 'passant',
  name: 'Passant',
  spriteKey: 'pedestrian-passant',
  walkSpeed: 40,
  fleeSpeed: 90,
  courage: { min: 0.5, max: 0.5 },
  patience: { min: 0.5, max: 0.5 },
  pauseSeconds: { min: 1, max: 2 },
}
const TYPES = createRegistry('Type de PNJ', [PASSANT])
const NO_TYPES = createRegistry('Type de PNJ', [])
const T = TUNING.pedestrians

// Une rue de trottoir de 60 cases entre deux routes, et un joueur au milieu.
const STREET_ROWS = ['r'.repeat(60), 's'.repeat(60), 'r'.repeat(60)]
const STREET_PLAYER = { x: 30 * 32 + 16, y: 48 }

function makeStreetWorld(types = TYPES, seed?: number) {
  const world = createTestWorld()
  if (seed !== undefined) world.rng = createTestWorld().rng
  loadMap(world, makeTestMap(STREET_ROWS))
  const player = spawnEntity(world, 'player', { position: { x: STREET_PLAYER.x, y: STREET_PLAYER.y, angle: 0 }, body: { width: 24, height: 24, isSolid: true } })
  const simulation = createSimulation(world, [createPedestriansSystem(types)])
  return { world, player, simulation }
}

function listPedestrians(world: World) {
  return findEntitiesWith(world, ['pedestrian', 'position'])
}

function runCommand(playerId: number, directionX: number, directionY: number, isRunning: boolean): Command {
  return { type: 'player:move', entityId: playerId, directionX, directionY, isRunning }
}

/** Modifie TUNING.pedestrians le temps d'un test, puis le remet (TUNING est modifiable, comme le fera le panneau admin). */
function withTuning(overrides: Partial<typeof T>, run: () => void): void {
  const saved = { ...T }
  Object.assign(T, overrides)
  try {
    run()
  } finally {
    Object.assign(T, saved)
  }
}

describe('population', () => {
  it('peuple la ville dès le premier pas, à bonne distance du joueur et sur les trottoirs', () => {
    const { world, simulation } = makeStreetWorld()
    simulation.step()
    const pedestrians = listPedestrians(world)
    expect(pedestrians.length).toBeGreaterThanOrEqual(4)
    expect(pedestrians.length).toBeLessThanOrEqual(T.maxCount)
    for (const pedestrian of pedestrians) {
      const distance = Math.abs(pedestrian.position.x - STREET_PLAYER.x)
      // Un piéton a déjà fait un tout petit pas depuis sa naissance.
      expect(distance).toBeGreaterThanOrEqual(T.spawnMinDistance - 5)
      expect(distance).toBeLessThanOrEqual(T.spawnMaxDistance + 5)
      expect(pedestrian.sprite?.key).toBe('pedestrian-passant')
      expect(pedestrian.body?.isSolid).toBe(false)
    }
  })

  it('ne dépasse jamais le nombre maximum de piétons', () => {
    const { world, simulation } = makeStreetWorld()
    for (let step = 0; step < 600; step++) {
      simulation.step()
      expect(listPedestrians(world).length).toBeLessThanOrEqual(T.maxCount)
    }
  })

  it('retire les piétons quand le joueur est loin, et n’en fait pas naître hors de portée', () => {
    const { world, player, simulation } = makeStreetWorld()
    simulation.step()
    expect(listPedestrians(world).length).toBeGreaterThan(0)
    if (player.position === undefined) throw new Error('joueur sans position')
    player.position.x += 5000
    simulation.step()
    expect(listPedestrians(world)).toHaveLength(0)
    for (let step = 0; step < 100; step++) simulation.step()
    expect(listPedestrians(world)).toHaveLength(0)
  })

  it('ne fait naître personne sans joueur', () => {
    const world = createTestWorld()
    loadMap(world, makeTestMap(STREET_ROWS))
    const simulation = createSimulation(world, [createPedestriansSystem(TYPES)])
    for (let step = 0; step < 50; step++) simulation.step()
    expect(listPedestrians(world)).toHaveLength(0)
  })

  it('ne fait rien sans carte, sans lever d’erreur', () => {
    const world = createTestWorld()
    spawnEntity(world, 'player', { position: { x: 0, y: 0, angle: 0 } })
    const simulation = createSimulation(world, [createPedestriansSystem(TYPES)])
    expect(() => simulation.step()).not.toThrow()
    expect(listPedestrians(world)).toHaveLength(0)
  })

  it('ne fait naître personne sans type de PNJ', () => {
    const { world, simulation } = makeStreetWorld(NO_TYPES)
    simulation.step()
    expect(listPedestrians(world)).toHaveLength(0)
  })

  it('retire un piéton dont le type n’existe plus dans les données', () => {
    const { world, simulation } = makeStreetWorld(NO_TYPES)
    const pedestrian = createPedestrian(PASSANT, world.rng)
    spawnEntity(world, 'pedestrian', { position: { x: 100, y: 48, angle: 0 }, pedestrian: { ...pedestrian, typeId: 'disparu' } })
    simulation.step()
    expect(listPedestrians(world)).toHaveLength(0)
  })
})

describe('promenade', () => {
  it('reste sur les trottoirs, en se promenant longtemps', () => {
    const { world, simulation } = makeStreetWorld()
    for (let step = 0; step < 900; step++) {
      simulation.step()
      for (const pedestrian of listPedestrians(world)) {
        const tile = getTileAt(makeTestMap(STREET_ROWS), pedestrian.position.x, pedestrian.position.y)
        expect(tile.tileY).toBe(1)
      }
    }
  })

  it('avance vraiment : les piétons ne restent pas plantés', () => {
    const { world, simulation } = makeStreetWorld()
    simulation.step()
    const start = new Map(listPedestrians(world).map((pedestrian) => [pedestrian.id, pedestrian.position.x]))
    for (let step = 0; step < 150; step++) simulation.step()
    const moved = listPedestrians(world).filter((pedestrian) => start.has(pedestrian.id) && Math.abs(pedestrian.position.x - (start.get(pedestrian.id) ?? 0)) > 20)
    expect(moved.length).toBeGreaterThan(0)
  })

  it('donne exactement la même ville avec la même graine et les mêmes commandes', () => {
    const play = (): string => {
      const { world, player, simulation } = makeStreetWorld()
      for (let step = 0; step < 300; step++) simulation.step(step % 40 < 20 ? [runCommand(player.id, 1, 0, true)] : [])
      return JSON.stringify(world.entities)
    }
    expect(play()).toBe(play())
  })

  it('deux piétons qui se croisent dans une rue étroite ne se bloquent pas pour toujours', () => {
    // Pas de naissance, pas de pause ni de virage : seuls ces deux-là se promènent, face à face, près du joueur.
    withTuning({ pauseChance: 0, turnChance: 0, maxCount: 0 }, () => {
      const { world, simulation } = makeStreetWorld()
      const first = createPedestrian(PASSANT, world.rng)
      const second = createPedestrian(PASSANT, world.rng)
      const a = spawnEntity(world, 'pedestrian', { position: { x: 26 * 32 + 16, y: 48, angle: 0 }, pedestrian: { ...first, heading: { x: 1, y: 0 }, targetTile: { tileX: 27, tileY: 1 } } })
      const b = spawnEntity(world, 'pedestrian', { position: { x: 34 * 32 + 16, y: 48, angle: 0 }, pedestrian: { ...second, heading: { x: -1, y: 0 }, targetTile: { tileX: 33, tileY: 1 } } })
      let hasCrossed = false
      for (let step = 0; step < 600 && !hasCrossed; step++) {
        simulation.step()
        if (a.position !== undefined && b.position !== undefined && a.position.x > b.position.x) hasCrossed = true
      }
      expect(hasCrossed).toBe(true)
    })
  })
})

describe('peur', () => {
  /** Un monde sans naissance avec un seul piéton posé sur un trottoir, et un joueur à `gap` px à sa gauche. */
  function makeScene(courage: number, gap: number) {
    const { world, player, simulation } = makeStreetWorld(TYPES)
    for (const pedestrian of listPedestrians(world)) delete world.entities[pedestrian.id]
    const pedestrianX = 20 * 32 + 16
    if (player.position === undefined) throw new Error('joueur sans position')
    player.position.x = pedestrianX - gap
    player.position.y = 48
    const base = createPedestrian(PASSANT, world.rng)
    const pedestrian = spawnEntity(world, 'pedestrian', { position: { x: pedestrianX, y: 48, angle: 0 }, pedestrian: { ...base, courage, heading: { x: 1, y: 0 } } })
    return { world, player, simulation, pedestrian }
  }

  function stepManyTimes(simulation: Simulation, command: Command | undefined, count: number): void {
    for (let step = 0; step < count; step++) simulation.step(command === undefined ? [] : [command])
  }

  it('s’enfuit d’un joueur qui court vers lui, une seule fois annoncé, en s’éloignant', () => {
    withTuning({ maxCount: 0 }, () => {
      const { world, player, simulation, pedestrian } = makeScene(0, 60)
      const scared: number[] = []
      world.events.on('pedestrian:scared', ({ entityId }) => scared.push(entityId))
      const startX = pedestrian.position?.x ?? 0
      stepManyTimes(simulation, runCommand(player.id, 1, 0, true), 20)
      expect(pedestrian.pedestrian?.state).toBe('fleeing')
      expect(scared).toEqual([pedestrian.id])
      expect((pedestrian.position?.x ?? 0) - startX).toBeGreaterThan(10)
    })
  })

  it('ne s’inquiète pas d’un joueur qui marche, même tout près', () => {
    withTuning({ maxCount: 0 }, () => {
      const { world, player, simulation, pedestrian } = makeScene(0, 30)
      const scared: number[] = []
      world.events.on('pedestrian:scared', ({ entityId }) => scared.push(entityId))
      stepManyTimes(simulation, runCommand(player.id, 1, 0, false), 20)
      expect(pedestrian.pedestrian?.state).toBe('walking')
      expect(scared).toEqual([])
    })
  })

  it('ne s’inquiète pas d’un joueur qui court en s’éloignant', () => {
    withTuning({ maxCount: 0 }, () => {
      const { player, simulation, pedestrian } = makeScene(0, 60)
      stepManyTimes(simulation, runCommand(player.id, -1, 0, true), 20)
      expect(pedestrian.pedestrian?.state).toBe('walking')
    })
  })

  it('un courageux s’arrête et regarde, sans fuir, quand le joueur court vers lui de loin', () => {
    withTuning({ maxCount: 0 }, () => {
      const { world, player, simulation, pedestrian } = makeScene(1, 110)
      const scared: number[] = []
      world.events.on('pedestrian:scared', ({ entityId }) => scared.push(entityId))
      stepManyTimes(simulation, runCommand(player.id, 1, 0, true), 3)
      const positionWhileNoticing = pedestrian.position?.x ?? 0
      stepManyTimes(simulation, runCommand(player.id, 1, 0, true), 10)
      expect(pedestrian.pedestrian?.state).toBe('noticing')
      expect(pedestrian.position?.x).toBe(positionWhileNoticing)
      // Il se tourne vers le joueur, qui est à sa gauche.
      expect(pedestrian.position?.angle).toBe(Math.PI)
      expect(scared).toEqual([])
    })
  })

  it('reprend sa promenade une fois le danger passé', () => {
    withTuning({ maxCount: 0 }, () => {
      const { player, simulation, pedestrian } = makeScene(0, 60)
      stepManyTimes(simulation, runCommand(player.id, 1, 0, true), 5)
      expect(pedestrian.pedestrian?.state).toBe('fleeing')
      stepManyTimes(simulation, undefined, Math.round(T.fleeSeconds * 30) + 5)
      expect(pedestrian.pedestrian?.state).toBe('walking')
    })
  })
})
