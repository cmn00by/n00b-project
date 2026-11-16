// Le contrat d'une sorte d'objectif : à chaque pas, le moteur demande à l'objectif en cours s'il est rempli.
// Expose : ObjectiveContext, ObjectiveHandler.

import type { ActiveMission, EntityWith, MissionObjectiveDef, TileMap } from '../../../core'

/** Ce que voit un objectif : le joueur, sa mission en cours, la fiche de l'objectif et la carte. */
export interface ObjectiveContext<T extends MissionObjectiveDef = MissionObjectiveDef> {
  player: EntityWith<'position'>
  active: ActiveMission
  objective: T
  map: TileMap
}

/** Une sorte d'objectif. `tryComplete` renvoie true quand l'objectif est rempli, après avoir appliqué son effet (prendre ou livrer un objet…). */
export interface ObjectiveHandler<T extends MissionObjectiveDef = MissionObjectiveDef> {
  tryComplete(context: ObjectiveContext<T>): boolean
}
