// La liste de tous les systèmes du jeu. Ajouter une brique = importer son système et l'ajouter ici.
// Le noyau les trie par tranche d'exécution (SYSTEM_ORDER) : l'ordre de cette liste n'a pas d'importance.
import type { System } from '../core'
import { MISSION_REGISTRY } from '../../data/missions'
import { NPC_TYPE_REGISTRY } from '../../data/npcTypes'
import { collisionSystem } from './collision'
import { drivingSystem } from './driving'
import { economySystem } from './economy'
import { createMissionsSystem } from './missions'
import { createPedestriansSystem } from './pedestrians'
import { walkingSystem } from './walking'

// Les briques qui ont du contenu en données (types de PNJ, missions) le reçoivent par leur registre : ajouter un type de PNJ ne touche pas à la brique.
export const SYSTEMS: System[] = [walkingSystem, drivingSystem, collisionSystem, createPedestriansSystem(NPC_TYPE_REGISTRY), createMissionsSystem(MISSION_REGISTRY), economySystem]
