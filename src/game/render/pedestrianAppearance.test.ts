import { describe, expect, it } from 'vitest'
import type { NpcLook } from '../../sim/core'
import { chooseAppearance } from './pedestrianAppearance'

const LOOK: NpcLook = {
  skinTones: ['#f6d3b8', '#e8b08a', '#c98a5e', '#9c6440', '#6a4128'],
  hairColors: ['#2b1e3a', '#6b4228', '#f5c84c'],
  topColors: ['#e5383b', '#f28c28', '#ffd23f', '#43c46b', '#3a86ff'],
  bottomColors: ['#3e4152', '#2a6fb5'],
  accessories: ['cap', 'glasses', 'backpack'],
  accessoryChance: 0.5,
  heightScale: { min: 0.9, max: 1.1 },
}

const IDS = Array.from({ length: 1000 }, (_, index) => index + 1)

describe('chooseAppearance', () => {
  it('donne toujours la même apparence au même piéton', () => {
    expect(chooseAppearance(LOOK, 42)).toEqual(chooseAppearance(LOOK, 42))
  })

  it('ne pioche que dans les listes de la recette', () => {
    for (const id of IDS) {
      const appearance = chooseAppearance(LOOK, id)
      expect(LOOK.skinTones).toContain(appearance.skinColor)
      expect(LOOK.hairColors).toContain(appearance.hairColor)
      expect(LOOK.topColors).toContain(appearance.topColor)
      expect(LOOK.bottomColors).toContain(appearance.bottomColor)
      expect(LOOK.topColors).toContain(appearance.accessoryColor)
      if (appearance.accessory !== undefined) expect(LOOK.accessories).toContain(appearance.accessory)
    }
  })

  it('fait de la variété : toutes les couleurs et tous les accessoires finissent par sortir', () => {
    const appearances = IDS.map((id) => chooseAppearance(LOOK, id))
    expect(new Set(appearances.map((appearance) => appearance.skinColor))).toEqual(new Set(LOOK.skinTones))
    expect(new Set(appearances.map((appearance) => appearance.topColor))).toEqual(new Set(LOOK.topColors))
    expect(new Set(appearances.map((appearance) => appearance.accessory))).toEqual(new Set([undefined, ...LOOK.accessories]))
  })

  it('ne lie pas les choix entre eux : un teint de peau donné se retrouve avec plusieurs hauts', () => {
    const tops = new Set(
      IDS.map((id) => chooseAppearance(LOOK, id))
        .filter((appearance) => appearance.skinColor === LOOK.skinTones[0])
        .map((appearance) => appearance.topColor),
    )
    expect(tops.size).toBeGreaterThan(2)
  })

  it('respecte la probabilité d’accessoire, à peu près', () => {
    const share = IDS.filter((id) => chooseAppearance(LOOK, id).accessory !== undefined).length / IDS.length
    expect(share).toBeGreaterThan(0.43)
    expect(share).toBeLessThan(0.57)
  })

  it('ne donne jamais d’accessoire à chance 0, et toujours à chance 1', () => {
    expect(IDS.some((id) => chooseAppearance({ ...LOOK, accessoryChance: 0 }, id).accessory !== undefined)).toBe(false)
    expect(IDS.every((id) => chooseAppearance({ ...LOOK, accessoryChance: 1 }, id).accessory !== undefined)).toBe(true)
  })

  it('ne donne pas d’accessoire si la liste est vide', () => {
    expect(chooseAppearance({ ...LOOK, accessories: [], accessoryChance: 1 }, 7).accessory).toBeUndefined()
  })

  it('tire une taille dans la plage, ou la taille fixe si la plage est réduite à un point', () => {
    for (const id of IDS) {
      const { heightScale } = chooseAppearance(LOOK, id)
      expect(heightScale).toBeGreaterThanOrEqual(0.9)
      expect(heightScale).toBeLessThanOrEqual(1.1)
    }
    expect(chooseAppearance({ ...LOOK, heightScale: { min: 1, max: 1 } }, 5).heightScale).toBe(1)
  })

  it('fonctionne avec des listes d’un seul élément', () => {
    const single: NpcLook = { ...LOOK, skinTones: ['#e8b08a'], hairColors: ['#2b1e3a'], topColors: ['#e5383b'], bottomColors: ['#3e4152'] }
    expect(chooseAppearance(single, 3).skinColor).toBe('#e8b08a')
  })
})
