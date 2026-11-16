// La taille et le rôle à l'écran de chaque élément de déco.
// Expose : PropStyle, PROP_STYLES.
// Pourquoi : les images sont toutes carrées (48 ou 32 px) ; ici on fixe leur taille réelle dans le monde, à l'échelle du jeu :
// une case fait 32 px, le joueur 24 px, une voiture 26 × 46 px. Un banc est donc plus petit qu'une voiture, un cône à peine plus grand qu'un pied.

import type { PropTexture } from '../assets'

export interface PropStyle {
  /** Taille d'affichage (l'image carrée est réduite à ce carré), en px. */
  size: number
  /** Haut (arbre, lampadaire, parasol) : passe au-dessus du joueur et des voitures. Sinon, au ras du sol. */
  isTall: boolean
  /** Le feuillage ondule doucement au vent. */
  sways: boolean
  /** Taille de l'ombre portée (largeur, hauteur), en px. */
  shadow: { width: number; height: number }
  /** Rayon de lumière la nuit (lampadaire), en px. */
  lightRadius?: number
}

export const PROP_STYLES: Readonly<Record<PropTexture, PropStyle>> = {
  arbre: { size: 46, isTall: true, sways: true, shadow: { width: 34, height: 16 } },
  'arbre-automne': { size: 38, isTall: true, sways: true, shadow: { width: 28, height: 13 } },
  palmier: { size: 44, isTall: true, sways: true, shadow: { width: 30, height: 12 } },
  buisson: { size: 22, isTall: false, sways: true, shadow: { width: 18, height: 7 } },
  parterre: { size: 28, isTall: false, sways: false, shadow: { width: 24, height: 6 } },
  banc: { size: 26, isTall: false, sways: false, shadow: { width: 22, height: 6 } },
  lampadaire: { size: 26, isTall: true, sways: false, shadow: { width: 8, height: 4 }, lightRadius: 78 },
  poubelle: { size: 15, isTall: false, sways: false, shadow: { width: 11, height: 5 } },
  fontaine: { size: 64, isTall: false, sways: false, shadow: { width: 54, height: 14 } },
  'table-pique-nique': { size: 26, isTall: false, sways: false, shadow: { width: 22, height: 7 } },
  parasol: { size: 36, isTall: true, sways: false, shadow: { width: 26, height: 12 } },
  'bouche-incendie': { size: 13, isTall: false, sways: false, shadow: { width: 9, height: 4 } },
  cone: { size: 13, isTall: false, sways: false, shadow: { width: 8, height: 4 } },
  rocher: { size: 18, isTall: false, sways: false, shadow: { width: 15, height: 5 } },
  haie: { size: 30, isTall: false, sways: false, shadow: { width: 28, height: 6 } },
  plante: { size: 18, isTall: false, sways: true, shadow: { width: 12, height: 5 } },
}
