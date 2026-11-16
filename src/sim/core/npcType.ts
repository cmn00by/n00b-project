// Les types de PNJ : la fiche d'un genre de piéton (vitesses, personnalité, apparence), décrite en données.
// Expose : NumberRange, NPC_ACCESSORIES, NpcAccessory, NpcLook, ReactionWeights, NpcTypeDef, validateNpcTypeDef().
// Pourquoi : un type de PNJ est UNIQUEMENT des données (nombres et textes, aucune fonction) : il se lit, se modifie et se sauvegarde en JSON tel quel.
// C'est ce qui permettra au futur panneau admin d'éditer les types de PNJ sans toucher au code. Le comportement (marcher, fuir…) est dans la brique pedestrians :
// elle lit ces données, elle ne connaît aucun type par son nom. Ajouter un type = un fichier dans src/data/npcTypes + une ligne dans sa liste.

import type { ContentDef } from './registry'

/** Une plage de valeurs : chaque PNJ tire la sienne au hasard (avec Rng) entre min et max, pour que deux PNJ d'un même type ne soient pas identiques. */
export interface NumberRange {
  min: number
  max: number
}

/** Les accessoires que l'affichage sait assembler sur un personnage. */
export const NPC_ACCESSORIES = ['cap', 'hat', 'glasses', 'backpack', 'cane'] as const
export type NpcAccessory = (typeof NPC_ACCESSORIES)[number]

/**
 * L'apparence d'un type de PNJ : une « recette » d'où l'affichage tire, pour chaque piéton, ses propres couleurs et son accessoire.
 * Les couleurs sont des textes `#rrggbb`. Chaque piéton pioche dans ces listes d'après son id (toujours le même résultat pour le même piéton) :
 * ajouter une couleur à une liste suffit à varier toute la foule de ce type, sans dessiner ni animer quoi que ce soit.
 */
export interface NpcLook {
  /** Les teints de peau possibles. */
  skinTones: string[]
  /** Les couleurs de cheveux possibles. */
  hairColors: string[]
  /** Les couleurs du haut (t-shirt, veste) possibles. */
  topColors: string[]
  /** Les couleurs du bas (pantalon, jupe) possibles. */
  bottomColors: string[]
  /** Les accessoires possibles (un seul par piéton, ou aucun). */
  accessories: NpcAccessory[]
  /** La probabilité, de 0 à 1, qu'un piéton porte un accessoire. */
  accessoryChance: number
  /** La taille relative d'un piéton (1 = taille du joueur) : chacun tire la sienne dans cette plage. */
  heightScale: NumberRange
}

/**
 * Les chances relatives de chaque réaction quand un piéton remarque quelqu'un qui fonce sur lui sans être assez près pour fuir.
 * Ce ne sont pas des pourcentages : seul le rapport compte (2, 1, 1, 0 = la moitié du temps il regarde, un quart curieux, un quart il filme, jamais il ne râle).
 * Un poids à 0 interdit la réaction à ce type de PNJ.
 */
export interface ReactionWeights {
  /** Il s'arrête et regarde, sans rien faire de plus. */
  stare: number
  /** Il s'approche pour voir de plus près, puis regarde. */
  curious: number
  /** Il s'arrête et filme avec son téléphone. */
  filming: number
  /** Il s'arrête et proteste, sans coups. */
  angry: number
}

/** La fiche d'un type de PNJ. */
export interface NpcTypeDef extends ContentDef {
  /** Le nom affiché (en français). */
  name: string
  /** Son apparence : la recette d'où l'affichage assemble chaque piéton (couleurs, accessoire, taille). */
  look: NpcLook
  /** Vitesse de marche quand il se promène, en px par seconde. */
  walkSpeed: number
  /** Vitesse quand il fuit, en px par seconde. */
  fleeSpeed: number
  /**
   * Le courage, de 0 à 1 : à 0 il fuit dès que le joueur est loin, à 1 il ne fuit que quand le joueur est tout près.
   * Chaque PNJ tire le sien dans cette plage.
   */
  courage: NumberRange
  /**
   * La patience, de 0 à 1 : à 0 il fait des pauses courtes (le bas de pauseSeconds), à 1 il fait des pauses longues (le haut).
   * Chaque PNJ tire la sienne dans cette plage.
   */
  patience: NumberRange
  /** La durée d'une pause quand il s'arrête, en secondes : le bas de la plage pour un impatient, le haut pour un patient. */
  pauseSeconds: NumberRange
  /** Ce qu'il fait quand il remarque quelqu'un qui fonce sur lui : chaque PNJ tire sa réaction selon ces poids. */
  reactionWeights: ReactionWeights
}

