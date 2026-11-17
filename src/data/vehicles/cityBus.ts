// Le bus de ville : énorme, lent, il prend toute la route. Les arrêts de bus n'ont qu'à bien se tenir.
import type { VehicleDef } from '../../sim/core'

export const cityBus: VehicleDef = {
  id: 'city-bus',
  name: 'Le Bus',
  width: 30,
  length: 96,
  maxSpeed: 240,
  maxReverseSpeed: 50,
  acceleration: 110,
  braking: 300,
  turnRate: 1.5,
  grip: 6,
  handbrakeGrip: 2,
  look: { color: '#3a86ff', bodyHeight: 26, cabin: { length: 0, offset: 0, height: 0 }, extras: ['side-windows'] },
}
