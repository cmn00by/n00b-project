// Le taxi : une berline honnête, avec son enseigne sur le toit. Personne ne lui dit rien quand il se gare n'importe où.
import type { VehicleDef } from '../../sim/core'

export const taxi: VehicleDef = {
  id: 'taxi',
  name: 'Le Taxi',
  width: 26,
  length: 48,
  maxSpeed: 350,
  maxReverseSpeed: 90,
  acceleration: 230,
  braking: 460,
  turnRate: 2.8,
  grip: 6,
  handbrakeGrip: 1.6,
  look: { color: '#f5c84c', cabinColor: '#2b1e3a', bodyHeight: 9, cabin: { length: 0.46, offset: 0.06, height: 8 }, extras: ['taxi-sign'] },
}
