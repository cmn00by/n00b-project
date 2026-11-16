// Les déplacements d'un piéton entre deux cases : avancer vers un point, et vers où il regarde.
// Expose : moveToward(), computeAngleOf(), computeHeadingToward().
// Pourquoi : cette partie ne dépend que de nombres, donc elle se teste dans Node. Pas de sin, cos, atan2 ni hypot : ils peuvent donner un résultat
// légèrement différent d'un navigateur à l'autre, ce qui casserait la coop. Seule Math.sqrt est identique partout.

import type { Heading } from './tiles'

/** Avance de `distance` px en ligne droite vers un point. Arrive pile dessus (arrived) sans le dépasser. */
export function moveToward(x: number, y: number, targetX: number, targetY: number, distance: number): { x: number; y: number; arrived: boolean } {
  const dx = targetX - x
  const dy = targetY - y
  const remaining = Math.sqrt(dx * dx + dy * dy)
  if (remaining <= distance) return { x: targetX, y: targetY, arrived: true }
  const scale = distance / remaining
  return { x: x + dx * scale, y: y + dy * scale, arrived: false }
}

/** L'angle (en radians) d'une direction de marche : 0 vers la droite, vers le bas π/2. Sans direction, 0. */
export function computeAngleOf(heading: Heading): number {
  if (heading.x > 0) return 0
  if (heading.x < 0) return Math.PI
  if (heading.y > 0) return Math.PI / 2
  if (heading.y < 0) return -Math.PI / 2
  return 0
}

/** La direction (un seul axe, le plus marqué) qui mène d'un point à un autre : celle vers laquelle un piéton se tourne pour regarder. */
export function computeHeadingToward(fromX: number, fromY: number, toX: number, toY: number): Heading {
  const dx = toX - fromX
  const dy = toY - fromY
  if (Math.abs(dx) >= Math.abs(dy)) return { x: dx < 0 ? -1 : 1, y: 0 }
  return { x: 0, y: dy < 0 ? -1 : 1 }
}
