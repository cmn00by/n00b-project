// Les types de PNJ : la fiche d'un genre de piéton (vitesses, personnalité, apparence), décrite en données.
// Expose : NumberRange, NpcTypeDef, validateNpcTypeDef().
// Pourquoi : un type de PNJ est UNIQUEMENT des données (nombres et textes, aucune fonction) : il se lit, se modifie et se sauvegarde en JSON tel quel.
// C'est ce qui permettra au futur panneau admin d'éditer les types de PNJ sans toucher au code. Le comportement (marcher, fuir…) est dans la brique pedestrians :
// elle lit ces données, elle ne connaît aucun type par son nom. Ajouter un type = un fichier dans src/data/npcTypes + une ligne dans sa liste.

import type { ContentDef } from './registry'

/** Une plage de valeurs : chaque PNJ tire la sienne au hasard (avec Rng) entre min et max, pour que deux PNJ d'un même type ne soient pas identiques. */
export interface NumberRange {
  min: number
  max: number
}

/** La fiche d'un type de PNJ. */
export interface NpcTypeDef extends ContentDef {
  /** Le nom affiché (en français). */
  name: string
  /** La clé d'affichage (voir src/game/assets.ts) : l'affichage en tire une forme de couleur, puis plus tard un vrai sprite. */
  spriteKey: string
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

/** Vérifie la fiche d'un type de PNJ et renvoie les erreurs trouvées (vide si tout va bien). À passer à validateDefs comme `checkDef`. */
export function validateNpcTypeDef(def: NpcTypeDef): string[] {
  const errors: string[] = []
  if (def.name.trim() === '') errors.push('name ne doit pas être vide')
  if (def.spriteKey.trim() === '') errors.push('spriteKey ne doit pas être vide')
  if (!Number.isFinite(def.walkSpeed) || def.walkSpeed <= 0) errors.push('walkSpeed doit être un nombre positif')
  if (!Number.isFinite(def.fleeSpeed) || def.fleeSpeed <= 0) errors.push('fleeSpeed doit être un nombre positif')
  if (def.fleeSpeed < def.walkSpeed) errors.push('fleeSpeed ne doit pas être plus lente que walkSpeed')
  errors.push(...checkRange('courage', def.courage, 0, 1))
  errors.push(...checkRange('patience', def.patience, 0, 1))
  errors.push(...checkRange('pauseSeconds', def.pauseSeconds, 0))
  return errors
}
