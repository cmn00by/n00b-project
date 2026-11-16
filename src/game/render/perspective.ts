// La perspective du relief : où dessiner un point situé en hauteur, vu par une caméra placée au-dessus de la ville.
// Expose : projectRaised(), isWallFacingCamera().
// Pourquoi : un point en hauteur s'écarte du centre de l'écran, d'autant plus qu'il est haut et loin du centre : c'est ce qui fait « pencher »
// les façades et donne l'illusion du volume. Pur calcul, sans Phaser : testé dans Node. Utilisé seulement par l'affichage.

/** Un point du monde, en pixels. */
export interface WorldPoint {
  x: number
  y: number
}

/**
 * Où dessiner le point (x, y) s'il est à `elevation` pixels du sol, pour une caméra au-dessus de `cameraCenter`, à `eyeHeight` pixels du sol.
 * Au sol (elevation = 0), le point ne bouge pas. Sous la caméra, il ne bouge pas non plus.
 */
export function projectRaised(point: WorldPoint, elevation: number, cameraCenter: WorldPoint, eyeHeight: number): WorldPoint {
  const factor = elevation / Math.max(1, eyeHeight - elevation)
  return { x: point.x + (point.x - cameraCenter.x) * factor, y: point.y + (point.y - cameraCenter.y) * factor }
}

/** Les quatre façades d'un bloc. */
export type WallSide = 'north' | 'south' | 'west' | 'east'

/**
 * Si une façade est tournée vers la caméra (donc visible) : la façade sud se voit quand la caméra est plus au sud que le mur, etc.
 * Les façades tournées de l'autre côté sont cachées par l'immeuble lui-même : on ne les dessine pas.
 */
export function isWallFacingCamera(side: WallSide, block: { x: number; y: number; width: number; height: number }, cameraCenter: WorldPoint): boolean {
  if (side === 'north') return cameraCenter.y < block.y
  if (side === 'south') return cameraCenter.y > block.y + block.height
  if (side === 'west') return cameraCenter.x < block.x
  return cameraCenter.x > block.x + block.width
}
