// L'atelier de la ville de test, au coin de la place, à deux pas du départ : on y entre au volant pour personnaliser sa voiture.
import type { WorkshopDef } from '../../sim/core'

export const atelierDeTonton: WorkshopDef = {
  id: 'atelier-de-tonton',
  name: "L'Atelier de Tonton",
  mapId: 'test-town',
  // Sur la place, devant la porte de l'atelier.
  place: { tileX: 13, tileY: 13, radiusTiles: 1.6 },
}
