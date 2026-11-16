import { describe, expect, it } from 'vitest'
import { TUNING, createTestWorld, spawnEntity } from '../../core'
import type { Command } from '../../core'
import { findPlayerPositions, findThreats } from './threats'

function moveCommand(entityId: number, directionX: number, directionY: number, isRunning: boolean): Command {
  return { type: 'player:move', entityId, directionX, directionY, isRunning }
}

describe('findPlayerPositions', () => {
  it('ne compte que les joueurs', () => {
    const world = createTestWorld()
    spawnEntity(world, 'player', { position: { x: 10, y: 20, angle: 0 } })
    spawnEntity(world, 'pedestrian', { position: { x: 99, y: 99, angle: 0 } })
    expect(findPlayerPositions(world)).toEqual([{ x: 10, y: 20 }])
  })
})

describe('findThreats', () => {
  it('prend la vitesse de course d’un joueur qui court, avec sa direction', () => {
    const world = createTestWorld()
    const player = spawnEntity(world, 'player', { position: { x: 5, y: 6, angle: 0 } })
    world.commands = [moveCommand(player.id, 1, 0, true)]
    expect(findThreats(world)).toEqual([{ x: 5, y: 6, directionX: 1, directionY: 0, speed: TUNING.walking.runSpeed }])
  })

  it('prend la vitesse de marche d’un joueur qui marche', () => {
    const world = createTestWorld()
    const player = spawnEntity(world, 'player', { position: { x: 0, y: 0, angle: 0 } })
    world.commands = [moveCommand(player.id, 0, 1, false)]
    expect(findThreats(world)[0]?.speed).toBe(TUNING.walking.walkSpeed)
  })

  it('ne compte pas un joueur immobile ou sans commande', () => {
    const world = createTestWorld()
    const player = spawnEntity(world, 'player', { position: { x: 0, y: 0, angle: 0 } })
    expect(findThreats(world)).toEqual([])
    world.commands = [moveCommand(player.id, 0, 0, true)]
    expect(findThreats(world)).toEqual([])
  })

  it('ne garde que la dernière commande d’un joueur', () => {
    const world = createTestWorld()
    const player = spawnEntity(world, 'player', { position: { x: 0, y: 0, angle: 0 } })
    world.commands = [moveCommand(player.id, 1, 0, true), moveCommand(player.id, -1, 0, false)]
    const threats = findThreats(world)
    expect(threats).toHaveLength(1)
    expect(threats[0]?.directionX).toBe(-1)
  })

  it('ignore une commande qui vise autre chose qu’un joueur', () => {
    const world = createTestWorld()
    const pedestrian = spawnEntity(world, 'pedestrian', { position: { x: 0, y: 0, angle: 0 } })
    world.commands = [moveCommand(pedestrian.id, 1, 0, true)]
    expect(findThreats(world)).toEqual([])
  })
})

describe('findThreats : les véhicules', () => {
  it('compte un véhicule en mouvement avec sa direction et sa vitesse', () => {
    const world = createTestWorld()
    spawnEntity(world, 'vehicle', { position: { x: 50, y: 60, angle: 0 }, velocity: { vx: 0, vy: -200 }, vehicle: { modelId: 'test', headingX: 0, headingY: -1 } })
    expect(findThreats(world)).toEqual([{ x: 50, y: 60, directionX: 0, directionY: -200, speed: 200 }])
  })

  it('ne compte pas un véhicule à l’arrêt', () => {
    const world = createTestWorld()
    spawnEntity(world, 'vehicle', { position: { x: 50, y: 60, angle: 0 }, velocity: { vx: 0, vy: 0 }, vehicle: { modelId: 'test', headingX: 0, headingY: -1 } })
    expect(findThreats(world)).toEqual([])
  })

  it('ignore une entité qui a une vitesse sans être un véhicule', () => {
    const world = createTestWorld()
    spawnEntity(world, 'prop', { position: { x: 50, y: 60, angle: 0 }, velocity: { vx: 300, vy: 0 } })
    expect(findThreats(world)).toEqual([])
  })
})
