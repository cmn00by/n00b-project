// Le hasard déterministe de la simulation.
// Expose : createRng(seed) et le type Rng.
// Pourquoi : même graine + mêmes commandes = même partie. C'est ce qui rend les bugs reproductibles,
// les tests fiables et, plus tard, la coop possible (le serveur et les clients tirent les mêmes nombres).
// Tout le hasard de src/sim passe par ici : jamais Math.random().

/** Un générateur de nombres pseudo-aléatoires avec une graine (algorithme mulberry32). */
export interface Rng {
  /** Un nombre décimal dans [0, 1[. */
  nextFloat(): number
  /** Un entier dans [min, max], bornes comprises. */
  nextInt(min: number, max: number): number
  /** Vrai avec la probabilité donnée (0 = jamais, 1 = toujours). */
  rollChance(probability: number): boolean
  /** Un élément au hasard dans une liste non vide. */
  pickOne<T>(items: readonly T[]): T
  /** L'état interne, à sauvegarder pour reprendre la suite exacte des tirages. */
  getState(): number
}

/**
 * Crée un générateur à partir d'une graine.
 * Si `state` est donné (issu de `getState()`), le générateur reprend exactement là où il s'était arrêté.
 */
export function createRng(seed: number, state?: number): Rng {
  // L'état est un entier 32 bits non signé.
  let current = (state ?? seed) >>> 0

  const nextFloat = (): number => {
    current = (current + 0x6d2b79f5) >>> 0
    let t = current
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  return {
    nextFloat,
    nextInt(min, max) {
      return min + Math.floor(nextFloat() * (max - min + 1))
    },
    rollChance(probability) {
      return nextFloat() < probability
    },
    pickOne<T>(items: readonly T[]): T {
      if (items.length === 0) throw new Error('pickOne : la liste est vide')
      // L'index est toujours valide : la liste n'est pas vide et nextFloat() < 1.
      return items[Math.floor(nextFloat() * items.length)] as T
    },
    getState() {
      return current
    },
  }
}
