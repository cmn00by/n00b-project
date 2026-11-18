// Les règles pures de la pose d'un piéton : vers où il regarde, comment il se tourne, et ce que font ses bras selon ce qu'il fait.
// Expose : computeYaw(), turnToward(), computeArmAngles().
// Pourquoi : un piéton qui change de direction ne doit pas pivoter d'un coup (ça ferait sauter le personnage) mais se tourner vite, par le chemin le plus court.
// Ces calculs n'ont pas besoin de three.js : ils se testent seuls.

/** L'angle (autour de la verticale) qui tourne l'avant d'un modèle (-z) vers le cap (headingX, headingY) de la simulation. */
export function computeYaw(headingX: number, headingY: number): number {
  return Math.atan2(-headingX, -headingY)
}

/** Tourne `current` vers `target` d'au plus `maxStep` radians, par le chemin le plus court (en passant par l'arrière si c'est plus court). */
export function turnToward(current: number, target: number, maxStep: number): number {
  const fullTurn = Math.PI * 2
  // La différence ramenée entre -π et π : le plus court chemin, dans un sens ou dans l'autre.
  const difference = ((((target - current) % fullTurn) + fullTurn + Math.PI) % fullTurn) - Math.PI
  if (Math.abs(difference) <= maxStep) return target
  return current + Math.sign(difference) * maxStep
}

/** Les angles (autour de l'épaule) des deux bras d'un piéton : [bras gauche, bras droit]. */
export type ArmAngles = readonly [number, number]

/**
 * Ce que font ses bras selon son état : celui qui filme tend le bras droit avec son téléphone, celui qui râle lève et secoue les deux bras, celui qui est projeté les agite en l'air, celui qui est au sol les laisse ballants,
 * les autres balancent leurs bras en marchant (`walkSwing`, en radians). `timeSeconds` fait avancer le secouement.
 */
export function computeArmAngles(
  state: string,
  walkSwing: number,
  timeSeconds: number,
  view: { filmArmAngle: number; angryArmAngle: number; angryShakeSpeed: number; angryShake: number; flailArmAngle: number; flailShake: number; limpArmAngle: number },
): ArmAngles {
  if (state === 'launched') {
    const flail = Math.sin(timeSeconds * view.angryShakeSpeed) * view.flailShake
    return [view.flailArmAngle + flail, view.flailArmAngle - flail]
  }
  if (state === 'down') return [view.limpArmAngle, -view.limpArmAngle]
  if (state === 'filming') return [0, view.filmArmAngle]
  if (state === 'angry') {
    const shake = Math.sin(timeSeconds * view.angryShakeSpeed) * view.angryShake
    return [view.angryArmAngle + shake, view.angryArmAngle - shake]
  }
  return [-walkSwing, walkSwing]
}
