import { describe, expect, it } from 'vitest'
import { despawnEntity, findEntitiesWith, findEntity, getEntity, spawnEntity } from './entities'
import { createTestWorld } from './world'

describe('spawnEntity', () => {
  it('donne des ids croissants à partir de 1', () => {
    const world = createTestWorld()
    expect(spawnEntity(world, 'player').id).toBe(1)
    expect(spawnEntity(world, 'prop').id).toBe(2)
  })

  it("range l'entité dans le monde avec son genre et ses composants", () => {
    const world = createTestWorld()
    const car = spawnEntity(world, 'vehicle', { position: { x: 10, y: 20, angle: 0 }, sprite: { key: 'mamie-car' } })
    expect(world.entities[car.id]).toBe(car)
    expect(car.kind).toBe('vehicle')
    expect(car.position).toEqual({ x: 10, y: 20, angle: 0 })
  })

  it('copie les composants : deux entités ne partagent jamais le même objet', () => {
    const world = createTestWorld()
    const template = { position: { x: 0, y: 0, angle: 0 } }
    const first = spawnEntity(world, 'prop', template)
    const second = spawnEntity(world, 'prop', template)
    first.position!.x = 99
    expect(second.position!.x).toBe(0)
    expect(template.position.x).toBe(0)
  })
})

describe('despawnEntity', () => {
  it("retire l'entité et renvoie true", () => {
    const world = createTestWorld()
    const { id } = spawnEntity(world, 'prop')
    expect(despawnEntity(world, id)).toBe(true)
    expect(findEntity(world, id)).toBeUndefined()
  })

  it("renvoie false pour une entité qui n'existe pas", () => {
    expect(despawnEntity(createTestWorld(), 42)).toBe(false)
  })

  it('ne réutilise jamais un id supprimé', () => {
    const world = createTestWorld()
    const { id } = spawnEntity(world, 'prop')
    despawnEntity(world, id)
    expect(spawnEntity(world, 'prop').id).toBeGreaterThan(id)
  })
})

describe('findEntity et getEntity', () => {
  it('findEntity renvoie undefined pour un id inconnu, getEntity lève une erreur', () => {
    const world = createTestWorld()
    expect(findEntity(world, 5)).toBeUndefined()
    expect(() => getEntity(world, 5)).toThrow()
  })

  it("getEntity renvoie l'entité qui existe", () => {
    const world = createTestWorld()
    const { id } = spawnEntity(world, 'player')
    expect(getEntity(world, id).kind).toBe('player')
  })
})

describe('findEntitiesWith', () => {
  it('ne garde que les entités qui ont tous les composants demandés', () => {
    const world = createTestWorld()
    spawnEntity(world, 'prop', { position: { x: 0, y: 0, angle: 0 } })
    const mover = spawnEntity(world, 'player', { position: { x: 1, y: 1, angle: 0 }, velocity: { vx: 0, vy: 0 } })
    spawnEntity(world, 'prop', { velocity: { vx: 1, vy: 1 } })
    const found = findEntitiesWith(world, ['position', 'velocity'])
    expect(found.map((entity) => entity.id)).toEqual([mover.id])
  })

  it('donne accès aux composants demandés sans vérification (typage)', () => {
    const world = createTestWorld()
    spawnEntity(world, 'player', { position: { x: 5, y: 6, angle: 0 }, velocity: { vx: 1, vy: 2 } })
    const [entity] = findEntitiesWith(world, ['position', 'velocity'])
    expect(entity!.position.x + entity!.velocity.vx).toBe(6)
  })

  it("parcourt toujours les entités dans l'ordre croissant des ids", () => {
    const world = createTestWorld()
    const ids = [1, 2, 3, 4].map(() => spawnEntity(world, 'prop', { position: { x: 0, y: 0, angle: 0 } }).id)
    despawnEntity(world, ids[1]!)
    const found = findEntitiesWith(world, ['position']).map((entity) => entity.id)
    expect(found).toEqual([ids[0], ids[2], ids[3]])
  })

  it('renvoie une liste vide quand personne ne correspond', () => {
    expect(findEntitiesWith(createTestWorld(), ['body'])).toEqual([])
  })
})
