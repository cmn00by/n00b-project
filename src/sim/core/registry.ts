// Les registres de contenus : la liste des véhicules, missions, objets… et leur validation.
// Expose : ContentDef, Registry, createRegistry(), validateDefs().
// Pourquoi : tout le contenu du jeu vit en données dans src/data/. Ajouter une voiture = un fichier de données + une ligne
// dans sa liste, sans toucher à aucun système. La validation (lancée par les tests) attrape les erreurs de données
// (id en double, valeur hors bornes, référence vers un contenu qui n'existe pas) avant que le joueur ne les rencontre.

/** Tout contenu a un id unique, en kebab-case, que le code et les sauvegardes utilisent pour le référencer. */
export interface ContentDef {
  id: string
}

/** Une liste de contenus consultable par id. */
export interface Registry<T extends ContentDef> {
  /** Tous les contenus, dans l'ordre de la liste. */
  all: readonly T[]
  /** Cherche un contenu : renvoie undefined s'il n'existe pas. */
  find(id: string): T | undefined
  /** Lit un contenu qui doit exister : lève une erreur sinon (un id inconnu est un bug de données). */
  get(id: string): T
  /** Dit si un contenu existe. */
  has(id: string): boolean
}

/** Crée un registre à partir d'une liste de contenus. Si un id est en double, le premier gagne (validateDefs le signale). */
export function createRegistry<T extends ContentDef>(label: string, defs: readonly T[]): Registry<T> {
  const defById = new Map<string, T>()
  for (const def of defs) {
    if (!defById.has(def.id)) defById.set(def.id, def)
  }

  return {
    all: defs,
    find: (id) => defById.get(id),
    get(id) {
      const def = defById.get(id)
      if (def === undefined) throw new Error(`${label} : '${id}' est introuvable`)
      return def
    },
    has: (id) => defById.has(id),
  }
}

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/

/**
 * Vérifie une liste de contenus et renvoie la liste des erreurs trouvées (vide si tout va bien).
 * Vérifie que les ids sont uniques et en kebab-case ; `checkDef` ajoute les vérifications propres au type de contenu
 * (bornes, références vers d'autres contenus…) et renvoie ses propres messages d'erreur.
 */
export function validateDefs<T extends ContentDef>(label: string, defs: readonly T[], checkDef?: (def: T) => string[]): string[] {
  const errors: string[] = []
  const seenIds = new Set<string>()
  const reportedDuplicates = new Set<string>()

  for (const def of defs) {
    if (!KEBAB_CASE.test(def.id)) errors.push(`${label} '${def.id}' : l'id doit être en kebab-case`)
    if (seenIds.has(def.id) && !reportedDuplicates.has(def.id)) {
      errors.push(`${label} '${def.id}' : id en double`)
      reportedDuplicates.add(def.id)
    }
    seenIds.add(def.id)
    for (const message of checkDef?.(def) ?? []) errors.push(`${label} '${def.id}' : ${message}`)
  }

  return errors
}

/** Un modèle de véhicule (src/data/vehicles) : ses réglages de conduite et sa silhouette. Les vitesses sont en px par seconde, les accélérations en px par seconde². */
export interface VehicleDef extends ContentDef {
  /** Le nom affiché (en français). */
  name: string
  /** Largeur (d'un flanc à l'autre) et longueur (du nez à l'arrière), en px. */
  width: number
  length: number
  /** Vitesse maximale en marche avant et en marche arrière. */
  maxSpeed: number
  maxReverseSpeed: number
  /** Accélération moteur, et décélération au freinage. */
  acceleration: number
  braking: number
  /** Vitesse de rotation du volant à fond, en radians par seconde (atteinte au-dessus de TUNING.driving.fullTurnSpeed). */
  turnRate: number
  /** Adhérence : la part du glissement latéral effacée par seconde. Haute = rails ; basse = dérapages. */
  grip: number
  /** Adhérence quand le frein à main est tiré (plus basse : on dérape). */
  handbrakeGrip: number
  /** Sa silhouette en blocs (lue par l'affichage seulement) : sans elle, une voiture simple et voyante. */
  look?: VehicleLook
}

/** Les accessoires qu'on sait poser sur une silhouette de véhicule. */
export const VEHICLE_EXTRAS = ['taxi-sign', 'siren', 'pickup-bed', 'golf-roof', 'side-windows'] as const
export type VehicleExtra = (typeof VEHICLE_EXTRAS)[number]

/**
 * La silhouette d'un modèle, en données : l'affichage assemble les blocs d'après elle (une caisse, un habitacle, des accessoires).
 * Les longueurs de l'habitacle sont des parts de la longueur du véhicule ; les hauteurs sont en px.
 */
export interface VehicleLook {
  /** La couleur de la caisse (`#rrggbb`), et de l'habitacle s'il en a une autre. */
  color: string
  cabinColor?: string
  /** La hauteur de la caisse, en px (9 pour une voiture, beaucoup plus pour un bus). */
  bodyHeight: number
  /** L'habitacle : sa longueur (part de la longueur), son décalage vers l'arrière (part de la longueur, négatif : vers l'avant) et sa hauteur en px. Hauteur 0 : pas d'habitacle. */
  cabin: { length: number; offset: number; height: number }
  extras?: VehicleExtra[]
}
