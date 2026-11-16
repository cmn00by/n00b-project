// Les tests du moteur de missions : il tourne seul, avec le noyau et aucun autre système (test LEGO). Le joueur est déplacé à la main.
import { describe, expect, it } from 'vitest'
import { STEPS_PER_SECOND, createRegistry, createSimulation, createTestWorld, loadMap, spawnEntity } from '../../core'
import type { Command, GameEvents, MissionDef, TileMap } from '../../core'
import { createMissionsSystem } from './missionsSystem'

const TILE = 32
/** Une carte vide de 20 × 5 cases, sans obstacle. */
const MAP: TileMap = { mapId: 'test', width: 20, height: 5, tileSize: TILE, tileKindIds: Array<string>(100).fill('road'), solid: Array<boolean>(100).fill(false) }

const DELIVERY: MissionDef = {
  id: 'livraison',
  title: 'Livraison',
  briefing: 'Un colis à livrer.',
  mapId: 'test',
  start: { tileX: 1, tileY: 1 },
  timeLimitSeconds: 10,
  reward: { money: 50 },
  objectives: [
    { type: 'pickup', text: 'Prends le colis', item: 'colis', place: { tileX: 8, tileY: 1 } },
    { type: 'deliver', text: 'Livre le colis', item: 'colis', place: { tileX: 15, tileY: 1 }, travel: 'foot' },
  ],
}

const center = (tileX: number) => (tileX + 0.5) * TILE

function createScene(missions: MissionDef[] = [DELIVERY]) {
  const world = createTestWorld()
  loadMap(world, MAP)
  const player = spawnEntity(world, 'player', { position: { x: center(5), y: center(3), angle: 0 } })
  const simulation = createSimulation(world, [createMissionsSystem(createRegistry('Mission', missions))])
  const events: string[] = []
  const names: Array<keyof GameEvents> = ['mission:started', 'mission:objective-completed', 'mission:succeeded', 'mission:failed']
  for (const name of names) world.events.on(name, (data) => events.push(`${name} ${JSON.stringify(data)}`))
  const moveTo = (tileX: number, tileY = 1) => {
    player.position!.x = center(tileX)
    player.position!.y = center(tileY)
  }
  const step = (commands: Command[] = []) => simulation.step(commands)
  return { world, player, simulation, events, moveTo, step }
}

describe('missionsSystem', () => {
  it('lance la mission quand le joueur entre sur son point de départ', () => {
    const { player, events, moveTo, step } = createScene()
    step()
    expect(player.missionProgress?.active).toBeUndefined()
    moveTo(1)
    step()
    expect(player.missionProgress?.active?.missionId).toBe('livraison')
    expect(events).toEqual([`mission:started {"entityId":${player.id},"missionId":"livraison"}`])
  })

  it('se joue de bout en bout : ramasser, livrer, réussir et toucher la récompense', () => {
    const { player, events, moveTo, step } = createScene()
    moveTo(1)
    step()
    moveTo(8)
    step()
    expect(player.missionProgress?.active?.carriedItems).toEqual(['colis'])
    moveTo(15)
    step()
    expect(player.missionProgress?.active).toBeUndefined()
    expect(player.missionProgress?.completedIds).toEqual(['livraison'])
    expect(events.at(-1)).toBe(`mission:succeeded {"entityId":${player.id},"missionId":"livraison","money":50}`)
    expect(events.filter((event) => event.startsWith('mission:objective-completed'))).toHaveLength(2)
  })

  it('suit les objectifs dans l’ordre : passer d’abord par la livraison ne compte pas', () => {
    const { player, moveTo, step } = createScene()
    moveTo(1)
    step()
    moveTo(15)
    step()
    expect(player.missionProgress?.active?.objectiveIndex).toBe(0)
  })

  it('demande d’arriver à pied quand l’objectif le dit', () => {
    const { player, moveTo, step } = createScene()
    moveTo(1)
    step()
    moveTo(8)
    step()
    player.driver = { vehicleId: 99, storedBody: { width: 24, height: 24, isSolid: true } }
    moveTo(15)
    step()
    expect(player.missionProgress?.active?.objectiveIndex).toBe(1)
    player.driver = undefined
    step()
    expect(player.missionProgress?.completedIds).toEqual(['livraison'])
  })

  it('échoue quand le chrono est écoulé, et ne repart pas tant que le joueur reste sur le départ', () => {
    const { player, events, moveTo, step } = createScene()
    moveTo(1)
    step()
    // Le chrono part au pas qui lance la mission : il reste là au dernier pas, puis tombe à zéro.
    for (let index = 0; index < 10 * STEPS_PER_SECOND - 1; index++) step()
    expect(player.missionProgress?.active).toBeDefined()
    step()
    expect(player.missionProgress?.active).toBeUndefined()
    expect(events.at(-1)).toBe(`mission:failed {"entityId":${player.id},"missionId":"livraison","reason":"time-out"}`)
    step()
    expect(player.missionProgress?.active).toBeUndefined()
    moveTo(5)
    step()
    moveTo(1)
    step()
    expect(player.missionProgress?.active?.missionId).toBe('livraison')
  })

  it('applique le chrono propre à un objectif', () => {
    const timed: MissionDef = { ...DELIVERY, id: 'chrono', timeLimitSeconds: undefined, objectives: [{ type: 'reach', text: 'Cours !', place: { tileX: 18, tileY: 1 }, timeLimitSeconds: 1 }] }
    const { player, events, moveTo, step } = createScene([timed])
    moveTo(1)
    step()
    for (let index = 0; index < STEPS_PER_SECOND; index++) step()
    expect(player.missionProgress?.active).toBeUndefined()
    expect(events.at(-1)).toContain('"reason":"time-out"')
  })

  it('ne propose plus une mission réussie', () => {
    const { player, moveTo, step } = createScene()
    moveTo(1)
    step()
    moveTo(8)
    step()
    moveTo(15)
    step()
    moveTo(1)
    step()
    expect(player.missionProgress?.active).toBeUndefined()
  })

  it('se lance et s’abandonne par commande', () => {
    const { player, events, step } = createScene()
    step([{ type: 'mission:start', entityId: player.id, missionId: 'livraison' }])
    expect(player.missionProgress?.active?.missionId).toBe('livraison')
    step([{ type: 'mission:abandon', entityId: player.id }])
    expect(player.missionProgress?.active).toBeUndefined()
    expect(events.at(-1)).toContain('"reason":"abandoned"')
  })

  it('ignore les missions d’une autre carte', () => {
    const { player, moveTo, step } = createScene([{ ...DELIVERY, mapId: 'ailleurs' }])
    moveTo(1)
    step()
    expect(player.missionProgress?.active).toBeUndefined()
  })

  it('arrête sans planter une mission retirée des données', () => {
    const { world, player, step } = createScene()
    player.missionProgress = { completedIds: [], active: { missionId: 'disparue', objectiveIndex: 0, carriedItems: [] } }
    expect(() => step()).not.toThrow()
    expect(player.missionProgress.active).toBeUndefined()
    expect(world.stepCount).toBe(1)
  })
})
