// Le passant : le piéton de base, qui se promène sans se presser.
import type { NpcTypeDef } from '../../sim/core'

export const passant: NpcTypeDef = {
  id: 'passant',
  name: 'Passant',
  spriteKey: 'pedestrian-passant',
  walkSpeed: 38,
  fleeSpeed: 90,
  courage: { min: 0.2, max: 0.8 },
  patience: { min: 0.2, max: 0.8 },
  pauseSeconds: { min: 1, max: 4 },
}
