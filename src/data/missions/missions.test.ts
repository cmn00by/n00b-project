import { describe, expect, it } from 'vitest'
import { TEST_SEED, createSimulation, createTileMap, createWorld, getTileCenter, loadMap, spawnEntity, validateDefs, validateMissionDef, validateMissionPlaces } from '../../sim/core'
import { SYSTEMS } from '../../sim/systems'
import { MAP_REGISTRY } from '../maps'
import { TILE_KIND_REGISTRY } from '../tileKinds'
import { MISSIONS, MISSION_REGISTRY } from './index'

describe('MISSIONS', () => {
  it('ne contient que des missions valides (ids uniques, objectifs cohérents)', () => {
    expect(validateDefs('Mission', MISSIONS, validateMissionDef)).toEqual([])
  })

  it('place chaque mission sur une carte qui existe, sur des cases où l’on peut aller', () => {
    for (const mission of MISSIONS) {
      expect(MAP_REGISTRY.has(mission.mapId)).toBe(true)
      const map = createTileMap(MAP_REGISTRY.get(mission.mapId), TILE_KIND_REGISTRY)
      expect(validateMissionPlaces(mission, map)).toEqual([])
    }
  })

  it('reste en JSON pur : une mission se sauvegarde et se relit à l’identique', () => {
    for (const mission of MISSIONS) expect(JSON.parse(JSON.stringify(mission))).toEqual(mission)
  })
})

describe('la mission d’essai, dans la vraie ville et avec toutes les briques', () => {
  it('se joue de bout en bout : départ, colis, livraison à pied, réussite', () => {
    const mapDef = MAP_REGISTRY.get('test-town')
    const map = createTileMap(mapDef, TILE_KIND_REGISTRY)
    const world = createWorld(TEST_SEED)
    loadMap(world, map)
    const simulation = createSimulation(world, SYSTEMS)
    const spawn = getTileCenter(map, mapDef.spawns.player)
    const player = spawnEntity(world, 'player', { position: { x: spawn.x, y: spawn.y, angle: 0 }, body: { width: 24, height: 24, isSolid: true } })
    const succeeded: string[] = []
    world.events.on('mission:succeeded', ({ missionId }) => succeeded.push(missionId))
    const visit = (place: { tileX: number; tileY: number }) => {
      const center = getTileCenter(map, place)
      player.position!.x = center.x
      player.position!.y = center.y
      simulation.step()
    }

    const mission = MISSION_REGISTRY.get('essai-livraison')
    visit(mission.start)
    expect(player.missionProgress?.active?.missionId).toBe('essai-livraison')
    for (const objective of mission.objectives) visit(objective.place)
    expect(succeeded).toEqual(['essai-livraison'])
  })
})
