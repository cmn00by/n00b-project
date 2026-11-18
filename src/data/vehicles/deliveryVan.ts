// La camionnette de livraison : lourde, longue, freine mal, tourne large.
import type { VehicleDef } from '../../sim/core'

export const deliveryVan: VehicleDef = {
  id: 'delivery-van',
  name: 'La Livreuse',
  width: 30,
  length: 58,
  maxSpeed: 260,
  maxReverseSpeed: 70,
  acceleration: 120,
  braking: 300,
  turnRate: 2,
  grip: 7,
  handbrakeGrip: 1.8,
  look: { color: '#f2efe6', bodyHeight: 10, cabin: { length: 0.68, offset: 0.12, height: 12 } },
}
