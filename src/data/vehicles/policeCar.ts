// La voiture de police : rapide et bien tenue. Elle n'arrête personne pour l'instant (la police viendra avec le bloc 7), mais on peut la voler.
import type { VehicleDef } from '../../sim/core'

export const policeCar: VehicleDef = {
  id: 'police-car',
  name: 'La Patrouille',
  width: 26,
  length: 50,
  maxSpeed: 400,
  maxReverseSpeed: 100,
  acceleration: 280,
  braking: 520,
  turnRate: 3,
  grip: 6.5,
  handbrakeGrip: 1.6,
  look: { color: '#fff8ec', cabinColor: '#3a86ff', bodyHeight: 9, cabin: { length: 0.44, offset: 0.06, height: 8 }, extras: ['siren'] },
}
