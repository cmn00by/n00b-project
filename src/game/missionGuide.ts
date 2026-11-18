// Ce que le joueur doit voir de ses missions : les repères sur la carte et le panneau (titre, consigne, chrono).
// Expose : MissionPanel, MissionGuide, describeMissions(), formatSeconds().
// Pourquoi : une règle pure, testée sans navigateur, partagée par l'affichage des repères (render) et le panneau (hud). Elle lit l'état de la simulation
// (missionProgress) et les fiches des missions, elle ne modifie rien.

import { STEPS_PER_SECOND } from '../sim/core'
import type { MissionDef, MissionProgress, TileMap } from '../sim/core'
import { toPlaceMarker } from './placeMarker'
import type { PlaceMarker } from './placeMarker'

/** Le panneau de la mission en cours. */
export interface MissionPanel {
  title: string
  objectiveText: string
  /** Le rang de l'objectif (à partir de 1) et leur nombre. */
  objectiveNumber: number
  objectiveCount: number
  /** Le chrono le plus pressant (mission ou objectif), en secondes entières ; absent s'il n'y en a pas. */
  secondsLeft?: number
}

export interface MissionGuide {
  markers: PlaceMarker[]
  panel?: MissionPanel
}

/** Les repères et le panneau, d'après l'avancement du joueur. Sans mission en cours : les départs des missions encore à faire sur cette carte. */
export function describeMissions(progress: MissionProgress | undefined, missions: readonly MissionDef[], map: TileMap): MissionGuide {
  const active = progress?.active
  const def = active === undefined ? undefined : missions.find((mission) => mission.id === active.missionId)
  if (active === undefined || def === undefined) {
    const markers = missions
      .filter((mission) => mission.mapId === map.mapId && progress?.completedIds.includes(mission.id) !== true)
      .map((mission) => toPlaceMarker(`start:${mission.id}`, 'start', mission.start, map))
    return { markers }
  }

  const objective = def.objectives[active.objectiveIndex]
  if (objective === undefined) return { markers: [] }
  const stepsLeft = [active.stepsLeft, active.objectiveStepsLeft].filter((steps): steps is number => steps !== undefined)
  const panel: MissionPanel = {
    title: def.title,
    objectiveText: objective.text,
    objectiveNumber: active.objectiveIndex + 1,
    objectiveCount: def.objectives.length,
  }
  if (stepsLeft.length > 0) panel.secondsLeft = Math.ceil(Math.min(...stepsLeft) / STEPS_PER_SECOND)
  return { markers: [toPlaceMarker(`objective:${def.id}:${active.objectiveIndex}`, 'objective', objective.place, map)], panel }
}

/** Un chrono lisible : « 1:05 ». */
export function formatSeconds(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds))
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`
}
