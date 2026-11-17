// Une toute petite police pixel (3 × 5) pour les enseignes peintes sur les façades.
// Expose : PIXEL_FONT_HEIGHT, measurePixelText(), drawPixelText().
// Pourquoi : l'IA écrit mal et un texte de navigateur réduit devient flou : les enseignes sont dessinées case par case, nettes à toutes les tailles.
// Seules les lettres utiles sont définies ; une lettre inconnue laisse un blanc.

/** Chaque lettre : 5 lignes de 3 cases (X = pleine). */
const GLYPHS: Readonly<Record<string, readonly string[]>> = {
  A: ['.X.', 'X.X', 'XXX', 'X.X', 'X.X'],
  B: ['XX.', 'X.X', 'XX.', 'X.X', 'XX.'],
  E: ['XXX', 'X..', 'XX.', 'X..', 'XXX'],
  G: ['.XX', 'X..', 'X.X', 'X.X', '.XX'],
  L: ['X..', 'X..', 'X..', 'X..', 'XXX'],
  N: ['X.X', 'XXX', 'XXX', 'X.X', 'X.X'],
  O: ['.X.', 'X.X', 'X.X', 'X.X', '.X.'],
  P: ['XX.', 'X.X', 'XX.', 'X..', 'X..'],
  R: ['XX.', 'X.X', 'XX.', 'X.X', 'X.X'],
  T: ['XXX', '.X.', '.X.', '.X.', '.X.'],
  U: ['X.X', 'X.X', 'X.X', 'X.X', 'XXX'],
}

export const PIXEL_FONT_HEIGHT = 5
const GLYPH_WIDTH = 3

/** La largeur du texte, en cases (une case d'espace entre deux lettres). */
export function measurePixelText(text: string): number {
  return text.length === 0 ? 0 : text.length * (GLYPH_WIDTH + 1) - 1
}

/** Dessine le texte en majuscules, coin haut gauche en (x, y), chaque case faisant `cell` pixels. */
export function drawPixelText(context: CanvasRenderingContext2D, text: string, x: number, y: number, cell: number): void {
  ;[...text.toUpperCase()].forEach((letter, index) => {
    const glyph = GLYPHS[letter]
    if (glyph === undefined) return
    const left = x + index * (GLYPH_WIDTH + 1) * cell
    glyph.forEach((row, rowIndex) => {
      for (let column = 0; column < row.length; column++) if (row[column] === 'X') context.fillRect(left + column * cell, y + rowIndex * cell, cell, cell)
    })
  })
}
