import { describe, expect, it } from 'vitest'
import { createEventBus } from './events'

interface TestEvents {
  'test:crashed': { speed: number }
  'test:started': { id: number }
}

describe('createEventBus', () => {
  it("prévient les écouteurs avec les données de l'événement", () => {
    const bus = createEventBus<TestEvents>()
    const received: number[] = []
    bus.on('test:crashed', (event) => received.push(event.speed))
    bus.emit('test:crashed', { speed: 180 })
    expect(received).toEqual([180])
  })

  it("appelle les écouteurs dans l'ordre où ils se sont inscrits", () => {
    const bus = createEventBus<TestEvents>()
    const calls: string[] = []
    bus.on('test:crashed', () => calls.push('premier'))
    bus.on('test:crashed', () => calls.push('deuxième'))
    bus.emit('test:crashed', { speed: 1 })
    expect(calls).toEqual(['premier', 'deuxième'])
  })

  it("ne prévient que les écouteurs de l'événement concerné", () => {
    const bus = createEventBus<TestEvents>()
    const calls: string[] = []
    bus.on('test:started', () => calls.push('started'))
    bus.emit('test:crashed', { speed: 1 })
    expect(calls).toEqual([])
  })

  it("ne fait rien quand personne n'écoute", () => {
    expect(() => createEventBus<TestEvents>().emit('test:started', { id: 1 })).not.toThrow()
  })

  it("arrête d'écouter quand on appelle la fonction renvoyée", () => {
    const bus = createEventBus<TestEvents>()
    let count = 0
    const stopListening = bus.on('test:started', () => (count += 1))
    bus.emit('test:started', { id: 1 })
    stopListening()
    bus.emit('test:started', { id: 2 })
    expect(count).toBe(1)
  })

  it("laisse un écouteur se retirer pendant l'événement sans en faire sauter un autre", () => {
    const bus = createEventBus<TestEvents>()
    const calls: string[] = []
    const stopFirst = bus.on('test:started', () => {
      calls.push('premier')
      stopFirst()
    })
    bus.on('test:started', () => calls.push('deuxième'))
    bus.emit('test:started', { id: 1 })
    bus.emit('test:started', { id: 2 })
    expect(calls).toEqual(['premier', 'deuxième', 'deuxième'])
  })
})
