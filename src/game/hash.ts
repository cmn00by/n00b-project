// Un hasard d'affichage, stable : le même endroit donne toujours la même valeur.
// Expose : hashToUnit().
// Pourquoi : la déco (quelle herbe a des fleurs, où pousse un arbre, quel toit sur quel immeuble) doit être identique à chaque partie
// et pour chaque joueur, sans passer par le hasard de la simulation (qui ne s'occupe que des règles du jeu).

/** Un nombre de [0, 1[ tiré de deux entiers et d'un « sel » (pour avoir des tirages différents au même endroit). */
export function hashToUnit(x: number, y: number, salt = 0): number {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(salt | 0, 2147483647)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}
