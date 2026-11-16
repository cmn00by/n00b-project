import { describe, expect, it } from 'vitest'
import { SYSTEM_ORDER, sortSystems, validateSystems } from './system'
import type { System } from './system'

function createFakeSystem(id: string, order: number): System {
  return { id, order, step() {} }
}

describe('SYSTEM_ORDER', () => {
  it("range les tranches dans l'ordre : entrées, IA, physique, collisions, règles, nettoyage", () => {
    const values = [SYSTEM_ORDER.input, SYSTEM_ORDER.ai, SYSTEM_ORDER.physics, SYSTEM_ORDER.collision, SYSTEM_ORDER.rules, SYSTEM_ORDER.cleanup]
    expect(values).toEqual([...values].sort((first, second) => first - second))
  })
})

describe('sortSystems', () => {
  it("trie par tranche d'exécution", () => {
    const rules = createFakeSystem('wanted', SYSTEM_ORDER.rules)
    const input = createFakeSystem('input', SYSTEM_ORDER.input)
    const physics = createFakeSystem('driving', SYSTEM_ORDER.physics)
    expect(sortSystems([rules, input, physics])).toEqual([input, physics, rules])
  })

  it("garde l'ordre de la liste à tranche égale", () => {
    const first = createFakeSystem('driving', SYSTEM_ORDER.physics)
    const second = createFakeSystem('walking', SYSTEM_ORDER.physics)
    expect(sortSystems([first, second])).toEqual([first, second])
    expect(sortSystems([second, first])).toEqual([second, first])
  })

  it("ne modifie pas la liste d'origine", () => {
    const systems = [createFakeSystem('wanted', SYSTEM_ORDER.rules), createFakeSystem('input', SYSTEM_ORDER.input)]
    sortSystems(systems)
    expect(systems.map((system) => system.id)).toEqual(['wanted', 'input'])
  })
})

describe('validateSystems', () => {
  it('ne renvoie aucune erreur pour une liste correcte', () => {
    expect(validateSystems([createFakeSystem('walking', 300), createFakeSystem('wanted', 400)])).toEqual([])
  })

  it('signale un id en double', () => {
    expect(validateSystems([createFakeSystem('walking', 300), createFakeSystem('walking', 400)])).toEqual(["Système 'walking' : id en double"])
  })

  it("signale un id qui n'est pas en kebab-case", () => {
    expect(validateSystems([createFakeSystem('Walking', 300)])).toEqual(["Système 'Walking' : l'id doit être en kebab-case"])
  })
})
