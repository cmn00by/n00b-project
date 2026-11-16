// Le passant : le piéton de base, qui se promène sans se presser.
import type { NpcTypeDef } from '../../sim/core'

export const passant: NpcTypeDef = {
  id: 'passant',
  name: 'Passant',
  look: {
    skinTones: ['#f6d3b8', '#e8b08a', '#c98a5e', '#9c6440', '#6a4128'],
    hairColors: ['#2b1e3a', '#6b4228', '#b47e4e', '#f5c84c', '#8e5ce0', '#ff6fa8'],
    topColors: ['#e5383b', '#f28c28', '#ffd23f', '#43c46b', '#2ec4b6', '#3a86ff', '#8e5ce0', '#ff6fa8', '#f2efe6'],
    bottomColors: ['#3e4152', '#565a6e', '#2a6fb5', '#6b4228', '#9c9389'],
    accessories: ['cap', 'glasses', 'backpack'],
    accessoryChance: 0.5,
    heightScale: { min: 0.92, max: 1.08 },
  },
  walkSpeed: 38,
  fleeSpeed: 90,
  courage: { min: 0.2, max: 0.8 },
  patience: { min: 0.2, max: 0.8 },
  pauseSeconds: { min: 1, max: 4 },
}
