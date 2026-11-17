import { describe, expect, it } from 'vitest'
import { TUNING, createRegistry, createTestWorld, loadMap, spawnEntity, spawnVehicleEntity } from '../sim/core'
import type { DealershipDef, EntityWith, GarageDef, TileMap, VehicleDef, VehiclePartDef, WorkshopDef } from '../sim/core'
import { describeShops } from './shopGuide'

const TILE = 32
const MAP: TileMap = { mapId: 'test', width: 20, height: 6, tileSize: TILE, tileKindIds: Array<string>(120).fill('road'), solid: Array<boolean>(120).fill(false) }
const CAR: VehicleDef = { id: 'auto', name: 'Auto', width: 26, length: 46, maxSpeed: 200, maxReverseSpeed: 60, acceleration: 100, braking: 200, turnRate: 2, grip: 6, handbrakeGrip: 1 }
const DEALERSHIP: DealershipDef = {
  id: 'concession',
  name: 'Concession',
  mapId: 'test',
  place: { tileX: 2, tileY: 1 },
  delivery: { tileX: 2, tileY: 4, facing: 'right' },
  offers: [{ modelId: 'auto', price: 100 }],
}
const GARAGE: GarageDef = { id: 'garage', name: 'Garage', mapId: 'test', place: { tileX: 15, tileY: 1 }, parking: { tileX: 15, tileY: 4, facing: 'right' } }
const WORKSHOP: WorkshopDef = { id: 'atelier', name: 'Atelier', mapId: 'test', place: { tileX: 8, tileY: 4 } }
const PARTS: VehiclePartDef[] = [
  { id: 'rose', name: 'Rose', slot: 'paint', price: 60, color: '#ff6fa8' },
  { id: 'or', name: 'Or', slot: 'paint', price: 900, color: '#ffd23f' },
]
const CONTENT = {
  vehicles: createRegistry('Véhicule', [CAR]),
  dealerships: createRegistry('Concession', [DEALERSHIP]),
  garages: createRegistry('Garage', [GARAGE]),
  workshops: createRegistry('Atelier', [WORKSHOP]),
  parts: createRegistry('Pièce', PARTS),
}
const center = (tile: number) => (tile + 0.5) * TILE

function scene(tileX: number, money = 300) {
  const world = createTestWorld()
  loadMap(world, MAP)
  const player = spawnEntity(world, 'player', { position: { x: center(tileX), y: center(1), angle: 0 }, wallet: { money } }) as EntityWith<'position'>
  return { world, player }
}

describe('describeShops', () => {
  it('montre toujours les repères de la concession et du garage, sans panneau loin d’eux', () => {
    const { world, player } = scene(8)
    const guide = describeShops(world, player, CONTENT)
    expect(guide.markers.map((marker) => marker.kind)).toEqual(['workshop', 'dealership', 'garage'])
    expect(guide.panel).toBeUndefined()
  })

  it('à la concession : un choix par modèle, qui envoie l’achat ; grisé quand c’est trop cher', () => {
    const rich = scene(2)
    expect(describeShops(rich.world, rich.player, CONTENT).panel?.choices).toEqual([
      { label: 'Auto', detail: '100 €', command: { type: 'dealership:buy', entityId: rich.player.id, dealershipId: 'concession', modelId: 'auto' } },
    ])
    const poor = scene(2, 50)
    expect(describeShops(poor.world, poor.player, CONTENT).panel?.choices).toEqual([{ label: 'Auto', detail: '100 € (trop cher)', command: undefined }])
  })

  it('au garage : ranger le véhicule garé devant, et sortir ceux qui sont rangés', () => {
    const { world, player } = scene(15)
    spawnVehicleEntity(world, CAR, center(15), center(4), 'right')
    player.vehicleCollection = { nextKey: 3, vehicles: [{ key: 2, modelId: 'auto', storedIn: 'garage' }] }
    const panel = describeShops(world, player, CONTENT).panel
    expect(panel?.hint).toContain(`1/${TUNING.garage.capacity}`)
    expect(panel?.choices).toEqual([
      { label: 'Ranger Auto', detail: 'volée : elle sera à toi', command: { type: 'garage:store', entityId: player.id, garageId: 'garage' } },
      { label: 'Sortir Auto', detail: 'rangée ici', command: { type: 'garage:take-out', entityId: player.id, garageId: 'garage', vehicleKey: 2 } },
    ])
  })

  it('pas de panneau de concession au volant', () => {
    const { world, player } = scene(2)
    player.driver = { vehicleId: 9, storedBody: { width: 24, height: 24, isSolid: true } }
    expect(describeShops(world, player, CONTENT).panel).toBeUndefined()
  })
})

describe('describeShops : l’atelier', () => {
  function inWorkshop() {
    const { world, player } = scene(8)
    player.position.y = center(4)
    const car = spawnVehicleEntity(world, CAR, center(8), center(4), 'right')
    player.driver = { vehicleId: car.id, storedBody: { width: 24, height: 24, isSolid: true } }
    return { world, player, car }
  }

  it('au volant dans l’atelier : un choix par emplacement, et la voiture en vitrine', () => {
    const { world, player, car } = inWorkshop()
    const guide = describeShops(world, player, CONTENT)
    expect(guide.panel?.choices).toHaveLength(9)
    expect(guide.panel?.choices[0]).toEqual({ label: 'Peinture', detail: 'd’origine', uiAction: { kind: 'open-slot', slot: 'paint' } })
    expect(guide.showcase).toEqual({ vehicleId: car.id, preview: undefined })
  })

  it('dans un emplacement : un appui pour essayer, un second pour acheter, et Retour', () => {
    const { world, player } = inWorkshop()
    const opened = describeShops(world, player, CONTENT, { slot: 'paint' }).panel?.choices
    expect(opened?.[0]).toEqual({ label: 'Rose', detail: '60 € · essayer', uiAction: { kind: 'preview', partId: 'rose' } })
    expect(opened?.at(-1)?.uiAction).toEqual({ kind: 'back' })
    const tried = describeShops(world, player, CONTENT, { slot: 'paint', previewPartId: 'rose' })
    expect(tried.panel?.choices[0]?.command).toEqual({ type: 'workshop:install', entityId: player.id, workshopId: 'atelier', partId: 'rose' })
    expect(tried.showcase?.preview).toEqual({ paint: 'rose' })
  })

  it('une pièce trop chère s’essaie, mais ne s’achète pas', () => {
    const { world, player } = inWorkshop()
    const tried = describeShops(world, player, CONTENT, { slot: 'paint', previewPartId: 'or' }).panel?.choices[1]
    expect(tried).toEqual({ label: 'Or', detail: '900 € (trop cher)', command: undefined })
  })

  it('propose de remettre d’origine un emplacement équipé', () => {
    const { world, player, car } = inWorkshop()
    car.vehicle!.customization = { paint: 'rose' }
    const choices = describeShops(world, player, CONTENT, { slot: 'paint' }).panel?.choices
    expect(choices?.[0]).toEqual({ label: 'Rose', detail: 'installée' })
    expect(choices?.[2]?.command).toEqual({ type: 'workshop:remove', entityId: player.id, workshopId: 'atelier', slot: 'paint' })
  })
})
