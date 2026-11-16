// La voiture de mamie : lente, très sage, colle à la route.
import type { VehicleDef } from '../../sim/core'

export const mamieCar: VehicleDef = {
  id: 'mamie-car',
  name: 'La Mamie',
  width: 26,
  length: 46,
  maxSpeed: 230,
  maxReverseSpeed: 80,
  acceleration: 150,
  braking: 420,
  turnRate: 2.6,
  grip: 9,
  handbrakeGrip: 2,
}
