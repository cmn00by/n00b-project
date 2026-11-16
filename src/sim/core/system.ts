// Le contrat d'un système et l'ordre d'exécution.
// Expose : System, SYSTEM_ORDER, sortSystems(), validateSystems().
// Pourquoi : un système est une brique de règles du jeu (conduite, police, missions…). Tous respectent la même forme,
// et le noyau les appelle dans l'ordre de leur tranche. Retirer un système de la liste le désactive sans rien casser.

import type { World } from './world'

/** Les tranches d'exécution : à l'intérieur d'un pas, les systèmes passent dans cet ordre. */
export const SYSTEM_ORDER = {
  input: 100, // appliquer les commandes des joueurs
  ai: 200, // décisions des PNJ
  physics: 300, // déplacements et collisions
  rules: 400, // règles du jeu (recherche, dégâts, missions, économie)
  cleanup: 900, // nettoyage
} as const

/** La forme que tout système respecte. Deux systèmes d'une même tranche ne doivent pas dépendre l'un de l'autre. */
export interface System {
  /** Identifiant unique, en kebab-case : 'walking'. */
  id: string
  /** La tranche d'exécution (voir SYSTEM_ORDER). */
  order: number
  /** Appelé une fois, quand le monde est prêt : c'est ici qu'un système s'inscrit aux événements. */
  init?(world: World): void
  /** Appelé à chaque pas de simulation, dt étant la durée d'un pas en secondes. */
  step(world: World, dt: number): void
}

/** Trie les systèmes par tranche d'exécution. À tranche égale, l'ordre de la liste est conservé. La liste d'origine n'est pas modifiée. */
export function sortSystems(systems: readonly System[]): System[] {
  return [...systems].sort((first, second) => first.order - second.order)
}

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** Vérifie la liste des systèmes et renvoie les erreurs trouvées (vide si tout va bien) : ids uniques et en kebab-case. */
export function validateSystems(systems: readonly System[]): string[] {
  const errors: string[] = []
  const seenIds = new Set<string>()
  for (const system of systems) {
    if (!KEBAB_CASE.test(system.id)) errors.push(`Système '${system.id}' : l'id doit être en kebab-case`)
    if (seenIds.has(system.id)) errors.push(`Système '${system.id}' : id en double`)
    seenIds.add(system.id)
  }
  return errors
}
