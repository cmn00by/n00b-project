// La porte d'entrée du noyau : les autres modules n'importent que ce fichier.
export { createRng } from './rng'
export type { Rng } from './rng'
export { STEPS_PER_SECOND, STEP_SECONDS, TUNING } from './config'
export type { Body, ComponentName, Components, Entity, EntityId, EntityKind, Position, Sprite, Velocity } from './components'
export { TEST_SEED, createTestWorld, createWorld } from './world'
export type { World } from './world'
export { despawnEntity, findEntitiesWith, findEntity, getEntity, spawnEntity } from './entities'
export type { EntityWith } from './entities'
