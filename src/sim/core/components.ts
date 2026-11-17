// Les composants : de petits paquets de données, sans logique, qu'on accroche aux entités.
// Expose : EntityId, EntityKind, les types de composants, Components, ComponentName, Entity.
// Pourquoi : une entité (joueur, voiture, poubelle…) n'est qu'un identifiant et des composants. Pour qu'un objet
// se comporte d'une façon, on lui ajoute le composant voulu : le système concerné s'en occupe sans une ligne de code en plus.
// Règle : un composant contient des données simples (nombres, textes, ids), jamais de fonction ni d'objet d'affichage (three.js),
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

/** Un véhicule : son modèle (id de src/data/vehicles), vers où pointe son nez, et qui le conduit.
 * Le cap est un vecteur de longueur 1 (et non un angle) : on le fait tourner avec de simples multiplications et une racine carrée,
 * dont le résultat est identique sur toutes les machines (condition de la coop), alors que sin/cos peuvent différer à la dernière décimale. */
export interface Vehicle {
  modelId: string
  headingX: number // le nez pointe vers (headingX, headingY) ; (0, -1) = vers le haut
  headingY: number
  driverId?: EntityId // l'entité au volant, s'il y en a une
  ownerId?: EntityId // le joueur à qui il appartient (acheté, ou volé puis rangé au garage)
  ownedKey?: number // son numéro dans la collection de ce joueur (OwnedVehicle.key)
}

/** Une entité qui conduit un véhicule. Son corps est mis de côté pendant la conduite (elle est dans la voiture) et lui est rendu à la sortie. */
export interface Driver {
  vehicleId: EntityId
  storedBody: Body
}

/** La clé d'affichage de l'entité : lue par l'affichage uniquement (voir src/game/assets.ts). */
export interface Sprite {
  key: string
}

/**
 * L'état d'un piéton (PNJ qui se promène). Des données simples, sauvegardables telles quelles.
 * Le comportement (marcher, s'arrêter, fuir…) est dans la brique pedestrians ; ce composant ne fait que retenir où il en est.
 */
export interface Pedestrian {
  /** L'id de sa fiche dans src/data/npcTypes (vitesses, plages de personnalité, apparence). */
  typeId: string
  /** L'état courant, par son id : 'walking', 'pausing', 'noticing', 'fleeing'… (défini par la brique pedestrians, d'autres s'ajouteront). */
  state: string
  /** Pas de simulation restants avant de changer d'état. */
  stateStepsLeft: number
  /** Son courage, de 0 à 1, tiré à sa naissance dans la plage de son type. */
  courage: number
  /** Sa patience, de 0 à 1, tirée à sa naissance dans la plage de son type. */
  patience: number
  /** La case de trottoir qu'il vise, en cases de la carte (undefined quand il n'en vise aucune). */
  targetTile?: { tileX: number; tileY: number }
  /** Sa direction de marche, en cases (-1, 0 ou 1 par axe) : il continue tout droit tant qu'il ne décide pas de tourner. */
  heading: { x: number; y: number }
}

/** La mission en cours d'un joueur : laquelle, l'objectif atteint, les chronos (en pas de simulation) et les objets qu'il porte. */
export interface ActiveMission {
  /** L'id de sa fiche dans src/data/missions. */
  missionId: string
  /** L'objectif en cours (son rang dans la fiche, à partir de 0). */
  objectiveIndex: number
  /** Pas restants avant la fin du chrono de la mission (absent : pas de chrono). */
  stepsLeft?: number
  /** Pas restants avant la fin du chrono de l'objectif en cours (absent : pas de chrono). */
  objectiveStepsLeft?: number
  /** Les objets ramassés et pas encore livrés (ids libres, donnés par la fiche). */
  carriedItems: string[]
}

/** Où en est un joueur dans les missions (brique missions). */
export interface MissionProgress {
  /** La mission en cours, s'il y en a une. */
  active?: ActiveMission
  /** Les missions réussies : elles ne sont plus proposées. */
  completedIds: string[]
  /** Une mission qui vient d'échouer alors que le joueur est sur son départ : elle ne repart que quand il en est sorti. */
  waitingToLeaveId?: string
}

/** L'argent d'une entité (le joueur), en euros entiers : jamais de virgule, pour que le compte soit le même sur toutes les machines (coop). */
export interface Wallet {
  money: number
}

/** Un véhicule qui appartient au joueur : dans la ville (entityId) ou rangé dans un garage (storedIn). */
export interface OwnedVehicle {
  /** Son numéro dans la collection, unique pour ce joueur. */
  key: number
  modelId: string
  /** L'id du garage où il est rangé (absent : il est dans la ville). */
  storedIn?: string
  /** L'entité du véhicule quand il est dans la ville. */
  entityId?: EntityId
}

/** Les véhicules d'un joueur (brique garage). Des données simples, sauvegardables telles quelles. */
export interface VehicleCollection {
  nextKey: number
  vehicles: OwnedVehicle[]
}

/** Tous les composants possibles : chacun est facultatif sur une entité. */
export interface Components {
  position?: Position
  velocity?: Velocity
  body?: Body
  sprite?: Sprite
  lastFreePosition?: LastFreePosition
  pedestrian?: Pedestrian
  vehicle?: Vehicle
  driver?: Driver
  missionProgress?: MissionProgress
  wallet?: Wallet
  vehicleCollection?: VehicleCollection
}

/** Le nom d'un composant. */
export type ComponentName = keyof Components

/** Une entité : un identifiant, un genre, et les composants qu'elle possède. */
export interface Entity extends Components {
  id: EntityId
  kind: EntityKind
}
