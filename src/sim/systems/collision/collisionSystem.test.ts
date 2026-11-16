import { describe, expect, it } from 'vitest'
import { createRegistry, createSimulation, createTestWorld, createTileMap, loadMap, spawnEntity } from '../../core'
import type { Entity, Simulation, TileKindDef } from '../../core'
import { collisionSystem } from './collisionSystem'

const TILE_KINDS = createRegistry<TileKindDef>('Type de case', [
  { id: 'floor', isSolid: false },
  { id: 'wall', isSolid: true },
])

/** Une salle de 6 × 5 cases de 10 px, avec un pilier au milieu. */
const ROOM = createTileMap(
  {
    id: 'room',
    name: 'Salle',
    tileSize: 10,
    rows: ['......', '......', '...#..', '......', '......'],
    legend: { '.': 'floor', '#': 'wall' },
    spawns: { player: { tileX: 0, tileY: 0 } },
  },
  TILE_KINDS,
)

/** Une simulation avec seulement la brique collision : les tests déplacent l'entité à la main, comme le ferait une autre brique. */
function createRoom(x: number, y: number): { simulation: Simulation; entity: Entity } {
  const world = createTestWorld()
  loadMap(world, ROOM)
  const simulation = createSimulation(world, [collisionSystem])
  const entity = spawnEntity(world, 'player', { position: { x, y, angle: 0 }, body: { width: 6, height: 6, isSolid: true } })
  simulation.step() // la brique retient la première position libre
  return { simulation, entity }
}

function moveTo(entity: Entity, x: number, y: number): void {
  if (entity.position === undefined) throw new Error('entité sans position')
  entity.position.x = x
  entity.position.y = y
}

describe('collisionSystem', () => {
  it('ne laisse aucun vide entre l’entité et le mur', () => {
    const { simulation, entity } = createRoom(25, 15)
    moveTo(entity, 28, 16)
    simulation.step()
    moveTo(entity, 31, 19) // se jette sur le coin du pilier
    simulation.step()
    expect(entity.position).toMatchObject({ x: 31, y: 17 }) // glisse vers la droite, s'arrête pile au-dessus
  })

  it('laisse passer un déplacement libre', () => {
    const { simulation, entity } = createRoom(15, 15)
    moveTo(entity, 18, 15)
    simulation.step()
    expect(entity.position).toMatchObject({ x: 18, y: 15 })
  })

  it('ramène une entité qui entre dans un mur', () => {
    const { simulation, entity } = createRoom(25, 15)
    moveTo(entity, 28, 15) // le pilier occupe x de 30 à 40, y de 20 à 30 : ici on ne le touche pas encore
    simulation.step()
    moveTo(entity, 28, 20) // descend dans le pilier
    simulation.step()
    expect(entity.position).toMatchObject({ x: 28, y: 17 }) // bloquée au contact du pilier (bas de l'entité = 20)
  })

  it('fait glisser le long du mur quand on avance en diagonale contre lui', () => {
    const { simulation, entity } = createRoom(25, 17)
    moveTo(entity, 28, 20) // en diagonale : la descente est bloquée par le pilier, pas l'avancée vers la droite
    simulation.step()
    expect(entity.position).toMatchObject({ x: 28, y: 17 })
  })

  it('empêche de sortir de la carte', () => {
    const { simulation, entity } = createRoom(5, 5)
    moveTo(entity, 1, 5)
    simulation.step()
    expect(entity.position).toMatchObject({ x: 3, y: 5 }) // s'arrête au contact du bord (bord gauche de l'entité = 0)
  })

  it("laisse sortir d'un mur une entité apparue dedans, puis la bloque normalement", () => {
    const { simulation, entity } = createRoom(35, 25) // dans le pilier
    moveTo(entity, 35, 35) // elle en sort
    simulation.step()
    expect(entity.position).toMatchObject({ x: 35, y: 35 })
    moveTo(entity, 35, 32) // y revient : bloquée au contact du pilier (haut de l'entité = 30)
    simulation.step()
    expect(entity.position).toMatchObject({ x: 35, y: 33 })
  })

  it("n'agit pas sur une entité sans corps", () => {
    const world = createTestWorld()
    loadMap(world, ROOM)
    const simulation = createSimulation(world, [collisionSystem])
    const ghost = spawnEntity(world, 'prop', { position: { x: 35, y: 25, angle: 0 } })
    simulation.step()
    expect(ghost.position).toMatchObject({ x: 35, y: 25 })
    expect(ghost.lastFreePosition).toBeUndefined()
  })

  it('bloque contre une autre entité solide, et coupe la vitesse sur l’axe bloqué', () => {
    const { simulation, entity } = createRoom(15, 15)
    spawnEntity(simulation.world, 'prop', { position: { x: 15, y: 35, angle: 0 }, body: { width: 6, height: 6, isSolid: true } })
    entity.velocity = { vx: 40, vy: 120 }
    const impacts: number[] = []
    simulation.world.events.on('entity:blocked', (event) => impacts.push(event.impactSpeed))
    moveTo(entity, 15, 30)
    simulation.step()
    expect(entity.position).toMatchObject({ x: 15, y: 29 }) // au contact de la caisse (haut de la caisse = 32, bas de l'entité = 32)
    expect(entity.velocity).toEqual({ vx: 40, vy: 0 })
    expect(impacts).toEqual([120])
  })

  it("n'annonce rien quand le déplacement est libre", () => {
    const { simulation, entity } = createRoom(15, 15)
    let blocked = 0
    simulation.world.events.on('entity:blocked', () => (blocked += 1))
    moveTo(entity, 18, 15)
    simulation.step()
    expect(blocked).toBe(0)
  })

  it('ne fait rien sans carte chargée ni obstacle', () => {
    const world = createTestWorld()
    const simulation = createSimulation(world, [collisionSystem])
    const entity = spawnEntity(world, 'player', { position: { x: -100, y: -100, angle: 0 }, body: { width: 6, height: 6, isSolid: true } })
    simulation.step()
    expect(entity.position).toMatchObject({ x: -100, y: -100 })
  })
})
