// La porte d'entrée du noyau : les autres modules n'importent que ce fichier.
export { createRng } from './rng'
export type { Rng } from './rng'
export { STEPS_PER_SECOND, STEP_SECONDS, TUNING } from './config'
export type {
  ActiveMission,
  Body,
  ComponentName,
  Components,
  Driver,
  Entity,
  EntityId,
  EntityKind,
  LastFreePosition,
  MissionProgress,
  Pedestrian,
  Position,
  Sprite,
  Vehicle,
  Velocity,
} from './components'
export { TEST_SEED, createTestWorld, createWorld, loadMap } from './world'
export type { World } from './world'
export { despawnEntity, findEntitiesWith, findEntity, getEntity, spawnEntity } from './entities'
export type { EntityWith } from './entities'
export { createEventBus } from './events'
export type { EventBus, EventHandler, GameEvents } from './events'
export { createRegistry, validateDefs } from './registry'
export type { ContentDef, Registry, VehicleDef } from './registry'
export { SYSTEM_ORDER, sortSystems, validateSystems } from './system'
export type { System } from './system'
export { findCommands } from './commands'
export type { Command, CommandName, CommandOf, GameCommands } from './commands'
export { createSimulation } from './step'
export type { Simulation } from './step'
export { createTileMap, facingToHeading, getTileCenter, isAreaFree, isSolidTile, validateMapDef } from './map'
export type { Facing, MapDef, TileCoords, TileKindDef, TileMap, VehicleSpawn } from './map'
export { NPC_ACCESSORIES, validateNpcTypeDef } from './npcType'
export type { NpcAccessory, NpcLook, NpcTypeDef, NumberRange } from './npcType'
export { findSolidOverlaps, isSpaceClear } from './space'
export { DEFAULT_PLACE_RADIUS_TILES, MISSION_OBJECTIVE_TYPES, MISSION_TRAVEL_MODES, validateMissionDef, validateMissionPlaces } from './mission'
export type { MissionDef, MissionObjectiveDef, MissionObjectiveType, MissionPlace, MissionTravelMode } from './mission'
