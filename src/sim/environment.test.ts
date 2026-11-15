// Vérifie que l'outillage de test fonctionne. À supprimer quand le noyau (#3) aura ses propres tests.
import { describe, expect, it } from 'vitest'

describe('environnement de test', () => {
  it('lance les tests de la simulation dans Node', () => {
    expect(typeof window).toBe('undefined')
  })
})
