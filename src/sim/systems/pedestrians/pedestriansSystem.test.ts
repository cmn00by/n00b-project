import { describe, expect, it } from 'vitest'
import { TUNING, createRegistry, createSimulation, createTestWorld, findEntitiesWith, loadMap, spawnEntity } from '../../core'
import type { Command, NpcTypeDef, ReactionWeights, Simulation, World } from '../../core'
import { createPedestriansSystem } from './pedestriansSystem'
import { makeTestMap } from './testMap'
import { createPedestrian } from './personality'
import { getTileAt } from './tiles'
import { TEST_LOOK } from './testLook'

const PASSANT: NpcTypeDef = {
  id: 'passant',
  name: 'Passant',
  look: TEST_LOOK,
  walkSpeed: 40,
  fleeSpeed: 90,
  courage: { min: 0.5, max: 0.5 },
  patience: { min: 0.5, max: 0.5 },
  pauseSeconds: { min: 1, max: 2 },
  reactionWeights: { stare: 1, curious: 0, filming: 0, angry: 0 }, // il regarde toujours : les tests de réaction restent prévisibles
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

describe('réactions variées', () => {
  /** Un monde sans naissance avec un piéton d'un type qui ne fait QUE la réaction demandée, et un joueur à `gap` px à sa gauche. */
  function makeReactionScene(weights: ReactionWeights, courage: number, gap: number) {
    const type: NpcTypeDef = { ...PASSANT, reactionWeights: weights }
    const { world, player, simulation } = makeStreetWorld(createRegistry('Type de PNJ', [type]))
    for (const pedestrian of listPedestrians(world)) delete world.entities[pedestrian.id]
    const pedestrianX = 20 * 32 + 16
    if (player.position === undefined) throw new Error('joueur sans position')
    player.position.x = pedestrianX - gap
    player.position.y = 48
    const base = createPedestrian(type, world.rng)
    const pedestrian = spawnEntity(world, 'pedestrian', { position: { x: pedestrianX, y: 48, angle: 0 }, pedestrian: { ...base, courage, heading: { x: 1, y: 0 } } })
    return { world, player, simulation, pedestrian }
  }

  function runAtPedestrian(simulation: Simulation, playerId: number, count: number): void {
    for (let step = 0; step < count; step++) simulation.step([runCommand(playerId, 1, 0, true)])
  }

  const ONLY = { stare: 0, curious: 0, filming: 0, angry: 0 }

  it('filme quand son type ne fait que ça, sans bouger, tourné vers le joueur', () => {
    withTuning({ maxCount: 0 }, () => {
      const { player, simulation, pedestrian } = makeReactionScene({ ...ONLY, filming: 1 }, 1, 110)
      runAtPedestrian(simulation, player.id, 3)
      const filmingX = pedestrian.position?.x ?? 0
      runAtPedestrian(simulation, player.id, 10)
      expect(pedestrian.pedestrian?.state).toBe('filming')
      expect(pedestrian.position?.x).toBe(filmingX)
      expect(pedestrian.position?.angle).toBe(Math.PI)
    })
  })

  it('râle quand son type ne fait que ça, sans bouger', () => {
    withTuning({ maxCount: 0 }, () => {
      const { player, simulation, pedestrian } = makeReactionScene({ ...ONLY, angry: 1 }, 1, 110)
      runAtPedestrian(simulation, player.id, 3)
      const angryX = pedestrian.position?.x ?? 0
      runAtPedestrian(simulation, player.id, 10)
      expect(pedestrian.pedestrian?.state).toBe('angry')
      expect(pedestrian.position?.x).toBe(angryX)
    })
  })

  it('un curieux s’approche du joueur, puis s’arrête à sa distance d’arrêt sans le traverser', () => {
    withTuning({ maxCount: 0 }, () => {
      const { simulation, pedestrian, player } = makeReactionScene({ ...ONLY, curious: 1 }, 1, 110)
      if (player.position === undefined || pedestrian.position === undefined) throw new Error('position manquante')
      const startX = pedestrian.position.x
      runAtPedestrian(simulation, player.id, 400)
      const distance = pedestrian.position.x - player.position.x
      expect(pedestrian.pedestrian?.state).toBe('curious')
      expect(startX - pedestrian.position.x).toBeGreaterThan(20)
      expect(distance).toBeLessThanOrEqual(T.curiousStopDistance)
      expect(distance).toBeGreaterThan(0)
    })
  })

  it('ne s’éloigne jamais du trottoir en s’approchant', () => {
    withTuning({ maxCount: 0 }, () => {
      const { simulation, pedestrian, player } = makeReactionScene({ ...ONLY, curious: 1 }, 1, 110)
      for (let step = 0; step < 300; step++) {
        simulation.step([runCommand(player.id, 1, 0, true)])
        expect(pedestrian.position?.y).toBe(48)
      }
    })
  })

  it('fuit quand même quand ça arrive tout près, même un filmeur', () => {
    withTuning({ maxCount: 0 }, () => {
      const { world, player, simulation, pedestrian } = makeReactionScene({ ...ONLY, filming: 1 }, 0, 145)
      if (player.position === undefined) throw new Error('joueur sans position')
      const scared: number[] = []
      world.events.on('pedestrian:scared', ({ entityId }) => scared.push(entityId))
      // Le joueur est loin : il filme. Puis le joueur s'avance en courant, et il fuit.
      runAtPedestrian(simulation, player.id, 3)
      expect(pedestrian.pedestrian?.state).toBe('filming')
      for (let step = 0; step < 40; step++) {
        player.position.x += 3
        simulation.step([runCommand(player.id, 1, 0, true)])
      }
      expect(pedestrian.pedestrian?.state).toBe('fleeing')
      expect(scared).toEqual([pedestrian.id])
    })
  })

  it('une voiture lancée vers lui le fait réagir, une voiture garée non', () => {
    withTuning({ maxCount: 0 }, () => {
      const { world, simulation, pedestrian, player } = makeReactionScene({ ...ONLY, stare: 1 }, 0, 400)
      if (player.position === undefined || pedestrian.position === undefined) throw new Error('position manquante')
      const car = spawnEntity(world, 'vehicle', { position: { x: pedestrian.position.x - 120, y: 48, angle: 0 }, velocity: { vx: 0, vy: 0 }, vehicle: { modelId: 'test', headingX: 1, headingY: 0 } })
      for (let step = 0; step < 10; step++) simulation.step()
      expect(pedestrian.pedestrian?.state).toBe('walking')
      if (car.velocity === undefined) throw new Error('voiture sans vitesse')
      car.velocity.vx = 200
      simulation.step()
      expect(['noticing', 'fleeing']).toContain(pedestrian.pedestrian?.state)
    })
  })

  it('deux piétons du même type ne réagissent pas tous pareil face au même événement', () => {
    withTuning({ maxCount: 0 }, () => {
      const type: NpcTypeDef = { ...PASSANT, reactionWeights: { stare: 1, curious: 1, filming: 1, angry: 1 } }
      const { world, player, simulation } = makeStreetWorld(createRegistry('Type de PNJ', [type]))
      for (const pedestrian of listPedestrians(world)) delete world.entities[pedestrian.id]
      if (player.position === undefined) throw new Error('joueur sans position')
      player.position.x = 20 * 32 + 16 - 110
      player.position.y = 48
      const crowd = [0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
        const base = createPedestrian(type, world.rng)
        return spawnEntity(world, 'pedestrian', { position: { x: 20 * 32 + 16 + index * 40, y: 48, angle: 0 }, pedestrian: { ...base, courage: 1, heading: { x: 1, y: 0 } } })
      })
      runAtPedestrian(simulation, player.id, 3)
      const states = new Set(crowd.map((pedestrian) => pedestrian.pedestrian?.state))
      expect(states.size).toBeGreaterThan(1)
    })
  })
})

