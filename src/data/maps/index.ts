// La liste des cartes du jeu. Ajouter une carte = un fichier de données + une ligne ici.
import { createRegistry } from '../../sim/core'
import type { MapDef } from '../../sim/core'
import { testTown } from './testTown'

export const MAPS: MapDef[] = [testTown]

export const MAP_REGISTRY = createRegistry('Carte', MAPS)
