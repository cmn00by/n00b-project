import { describe, expect, it } from 'vitest'
import { TUNING, createRng } from '../../core'
import { chooseApproachTile, chooseFleeTile, chooseNextTile, chooseSpawnTile, getTileAt, isWalkableTile } from './tiles'
import { makeTestMap } from './testMap'

const TUNING_PEDESTRIANS = TUNING.pedestrians
const ALWAYS_STRAIGHT = { ...TUNING_PEDESTRIANS, turnChance: 0 }
const ALWAYS_TURN = { ...TUNING_PEDESTRIANS, turnChance: 1 }

// Un couloir de trottoir (ligne du haut) bordé de bâtiments et d'une route.
const CORRIDOR = makeTestMap(['sssss', '#####', 'rrrrr'])
// Un carrefour de trottoirs en T : une ligne horizontale et une branche vers le bas, entourées de bâtiments.
const T_JUNCTION = makeTestMap(['#####', 'sssss', '##s##', '##s##'])

describe('isWalkableTile', () => {
  it('autorise le trottoir, refuse la route, les bâtiments et le dehors de la carte', () => {
    expect(isWalkableTile(CORRIDOR, 2, 0, TUNING_PEDESTRIANS)).toBe(true)
    expect(isWalkableTile(CORRIDOR, 2, 1, TUNING_PEDESTRIANS)).toBe(false) // bâtiment
    expect(isWalkableTile(CORRIDOR, 2, 2, TUNING_PEDESTRIANS)).toBe(false) // route
    expect(isWalkableTile(CORRIDOR, -1, 0, TUNING_PEDESTRIANS)).toBe(false)
    expect(isWalkableTile(CORRIDOR, 5, 0, TUNING_PEDESTRIANS)).toBe(false)
  })

  it('suit le réglage des types de case praticables', () => {
    const walksOnRoads = { ...TUNING_PEDESTRIANS, walkableTileKinds: ['road'] }
    expect(isWalkableTile(CORRIDOR, 2, 2, walksOnRoads)).toBe(true)
    expect(isWalkableTile(CORRIDOR, 2, 0, walksOnRoads)).toBe(false)
  })
})

describe('getTileAt', () => {
  it('donne la case qui contient un point en pixels', () => {
    expect(getTileAt(CORRIDOR, 0, 0)).toEqual({ tileX: 0, tileY: 0 })
    expect(getTileAt(CORRIDOR, 95, 33)).toEqual({ tileX: 2, tileY: 1 })
  })
})

describe('chooseNextTile', () => {
  it('continue tout droit dans un couloir', () => {
    const next = chooseNextTile(CORRIDOR, { tileX: 1, tileY: 0 }, { x: 1, y: 0 }, createRng(1), ALWAYS_TURN)
    expect(next).toEqual({ tileX: 2, tileY: 0, heading: { x: 1, y: 0 } })
  })

  it('fait demi-tour au bout d’une impasse', () => {
    const next = chooseNextTile(CORRIDOR, { tileX: 4, tileY: 0 }, { x: 1, y: 0 }, createRng(1), ALWAYS_TURN)
    expect(next).toEqual({ tileX: 3, tileY: 0, heading: { x: -1, y: 0 } })
  })

  it('choisit une direction quand il n’en a pas encore', () => {
    const next = chooseNextTile(CORRIDOR, { tileX: 2, tileY: 0 }, { x: 0, y: 0 }, createRng(1), ALWAYS_STRAIGHT)
    expect(next).toBeDefined()
    expect(isWalkableTile(CORRIDOR, next?.tileX ?? -1, next?.tileY ?? -1, TUNING_PEDESTRIANS)).toBe(true)
  })

  it('reste immobile (undefined) quand aucune case voisine n’est praticable', () => {
    const alone = makeTestMap(['###', '#s#', '###'])
    expect(chooseNextTile(alone, { tileX: 1, tileY: 1 }, { x: 1, y: 0 }, createRng(1), TUNING_PEDESTRIANS)).toBeUndefined()
  })

  it('tourne toujours à un carrefour quand turnChance vaut 1, et ne fait jamais demi-tour', () => {
    // Arrivé en (2,1) en allant vers la droite : tout droit (3,1) ou la branche (2,2), jamais le retour (1,1).
    const seen = new Set<string>()
    for (let seed = 1; seed <= 40; seed++) {
      const next = chooseNextTile(T_JUNCTION, { tileX: 2, tileY: 1 }, { x: 1, y: 0 }, createRng(seed), ALWAYS_TURN)
      seen.add(`${next?.tileX},${next?.tileY}`)
    }
    expect(seen).toEqual(new Set(['2,2']))
  })

  it('continue tout droit à un carrefour quand turnChance vaut 0', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const next = chooseNextTile(T_JUNCTION, { tileX: 2, tileY: 1 }, { x: 1, y: 0 }, createRng(seed), ALWAYS_STRAIGHT)
      expect(next).toEqual({ tileX: 3, tileY: 1, heading: { x: 1, y: 0 } })
    }
  })

  it('ne marche jamais ailleurs que sur les trottoirs, même en se promenant longtemps', () => {
    const rng = createRng(7)
    let tile = { tileX: 2, tileY: 1 }
    let heading = { x: 1, y: 0 }
    for (let step = 0; step < 300; step++) {
      const next = chooseNextTile(T_JUNCTION, tile, heading, rng, TUNING_PEDESTRIANS)
      expect(next).toBeDefined()
      if (next === undefined) return
      expect(isWalkableTile(T_JUNCTION, next.tileX, next.tileY, TUNING_PEDESTRIANS)).toBe(true)
      tile = next
      heading = next.heading
    }
  })

  it('donne les mêmes choix avec la même graine', () => {
    const walk = (seed: number): string[] => {
      const rng = createRng(seed)
      let tile = { tileX: 2, tileY: 1 }
      let heading = { x: 1, y: 0 }
      const path: string[] = []
      for (let step = 0; step < 40; step++) {
        const next = chooseNextTile(T_JUNCTION, tile, heading, rng, TUNING_PEDESTRIANS)
        if (next === undefined) break
        tile = next
        heading = next.heading
        path.push(`${next.tileX},${next.tileY}`)
      }
      return path
    }
    expect(walk(42)).toEqual(walk(42))
  })
})

