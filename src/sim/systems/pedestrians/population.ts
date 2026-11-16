// La population : faire naître des piétons autour des joueurs et les retirer quand ils sont loin.
// Expose : despawnFarPedestrians(), spawnPedestrians().
// Pourquoi : pas de PNJ simulés partout, seulement autour des joueurs. Un piéton naît hors de l'écran sur un trottoir et disparaît une fois loin.
// À l'ouverture d'une partie la ville est déjà peuplée ; ensuite un piéton de plus naît à intervalle régulier, jusqu'au maximum.

import { despawnEntity, findEntitiesWith, getTileCenter, spawnEntity } from '../../core'
import type { NpcTypeDef, Registry, TileMap, World } from '../../core'
import { computeAngleOf } from './movement'
import { createPedestrian } from './personality'
import { secondsToSteps } from './stepTime'
import { chooseNextTile, chooseSpawnTile } from './tiles'
import type { TileStep } from './tiles'
import type { PedestrianTuning } from './tuning'

type Point = { x: number; y: number }

function distanceBetween(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

/** Retire les piétons trop loin de tous les joueurs. Sans joueur, personne n'est retiré : on n'a plus de repère. */
export function despawnFarPedestrians(world: World, players: readonly Point[], tuning: PedestrianTuning): void {
  if (players.length === 0) return
  for (const pedestrian of findEntitiesWith(world, ['pedestrian', 'position'])) {
    const nearest = Math.min(...players.map((player) => distanceBetween(player, pedestrian.position)))
    if (nearest > tuning.despawnDistance) despawnEntity(world, pedestrian.id)
  }
}

/** Fait naître des piétons si la ville n'est pas pleine : tous d'un coup au tout premier pas, puis au plus un par intervalle. */
export function spawnPedestrians(world: World, npcTypes: Registry<NpcTypeDef>, players: readonly Point[], map: TileMap, tuning: PedestrianTuning): void {
  if (players.length === 0 || npcTypes.all.length === 0) return
  const isFirstStep = world.stepCount === 0
  const isSpawnStep = world.stepCount % secondsToSteps(tuning.spawnIntervalSeconds) === 0
  if (!isFirstStep && !isSpawnStep) return

  const taken: Point[] = findEntitiesWith(world, ['pedestrian', 'position']).map((pedestrian) => pedestrian.position)
  const attempts = isFirstStep ? tuning.maxCount : 1
  for (let attempt = 0; attempt < attempts && taken.length < tuning.maxCount; attempt++) {
    const tile = chooseSpawnTile(map, world.rng.pickOne(players), taken, world.rng, tuning)
    if (tile === undefined) continue
    taken.push(spawnPedestrian(world, world.rng.pickOne(npcTypes.all), tile, map, tuning))
  }
}

/** Crée un piéton sur une case et lui choisit sa première case à viser. Renvoie sa position. */
function spawnPedestrian(world: World, type: NpcTypeDef, tile: { tileX: number; tileY: number }, map: TileMap, tuning: PedestrianTuning): Point {
  const center = getTileCenter(map, tile)
  const pedestrian = createPedestrian(type, world.rng)
  const first: TileStep | undefined = chooseNextTile(map, tile, pedestrian.heading, world.rng, tuning)
  if (first !== undefined) {
    pedestrian.targetTile = { tileX: first.tileX, tileY: first.tileY }
    pedestrian.heading = first.heading
  }
  spawnEntity(world, 'pedestrian', {
    position: { x: center.x, y: center.y, angle: computeAngleOf(pedestrian.heading) },
    body: { width: tuning.bodySize, height: tuning.bodySize, isSolid: false },
    pedestrian,
  })
  return center
}
