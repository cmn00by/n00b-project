// La liste des garages. Ajouter un garage = un fichier de données + une ligne ici.
import { createRegistry } from '../../sim/core'
import type { GarageDef } from '../../sim/core'
import { garageDesPavillons } from './garageDesPavillons'

export const GARAGES: GarageDef[] = [garageDesPavillons]

export const GARAGE_REGISTRY = createRegistry('Garage', GARAGES)