describe('projeté par un véhicule', () => {
  const PEDESTRIAN_X = 20 * 32 + 16

  function spawnCar(world: World, x: number, y: number, vx: number, vy: number) {
    return spawnEntity(world, 'vehicle', { position: { x, y, angle: 0 }, velocity: { vx, vy }, body: { width: 40, height: 20, isSolid: true }, vehicle: { modelId: 'test', headingX: 1, headingY: 0 } })
  }

  /** Un monde sans naissance, un seul piéton posé à (x, y), et un véhicule qui roule exactement sur lui. */
  function makeHitScene(rows: readonly string[], carVelocity: { vx: number; vy: number }, pedestrianState = 'walking', start = { x: PEDESTRIAN_X, y: 48 }) {
    const world = createTestWorld()
    loadMap(world, makeTestMap(rows))
    const base = createPedestrian(PASSANT, world.rng)
    const pedestrian = spawnEntity(world, 'pedestrian', { position: { x: start.x, y: start.y, angle: 0 }, pedestrian: { ...base, state: pedestrianState, heading: { x: 1, y: 0 } } })
    const car = spawnCar(world, start.x, start.y, carVelocity.vx, carVelocity.vy)
    const simulation = createSimulation(world, [createPedestriansSystem(TYPES)])
    const hits: { entityId: number; vehicleId: number; impactSpeed: number }[] = []
    world.events.on('pedestrian:hit', (hit) => hits.push(hit))
    // Après le choc la voiture est déjà loin : elle ne fonce plus sur le piéton (sinon il resterait en colère contre elle).
    const carDrivesAway = (): void => {
      if (car.velocity !== undefined) car.velocity = { vx: 0, vy: 0 }
    }
    return { world, pedestrian, car, simulation, hits, carDrivesAway }
  }

  /** Avance jusqu'à ce que le piéton reprenne sa promenade, en notant chaque état traversé. Renvoie la liste des états, sans doublons consécutifs. */
  function runUntilWalking(simulation: Simulation, state: () => string | undefined, maxSteps = 600): string[] {
    const seen: string[] = []
    for (let step = 0; step < maxSteps; step++) {
      simulation.step()
      const current = state()
      if (current !== undefined && seen[seen.length - 1] !== current) seen.push(current)
      if (current === 'walking' && seen.length > 1) break
    }
    return seen
  }

  it('un véhicule qui roule projette le piéton qu’il touche, dans son sens, et annonce le choc', () => {
    withTuning({ maxCount: 0 }, () => {
      const { pedestrian, car, simulation, hits } = makeHitScene(STREET_ROWS, { vx: 300, vy: 0 })
      simulation.step()
      expect(pedestrian.pedestrian?.state).toBe('launched')
      expect(hits).toEqual([{ entityId: pedestrian.id, vehicleId: car.id, impactSpeed: 300 }])
      const startX = PEDESTRIAN_X
      for (let step = 0; step < 15; step++) simulation.step()
      expect((pedestrian.position?.x ?? 0) - startX).toBeGreaterThan(30)
      expect(pedestrian.position?.y).toBe(48)
    })
  })

  it('ne touche pas au véhicule : ni sa position ni sa vitesse', () => {
    withTuning({ maxCount: 0 }, () => {
      const { car, simulation } = makeHitScene(STREET_ROWS, { vx: 300, vy: -20 })
      for (let step = 0; step < 40; step++) simulation.step()
      expect(car.position).toEqual({ x: PEDESTRIAN_X, y: 48, angle: 0 })
      expect(car.velocity).toEqual({ vx: 300, vy: -20 })
    })
  })

  it('un véhicule à l’arrêt ou trop lent ne projette personne', () => {
    withTuning({ maxCount: 0 }, () => {
      for (const speed of [0, T.hitMinSpeed - 1]) {
        const { pedestrian, simulation, hits } = makeHitScene(STREET_ROWS, { vx: speed, vy: 0 })
        for (let step = 0; step < 20; step++) simulation.step()
        expect(hits).toEqual([])
        expect(pedestrian.pedestrian?.state).not.toBe('launched')
      }
    })
  })

  it('est projeté plus loin par un véhicule plus rapide', () => {
    withTuning({ maxCount: 0 }, () => {
      const distances = [100, 400].map((speed) => {
        const { pedestrian, simulation } = makeHitScene(STREET_ROWS, { vx: speed, vy: 0 })
        for (let step = 0; step < 60; step++) simulation.step()
        return (pedestrian.position?.x ?? 0) - PEDESTRIAN_X
      })
      expect(distances[1]).toBeGreaterThan((distances[0] ?? 0) + 20)
    })
  })

  it('même en train de fuir, un piéton touché est projeté', () => {
    withTuning({ maxCount: 0 }, () => {
      const { pedestrian, simulation, hits } = makeHitScene(STREET_ROWS, { vx: 300, vy: 0 }, 'fleeing')
      simulation.step()
      expect(pedestrian.pedestrian?.state).toBe('launched')
      expect(hits).toHaveLength(1)
    })
  })

  it('enchaîne : projeté, au sol, il se relève et râle, puis reprend sa promenade (un seul choc annoncé)', () => {
    withTuning({ maxCount: 0 }, () => {
      const { pedestrian, simulation, hits, carDrivesAway } = makeHitScene(STREET_ROWS, { vx: 300, vy: 0 })
      simulation.step()
      carDrivesAway()
      const states = runUntilWalking(simulation, () => pedestrian.pedestrian?.state)
      expect(states).toEqual(['launched', 'down', 'angry', 'walking'])
      expect(hits).toHaveLength(1)
      expect(pedestrian.pedestrian?.flight).toBeUndefined()
    })
  })

  it('reste immobile au sol', () => {
    withTuning({ maxCount: 0 }, () => {
      const { pedestrian, simulation } = makeHitScene(STREET_ROWS, { vx: 300, vy: 0 })
      while (pedestrian.pedestrian?.state !== 'down') simulation.step()
      const landedX = pedestrian.position?.x
      for (let step = 0; step < 10; step++) simulation.step()
      expect(pedestrian.pedestrian?.state).toBe('down')
      expect(pedestrian.position?.x).toBe(landedX)
    })
  })

  it('est arrêté par un mur : il ne le traverse jamais', () => {
    withTuning({ maxCount: 0 }, () => {
      const { pedestrian, simulation } = makeHitScene(['rrrrrrrrrr', 'ssssss#sss', 'rrrrrrrrrr'], { vx: 300, vy: 0 }, 'walking', { x: 4 * 32 + 16, y: 48 })
      for (let step = 0; step < 60; step++) {
        simulation.step()
        expect(pedestrian.position?.x ?? 0).toBeLessThanOrEqual(6 * 32 - T.bodySize / 2)
      }
    })
  })

  it('projeté sur la route, il revient sur le trottoir le plus proche puis reprend sa promenade', () => {
    withTuning({ maxCount: 0 }, () => {
      // Le véhicule va vers le bas : le piéton atterrit sur la route, sous le trottoir.
      const { pedestrian, simulation, carDrivesAway } = makeHitScene(STREET_ROWS, { vx: 0, vy: 300 })
      simulation.step()
      carDrivesAway()
      const states = runUntilWalking(simulation, () => pedestrian.pedestrian?.state)
      expect(states).toEqual(['launched', 'down', 'angry', 'returning', 'walking'])
      const tile = getTileAt(makeTestMap(STREET_ROWS), pedestrian.position?.x ?? 0, pedestrian.position?.y ?? 0)
      expect(tile.tileY).toBe(1)
    })
  })

  it('quitte la ville quand aucun trottoir n’est assez près pour y revenir', () => {
    withTuning({ maxCount: 0 }, () => {
      const { world, pedestrian, simulation, carDrivesAway } = makeHitScene(['r'.repeat(60), 'r'.repeat(60), 'r'.repeat(60)], { vx: 300, vy: 0 })
      simulation.step()
      carDrivesAway()
      for (let step = 0; step < 400; step++) simulation.step()
      expect(world.entities[pedestrian.id]).toBeUndefined()
    })
  })

  it('donne la même scène avec la même graine', () => {
    withTuning({ maxCount: 0 }, () => {
      const replay = () => {
        const { pedestrian, simulation } = makeHitScene(STREET_ROWS, { vx: 0, vy: 300 })
        for (let step = 0; step < 250; step++) simulation.step()
        return { ...pedestrian.position, state: pedestrian.pedestrian?.state }
      }
      expect(replay()).toEqual(replay())
    })
  })
})
