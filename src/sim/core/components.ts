// Les composants : de petits paquets de données, sans logique, qu'on accroche aux entités.
// Expose : EntityId, EntityKind, les types de composants, Components, ComponentName, Entity.
// Pourquoi : une entité (joueur, voiture, poubelle…) n'est qu'un identifiant et des composants. Pour qu'un objet
// se comporte d'une façon, on lui ajoute le composant voulu : le système concerné s'en occupe sans une ligne de code en plus.
// Règle : un composant contient des données simples (nombres, textes, ids), jamais de fonction ni d'objet Phaser,
// pour que l'état complet se sauvegarde et s'envoie sur le réseau tel quel. Ajouter un type de composant est un ajout permis.

/** L'identifiant d'une entité. Une entité en référence une autre par son id, jamais par un pointeur. */
export type EntityId = number

/** Le genre d'une entité (sert à l'affichage, aux requêtes larges et au débogage). */
export type EntityKind = 'player' | 'vehicle' | 'pedestrian' | 'prop'

/** Où se trouve l'entité dans le monde, en pixels, et vers où elle regarde. */
export interface Position {
  x: number
  y: number
  angle: number // en radians
}

/** Le déplacement de l'entité, en pixels par seconde. */
export interface Velocity {
  vx: number
  vy: number
}

/** L'encombrement de l'entité, pour les collisions. */
export interface Body {
  width: number // en px
  height: number // en px
  isSolid: boolean // un corps solide bloque les autres
}

/** La dernière position où l'entité ne touchait aucun obstacle : la brique collision y ramène l'entité qui entre dans un mur. */
export interface LastFreePosition {
  x: number
  y: number
}

/** La clé d'affichage de l'entité : lue par l'affichage uniquement (voir src/game/assets.ts). */
export interface Sprite {
  key: string
}

/** Tous les composants possibles : chacun est facultatif sur une entité. */
export interface Components {
  position?: Position
  velocity?: Velocity
  body?: Body
  sprite?: Sprite
  lastFreePosition?: LastFreePosition
}

/** Le nom d'un composant. */
export type ComponentName = keyof Components

/** Une entité : un identifiant, un genre, et les composants qu'elle possède. */
export interface Entity extends Components {
  id: EntityId
  kind: EntityKind
}
