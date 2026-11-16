// Le système de collisions : empêche les entités de traverser les murs de la carte.
// Expose : collisionSystem.
// Pourquoi : il passe après tous les déplacements (marche, et plus tard conduite et piétons). Il ne sait pas qui a bougé ni pourquoi :
// il compare la position actuelle à la dernière position libre, et ramène l'entité au plus loin possible sans toucher un mur.
// Une brique qui déplace une entité n'a donc rien à faire pour respecter les murs.

import { SYSTEM_ORDER, findEntitiesWith, isAreaFree } from '../../core'
import type { System } from '../../core'
import { resolveMove } from './resolveMove'

export const collisionSystem: System = {
  id: 'collision',
  order: SYSTEM_ORDER.collision,
  step(world) {
    const map = world.map
    if (map === undefined) return

    for (const entity of findEntitiesWith(world, ['position', 'body'])) {
      const { position, body } = entity
      const lastFree = entity.lastFreePosition

      // Première fois qu'on voit l'entité : on retient sa position si elle est libre. Une entité apparue dans un mur
      // n'est pas bloquée (elle peut en sortir) : elle sera prise en charge dès qu'elle atteint une position libre.
      if (lastFree === undefined) {
        if (isAreaFree(map, position.x, position.y, body.width, body.height)) entity.lastFreePosition = { x: position.x, y: position.y }
        continue
      }

      const resolved = resolveMove(map, lastFree, position, body)
      position.x = resolved.x
      position.y = resolved.y
      lastFree.x = resolved.x
      lastFree.y = resolved.y
    }
  },
}
