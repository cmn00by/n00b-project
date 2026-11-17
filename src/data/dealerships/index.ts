// La liste des concessions. Ajouter une concession = un fichier de données + une ligne ici.
import { createRegistry } from '../../sim/core'
import type { DealershipDef } from '../../sim/core'
import { bonPlanAuto } from './bonPlanAuto'

export const DEALERSHIPS: DealershipDef[] = [bonPlanAuto]

export const DEALERSHIP_REGISTRY = createRegistry('Concession', DEALERSHIPS)
