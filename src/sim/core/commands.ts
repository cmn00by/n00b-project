// Les commandes : ce que les joueurs demandent au jeu.
// Expose : GameCommands (le catalogue), Command, CommandName, CommandOf, findCommands().
// Pourquoi : la simulation ne lit jamais le clavier. Chaque périphérique (clavier, manette, tactile) traduit ce que fait le joueur
// en commandes, et la simulation ne sait pas d'où elles viennent. C'est ce qui permettra d'envoyer ces commandes à un serveur pour la coop.
// Règles : une commande est une demande ('domaine:verbe'), à la différence d'un événement qui est un fait passé.

import type { EntityId } from './components'

/**
 * Le catalogue de toutes les commandes : leur nom et les données qu'elles transportent.
 * Une brique qui a besoin d'une nouvelle commande l'ajoute ici (c'est un ajout permis).
 */
export interface GameCommands {
  /** Le joueur indique où il veut aller (touches ou joystick tenus) et s'il court. Une commande par pas tant qu'il agit. */
  'player:move': {
    entityId: EntityId // l'entité commandée par ce joueur
    directionX: number // de -1 (gauche) à 1 (droite) ; 0 = immobile
    directionY: number // de -1 (haut) à 1 (bas) ; 0 = immobile
    isRunning: boolean
  }
}

/** Le nom d'une commande. */
export type CommandName = keyof GameCommands

/** Une commande : son nom (`type`) et ses données. */
export type Command = { [K in CommandName]: { type: K } & GameCommands[K] }[CommandName]

/** La commande qui porte ce nom. */
export type CommandOf<K extends CommandName> = Extract<Command, { type: K }>

/** Toutes les commandes d'un certain nom, dans l'ordre où elles ont été envoyées. */
export function findCommands<K extends CommandName>(commands: readonly Command[], type: K): CommandOf<K>[] {
  return commands.filter((command): command is CommandOf<K> => command.type === type)
}
