// Ce qui fait peur aux piétons, et où sont les joueurs.
// Expose : findThreats(), findPlayerPositions().
// Pourquoi : la brique lit les COMMANDES des joueurs (déjà dans world.commands, côté noyau) au lieu de dépendre de la brique de marche.
// La vitesse d'un joueur qui avance vient de sa commande (course ou marche). Une voiture fournit la sienne par son composant velocity (posé par la brique driving) :
// un véhicule lancé vers un piéton lui fait peur comme un joueur qui court, sans que la brique pedestrians connaisse la conduite.

import { TUNING, findCommands, findEntitiesWith } from '../../core'
import type { CommandOf, EntityId, World } from '../../core'
import type { Threat } from './reaction'

/** Les positions de tous les joueurs : le point de repère de la foule (autour d'eux elle naît et disparaît). */
export function findPlayerPositions(world: World): { x: number; y: number }[] {
  return findEntitiesWith(world, ['position'])
    .filter((entity) => entity.kind === 'player')
    .map((entity) => ({ x: entity.position.x, y: entity.position.y }))
}

/** Les joueurs qui avancent ce pas-ci : ce sont eux qui peuvent faire peur. Un joueur immobile ne fait peur à personne. */
export function findThreats(world: World): Threat[] {
  // Une seule commande compte par joueur et par pas : la dernière.
  const lastMoveByEntityId = new Map<EntityId, CommandOf<'player:move'>>()
  for (const command of findCommands(world.commands, 'player:move')) lastMoveByEntityId.set(command.entityId, command)

  const threats: Threat[] = []
  for (const player of findEntitiesWith(world, ['position'])) {
    if (player.kind !== 'player') continue
    const move = lastMoveByEntityId.get(player.id)
    if (move === undefined || (move.directionX === 0 && move.directionY === 0)) continue
    const speed = move.isRunning ? TUNING.walking.runSpeed : TUNING.walking.walkSpeed
    threats.push({ x: player.position.x, y: player.position.y, directionX: move.directionX, directionY: move.directionY, speed })
  }
  // Les véhicules en mouvement : leur direction et leur vitesse sont celles de leur déplacement. Une voiture à l'arrêt ne fait peur à personne.
  for (const vehicle of findEntitiesWith(world, ['position', 'velocity', 'vehicle'])) {
    const speed = Math.sqrt(vehicle.velocity.vx ** 2 + vehicle.velocity.vy ** 2)
    if (speed === 0) continue
    threats.push({ x: vehicle.position.x, y: vehicle.position.y, directionX: vehicle.velocity.vx, directionY: vehicle.velocity.vy, speed })
  }
  return threats
}
