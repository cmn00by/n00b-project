// Le monde : l'état complet du jeu à un instant donné.
// Expose : World, createWorld(), createTestWorld(), loadMap(), TEST_SEED.
// Pourquoi : tout l'état de la partie vit ici et nulle part ailleurs (pas de variable globale). Ainsi on peut
// le sauvegarder, le rejouer à partir d'une graine, et le faire tourner dans Node ou sur un serveur pour la coop.

import type { Command } from './commands'
import type { Entity, EntityId } from './components'
import { createEventBus } from './events'
import type { TileMap } from './map'
import type { EventBus, GameEvents } from './events'
import { createRng } from './rng'
import type { Rng } from './rng'

/** L'état complet de la partie. */
export interface World {
  /** La graine de départ : avec les mêmes commandes, elle redonne la même partie. */
  seed: number
  /** Le hasard de la simulation : jamais Math.random(). */
  rng: Rng
  /** Le bus d'événements : c'est par lui que les systèmes se parlent. Ce n'est pas de l'état à sauvegarder. */
  events: EventBus<GameEvents>
  /** Les commandes des joueurs pour le pas en cours : remplies par la simulation pendant un pas, vides entre deux pas. */
  commands: readonly Command[]
  /** Le nombre de pas de simulation écoulés depuis le début : c'est la seule horloge de la simulation. */
  stepCount: number
  /** Les entités par id. Un dictionnaire (et non une Map) pour se sauvegarder tel quel ; les ids croissent, l'ordre est donc stable. */
  entities: Record<EntityId, Entity>
  /** L'id que recevra la prochaine entité. Un id n'est jamais réutilisé, même après la disparition d'une entité. */
  nextEntityId: EntityId
  /** La carte de la ville, si une carte est chargée (voir loadMap). Facultative : un monde de test peut s'en passer. */
  map?: TileMap
}

/** Crée un monde vide à partir d'une graine. */
export function createWorld(seed: number): World {
  return {
    seed,
    rng: createRng(seed),
    events: createEventBus<GameEvents>(),
    commands: [],
    stepCount: 0,
    entities: {},
    nextEntityId: 1,
  }
}

/** La graine fixe des tests : les mondes de test sont toujours identiques. */
export const TEST_SEED = 1234

/** Crée un petit monde de test, avec une graine fixe, pour que les tests d'une brique n'aient besoin d'aucun autre système. */
export function createTestWorld(): World {
  return createWorld(TEST_SEED)
}

/** Range une carte dans le monde : c'est elle que les briques consultent ensuite (world.map). */
export function loadMap(world: World, map: TileMap): void {
  world.map = map
}
