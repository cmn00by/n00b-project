// La sportive tape-à-l'œil : très rapide, nerveuse, et elle part en dérapage pour un rien.
import type { VehicleDef } from '../../sim/core'

export const sportsCar: VehicleDef = {
  id: 'sports-car',
  name: 'La Frimeuse',
  width: 26,
  length: 50,
  maxSpeed: 420,
  maxReverseSpeed: 100,
  acceleration: 300,
  braking: 520,
  turnRate: 3.2,
  grip: 5,
  handbrakeGrip: 1.2,
}
