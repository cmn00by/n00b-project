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
  OwnedVehicle,
  Pedestrian,
  Position,
  Sprite,
  Vehicle,
  Velocity,
  VehicleCollection,
  Wallet,
} from './components'
export { TEST_SEED, createTestWorld, createWorld, loadMap } from './world'
export type { World } from './world'
export { despawnEntity, findEntitiesWith, findEntity, getEntity, spawnEntity } from './entities'
export type { EntityWith } from './entities'
export { createEventBus } from './events'
export type { EventBus, EventHandler, GameEvents } from './events'
export { createRegistry, validateDefs } from './registry'
export { VEHICLE_EXTRAS } from './registry'
export type { ContentDef, Registry, VehicleDef, VehicleExtra, VehicleLook } from './registry'
export { SYSTEM_ORDER, sortSystems, validateSystems } from './system'
export type { System } from './system'
export { findCommands } from './commands'
export type { Command, CommandName, CommandOf, GameCommands } from './commands'
export { createSimulation } from './step'
export type { Simulation } from './step'
export { createTileMap, facingToHeading, getTileCenter, isAreaFree, isSolidTile, validateMapDef } from './map'
export type { Facing, MapDef, TileCoords, TileKindDef, TileMap, VehicleSpawn } from './map'
export { NPC_ACCESSORIES, validateNpcTypeDef } from './npcType'
export type { NpcAccessory, NpcLook, NpcTypeDef, NumberRange, ReactionWeights } from './npcType'
export { findSolidOverlaps, isSpaceClear } from './space'
export { computeVehicleBodySize, spawnVehicleEntity } from './vehicle'
export { earnMoney, spendMoney, walletOf } from './wallet'
export { validateDealershipDef, validateDealershipPlaces, validateGaragePlaces, validateWorkshopPlaces } from './garage'
export type { DealershipDef, DealershipOffer, GarageDef, ParkingSpot, WorkshopDef } from './garage'
export { PART_STAT_MAX, PART_STAT_MIN, VEHICLE_PART_SLOTS, VEHICLE_STATS, applyVehicleParts, validateVehiclePartDef } from './vehiclePart'
export type { VehicleCustomization, VehiclePartDef, VehiclePartSlot, VehicleStat } from './vehiclePart'
export { DEFAULT_PLACE_RADIUS_TILES, MISSION_OBJECTIVE_TYPES, MISSION_TRAVEL_MODES, validateMissionDef, validateMissionPlaces } from './mission'
export type { MissionDef, MissionObjectiveDef, MissionObjectiveType, MissionPlace, MissionTravelMode } from './mission'
