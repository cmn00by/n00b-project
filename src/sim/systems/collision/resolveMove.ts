// Le calcul d'un déplacement qui respecte les murs.
// Expose : resolveMove().
// Pourquoi : quand une entité entre dans un mur, on ne l'arrête pas net : on garde la partie du déplacement qui est possible,
// axe par axe. Ainsi le joueur qui marche en diagonale contre un mur glisse le long du mur au lieu de rester collé.

import { isAreaFree } from '../../core'
import type { TileMap } from '../../core'

/** Une position, en pixels. */
export interface Point {
  x: number
  y: number
}

/** Une taille de rectangle, en pixels. */
export interface Size {
  width: number
  height: number
}

/**
 * La position finale d'un rectangle qui voulait aller de `from` (une position libre) à `to`.
 * Si `to` est libre, on y va. Sinon on avance axe par axe (horizontal puis vertical) jusqu'au contact du mur :
 * pas de vide entre l'entité et le mur, et on glisse le long du mur quand on y arrive en diagonale.
 * Valable tant qu'un déplacement fait moins d'une case par pas (sinon on pourrait sauter un mur fin).
 */
export function resolveMove(map: TileMap, from: Point, to: Point, size: Size): Point {
  if (isAreaFree(map, to.x, to.y, size.width, size.height)) return { x: to.x, y: to.y }
  const x = advanceAxis(from.x, to.x, (candidate) => isAreaFree(map, candidate, from.y, size.width, size.height))
  const y = advanceAxis(from.y, to.y, (candidate) => isAreaFree(map, x, candidate, size.width, size.height))
  return { x, y }
}

/** Avance de `from` vers `to` sur un axe, pixel par pixel, tant que la place est libre ; renvoie la dernière valeur libre. */
function advanceAxis(from: number, to: number, isFree: (value: number) => boolean): number {
  if (isFree(to)) return to
  const direction = Math.sign(to - from)
  let reached = from
  for (let distance = 1; distance < Math.abs(to - from); distance++) {
    const candidate = from + direction * distance
    if (!isFree(candidate)) break
    reached = candidate
  }
  return reached
}
