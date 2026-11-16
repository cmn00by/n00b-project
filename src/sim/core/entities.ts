// Les entités : les créer, les supprimer, les retrouver, les filtrer par composants.
// Expose : spawnEntity, despawnEntity, findEntity, getEntity, findEntitiesWith, EntityWith.
// Pourquoi : les systèmes ne manipulent jamais le dictionnaire du monde à la main ; ils passent par ces fonctions,
// ce qui garantit des ids uniques et un ordre de parcours toujours identique (condition du déterminisme).

import type { ComponentName, Components, Entity, EntityId, EntityKind } from './components'
import type { World } from './world'

/** Une entité dont on est sûr qu'elle possède certains composants. */
export type EntityWith<K extends ComponentName> = Entity & Required<Pick<Components, K>>

/** Crée une entité dans le monde. Les composants donnés sont copiés : l'entité en est la seule propriétaire. */
export function spawnEntity(world: World, kind: EntityKind, components: Components = {}): Entity {
  const entity: Entity = { id: world.nextEntityId, kind, ...structuredClone(components) }
  world.nextEntityId += 1
  world.entities[entity.id] = entity
  return entity
}

/** Retire une entité du monde. Renvoie false si elle n'existait déjà plus. */
export function despawnEntity(world: World, id: EntityId): boolean {
  if (world.entities[id] === undefined) return false
  delete world.entities[id]
  return true
}

/** Cherche une entité : renvoie undefined si elle n'existe pas (ou plus). */
export function findEntity(world: World, id: EntityId): Entity | undefined {
  return world.entities[id]
}

/** Lit une entité qui doit exister : lève une erreur sinon (un id inconnu est un bug, pas un cas normal). */
export function getEntity(world: World, id: EntityId): Entity {
  const entity = world.entities[id]
  if (entity === undefined) throw new Error(`Entité ${id} introuvable`)
  return entity
}

/** Toutes les entités qui possèdent tous les composants demandés, dans l'ordre croissant des ids. */
export function findEntitiesWith<K extends ComponentName>(world: World, componentNames: readonly K[]): EntityWith<K>[] {
  const found: EntityWith<K>[] = []
  for (const entity of Object.values(world.entities)) {
    if (componentNames.every((name) => entity[name] !== undefined)) found.push(entity as EntityWith<K>)
  }
  return found
}
