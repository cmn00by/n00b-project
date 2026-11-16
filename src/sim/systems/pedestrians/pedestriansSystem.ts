// Le système des piétons : la foule de la ville.
// Expose : createPedestriansSystem().
// Pourquoi : il fait naître des piétons autour des joueurs, les fait marcher de case de trottoir en case de trottoir, et les fait remarquer puis fuir
// un joueur qui court vers eux. Il ne connaît aucun type de piéton par son nom : tout ce qui est propre à un type (vitesses, personnalité) vient de ses données
// (src/data/npcTypes), qu'il reçoit par le registre donné à createPedestriansSystem. Il lit les commandes des joueurs, jamais une autre brique.

import { SYSTEM_ORDER, TUNING, despawnEntity, findEntitiesWith } from '../../core'
import type { NpcTypeDef, Registry, System } from '../../core'
import { updatePedestrian } from './pedestrianStep'
import { despawnFarPedestrians, spawnPedestrians } from './population'
import { findPlayerPositions, findThreats } from './threats'

export function createPedestriansSystem(npcTypes: Registry<NpcTypeDef>): System {
  return {
    id: 'pedestrians',
    order: SYSTEM_ORDER.ai,
    step(world, dt) {
      const map = world.map
      if (map === undefined) return
      const tuning = TUNING.pedestrians

      const players = findPlayerPositions(world)
      despawnFarPedestrians(world, players, tuning)
      spawnPedestrians(world, npcTypes, players, map, tuning)

      const context = { world, map, tuning, threats: findThreats(world), dt }
      const pedestrians = findEntitiesWith(world, ['pedestrian', 'position'])
      for (const entity of pedestrians) {
        const type = npcTypes.find(entity.pedestrian.typeId)
        // Un type retiré des données (par exemple depuis le panneau admin) : ses piétons disparaissent au lieu de planter le jeu.
        if (type === undefined) {
          despawnEntity(world, entity.id)
          continue
        }
        updatePedestrian(context, entity, type, pedestrians)
      }
    },
  }
}
