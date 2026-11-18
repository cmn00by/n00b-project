// Les règles pures de l'affichage d'un piéton projeté par un véhicule : l'arc de son vol, ses culbutes, sa pose allongée, puis son redressement.
// Expose : FallVariant, FallPose, computeFallVariant(), computeFallPose().
// Pourquoi : la simulation dit seulement « projeté » puis « au sol » ; la façon de voler et de retomber est de l'affichage, et varie d'un piéton à l'autre
// (sens et nombre de tours, sur le dos ou sur le ventre) d'après son id, donc de façon stable. Rien ici n'a besoin de three.js : tout se teste seul.

import { hashToUnit } from '../hash'

const spreadSalt = (choiceNumber: number): number => Math.imul(choiceNumber, 0x9e3779b1)

/** La façon propre à ce piéton de tomber : stable, car tirée de son id. */
export interface FallVariant {
  /** +1 ou -1 : le sens dans lequel il culbute. */
  spinDirection: number
  /** Le nombre de tours qu'il fait en vol : 1 ou 2. */
  turns: number
  /** Il retombe sur le dos (+1) ou sur le ventre (-1). */
  lying: number
}

/** La pose du corps : `pitch` est l'inclinaison avant/arrière (radians), `lift` la hauteur dont on soulève le corps et `shift` le décalage avant/arrière, dans le repère du corps. */
export interface FallPose {
  pitch: number
  lift: number
  shift: number
}

export interface FallView {
  arcHeight: number
  pivotHeight: number
  lyingDrop: number
  getUpSeconds: number
  maxSpinTurns: number
}

export interface FallTiming {
  launchSeconds: number
  downSeconds: number
}

const NO_POSE: FallPose = { pitch: 0, lift: 0, shift: 0 }

export function computeFallVariant(entityId: number, view: Pick<FallView, 'maxSpinTurns'>): FallVariant {
  return {
    spinDirection: hashToUnit(entityId, 0, spreadSalt(11)) < 0.5 ? -1 : 1,
    turns: 1 + Math.floor(hashToUnit(entityId, 0, spreadSalt(12)) * view.maxSpinTurns),
    lying: hashToUnit(entityId, 0, spreadSalt(13)) < 0.5 ? -1 : 1,
  }
}

/**
 * Le corps d'un piéton `launched` ou `down`, selon le temps qu'il lui reste dans l'état (`secondsLeft`). Les autres états : aucune pose particulière.
 * En vol : il monte et redescend en arc en culbutant, et arrive allongé. Au sol : il reste allongé, puis se redresse pendant les derniers `getUpSeconds`.
 * Il tourne autour du milieu de son corps : le décalage garde ce point en place.
 */
export function computeFallPose(state: string, secondsLeft: number, timing: FallTiming, variant: FallVariant, view: FallView): FallPose {
  const lyingPitch = (variant.lying * Math.PI) / 2
  if (state === 'launched') {
    const progress = clamp01(1 - secondsLeft / timing.launchSeconds)
    const pitch = (lyingPitch + variant.spinDirection * variant.turns * Math.PI * 2) * progress
    // Il se pose au sol à mesure qu'il retombe : l'abaissement de son corps allongé ne vient que vers la fin du vol.
    return placeBody(pitch, Math.sin(Math.PI * progress) * view.arcHeight, progress * progress, view)
  }
  if (state === 'down') {
    const getUp = view.getUpSeconds > 0 ? clamp01(1 - secondsLeft / view.getUpSeconds) : 0
    return placeBody(lyingPitch * (1 - getUp), 0, 1, view)
  }
  return NO_POSE
}

function placeBody(pitch: number, arc: number, landed: number, view: FallView): FallPose {
  const lowering = view.lyingDrop * Math.abs(Math.sin(pitch)) * landed
  return { pitch, lift: arc + view.pivotHeight - view.pivotHeight * Math.cos(pitch) - lowering, shift: -view.pivotHeight * Math.sin(pitch) }
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}
