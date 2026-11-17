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
  // Neuf offres au plus (touches 1 à 9), de la moins chère à la plus chère. La voiture de police ne se vend pas : elle se vole.
  offers: [
    { modelId: 'golf-cart', price: 150 },
    { modelId: 'mamie-car', price: 250 },
    { modelId: 'city-car', price: 400 },
    { modelId: 'taxi', price: 500 },
    { modelId: 'delivery-van', price: 600 },
    { modelId: 'pickup', price: 800 },
    { modelId: 'sports-car', price: 1500 },
    { modelId: 'limousine', price: 2200 },
    { modelId: 'city-bus', price: 3000 },
  ],
}