function checkRange(label: string, range: NumberRange, lowest: number, highest?: number): string[] {
  const errors: string[] = []
  if (!Number.isFinite(range.min) || !Number.isFinite(range.max)) return [`${label} : min et max doivent être des nombres`]
  if (range.min > range.max) errors.push(`${label} : min (${range.min}) dépasse max (${range.max})`)
  if (highest === undefined) {
    if (range.min < lowest) errors.push(`${label} : ne doit pas être inférieur à ${lowest}`)
  } else if (range.min < lowest || range.max > highest) {
    errors.push(`${label} : doit rester entre ${lowest} et ${highest}`)
  }
  return errors
}

const COLOR_FORMAT = /^#[0-9a-f]{6}$/i

function checkColors(label: string, colors: string[]): string[] {
  if (colors.length === 0) return [`${label} ne doit pas être vide`]
  return colors.filter((color) => !COLOR_FORMAT.test(color)).map((color) => `${label} : « ${color} » n'est pas une couleur au format #rrggbb`)
}

function checkLook(look: NpcLook): string[] {
  const errors = [
    ...checkColors('look.skinTones', look.skinTones),
    ...checkColors('look.hairColors', look.hairColors),
    ...checkColors('look.topColors', look.topColors),
    ...checkColors('look.bottomColors', look.bottomColors),
  ]
  for (const accessory of look.accessories) {
    if (!NPC_ACCESSORIES.includes(accessory)) errors.push(`look.accessories : « ${accessory} » n'est pas un accessoire connu (${NPC_ACCESSORIES.join(', ')})`)
  }
  if (!Number.isFinite(look.accessoryChance) || look.accessoryChance < 0 || look.accessoryChance > 1) errors.push('look.accessoryChance : doit rester entre 0 et 1')
  else if (look.accessoryChance > 0 && look.accessories.length === 0) errors.push('look.accessories ne doit pas être vide quand accessoryChance dépasse 0')
  errors.push(...checkRange('look.heightScale', look.heightScale, 0.5, 1.5))
  return errors
}

function checkReactionWeights(weights: ReactionWeights): string[] {
  const values = [weights.stare, weights.curious, weights.filming, weights.angry]
  if (values.some((value) => !Number.isFinite(value) || value < 0)) return ['reactionWeights : chaque poids doit être un nombre supérieur ou égal à 0']
  if (values.every((value) => value === 0)) return ['reactionWeights : au moins un poids doit dépasser 0']
  return []
}

/** Vérifie la fiche d'un type de PNJ et renvoie les erreurs trouvées (vide si tout va bien). À passer à validateDefs comme `checkDef`. */
export function validateNpcTypeDef(def: NpcTypeDef): string[] {
  const errors: string[] = []
  if (def.name.trim() === '') errors.push('name ne doit pas être vide')
  if (!Number.isFinite(def.walkSpeed) || def.walkSpeed <= 0) errors.push('walkSpeed doit être un nombre positif')
  if (!Number.isFinite(def.fleeSpeed) || def.fleeSpeed <= 0) errors.push('fleeSpeed doit être un nombre positif')
  if (def.fleeSpeed < def.walkSpeed) errors.push('fleeSpeed ne doit pas être plus lente que walkSpeed')
  errors.push(...checkRange('courage', def.courage, 0, 1))
  errors.push(...checkRange('patience', def.patience, 0, 1))
  errors.push(...checkRange('pauseSeconds', def.pauseSeconds, 0))
  errors.push(...checkReactionWeights(def.reactionWeights))
  errors.push(...checkLook(def.look))
  return errors
}
