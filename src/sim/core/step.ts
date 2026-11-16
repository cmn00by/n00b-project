// La boucle de la simulation : faire avancer le monde d'un pas.
// Expose : Simulation, createSimulation().
// Pourquoi : la simulation avance à pas fixe (30 par seconde), jamais au rythme de l'écran. Avec la même graine et les mêmes commandes
// au même pas, on obtient exactement le même monde sur toutes les machines : c'est la condition des bugs reproductibles et de la coop.
// Le noyau n'a pas le droit d'importer la liste des systèmes du jeu : on la lui passe à la création.

import { STEP_SECONDS } from './config'
import type { Command } from './commands'
import { sortSystems, validateSystems } from './system'
import type { System } from './system'
import type { World } from './world'

/** Un monde et les systèmes qui le font vivre. */
export interface Simulation {
  world: World
  /** Fait avancer le monde d'un pas, en appliquant les commandes données (celles de ce pas seulement). */
  step(commands?: readonly Command[]): void
}

/**
 * Prépare une simulation : vérifie les systèmes, les trie par tranche d'exécution, puis appelle leur `init` (une seule fois).
 * Lève une erreur si la liste des systèmes est invalide (id en double ou mal écrit).
 */
export function createSimulation(world: World, systems: readonly System[]): Simulation {
  const errors = validateSystems(systems)
  if (errors.length > 0) throw new Error(errors.join('\n'))

  const sortedSystems = sortSystems(systems)
  for (const system of sortedSystems) system.init?.(world)

  return {
    world,
    step(commands = []) {
      world.commands = commands
      for (const system of sortedSystems) system.step(world, STEP_SECONDS)
      world.commands = []
      world.stepCount += 1
      world.events.emit('world:stepped', { stepCount: world.stepCount })
    },
  }
}
