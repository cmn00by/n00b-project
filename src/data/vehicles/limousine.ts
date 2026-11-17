// La limousine : interminable, chic, et un vrai cauchemar dans les virages.
import type { VehicleDef } from '../../sim/core'

export const limousine: VehicleDef = {
  id: 'limousine',
  name: 'La Limousine',
  width: 28,
  length: 80,
  maxSpeed: 320,
  maxReverseSpeed: 70,
  acceleration: 160,
  braking: 360,
  turnRate: 1.9,
  grip: 5,
  handbrakeGrip: 1.5,
  look: { color: '#2b1e3a', bodyHeight: 9, cabin: { length: 0.72, offset: 0.04, height: 8 }, extras: ['side-windows'] },
}
