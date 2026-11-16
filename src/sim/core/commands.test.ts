import { describe, expect, it } from 'vitest'
import { findCommands } from './commands'
import type { Command } from './commands'

const moveLeft: Command = { type: 'player:move', entityId: 1, directionX: -1, directionY: 0, isRunning: false }
const moveUpRunning: Command = { type: 'player:move', entityId: 2, directionX: 0, directionY: -1, isRunning: true }

describe('findCommands', () => {
  it("renvoie les commandes du nom demandé, dans l'ordre d'envoi", () => {
    expect(findCommands([moveLeft, moveUpRunning], 'player:move')).toEqual([moveLeft, moveUpRunning])
  })

  it("renvoie une liste vide quand il n'y en a aucune", () => {
    expect(findCommands([], 'player:move')).toEqual([])
  })

  it('donne accès aux données de la commande sans vérification (typage)', () => {
    const [command] = findCommands([moveUpRunning], 'player:move')
    expect(command!.isRunning).toBe(true)
    expect(command!.entityId).toBe(2)
  })
})
