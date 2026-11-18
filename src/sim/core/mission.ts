// Les missions décrites en données : leur fiche (titre, point de départ, objectifs, chrono, récompense) et sa validation.
// Expose : MISSION_OBJECTIVE_TYPES, MISSION_TRAVEL_MODES, MissionObjectiveType, MissionTravelMode, MissionPlace, MissionObjectiveDef, MissionDef,
// DEFAULT_PLACE_RADIUS_TILES, validateMissionDef(), validateMissionPlaces().
// Pourquoi : une mission est UNIQUEMENT des données (textes, cases, nombres) : on l'écrit sans toucher au code, elle se lit et se sauvegarde en JSON telle quelle.
// Le moteur (la brique missions) lit ces fiches et ne connaît aucune mission par son nom. Ajouter une mission = un fichier dans src/data/missions + une ligne.
// Guide d'écriture : docs/missions.md.

import type { TileCoords, TileMap } from './map'
import type { ContentDef } from './registry'

/** Les sortes d'objectifs que le moteur sait suivre. */
export const MISSION_OBJECTIVE_TYPES = ['reach', 'pickup', 'deliver'] as const
export type MissionObjectiveType = (typeof MISSION_OBJECTIVE_TYPES)[number]

/** Comment le joueur doit arriver à un lieu : peu importe, à pied, ou au volant. */
export const MISSION_TRAVEL_MODES = ['any', 'foot', 'vehicle'] as const
export type MissionTravelMode = (typeof MISSION_TRAVEL_MODES)[number]

/** Le rayon d'un lieu quand la fiche n'en donne pas, en cases. */
export const DEFAULT_PLACE_RADIUS_TILES = 1

/** Un lieu de la carte : une case, et le rayon (en cases) dans lequel on considère que le joueur y est. */
export interface MissionPlace extends TileCoords {
  radiusTiles?: number
}

/** Un objectif : ce qu'affiche le jeu (`text`), où aller, et comment. */
interface ObjectiveBase {
  /** La consigne affichée au joueur (en français), par exemple « Récupère le colis au parking ». */
  text: string
  /** Où aller. */
  place: MissionPlace
  /** Comment y arriver ('any' si absent). */
  travel?: MissionTravelMode
  /** Un chrono propre à cet objectif, en secondes : il démarre quand l'objectif commence. Absent = pas de chrono. */
  timeLimitSeconds?: number
}

/**
 * Les objectifs :
 * - `reach` : aller au lieu ;
 * - `pickup` : aller au lieu pour y prendre l'objet `item` (le joueur le porte ensuite) ;
 * - `deliver` : apporter l'objet `item` au lieu (il faut le porter, il est alors livré).
 */
export type MissionObjectiveDef = (ObjectiveBase & { type: 'reach' }) | (ObjectiveBase & { type: 'pickup'; item: string }) | (ObjectiveBase & { type: 'deliver'; item: string })

/** La fiche d'une mission. */
export interface MissionDef extends ContentDef {
  /** Le titre affiché (en français). */
  title: string
  /** La présentation affichée au lancement : une ou deux phrases, le ton du jeu. */
  briefing: string
  /** La carte où elle se joue (id de src/data/maps). */
  mapId: string
  /** Le point de départ : la mission commence quand le joueur y entre. */
  start: MissionPlace
  /** Un chrono pour toute la mission, en secondes. Absent = pas de chrono. */
  timeLimitSeconds?: number
  /** Ce que rapporte la mission réussie. */
  reward: { money: number }
  /** Les objectifs, dans l'ordre : on passe au suivant quand le précédent est rempli. */
  objectives: MissionObjectiveDef[]
}

const isPositive = (value: number | undefined): boolean => value === undefined || (Number.isFinite(value) && value > 0)

/** Vérifie une mission sans sa carte : objectifs connus, chronos et rayons positifs, et chaque objet livré a d'abord été ramassé. */
export function validateMissionDef(def: MissionDef): string[] {
  const errors: string[] = []
  if (def.title.trim() === '') errors.push('le titre est vide')
  if (def.objectives.length === 0) errors.push('il faut au moins un objectif')
  if (!isPositive(def.timeLimitSeconds)) errors.push('timeLimitSeconds doit être un nombre positif')
  if (!Number.isInteger(def.reward.money) || def.reward.money < 0) errors.push('la récompense doit être un nombre entier d’euros, positif ou nul')
  if (!isPositive(def.start.radiusTiles)) errors.push('le rayon du départ doit être positif')

  const carried = new Set<string>()
  def.objectives.forEach((objective, index) => {
    const label = `objectif ${index + 1}`
    if (!(MISSION_OBJECTIVE_TYPES as readonly string[]).includes(objective.type)) errors.push(`${label} : type inconnu '${objective.type}'`)
    if (objective.text.trim() === '') errors.push(`${label} : la consigne est vide`)
    if (objective.travel !== undefined && !(MISSION_TRAVEL_MODES as readonly string[]).includes(objective.travel)) errors.push(`${label} : travel inconnu '${objective.travel}'`)
    if (!isPositive(objective.timeLimitSeconds)) errors.push(`${label} : timeLimitSeconds doit être un nombre positif`)
    if (!isPositive(objective.place.radiusTiles)) errors.push(`${label} : le rayon doit être positif`)
    if (objective.type === 'pickup') carried.add(objective.item)
    if (objective.type === 'deliver') {
      if (!carried.has(objective.item)) errors.push(`${label} : livre '${objective.item}' sans l'avoir ramassé avant`)
      carried.delete(objective.item)
    }
  })
  return errors
}

/** Vérifie que le départ et les lieux de la mission sont dans la carte et sur des cases où l'on peut aller. */
export function validateMissionPlaces(def: MissionDef, map: TileMap): string[] {
  const errors: string[] = []
  const check = (label: string, place: MissionPlace) => {
    if (place.tileX < 0 || place.tileY < 0 || place.tileX >= map.width || place.tileY >= map.height) errors.push(`${label} : la case (${place.tileX}, ${place.tileY}) est hors de la carte`)
    else if (map.solid[place.tileY * map.width + place.tileX] === true) errors.push(`${label} : la case (${place.tileX}, ${place.tileY}) est un obstacle`)
  }
  if (def.mapId !== map.mapId) errors.push(`la mission se joue sur '${def.mapId}', pas sur '${map.mapId}'`)
  check('départ', def.start)
  def.objectives.forEach((objective, index) => check(`objectif ${index + 1}`, objective.place))
  return errors
}
