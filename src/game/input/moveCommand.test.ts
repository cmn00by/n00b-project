import { describe, expect, it } from 'vitest'
import { toMoveCommand } from './moveCommand'
import type { PressedKeys } from './moveCommand'

const noKeys: PressedKeys = { up: false, down: false, left: false, right: false, run: false }

describe('toMoveCommand', () => {
  it("ne renvoie rien quand aucune direction n'est demandée", () => {
    expect(toMoveCommand(1, noKeys)).toBeUndefined()
    expect(toMoveCommand(1, { ...noKeys, run: true })).toBeUndefined()
  })

  it('traduit chaque direction', () => {
    expect(toMoveCommand(1, { ...noKeys, left: true })).toMatchObject({ directionX: -1, directionY: 0 })
    expect(toMoveCommand(1, { ...noKeys, right: true })).toMatchObject({ directionX: 1, directionY: 0 })
    expect(toMoveCommand(1, { ...noKeys, up: true })).toMatchObject({ directionX: 0, directionY: -1 })
    expect(toMoveCommand(1, { ...noKeys, down: true })).toMatchObject({ directionX: 0, directionY: 1 })
  })

  it('combine deux touches en diagonale', () => {
    expect(toMoveCommand(1, { ...noKeys, up: true, right: true })).toMatchObject({ directionX: 1, directionY: -1 })
  })

  it('annule deux touches opposées', () => {
    expect(toMoveCommand(1, { ...noKeys, left: true, right: true })).toBeUndefined()
  })

  it("transmet l'entité commandée et la course", () => {
    expect(toMoveCommand(7, { ...noKeys, down: true, run: true })).toEqual({ type: 'player:move', entityId: 7, directionX: 0, directionY: 1, isRunning: true })
  })
})
