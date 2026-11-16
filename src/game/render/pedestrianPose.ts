// Les règles pures de la pose d'un piéton : vers où il regarde et comment il se tourne.
// Expose : computeYaw(), turnToward().
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
