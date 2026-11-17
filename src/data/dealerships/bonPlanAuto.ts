// La concession de la ville de test, au parking du centre-ville. Les prix sont un premier jet, à équilibrer (bloc 11).
import type { DealershipDef } from '../../sim/core'

export const bonPlanAuto: DealershipDef = {
  id: 'bon-plan-auto',
  name: 'Bon Plan Auto',
  mapId: 'test-town',
  // Sur le trottoir, à droite du parking.
  place: { tileX: 52, tileY: 26, radiusTiles: 1.2 },
  // La voiture achetée attend sur le parking, nez vers le bas.
  delivery: { tileX: 47, tileY: 24, facing: 'down' },
  offers: [
    { modelId: 'mamie-car', price: 250 },
    { modelId: 'delivery-van', price: 600 },
    { modelId: 'sports-car', price: 1500 },
  ],
}
