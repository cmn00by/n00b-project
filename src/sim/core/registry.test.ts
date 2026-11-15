import { describe, expect, it } from 'vitest'
import { createRegistry, validateDefs } from './registry'

interface TestDef {
  id: string
  maxSpeed: number
}

const mamieCar: TestDef = { id: 'mamie-car', maxSpeed: 140 }
const golfCart: TestDef = { id: 'golf-cart', maxSpeed: 60 }

describe('createRegistry', () => {
  const registry = createRegistry('Véhicule', [mamieCar, golfCart])

  it('retrouve un contenu par son id', () => {
    expect(registry.get('golf-cart')).toBe(golfCart)
    expect(registry.find('mamie-car')).toBe(mamieCar)
    expect(registry.has('mamie-car')).toBe(true)
  })

  it('garde la liste dans son ordre', () => {
    expect(registry.all).toEqual([mamieCar, golfCart])
  })

  it('renvoie undefined avec find et lève une erreur claire avec get pour un id inconnu', () => {
    expect(registry.find('inconnu')).toBeUndefined()
    expect(registry.has('inconnu')).toBe(false)
    expect(() => registry.get('inconnu')).toThrow("Véhicule : 'inconnu' est introuvable")
  })

  it('garde le premier contenu quand un id est en double', () => {
    const duplicate: TestDef = { id: 'mamie-car', maxSpeed: 999 }
    expect(createRegistry('Véhicule', [mamieCar, duplicate]).get('mamie-car')).toBe(mamieCar)
  })
})

describe('validateDefs', () => {
  it('ne renvoie aucune erreur pour une liste correcte', () => {
    expect(validateDefs('Véhicule', [mamieCar, golfCart])).toEqual([])
  })

  it('signale un id en double, une seule fois', () => {
    const errors = validateDefs('Véhicule', [mamieCar, mamieCar, mamieCar])
    expect(errors).toEqual(["Véhicule 'mamie-car' : id en double"])
  })

  it("signale un id qui n'est pas en kebab-case", () => {
    expect(validateDefs('Véhicule', [{ id: 'MamieCar', maxSpeed: 1 }])).toEqual(["Véhicule 'MamieCar' : l'id doit être en kebab-case"])
  })

  it('ajoute les erreurs propres au type de contenu', () => {
    const checkDef = (def: TestDef) => (def.maxSpeed > 100 ? ['maxSpeed trop élevée'] : [])
    expect(validateDefs('Véhicule', [mamieCar, golfCart], checkDef)).toEqual(["Véhicule 'mamie-car' : maxSpeed trop élevée"])
  })
})
