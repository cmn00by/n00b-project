import { describe, expect, it } from 'vitest'
import { STEPS_PER_SECOND } from '../sim/core'
import type { MissionDef, TileMap } from '../sim/core'
import { describeMissions, formatSeconds } from './missionGuide'

const MAP: TileMap = { mapId: 'test', width: 10, height: 2, tileSize: 32, tileKindIds: [], solid: [] }
const MISSION: MissionDef = {
  id: 'colis',
  title: 'Le colis',
  briefing: '…',
  mapId: 'test',
  start: { tileX: 1, tileY: 0 },
  timeLimitSeconds: 60,
  reward: { money: 10 },
  objectives: [
    { type: 'pickup', text: 'Prends le colis', item: 'colis', place: { tileX: 4, tileY: 1, radiusTiles: 2 } },
    { type: 'deliver', text: 'Livre-le', item: 'colis', place: { tileX: 8, tileY: 1 } },
  ],
}

describe('describeMissions', () => {
  it('montre les départs des missions à faire, sans panneau', () => {
    expect(describeMissions(undefined, [MISSION], MAP)).toEqual({ markers: [{ key: 'start:colis', kind: 'start', x: 48, y: 16, radius: 32 }] })
  })

  it('ne montre plus une mission réussie, ni celle d’une autre carte', () => {
    expect(describeMissions({ completedIds: ['colis'] }, [MISSION], MAP).markers).toEqual([])
    expect(describeMissions(undefined, [{ ...MISSION, mapId: 'ailleurs' }], MAP).markers).toEqual([])
  })

  it('pendant la mission : un seul repère, sur l’objectif en cours, et le panneau avec le chrono le plus pressant', () => {
    const guide = describeMissions(
      { completedIds: [], active: { missionId: 'colis', objectiveIndex: 0, stepsLeft: 40 * STEPS_PER_SECOND, objectiveStepsLeft: 10.5 * STEPS_PER_SECOND, carriedItems: [] } },
      [MISSION],
      MAP,
    )
    expect(guide.markers).toEqual([{ key: 'objective:colis:0', kind: 'objective', x: 144, y: 48, radius: 64 }])
    expect(guide.panel).toEqual({ title: 'Le colis', objectiveText: 'Prends le colis', objectiveNumber: 1, objectiveCount: 2, secondsLeft: 11 })
  })

  it('n’affiche pas de chrono quand la mission n’en a pas', () => {
    const guide = describeMissions({ completedIds: [], active: { missionId: 'colis', objectiveIndex: 1, carriedItems: ['colis'] } }, [MISSION], MAP)
    expect(guide.panel?.secondsLeft).toBeUndefined()
    expect(guide.panel?.objectiveNumber).toBe(2)
  })
})

describe('formatSeconds', () => {
  it('écrit minutes et secondes', () => {
    expect(formatSeconds(65)).toBe('1:05')
    expect(formatSeconds(9)).toBe('0:09')
    expect(formatSeconds(-3)).toBe('0:00')
  })
})
