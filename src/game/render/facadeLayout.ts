// Les fenêtres d'une façade : combien d'étages, combien de fenêtres par étage, où est la porte.
// Expose : WindowRect, computeFacadeWindows().
// Pourquoi : les façades sont dessinées par le code (pas d'image générée) : il faut savoir où mettre chaque fenêtre, régulièrement,
// quelle que soit la taille de l'immeuble. Pur calcul : testé dans Node.

/** Un rectangle sur la façade, en pixels du monde, mesuré depuis le coin en haut à gauche de la façade. */
export interface WindowRect {
  x: number
  y: number
  width: number
  height: number
  floor: number
  column: number
}

/** Hauteur d'un étage et largeur occupée par une fenêtre et son mur, en px. */
export const FLOOR_HEIGHT_PX = 22
export const WINDOW_SPACING_PX = 16

/** Les fenêtres d'une façade de `width` × `height` px. Le rez-de-chaussée garde de la place pour une porte au milieu si `hasDoor`. */
export function computeFacadeWindows(width: number, height: number, hasDoor: boolean): { windows: WindowRect[]; door?: { x: number; y: number; width: number; height: number } } {
  const floors = Math.max(1, Math.floor(height / FLOOR_HEIGHT_PX))
  const columns = Math.max(1, Math.floor(width / WINDOW_SPACING_PX))
  const floorHeight = height / floors
  const columnWidth = width / columns
  const doorColumn = hasDoor ? Math.floor(columns / 2) : -1
  const windows: WindowRect[] = []
  for (let floor = 0; floor < floors; floor++) {
    for (let column = 0; column < columns; column++) {
      // Les étages sont comptés depuis le sol : l'étage 0 est en bas de la façade.
      if (floor === 0 && column === doorColumn) continue
      windows.push({
        x: Math.round(column * columnWidth + columnWidth * 0.28),
        y: Math.round(height - (floor + 1) * floorHeight + floorHeight * 0.25),
        width: Math.max(2, Math.round(columnWidth * 0.44)),
        height: Math.max(2, Math.round(floorHeight * 0.45)),
        floor,
        column,
      })
    }
  }
  if (doorColumn < 0) return { windows }
  const doorWidth = Math.max(4, Math.round(columnWidth * 0.5))
  const doorHeight = Math.round(Math.min(floorHeight * 0.8, 16))
  return { windows, door: { x: Math.round(doorColumn * columnWidth + (columnWidth - doorWidth) / 2), y: height - doorHeight, width: doorWidth, height: doorHeight } }
}
