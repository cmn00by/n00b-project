// Le système de déplacement à pied : déplace le joueur selon ses commandes.
// Expose : walkingSystem.
// Pourquoi : c'est la première brique du jeu, écrite comme exemple pour toutes les suivantes. Elle ne connaît
// ni le clavier (elle lit des commandes), ni l'affichage, ni aucun autre système. Les collisions viendront dans une autre brique.

import { SYSTEM_ORDER, findCommands, findEntity } from '../../core'
import type { CommandOf, EntityId, System } from '../../core'
import { computeWalkOffset } from './walkMovement'

export const walkingSystem: System = {
  id: 'walking',
  order: SYSTEM_ORDER.physics,
  step(world, dt) {
    // Une seule commande compte par entité et par pas (la dernière) : envoyer deux fois la même demande ne doit pas doubler la vitesse.
    const lastCommandByEntityId = new Map<EntityId, CommandOf<'player:move'>>()
    for (const command of findCommands(world.commands, 'player:move')) lastCommandByEntityId.set(command.entityId, command)

    for (const [entityId, command] of lastCommandByEntityId) {
      const entity = findEntity(world, entityId)
      if (entity?.position === undefined) continue
      const { dx, dy } = computeWalkOffset(command, dt)
      entity.position.x += dx
      entity.position.y += dy
    }
  },
}
