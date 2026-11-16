// Le moteur de missions : il lance les missions, suit leurs objectifs et leurs chronos, et dit si elles réussissent ou échouent.
// Expose : createMissionsSystem().
// Pourquoi : les missions sont des données (src/data/missions) que ce moteur lit sans en connaître aucune par son nom. Il reçoit leur registre
// à sa création, comme la brique pedestrians reçoit les types de PNJ. Il annonce ce qui se passe par des événements (mission:started, mission:succeeded…) :
// l'argent, la recherche ou les dialogues pourront s'y brancher sans le modifier. Les chronos se comptent en pas de simulation (déterministe).

import { SYSTEM_ORDER, STEPS_PER_SECOND, findCommands, findEntitiesWith } from '../../core'
import type { ActiveMission, EntityWith, MissionDef, MissionProgress, Registry, System, TileMap, World } from '../../core'
import { isInsidePlace, tryCompleteObjective } from './objectives'

type Player = EntityWith<'position'>

/** Un chrono en secondes devient un nombre de pas (arrondi au pas supérieur) ; absent reste absent. */
const toSteps = (seconds: number | undefined): number | undefined => (seconds === undefined ? undefined : Math.ceil(seconds * STEPS_PER_SECOND))

function progressOf(player: Player): MissionProgress {
  player.missionProgress ??= { completedIds: [] }
  return player.missionProgress
}

function startMission(world: World, player: Player, progress: MissionProgress, def: MissionDef) {
  progress.active = {
    missionId: def.id,
    objectiveIndex: 0,
    stepsLeft: toSteps(def.timeLimitSeconds),
    objectiveStepsLeft: toSteps(def.objectives[0]?.timeLimitSeconds),
    carriedItems: [],
  }
  progress.waitingToLeaveId = undefined
  world.events.emit('mission:started', { entityId: player.id, missionId: def.id })
}

function failMission(world: World, player: Player, progress: MissionProgress, active: ActiveMission, reason: 'time-out' | 'abandoned') {
  progress.active = undefined
  // S'il est encore sur le départ, la mission ne repart pas aussitôt : il doit d'abord en sortir.
  progress.waitingToLeaveId = active.missionId
  world.events.emit('mission:failed', { entityId: player.id, missionId: active.missionId, reason })
}

/** Fait avancer la mission en cours d'un pas : chronos, puis objectif en cours (chaque sorte d'objectif est dans objectives/). */
function advanceMission(world: World, map: TileMap, player: Player, progress: MissionProgress, active: ActiveMission, def: MissionDef) {
  if (active.stepsLeft !== undefined) active.stepsLeft -= 1
  if (active.objectiveStepsLeft !== undefined) active.objectiveStepsLeft -= 1
  if ((active.stepsLeft ?? 1) <= 0 || (active.objectiveStepsLeft ?? 1) <= 0) {
    failMission(world, player, progress, active, 'time-out')
    return
  }

  const objective = def.objectives[active.objectiveIndex]
  if (objective === undefined || !tryCompleteObjective({ player, active, objective, map })) return
  world.events.emit('mission:objective-completed', { entityId: player.id, missionId: def.id, objectiveIndex: active.objectiveIndex })

  active.objectiveIndex += 1
  const next = def.objectives[active.objectiveIndex]
  if (next !== undefined) {
    active.objectiveStepsLeft = toSteps(next.timeLimitSeconds)
    return
  }
  progress.active = undefined
  progress.completedIds.push(def.id)
  world.events.emit('mission:succeeded', { entityId: player.id, missionId: def.id, money: def.reward.money })
}

export function createMissionsSystem(missions: Registry<MissionDef>): System {
  return {
    id: 'missions',
    order: SYSTEM_ORDER.rules,
    step(world) {
      const map = world.map
      if (map === undefined) return
      const offered = missions.all.filter((def) => def.mapId === map.mapId)

      for (const player of findEntitiesWith(world, ['position'])) {
        if (player.kind !== 'player') continue
        const progress = progressOf(player)

        for (const command of findCommands(world.commands, 'mission:abandon')) {
          if (command.entityId === player.id && progress.active !== undefined) failMission(world, player, progress, progress.active, 'abandoned')
        }
        for (const command of findCommands(world.commands, 'mission:start')) {
          const def = missions.find(command.missionId)
          if (command.entityId === player.id && progress.active === undefined && def !== undefined) startMission(world, player, progress, def)
        }

        const active = progress.active
        if (active !== undefined) {
          const def = missions.find(active.missionId)
          // Une mission retirée des données pendant la partie s'arrête sans planter le jeu.
          if (def === undefined) progress.active = undefined
          else advanceMission(world, map, player, progress, active, def)
          continue
        }

        // Pas de mission en cours : le joueur en lance une en entrant sur son point de départ.
        const { x, y } = player.position
        if (progress.waitingToLeaveId !== undefined) {
          const waiting = missions.find(progress.waitingToLeaveId)
          if (waiting === undefined || !isInsidePlace(x, y, waiting.start, map)) progress.waitingToLeaveId = undefined
        }
        const toStart = offered.find((def) => !progress.completedIds.includes(def.id) && def.id !== progress.waitingToLeaveId && isInsidePlace(x, y, def.start, map))
        if (toStart !== undefined) startMission(world, player, progress, toStart)
      }
    },
  }
}
