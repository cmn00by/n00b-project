// La voiturette de golf : lente, minuscule, elle se faufile partout et tourne sur place.
import type { VehicleDef } from '../../sim/core'

export const golfCart: VehicleDef = {
  id: 'golf-cart',
  name: 'La Voiturette',
  width: 20,
  length: 32,
  maxSpeed: 140,
  maxReverseSpeed: 40,
  acceleration: 140,
  braking: 320,
  turnRate: 3.6,
  grip: 8,
  handbrakeGrip: 2.5,
  look: { color: '#fff8ec', bodyHeight: 6, cabin: { length: 0.5, offset: 0.1, height: 2 }, extras: ['golf-roof'] },
}
