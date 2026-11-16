// L'espace libre : un endroit est-il libre de murs ET d'entités solides ?
// Expose : isSpaceClear(), findSolidOverlaps().
// Pourquoi : la carte seule (isAreaFree) ne connaît que les murs. Pour poser un joueur qui descend de voiture, ou empêcher deux voitures
// de se traverser, il faut aussi tenir compte des entités qui ont un corps solide. Toutes les briques posent la même question ici.

import { findEntitiesWith } from './entities'
import type { EntityId } from './components'
import { isAreaFree } from './map'
import type { World } from './world'

/** Les entités solides dont le corps chevauche le rectangle centré sur (centerX, centerY), sauf celles listées dans `ignoreIds`. */
export function findSolidOverlaps(world: World, centerX: number, centerY: number, width: number, height: number, ignoreIds: readonly EntityId[] = []): EntityId[] {
  const overlaps: EntityId[] = []
  for (const other of findEntitiesWith(world, ['position', 'body'])) {
    if (!other.body.isSolid || ignoreIds.includes(other.id)) continue
    // Toucher pile le bord de l'autre ne compte pas : on peut se coller à une voiture.
    const isOverlapping = Math.abs(other.position.x - centerX) * 2 < other.body.width + width && Math.abs(other.position.y - centerY) * 2 < other.body.height + height
    if (isOverlapping) overlaps.push(other.id)
  }
  return overlaps
}

/** Si le rectangle ne touche ni un mur de la carte (s'il y en a une), ni une entité solide (sauf `ignoreIds`). */
export function isSpaceClear(world: World, centerX: number, centerY: number, width: number, height: number, ignoreIds: readonly EntityId[] = []): boolean {
  if (world.map !== undefined && !isAreaFree(world.map, centerX, centerY, width, height)) return false
  return findSolidOverlaps(world, centerX, centerY, width, height, ignoreIds).length === 0
}
