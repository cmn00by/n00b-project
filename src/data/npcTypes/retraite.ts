// Le retraité : lent, patient, et plus têtu que courageux. Il prouve qu'un type de PNJ est juste d'autres chiffres (et d'autres couleurs).
import type { NpcTypeDef } from '../../sim/core'

export const retraite: NpcTypeDef = {
  id: 'retraite',
  name: 'Retraité',
  look: {
    skinTones: ['#f6d3b8', '#e8b08a', '#c98a5e', '#9c6440'],
    hairColors: ['#f2efe6', '#dcd4c4', '#8a8797'],
    topColors: ['#7cc7f2', '#8ed46b', '#f3d9a4', '#e9805d', '#d4b8e0'],
    bottomColors: ['#565a6e', '#6b4228', '#9e3b33', '#3e4152'],
    accessories: ['hat', 'cane', 'glasses'],
    accessoryChance: 0.85,
    heightScale: { min: 0.88, max: 0.98 },
  },
  walkSpeed: 24,
  fleeSpeed: 52,
  courage: { min: 0.5, max: 1 },
  patience: { min: 0.6, max: 1 },
  pauseSeconds: { min: 3, max: 8 },
  // Il regarde et il râle volontiers, il filme rarement : le téléphone n'est pas son fort.
  reactionWeights: { stare: 2, curious: 1, filming: 0.5, angry: 3 },
}
