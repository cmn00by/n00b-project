// L'apparence d'un piéton : ses couleurs, son accessoire et sa taille, tirés de la recette de son type.
// Expose : PedestrianAppearance, chooseAppearance().
// Pourquoi : chaque piéton doit être différent des autres et pourtant rester le même à chaque image et à chaque partie. Le tirage ne dépend donc que de l'id du piéton
// (hasard d'affichage, comme la déco) : la simulation n'en sait rien et n'a rien à sauvegarder. C'est une règle pure : elle se teste sans three.js.

import type { EntityId, NpcAccessory, NpcLook } from '../../sim/core'
import { hashToUnit } from '../hash'

/** Ce qui rend un piéton unique, prêt à être assemblé en blocs. Les couleurs sont des textes `#rrggbb`. */
export interface PedestrianAppearance {
  skinColor: string
  hairColor: string
  topColor: string
  bottomColor: string
  /** L'accessoire porté, ou rien. */
  accessory: NpcAccessory | undefined
  /** La couleur de l'accessoire (casquette, chapeau, sac, canne). */
  accessoryColor: string
  /** La taille relative du piéton (1 = taille du joueur). */
  heightScale: number
}

// Un « sel » par choix : sans cela, un piéton au 3e teint de peau aurait aussi toujours le 3e haut.
// hashToUnit mélange mal des sels très proches (1, 2, 3…) : on les écarte en les multipliant par une grande constante, pour des choix bien indépendants.
const spreadSalt = (choiceNumber: number): number => Math.imul(choiceNumber, 0x9e3779b1)
const SALT = {
  skin: spreadSalt(1),
  hair: spreadSalt(2),
  top: spreadSalt(3),
  bottom: spreadSalt(4),
  hasAccessory: spreadSalt(5),
  accessory: spreadSalt(6),
  accessoryColor: spreadSalt(7),
  height: spreadSalt(8),
} as const

function pickFrom<T>(list: readonly T[], entityId: EntityId, salt: number): T {
  const index = Math.min(list.length - 1, Math.floor(hashToUnit(entityId, 0, salt) * list.length))
  return list[index] as T
}

/** Tire l'apparence d'un piéton dans la recette de son type. Le même id donne toujours la même apparence. */
export function chooseAppearance(look: NpcLook, entityId: EntityId): PedestrianAppearance {
  const hasAccessory = look.accessories.length > 0 && hashToUnit(entityId, 0, SALT.hasAccessory) < look.accessoryChance
  const heightRatio = hashToUnit(entityId, 0, SALT.height)
  return {
    skinColor: pickFrom(look.skinTones, entityId, SALT.skin),
    hairColor: pickFrom(look.hairColors, entityId, SALT.hair),
    topColor: pickFrom(look.topColors, entityId, SALT.top),
    bottomColor: pickFrom(look.bottomColors, entityId, SALT.bottom),
    accessory: hasAccessory ? pickFrom(look.accessories, entityId, SALT.accessory) : undefined,
    accessoryColor: pickFrom(look.topColors, entityId, SALT.accessoryColor),
    heightScale: look.heightScale.min + (look.heightScale.max - look.heightScale.min) * heightRatio,
  }
}
