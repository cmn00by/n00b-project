// La liste de tous les systèmes du jeu. Ajouter une brique = importer son système et l'ajouter ici.
// Le noyau les trie par tranche d'exécution (SYSTEM_ORDER) : l'ordre de cette liste n'a pas d'importance.
import type { System } from '../core'
import { collisionSystem } from './collision'
import { walkingSystem } from './walking'

export const SYSTEMS: System[] = [walkingSystem, collisionSystem]
