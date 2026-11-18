// Le garage de la ville de test, devant les pavillons, à deux pas du départ du joueur : on y range ses véhicules.
import type { GarageDef } from '../../sim/core'

export const garageDesPavillons: GarageDef = {
  id: 'garage-des-pavillons',
  name: 'Garage des pavillons',
  mapId: 'test-town',
  // Sur le trottoir, devant la porte du garage.
  place: { tileX: 6, tileY: 7, radiusTiles: 1.5 },
  // La place sur la route, devant : on y gare le véhicule à ranger, et c'est là qu'il ressort, nez vers la droite.
  parking: { tileX: 6, tileY: 8, facing: 'right' },
}
