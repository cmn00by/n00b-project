// Le retraité : lent, patient, et plus têtu que courageux. Il prouve qu'un type de PNJ est juste d'autres chiffres.
import type { NpcTypeDef } from '../../sim/core'

export const retraite: NpcTypeDef = {
  id: 'retraite',
  name: 'Retraité',
  spriteKey: 'pedestrian-retraite',
  walkSpeed: 24,
  fleeSpeed: 52,
  courage: { min: 0.5, max: 1 },
  patience: { min: 0.6, max: 1 },
  pauseSeconds: { min: 3, max: 8 },
}
