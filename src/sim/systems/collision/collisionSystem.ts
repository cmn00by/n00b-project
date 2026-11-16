// Le système de collisions : empêche les entités de traverser les murs de la carte et les autres entités solides.
// Expose : collisionSystem.
// Pourquoi : il passe après tous les déplacements (marche, conduite, et plus tard piétons). Il ne sait pas qui a bougé ni pourquoi :
// il compare la position actuelle à la dernière position libre, et ramène l'entité au plus loin possible sans rien toucher.
// Il coupe aussi la vitesse sur l'axe bloqué et annonce le choc (entity:blocked) : dégâts, police ou sons pourront y réagir.
// Une brique qui déplace une entité n'a donc rien à faire pour respecter les obstacles.

import { SYSTEM_ORDER, findEntitiesWith, isSpaceClear } from '../../core'
import type { System } from '../../core'
import { resolveMove } from './resolveMove'

export const collisionSystem: System = {
  id: 'collision',
  order: SYSTEM_ORDER.collision,
  step(world) {
    for (const entity of findEntitiesWith(world, ['position', 'body'])) {
      const { position, body } = entity
      const ignoreIds = [entity.id]
      const isFreeAt = (x: number, y: number): boolean => isSpaceClear(world, x, y, body.width, body.height, ignoreIds)
      const lastFree = entity.lastFreePosition

      // Première fois qu'on voit l'entité : on retient sa position si elle est libre. Une entité apparue dans un obstacle
      // n'est pas bloquée (elle peut en sortir) : elle sera prise en charge dès qu'elle atteint une position libre.
      if (lastFree === undefined) {
        if (isFreeAt(position.x, position.y)) entity.lastFreePosition = { x: position.x, y: position.y }
        continue
      }

      const resolved = resolveMove(lastFree, position, isFreeAt)
      const isBlockedX = resolved.x !== position.x
      const isBlockedY = resolved.y !== position.y
      position.x = resolved.x
      position.y = resolved.y
      lastFree.x = resolved.x
      lastFree.y = resolved.y
      if (!isBlockedX && !isBlockedY) continue

      // La vitesse perdue dans le choc, puis plus de vitesse sur l'axe bloqué (sinon une voiture continuerait de « pousser » le mur).
      let lostX = 0
      let lostY = 0
      if (entity.velocity !== undefined) {
        if (isBlockedX) {
          lostX = entity.velocity.vx
          entity.velocity.vx = 0
        }
        if (isBlockedY) {
          lostY = entity.velocity.vy
          entity.velocity.vy = 0
        }
      }
      world.events.emit('entity:blocked', { entityId: entity.id, impactSpeed: Math.sqrt(lostX * lostX + lostY * lostY) })
    }
  },
}
