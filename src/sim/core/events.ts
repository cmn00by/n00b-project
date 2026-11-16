// Le bus d'événements : la façon dont les briques se parlent sans s'importer.
// Expose : GameEvents (le catalogue), EventBus, EventHandler, createEventBus().
// Pourquoi : le système de conduite annonce « un choc a eu lieu », le système de dégâts et celui de la police
// réagissent, sans que l'un connaisse l'autre. Ajouter la police ne touche donc jamais au code de la conduite.
// Règles : un événement décrit un fait passé ('domaine:fait-au-passe'), avec des données simples et suffisantes.
// Un écouteur ne suppose jamais qu'un autre écouteur existe.

/**
 * Le catalogue de tous les événements du jeu : leur nom et les données qu'ils transportent.
 * Une brique qui émet un nouvel événement l'ajoute ici (c'est un ajout permis) et dans la fiche de son README.md.
 */
export interface GameEvents {
  /** Un pas de simulation vient de se terminer (émis par step()). */
  'world:stepped': { stepCount: number }
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