describe('chooseFleeTile', () => {
  it('choisit la case voisine la plus éloignée de ce qui fait peur', () => {
    // La menace est à gauche du piéton, en (0, 0) px : il fuit vers la droite.
    const next = chooseFleeTile(CORRIDOR, { tileX: 2, tileY: 0 }, { x: 0, y: 16 }, createRng(1), TUNING_PEDESTRIANS)
    expect(next).toEqual({ tileX: 3, tileY: 0, heading: { x: 1, y: 0 } })
  })

  it('fuit dans l’autre sens quand la menace est de l’autre côté', () => {
    const next = chooseFleeTile(CORRIDOR, { tileX: 2, tileY: 0 }, { x: 160, y: 16 }, createRng(1), TUNING_PEDESTRIANS)
    expect(next).toEqual({ tileX: 1, tileY: 0, heading: { x: -1, y: 0 } })
  })

  it('renvoie undefined quand il est coincé', () => {
    const alone = makeTestMap(['###', '#s#', '###'])
    expect(chooseFleeTile(alone, { tileX: 1, tileY: 1 }, { x: 0, y: 0 }, createRng(1), TUNING_PEDESTRIANS)).toBeUndefined()
  })
})

describe('chooseSpawnTile', () => {
  const tuning = { ...TUNING_PEDESTRIANS, spawnMinDistance: 64, spawnMaxDistance: 160, minSeparation: 20, spawnTries: 200 }
  // Une longue rue de trottoir : 20 cases de 32 px.
  const street = makeTestMap(['ssssssssssssssssssss'])
  const player = { x: 16, y: 16 }

  it('choisit un trottoir ni trop près ni trop loin du joueur', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const tile = chooseSpawnTile(street, player, [], createRng(seed), tuning)
      expect(tile).toBeDefined()
      const distance = Math.abs(((tile?.tileX ?? 0) + 0.5) * 32 - player.x)
      expect(distance).toBeGreaterThanOrEqual(64)
      expect(distance).toBeLessThanOrEqual(160)
    }
  })

  it('ne choisit pas une case déjà occupée par un piéton', () => {
    // Toutes les cases de la zone valide (2 à 5 cases du joueur) sauf une sont prises.
    const taken = [2, 3, 4, 6].map((tileX) => ({ x: (tileX + 0.5) * 32, y: 16 }))
    for (let seed = 1; seed <= 20; seed++) {
      expect(chooseSpawnTile(street, player, taken, createRng(seed), tuning)).toEqual({ tileX: 5, tileY: 0 })
    }
  })

  it('renvoie undefined quand aucune case ne convient', () => {
    const buildings = makeTestMap(['#####', '#####'])
    expect(chooseSpawnTile(buildings, player, [], createRng(1), tuning)).toBeUndefined()
  })
})

describe('chooseApproachTile', () => {
  it('choisit la case voisine qui le rapproche de ce qui l’intrigue', () => {
    const next = chooseApproachTile(CORRIDOR, { tileX: 2, tileY: 0 }, { x: 0, y: 16 }, createRng(1), TUNING_PEDESTRIANS)
    expect(next).toEqual({ tileX: 1, tileY: 0, heading: { x: -1, y: 0 } })
  })

  it('va dans l’autre sens quand ce qui l’intrigue est de l’autre côté', () => {
    const next = chooseApproachTile(CORRIDOR, { tileX: 2, tileY: 0 }, { x: 160, y: 16 }, createRng(1), TUNING_PEDESTRIANS)
    expect(next).toEqual({ tileX: 3, tileY: 0, heading: { x: 1, y: 0 } })
  })

  it('reste sur place quand aucune case ne le rapproche (au bout du trottoir, ce qui l’intrigue étant plus loin)', () => {
    expect(chooseApproachTile(CORRIDOR, { tileX: 4, tileY: 0 }, { x: 400, y: 16 }, createRng(1), TUNING_PEDESTRIANS)).toBeUndefined()
  })

  it('reste sur place quand il est coincé', () => {
    const alone = makeTestMap(['#####', '##s##', '#####'])
    expect(chooseApproachTile(alone, { tileX: 2, tileY: 1 }, { x: 0, y: 0 }, createRng(1), TUNING_PEDESTRIANS)).toBeUndefined()
  })

  it('ne quitte jamais le trottoir pour s’approcher', () => {
    // La route est juste sous le trottoir, et ce qui l’intrigue est dessus : il ne descend pas sur la route.
    expect(chooseApproachTile(CORRIDOR, { tileX: 2, tileY: 0 }, { x: 80, y: 80 }, createRng(1), TUNING_PEDESTRIANS)).toBeUndefined()
  })
})
