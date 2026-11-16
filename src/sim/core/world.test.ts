import { describe, expect, it } from 'vitest'
import { TEST_SEED, createTestWorld, createWorld } from './world'

describe('createWorld', () => {
  it('crée un monde vide, au pas 0', () => {
    const world = createWorld(7)
    expect(world.seed).toBe(7)
    expect(world.stepCount).toBe(0)
    expect(world.commands).toEqual([])
    expect(world.entities).toEqual({})
    expect(world.nextEntityId).toBe(1)
  })

  it("donne à chaque monde son propre bus d'événements", () => {
    const first = createWorld(7)
    const second = createWorld(7)
    let received = 0
    second.events.on('world:stepped', () => (received += 1))
    first.events.emit('world:stepped', { stepCount: 1 })
    expect(received).toBe(0)
  })

  it('donne le même hasard à deux mondes de même graine', () => {
    expect(createWorld(7).rng.nextFloat()).toBe(createWorld(7).rng.nextFloat())
  })

  it('donne un hasard différent à deux mondes de graines différentes', () => {
    expect(createWorld(7).rng.nextFloat()).not.toBe(createWorld(8).rng.nextFloat())
  })
})

describe('createTestWorld', () => {
  it('utilise toujours la graine fixe des tests', () => {
    expect(createTestWorld().seed).toBe(TEST_SEED)
    expect(createTestWorld().rng.nextFloat()).toBe(createTestWorld().rng.nextFloat())
  })
})
