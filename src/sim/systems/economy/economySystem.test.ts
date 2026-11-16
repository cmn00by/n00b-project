// Les tests de la brique economy : elle tourne seule, avec le noyau et aucun autre système (test LEGO). Les missions sont simulées par leur événement.
import { describe, expect, it } from 'vitest'
import { TUNING, createSimulation, createTestWorld, spawnEntity } from '../../core'
import type { Command, GameEvents } from '../../core'
import { economySystem } from './economySystem'

function createScene() {
  const world = createTestWorld()
  const player = spawnEntity(world, 'player', { position: { x: 0, y: 0, angle: 0 } })
  const simulation = createSimulation(world, [economySystem])
  const events: string[] = []
  const names = ['economy:earned', 'economy:spent', 'economy:refused'] as const
  const record = (name: string, data: GameEvents['economy:earned']) => events.push(`${name} ${data.amount} ${data.reason} → ${data.balance}`)
  for (const name of names) world.events.on(name, (data) => record(name, data))
  const spend = (amount: number, reason = 'test'): Command => ({ type: 'economy:spend', entityId: player.id, amount, reason })
  return { world, player, simulation, events, spend }
}

describe('economySystem', () => {
  it('donne au joueur l’argent de départ dès le premier pas', () => {
    const { player, simulation } = createScene()
    simulation.step()
    expect(player.wallet?.money).toBe(TUNING.economy.startingMoney)
  })

  it('verse la récompense d’une mission réussie', () => {
    const { world, player, simulation, events } = createScene()
    simulation.step()
    world.events.emit('mission:succeeded', { entityId: player.id, missionId: 'colis', money: 150 })
    expect(player.wallet?.money).toBe(TUNING.economy.startingMoney + 150)
    expect(events).toEqual([`economy:earned 150 mission:colis → ${TUNING.economy.startingMoney + 150}`])
  })

  it('dépense quand le portefeuille suffit', () => {
    const { player, simulation, events, spend } = createScene()
    simulation.step([spend(100, 'pizza')])
    expect(player.wallet?.money).toBe(TUNING.economy.startingMoney - 100)
    expect(events).toEqual([`economy:spent 100 pizza → ${TUNING.economy.startingMoney - 100}`])
  })

  it('refuse une dépense trop chère sans rien retirer', () => {
    const { player, simulation, events, spend } = createScene()
    simulation.step([spend(TUNING.economy.startingMoney + 1, 'voiture')])
    expect(player.wallet?.money).toBe(TUNING.economy.startingMoney)
    expect(events[0]).toMatch(/^economy:refused/)
  })

  it('refuse un montant négatif, nul ou à virgule', () => {
    const { player, simulation, events, spend } = createScene()
    simulation.step([spend(-50), spend(0), spend(2.5)])
    expect(player.wallet?.money).toBe(TUNING.economy.startingMoney)
    expect(events.every((event) => event.startsWith('economy:refused'))).toBe(true)
    expect(events).toHaveLength(3)
  })

  it('applique plusieurs dépenses d’un même pas dans l’ordre, jusqu’à ce que l’argent manque', () => {
    const { player, simulation, spend } = createScene()
    simulation.step([spend(70), spend(70), spend(50)])
    expect(player.wallet?.money).toBe(TUNING.economy.startingMoney - 70 - 50)
  })

  it('ignore une récompense pour une entité disparue', () => {
    const { world, simulation, events } = createScene()
    simulation.step()
    world.events.emit('mission:succeeded', { entityId: 999, missionId: 'colis', money: 150 })
    expect(events).toEqual([])
  })
})
