// Les commandes : ce que les joueurs demandent au jeu.
// Expose : GameCommands (le catalogue), Command, CommandName, CommandOf, findCommands().
// Pourquoi : la simulation ne lit jamais le clavier. Chaque périphérique (clavier, manette, tactile) traduit ce que fait le joueur
// en commandes, et la simulation ne sait pas d'où elles viennent. C'est ce qui permettra d'envoyer ces commandes à un serveur pour la coop.
// Règles : une commande est une demande ('domaine:verbe'), à la différence d'un événement qui est un fait passé.

import type { EntityId } from './components'
import type { VehiclePartSlot } from './vehiclePart'

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
  /** Le joueur appuie sur la touche d'interaction (une seule commande par appui) : monter dans un véhicule, en descendre… */
  'player:interact': {
    entityId: EntityId
  }
  /** Lancer une mission sans passer par son point de départ (menu, test, débogage). Ignorée si le joueur a déjà une mission en cours. */
  'mission:start': {
    entityId: EntityId // le joueur
    missionId: string
  }
  /** Abandonner la mission en cours (elle échoue). */
  'mission:abandon': {
    entityId: EntityId
  }
  /** Dépenser de l'argent (un achat en boutique, une amende…). Refusée, sans rien retirer, si le portefeuille ne suffit pas. */
  'economy:spend': {
    entityId: EntityId // celui qui paie
    amount: number // en euros entiers, positif
    reason: string // ce qui est payé, pour les messages et les statistiques : 'vehicle:sports-car', 'fine'…
  }
  /** Acheter un modèle à une concession (le joueur doit s'y trouver). */
  'dealership:buy': {
    entityId: EntityId
    dealershipId: string
    modelId: string
  }
  /** Ranger au garage le véhicule garé devant (le joueur doit s'y trouver, à pied). */
  'garage:store': {
    entityId: EntityId
    garageId: string
  }
  /** Sortir du garage un véhicule qui y est rangé : il apparaît sur la place devant. */
  'garage:take-out': {
    entityId: EntityId
    garageId: string
    vehicleKey: number
  }
  /** Installer une pièce sur la voiture qu'on conduit, dans un atelier. */
  'workshop:install': {
    entityId: EntityId // le joueur, au volant
    workshopId: string
    partId: string
  }
  /** Remettre d'origine un emplacement de la voiture qu'on conduit, dans un atelier (gratuit). */
  'workshop:remove': {
    entityId: EntityId
    workshopId: string
    slot: VehiclePartSlot
  }
  /** Le joueur au volant conduit (touches tenues). Une commande par pas tant qu'il agit. */
  'vehicle:drive': {
    entityId: EntityId // l'entité au volant (pas le véhicule)
    throttle: number // de -1 (frein, puis marche arrière) à 1 (accélérer)
    steer: number // de -1 (à gauche) à 1 (à droite)
    isHandbraking: boolean
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
