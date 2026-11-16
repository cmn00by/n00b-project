// La liste des missions. Ajouter une mission = un fichier de données + une ligne ici. Guide : docs/missions.md.
// Ce sont des données pures (voir sim/core/mission.ts) : elles se lisent et se sauvegardent en JSON telles quelles.
import { createRegistry } from '../../sim/core'
import type { MissionDef } from '../../sim/core'
import { essaiLivraison } from './essaiLivraison'

export const MISSIONS: MissionDef[] = [essaiLivraison]

export const MISSION_REGISTRY = createRegistry('Mission', MISSIONS)
