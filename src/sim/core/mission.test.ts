import { describe, expect, it } from 'vitest'
import { validateMissionDef, validateMissionPlaces } from './mission'
import type { MissionDef } from './mission'
import type { TileMap } from './map'

const VALID: MissionDef = {
  id: 'essai',
  title: 'Essai',
  briefing: 'Pour les tests.',
  mapId: 'test',
  start: { tileX: 0, tileY: 0 },
  reward: { money: 10 },
  objectives: [
    { type: 'pickup', text: 'Prends', item: 'colis', place: { tileX: 1, tileY: 0 } },
    { type: 'deliver', text: 'Livre', item: 'colis', place: { tileX: 2, tileY: 0 } },
  ],
}

const MAP: TileMap = { mapId: 'test', width: 3, height: 2, tileSize: 32, tileKindIds: ['road', 'road', 'road', 'building', 'road', 'road'], solid: [false, false, false, true, false, false] }

describe('validateMissionDef', () => {
  it('accepte une mission bien écrite', () => {
    expect(validateMissionDef(VALID)).toEqual([])
  })

  it('refuse de livrer un objet jamais ramassé', () => {
    const errors = validateMissionDef({ ...VALID, objectives: [{ type: 'deliver', text: 'Livre', item: 'pizza', place: { tileX: 2, tileY: 0 } }] })
    expect(errors).toEqual(["objectif 1 : livre 'pizza' sans l'avoir ramassé avant"])
  })

  it('refuse une mission sans objectif, un chrono négatif ou une récompense négative', () => {
    const errors = validateMissionDef({ ...VALID, objectives: [], timeLimitSeconds: -5, reward: { money: -1 } })
    expect(errors).toHaveLength(3)
  })
})

describe('validateMissionPlaces', () => {
  it('accepte des lieux libres dans la carte', () => {
    expect(validateMissionPlaces(VALID, MAP)).toEqual([])
  })

  it('signale un lieu hors de la carte ou sur un obstacle', () => {
    const errors = validateMissionPlaces({ ...VALID, start: { tileX: 0, tileY: 1 }, objectives: [{ type: 'reach', text: 'Va', place: { tileX: 9, tileY: 0 } }] }, MAP)
    expect(errors).toEqual(['départ : la case (0, 1) est un obstacle', 'objectif 1 : la case (9, 0) est hors de la carte'])
  })
})
