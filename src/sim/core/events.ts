// Le bus d'événements : la façon dont les briques se parlent sans s'importer.
// Expose : GameEvents (le catalogue), EventBus, EventHandler, createEventBus().
// Pourquoi : le système de conduite annonce « un choc a eu lieu », le système de dégâts et celui de la police
// réagissent, sans que l'un connaisse l'autre. Ajouter la police ne touche donc jamais au code de la conduite.
// Règles : un événement décrit un fait passé ('domaine:fait-au-passe'), avec des données simples et suffisantes.
// Un écouteur ne suppose jamais qu'un autre écouteur existe.

import type { EntityId } from './components'
import type { VehiclePartSlot } from './vehiclePart'

/**
 * Le catalogue de tous les événements du jeu : leur nom et les données qu'ils transportent.
 * Une brique qui émet un nouvel événement l'ajoute ici (c'est un ajout permis) et dans la fiche de son README.md.
 */
export interface GameEvents {
  /** Un pas de simulation vient de se terminer (émis par step()). */
  'world:stepped': { stepCount: number }
  /** Un piéton vient d'avoir peur et prend la fuite (émis par la brique pedestrians). Les effets (cri, bulle) pourront s'y brancher. */
  'pedestrian:scared': { entityId: EntityId }
  /** Un véhicule en mouvement vient de projeter un piéton (émis par la brique pedestrians). impactSpeed : la vitesse du véhicule, en px/s. Dégâts, police et sons pourront s'y brancher. */
  'pedestrian:hit': { entityId: EntityId; vehicleId: EntityId; impactSpeed: number }
  /** Une entité a été arrêtée par un obstacle (mur ou autre entité), émis par la brique collision. impactSpeed : la vitesse perdue, en px/s (0 si l'entité n'a pas de vitesse). */
  'entity:blocked': { entityId: EntityId; impactSpeed: number }
  /** Une entité est montée dans un véhicule (brique driving). */
  'vehicle:entered': { vehicleId: EntityId; driverId: EntityId }
  /** Une entité est descendue d'un véhicule (brique driving). */
  'vehicle:exited': { vehicleId: EntityId; driverId: EntityId }
  /** Un joueur a commencé une mission (brique missions). */
  'mission:started': { entityId: EntityId; missionId: string }
  /** Un joueur a rempli un objectif de sa mission (brique missions). objectiveIndex : son rang, à partir de 0. */
  'mission:objective-completed': { entityId: EntityId; missionId: string; objectiveIndex: number }
  /** Un joueur a réussi sa mission (brique missions). L'économie, quand elle existera, versera `money`. */
  'mission:succeeded': { entityId: EntityId; missionId: string; money: number }
  /** La mission d'un joueur a échoué (brique missions) : chrono écoulé, ou abandon. */
  'mission:failed': { entityId: EntityId; missionId: string; reason: 'time-out' | 'abandoned' }
  /** De l'argent a été gagné (brique economy). balance : le nouveau solde. */
  'economy:earned': { entityId: EntityId; amount: number; reason: string; balance: number }
  /** De l'argent a été dépensé (brique economy). */
  'economy:spent': { entityId: EntityId; amount: number; reason: string; balance: number }
  /** Un véhicule a été acheté et attend sur la place de livraison (brique garage). */
  'garage:bought': { entityId: EntityId; dealershipId: string; modelId: string; price: number; vehicleId: EntityId }
  /** Un véhicule a été rangé au garage (brique garage). wasStolen : il n'appartenait pas encore au joueur, il est désormais à lui. */
  'garage:stored': { entityId: EntityId; garageId: string; modelId: string; vehicleKey: number; wasStolen: boolean }
  /** Un véhicule est sorti du garage (brique garage). */
  'garage:taken-out': { entityId: EntityId; garageId: string; modelId: string; vehicleKey: number; vehicleId: EntityId }
  /** Une action de concession, de garage ou d'atelier a été refusée (brique garage) : `why` le dit au joueur. */
  'garage:refused': { entityId: EntityId; action: 'buy' | 'store' | 'take-out' | 'install' | 'remove'; why: string }
  /** Une pièce a été installée à l'atelier (brique garage). */
  'workshop:installed': { entityId: EntityId; vehicleId: EntityId; partId: string; price: number }
  /** Un emplacement a été remis d'origine à l'atelier (brique garage). */
  'workshop:removed': { entityId: EntityId; vehicleId: EntityId; slot: VehiclePartSlot }
  /** Une dépense a été refusée : pas assez d'argent (brique economy). Le solde n'a pas changé. */
  'economy:refused': { entityId: EntityId; amount: number; reason: string; balance: number }
}

/** Une fonction appelée quand l'événement a lieu. */
export type EventHandler<T> = (data: T) => void

/** Un bus d'événements typé : le nom d'un événement fixe le type de ses données. */
export interface EventBus<E> {
  /** Écoute un événement. Renvoie une fonction qui arrête l'écoute. */
  on<K extends keyof E>(name: K, handler: EventHandler<E[K]>): () => void
  /** Annonce un événement : les écouteurs sont appelés tout de suite, dans l'ordre où ils se sont inscrits. */
  emit<K extends keyof E>(name: K, data: E[K]): void
}

/** Crée un bus vide. */
export function createEventBus<E>(): EventBus<E> {
  const handlersByName = new Map<keyof E, Array<EventHandler<unknown>>>()

  return {
    on(name, handler) {
      const handlers = handlersByName.get(name) ?? []
      handlers.push(handler as EventHandler<unknown>)
      handlersByName.set(name, handlers)
      return () => {
        const index = handlers.indexOf(handler as EventHandler<unknown>)
        if (index !== -1) handlers.splice(index, 1)
      }
    },
    emit(name, data) {
      // Une copie de la liste : un écouteur peut s'inscrire ou se retirer pendant l'événement sans fausser le parcours.
      for (const handler of [...(handlersByName.get(name) ?? [])]) handler(data)
    },
  }
}
