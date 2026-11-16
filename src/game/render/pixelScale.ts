// La taille des pixels de la scène : combien de pixels de l'écran pour un pixel de la scène.
// Expose : PIXEL_SCALE_CHOICES, PixelScaleChoice, choosePixelScale(), describePixelScale().
// Pourquoi : un grain fixe (3) était trop gros sur un écran 1080p et changeait d'allure d'un écran à l'autre. En automatique, la scène vise
// une hauteur d'environ SCENE_HEIGHT_TARGET_PX pixels, quel que soit l'écran : le grain reste fin et constant. P passe aux tailles fixes, pour comparer.

/** La hauteur visée pour la scène en basse résolution, en pixels : c'est elle qui fixe la finesse du rendu. */
export const SCENE_HEIGHT_TARGET_PX = 540
/** Le grain le plus gros accepté en automatique (sur un écran 4K, par exemple). */
const MAX_AUTO_SCALE = 4

/** Les choix proposés par la touche P, dans l'ordre : automatique d'abord. */
export const PIXEL_SCALE_CHOICES = ['auto', 1, 2, 3] as const
export type PixelScaleChoice = (typeof PIXEL_SCALE_CHOICES)[number]

/** Le facteur à appliquer pour un écran de `screenHeightPx` pixels de haut. */
export function choosePixelScale(choice: PixelScaleChoice, screenHeightPx: number): number {
  if (choice !== 'auto') return choice
  return Math.min(MAX_AUTO_SCALE, Math.max(1, Math.round(screenHeightPx / SCENE_HEIGHT_TARGET_PX)))
}

/** Le libellé montré au joueur quand il appuie sur P. */
export function describePixelScale(choice: PixelScaleChoice, scale: number): string {
  return choice === 'auto' ? `Pixels : automatique (×${scale})` : `Pixels : ×${scale}`
}
