// La citadine électrique : petite, silencieuse, elle démarre comme une fusée mais plafonne vite.
import type { VehicleDef } from '../../sim/core'

export const cityCar: VehicleDef = {
  id: 'city-car',
  name: 'La Citadine',
  width: 22,
  length: 36,
  maxSpeed: 300,
  maxReverseSpeed: 90,
  acceleration: 380,
  braking: 480,
  turnRate: 3.4,
  grip: 7,
  handbrakeGrip: 2,
  look: { color: '#2ec4b6', bodyHeight: 9, cabin: { length: 0.6, offset: 0.05, height: 9 } },
}
