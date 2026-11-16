// La liste des types de PNJ. Ajouter un type = un fichier de données + une ligne ici.
// Ce sont des données pures (voir sim/core/npcType.ts) : le futur panneau admin pourra les modifier.
import { createRegistry } from '../../sim/core'
import type { NpcTypeDef } from '../../sim/core'
import { passant } from './passant'
import { retraite } from './retraite'

export const NPC_TYPES: NpcTypeDef[] = [passant, retraite]

export const NPC_TYPE_REGISTRY = createRegistry('Type de PNJ', NPC_TYPES)
