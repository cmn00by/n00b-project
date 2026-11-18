// Le pick-up : costaud, une benne à l'arrière, il préfère la ligne droite aux virages serrés.
import type { VehicleDef } from '../../sim/core'

export const pickup: VehicleDef = {
  id: 'pickup',
  name: 'Le Pick-up',
  width: 28,
  length: 56,
  maxSpeed: 330,
  maxReverseSpeed: 90,
  acceleration: 210,
  braking: 420,
  turnRate: 2.4,
  grip: 5.5,
  handbrakeGrip: 1.4,
  look: { color: '#f28c28', bodyHeight: 10, cabin: { length: 0.32, offset: -0.12, height: 9 }, extras: ['pickup-bed'] },
}
