import { describe, expect, it } from 'vitest'
import { createTileMap, facingToHeading, getTileCenter, isAreaFree, isSolidTile, validateMapDef } from './map'
import type { MapDef, TileKindDef } from './map'
import { createRegistry } from './registry'
import { createTestWorld, loadMap } from './world'

const TILE_KINDS = createRegistry<TileKindDef>('Type de case', [
  { id: 'floor', isSolid: false },
  { id: 'wall', isSolid: true },
])

/** Une petite carte 4 × 3 : un mur en haut à droite. */
function createMapDef(overrides: Partial<MapDef> = {}): MapDef {
  return {
    id: 'mini',
    name: 'Mini',
    tileSize: 10,
    rows: ['..##', '....', '....'],
    legend: { '.': 'floor', '#': 'wall' },
    spawns: { player: { tileX: 0, tileY: 0 } },
    ...overrides,
  }
}

describe('validateMapDef', () => {
  it('ne renvoie aucune erreur pour une carte correcte', () => {
    expect(validateMapDef(createMapDef(), TILE_KINDS)).toEqual([])
  })

  it('signale une grille vide', () => {
    expect(validateMapDef(createMapDef({ rows: [] }), TILE_KINDS)).toEqual(['la grille est vide'])
  })

  it("signale une ligne qui n'a pas la bonne longueur", () => {
    expect(validateMapDef(createMapDef({ rows: ['..##', '...', '....'] }), TILE_KINDS)).toContain('ligne 1 : 3 cases au lieu de 4')
  })

  it('signale un caractère absent de la légende', () => {
    expect(validateMapDef(createMapDef({ rows: ['..##', '..x.', '....'] }), TILE_KINDS)).toContain("ligne 1 : caractère 'x' absent de la légende")
  })

  it('signale une légende qui pointe vers un type de case inconnu', () => {
    const errors = validateMapDef(createMapDef({ legend: { '.': 'floor', '#': 'lava' } }), TILE_KINDS)
    expect(errors).toContain("légende : '#' pointe vers le type de case inconnu 'lava'")
  })

  it('signale un point d’apparition hors de la carte ou dans un mur', () => {
    expect(validateMapDef(createMapDef({ spawns: { player: { tileX: 9, tileY: 0 } } }), TILE_KINDS)).toContain('apparition du joueur (9, 0) hors de la carte')
    expect(validateMapDef(createMapDef({ spawns: { player: { tileX: 2, tileY: 0 } } }), TILE_KINDS)).toContain('apparition du joueur (2, 0) sur une case qui bloque le passage')
  })
})

describe('validateMapDef : véhicules garés', () => {
  it('accepte des véhicules sur des cases libres', () => {
    expect(validateMapDef(createMapDef({ spawns: { player: { tileX: 0, tileY: 0 }, vehicles: [{ tileX: 1, tileY: 1, modelId: 'x', facing: 'up' }] } }), TILE_KINDS)).toEqual([])
  })

  it('signale un véhicule hors de la carte ou dans un mur', () => {
    const errors = validateMapDef(
      createMapDef({
        spawns: {
          player: { tileX: 0, tileY: 0 },
          vehicles: [
            { tileX: 9, tileY: 1, modelId: 'loin', facing: 'up' },
            { tileX: 3, tileY: 0, modelId: 'mur', facing: 'up' },
          ],
        },
      }),
      TILE_KINDS,
    )
    expect(errors).toEqual(["véhicule 'loin' (9, 1) hors de la carte", "véhicule 'mur' (3, 0) sur une case qui bloque le passage"])
  })
})

describe('facingToHeading', () => {
  it('donne un cap de longueur 1 dans le bon sens', () => {
    expect(facingToHeading('up')).toEqual({ x: 0, y: -1 })
    expect(facingToHeading('down')).toEqual({ x: 0, y: 1 })
    expect(facingToHeading('left')).toEqual({ x: -1, y: 0 })
    expect(facingToHeading('right')).toEqual({ x: 1, y: 0 })
  })
})

describe('createTileMap', () => {
  it('transforme les lignes en grille, ligne par ligne', () => {
    const map = createTileMap(createMapDef(), TILE_KINDS)
    expect(map).toMatchObject({ mapId: 'mini', width: 4, height: 3, tileSize: 10 })
    expect(map.tileKindIds.slice(0, 4)).toEqual(['floor', 'floor', 'wall', 'wall'])
    expect(map.solid.slice(0, 4)).toEqual([false, false, true, true])
  })

  it('refuse une carte invalide', () => {
    expect(() => createTileMap(createMapDef({ rows: [] }), TILE_KINDS)).toThrow("Carte 'mini' invalide")
  })

  it('donne une grille qui se sauvegarde telle quelle (JSON)', () => {
    const map = createTileMap(createMapDef(), TILE_KINDS)
    expect(JSON.parse(JSON.stringify(map))).toEqual(map)
  })
})

describe('isSolidTile', () => {
  const map = createTileMap(createMapDef(), TILE_KINDS)

  it('lit si une case bloque le passage', () => {
    expect(isSolidTile(map, 0, 0)).toBe(false)
    expect(isSolidTile(map, 2, 0)).toBe(true)
  })

  it('considère tout ce qui est hors de la carte comme bloquant', () => {
    expect(isSolidTile(map, -1, 0)).toBe(true)
    expect(isSolidTile(map, 0, 3)).toBe(true)
    expect(isSolidTile(map, 4, 1)).toBe(true)
  })
})

describe('isAreaFree', () => {
  const map = createTileMap(createMapDef(), TILE_KINDS)

  it('dit libre un rectangle qui ne touche que des cases libres', () => {
    expect(isAreaFree(map, 10, 15, 8, 8)).toBe(true)
  })

  it('dit occupé un rectangle qui touche un mur, même d’un pixel', () => {
    expect(isAreaFree(map, 16, 5, 10, 8)).toBe(false)
  })

  it('permet de longer un mur : toucher pile sa limite ne compte pas', () => {
    // Le mur commence à x = 20 ; un rectangle de 10 px centré en x = 15 s'arrête pile à 20.
    expect(isAreaFree(map, 15, 5, 10, 8)).toBe(true)
  })

  it('dit occupé un rectangle qui dépasse du bord de la carte', () => {
    expect(isAreaFree(map, 2, 15, 8, 8)).toBe(false)
  })
})

describe('getTileCenter', () => {
  it('donne le centre de la case, en pixels', () => {
    const map = createTileMap(createMapDef(), TILE_KINDS)
    expect(getTileCenter(map, { tileX: 1, tileY: 2 })).toEqual({ x: 15, y: 25 })
  })
})

describe('loadMap', () => {
  it('range la carte dans le monde', () => {
    const world = createTestWorld()
    expect(world.map).toBeUndefined()
    const map = createTileMap(createMapDef(), TILE_KINDS)
    loadMap(world, map)
    expect(world.map).toBe(map)
  })
})
