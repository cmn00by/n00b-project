// La liste de tous les systèmes du jeu. Ajouter une brique = importer son système et l'ajouter ici.
// Le noyau les trie par tranche d'exécution (SYSTEM_ORDER) : l'ordre de cette liste n'a pas d'importance.
import type { System } from '../core'
import { DEALERSHIP_REGISTRY } from '../../data/dealerships'
import { GARAGE_REGISTRY } from '../../data/garages'
import { MISSION_REGISTRY } from '../../data/missions'
import { NPC_TYPE_REGISTRY } from '../../data/npcTypes'
import { VEHICLE_PART_REGISTRY } from '../../data/vehicleParts'
import { VEHICLE_REGISTRY } from '../../data/vehicles'
import { WORKSHOP_REGISTRY } from '../../data/workshops'
import { collisionSystem } from './collision'
import { drivingSystem } from './driving'
import { economySystem } from './economy'
import { createGarageSystem } from './garage'
import { createMissionsSystem } from './missions'
import { createPedestriansSystem } from './pedestrians'
import { walkingSystem } from './walking'

// Les briques qui ont du contenu en données (types de PNJ, missions, concessions, garages) le reçoivent par leur registre : ajouter un type de PNJ ne touche pas à la brique.
export const SYSTEMS: System[] = [
  walkingSystem,
  drivingSystem,
  collisionSystem,
  createPedestriansSystem(NPC_TYPE_REGISTRY),
  createMissionsSystem(MISSION_REGISTRY),
  economySystem,
  createGarageSystem({ vehicles: VEHICLE_REGISTRY, dealerships: DEALERSHIP_REGISTRY, garages: GARAGE_REGISTRY, workshops: WORKSHOP_REGISTRY, parts: VEHICLE_PART_REGISTRY }),
]
