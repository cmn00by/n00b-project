// La liste de tous les systèmes du jeu. Ajouter une brique = importer son système et l'ajouter ici.
// Le noyau les trie par tranche d'exécution (SYSTEM_ORDER) : l'ordre de cette liste n'a pas d'importance.
import type { System } from '../core'
import { NPC_TYPE_REGISTRY } from '../../data/npcTypes'
import { collisionSystem } from './collision'
import { createPedestriansSystem } from './pedestrians'
import { walkingSystem } from './walking'

// Les briques qui ont du contenu en données (ici les types de PNJ) le reçoivent par leur registre : ajouter un type de PNJ ne touche pas à la brique.
export const SYSTEMS: System[] = [walkingSystem, collisionSystem, createPedestriansSystem(NPC_TYPE_REGISTRY)]
