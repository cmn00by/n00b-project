// Les déplacements de piéton case par case : où aller ensuite, où fuir, où naître.
// Expose : isWalkableTile(), getTileAt(), chooseNextTile(), chooseFleeTile(), chooseSpawnTile().
// Pourquoi : pas de calcul de chemin : un piéton avance de case de trottoir en case voisine, tout droit la plupart du temps, en tournant de temps en temps.
// Il ne quitte jamais les types de case où il peut marcher (TUNING.pedestrians.walkableTileKinds). Tout le hasard passe par Rng.

import { getTileCenter, isSolidTile } from '../../core'
import type { Rng, TileCoords, TileMap } from '../../core'
import type { PedestrianTuning } from './tuning'

/** Une direction de marche, en cases : un seul axe à la fois (-1, 0 ou 1). */
export interface Heading {
  x: number
  y: number
}

/** La case où le piéton va, et la direction dans laquelle il y va. */
export interface TileStep extends TileCoords {
  heading: Heading
}

const DIRECTIONS: readonly Heading[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
]

/** Si un piéton peut marcher sur cette case : dans la carte, qui ne bloque pas, et d'un type de case autorisé. */
export function isWalkableTile(map: TileMap, tileX: number, tileY: number, tuning: PedestrianTuning): boolean {
  if (isSolidTile(map, tileX, tileY)) return false
  const kindId = map.tileKindIds[tileY * map.width + tileX]
  return kindId !== undefined && tuning.walkableTileKinds.includes(kindId)
}

/** La case qui contient un point, en pixels. */
export function getTileAt(map: TileMap, x: number, y: number): TileCoords {
  return { tileX: Math.floor(x / map.tileSize), tileY: Math.floor(y / map.tileSize) }
}

function findWalkableNeighbours(map: TileMap, tile: TileCoords, tuning: PedestrianTuning): TileStep[] {
  return DIRECTIONS.filter((direction) => isWalkableTile(map, tile.tileX + direction.x, tile.tileY + direction.y, tuning)).map((direction) => ({
    tileX: tile.tileX + direction.x,
    tileY: tile.tileY + direction.y,
    heading: direction,
  }))
}

/**
 * La prochaine case d'un piéton qui se promène : tout droit la plupart du temps, en tournant de temps en temps (turnChance),
 * jamais en faisant demi-tour sauf au bout d'une impasse. Renvoie undefined si aucune case voisine n'est praticable (il reste sur place).
 */
export function chooseNextTile(map: TileMap, tile: TileCoords, heading: Heading, rng: Rng, tuning: PedestrianTuning): TileStep | undefined {
  const neighbours = findWalkableNeighbours(map, tile, tuning)
  if (neighbours.length === 0) return undefined

  const isStraight = (step: TileStep): boolean => step.heading.x === heading.x && step.heading.y === heading.y
  const isReverse = (step: TileStep): boolean => step.heading.x === -heading.x && step.heading.y === -heading.y
  const straight = neighbours.find(isStraight)
  const sideSteps = neighbours.filter((step) => !isStraight(step) && !isReverse(step))
  const reverse = neighbours.find(isReverse)

  if (straight !== undefined && (sideSteps.length === 0 || !rng.rollChance(tuning.turnChance))) return straight
  if (sideSteps.length > 0) return rng.pickOne(sideSteps)
  // Ni tout droit ni sur les côtés : une impasse, il fait demi-tour. (Sans direction encore, tous les voisins sont des côtés.)
  return reverse
}

/** La case voisine qui l'éloigne le plus de ce qui lui fait peur (au hasard entre celles à égalité). Undefined si coincé. */
export function chooseFleeTile(map: TileMap, tile: TileCoords, threat: { x: number; y: number }, rng: Rng, tuning: PedestrianTuning): TileStep | undefined {
  const neighbours = findWalkableNeighbours(map, tile, tuning)
  if (neighbours.length === 0) return undefined
  const squaredDistance = (step: TileStep): number => {
    const center = getTileCenter(map, step)
    return (center.x - threat.x) ** 2 + (center.y - threat.y) ** 2
  }
  const farthest = Math.max(...neighbours.map(squaredDistance))
  return rng.pickOne(neighbours.filter((step) => squaredDistance(step) === farthest))
}

/** La case voisine qui le rapproche le plus de ce qui l'intrigue (au hasard entre celles à égalité). Undefined si coincé ou si aucune case ne le rapproche. */
export function chooseApproachTile(map: TileMap, tile: TileCoords, target: { x: number; y: number }, rng: Rng, tuning: PedestrianTuning): TileStep | undefined {
  const neighbours = findWalkableNeighbours(map, tile, tuning)
  const squaredDistanceTo = (center: { x: number; y: number }): number => (center.x - target.x) ** 2 + (center.y - target.y) ** 2
  const squaredDistance = (step: TileStep): number => squaredDistanceTo(getTileCenter(map, step))
  const closest = Math.min(...neighbours.map(squaredDistance))
  // Si aucune case voisine ne le rapproche, il reste où il est : il n'est pas utile de s'éloigner pour être « curieux ».
  if (neighbours.length === 0 || closest >= squaredDistanceTo(getTileCenter(map, tile))) return undefined
  return rng.pickOne(neighbours.filter((step) => squaredDistance(step) === closest))
}

/**
 * Une case où faire naître un piéton : un trottoir à la bonne distance du joueur (hors de l'écran, mais pas trop loin),
 * assez loin des piétons déjà là. Tire quelques endroits au hasard ; undefined si aucun ne convient (on réessayera plus tard).
 */
export function chooseSpawnTile(map: TileMap, player: { x: number; y: number }, takenPositions: readonly { x: number; y: number }[], rng: Rng, tuning: PedestrianTuning): TileCoords | undefined {
  for (let attempt = 0; attempt < tuning.spawnTries; attempt++) {
    const tile = { tileX: rng.nextInt(0, map.width - 1), tileY: rng.nextInt(0, map.height - 1) }
    if (!isWalkableTile(map, tile.tileX, tile.tileY, tuning)) continue
    const center = getTileCenter(map, tile)
    const distance = Math.sqrt((center.x - player.x) ** 2 + (center.y - player.y) ** 2)
    if (distance < tuning.spawnMinDistance || distance > tuning.spawnMaxDistance) continue
    const isCrowded = takenPositions.some((other) => Math.sqrt((center.x - other.x) ** 2 + (center.y - other.y) ** 2) < tuning.minSeparation)
    if (!isCrowded) return tile
  }
  return undefined
}
