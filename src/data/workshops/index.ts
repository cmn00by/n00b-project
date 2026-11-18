// La liste des ateliers. Ajouter un atelier = un fichier de données + une ligne ici. Toutes les pièces (src/data/vehicleParts) y sont proposées.
import { createRegistry } from '../../sim/core'
import type { WorkshopDef } from '../../sim/core'
import { atelierDeTonton } from './atelierDeTonton'

export const WORKSHOPS: WorkshopDef[] = [atelierDeTonton]

export const WORKSHOP_REGISTRY = createRegistry('Atelier', WORKSHOPS)
