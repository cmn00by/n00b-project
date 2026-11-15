// Les tests de la brique walking : elle tourne seule, avec le noyau et aucun autre système (test LEGO).
import { describe, expect, it } from 'vitest'
import { STEP_SECONDS, TUNING, createSimulation, createTestWorld, spawnEntity } from '../../core'
import type { Command } from '../../core'
import { walkingSystem } from './walkingSystem'

function createWalkingScene() {
  const world = createTestWorld()
  const player = spawnEntity(world, 'player', { position: { x: 100, y: 100, angle: 0 } })
  const simulation = createSimulation(world, [walkingSystem])
  return { world, player, simulation }
}

function move(entityId: number, directionX: number, directionY: number, isRunning = false): Command {
  return { type: 'player:move', entityId, directionX, directionY, isRunning }
}

describe('walkingSystem', () => {
  it('fait avancer le joueur à la vitesse de marche, pas après pas', () => {
    const { player, simulation } = createWalkingScene()
    simulation.step([move(player.id, 1, 0)])
    expect(player.position!.x).toBeCloseTo(100 + TUNING.walking.walkSpeed * STEP_SECONDS)
    expect(player.position!.y).toBe(100)
  })

  it('parcourt la vitesse de marche en une seconde de simulation', () => {
    const { player, simulation } = createWalkingScene()
    for (let step = 0; step < 30; step++) simulation.step([move(player.id, 0, 1)])
    expect(player.position!.y).toBeCloseTo(100 + TUNING.walking.walkSpeed)
  })

  it('va plus vite quand le joueur court', () => {
    const { player, simulation } = createWalkingScene()
    simulation.step([move(player.id, -1, 0, true)])
    expect(player.position!.x).toBeCloseTo(100 - TUNING.walking.runSpeed * STEP_SECONDS)
  })

  it('ne va pas plus vite en diagonale', () => {
    const { player, simulation } = createWalkingScene()
    simulation.step([move(player.id, 1, 1)])
    const distance = Math.sqrt((player.position!.x - 100) ** 2 + (player.position!.y - 100) ** 2)
    expect(distance).toBeCloseTo(TUNING.walking.walkSpeed * STEP_SECONDS)
  })

  it("ignore l'intensité de la direction : seule la direction compte", () => {
    const { player, simulation } = createWalkingScene()
    simulation.step([move(player.id, 0.2, 0)])
    expect(player.position!.x).toBeCloseTo(100 + TUNING.walking.walkSpeed * STEP_SECONDS)
  })

  it('ne bouge pas sans commande, ni avec une direction nulle', () => {
    const { player, simulation } = createWalkingScene()
    simulation.step()
    simulation.step([move(player.id, 0, 0)])
    expect(player.position).toEqual({ x: 100, y: 100, angle: 0 })
  })

  it("ne compte que la dernière commande d'une entité dans un même pas", () => {
    const { player, simulation } = createWalkingScene()
    simulation.step([move(player.id, 1, 0), move(player.id, 1, 0)])
    expect(player.position!.x).toBeCloseTo(100 + TUNING.walking.walkSpeed * STEP_SECONDS)
  })

  it('ignore une commande pour une entité inconnue ou sans position', () => {
    const { world, simulation } = createWalkingScene()
    const ghost = spawnEntity(world, 'prop')
    expect(() => simulation.step([move(999, 1, 0), move(ghost.id, 1, 0)])).not.toThrow()
    expect(ghost.position).toBeUndefined()
  })

  it("ne déplace que l'entité commandée", () => {
    const { world, player, simulation } = createWalkingScene()
    const other = spawnEntity(world, 'pedestrian', { position: { x: 5, y: 5, angle: 0 } })
    simulation.step([move(player.id, 1, 0)])
    expect(other.position).toEqual({ x: 5, y: 5, angle: 0 })
  })
})
