// La mini-carte, en haut à gauche : la ville vue de dessus autour du joueur, les repères (missions, concession, garage, atelier) et le joueur.
// Expose : MinimapView, MinimapState, createMinimapView().
// Pourquoi : dans une grande ville, il faut savoir où l'on est et où aller. La carte entière est peinte une fois dans une petite image (MINIMAP_STYLE.pixelsPerTile
// pixels par case), puis à chaque image on n'en recopie que le cadre autour du joueur. Les règles (couleurs, cadrage, repères au bord) sont dans minimapLayout.ts.

import { MINIMAP_STYLE } from '../constants'
import { frameMinimap, minimapColorOf, placeOnMinimap } from '../minimapLayout'

/** La carte à peindre : sa taille en cases, la taille d'une case en px, et le type de chaque case (ligne par ligne). */
export interface MinimapMap {
  width: number
  height: number
  tileSize: number
  tileKindIds: readonly string[]
}

/** Ce qu'il faut dessiner à cette image. */
export interface MinimapState {
  playerX: number
  playerY: number
  /** Le cap du joueur ou de sa voiture (vecteur), pour la flèche ; absent : un simple point. */
  heading?: { x: number; y: number }
  markers: ReadonlyArray<{ x: number; y: number; color: string }>
}

export interface MinimapView {
  update(state: MinimapState): void
  setVisible(isVisible: boolean): void
}

const style = MINIMAP_STYLE

export function createMinimapView(parent: HTMLElement, map: MinimapMap): MinimapView {
  // La carte entière, peinte une fois.
  const base = document.createElement('canvas')
  base.width = map.width * style.pixelsPerTile
  base.height = map.height * style.pixelsPerTile
  const baseContext = base.getContext('2d')
  if (baseContext === null) throw new Error('Canvas 2D indisponible')
  for (let tileY = 0; tileY < map.height; tileY++) {
    for (let tileX = 0; tileX < map.width; tileX++) {
      baseContext.fillStyle = minimapColorOf(map.tileKindIds[tileY * map.width + tileX] ?? '')
      baseContext.fillRect(tileX * style.pixelsPerTile, tileY * style.pixelsPerTile, style.pixelsPerTile, style.pixelsPerTile)
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = style.sizePx
  canvas.height = style.sizePx
  canvas.style.cssText = [
    'position:fixed',
    `left:calc(${style.margin}px + env(safe-area-inset-left, 0px))`,
    `top:calc(${style.margin}px + env(safe-area-inset-top, 0px))`,
    // Sur un petit écran (téléphone en paysage), elle ne prend pas plus de 28 % de la hauteur.
    `width:min(${style.sizePx}px, 28vh)`,
    `height:min(${style.sizePx}px, 28vh)`,
    'z-index:9',
    `border:2px solid ${style.borderColor}`,
    'background:#2b1e3a',
    'image-rendering:pixelated',
    'pointer-events:none',
  ].join(';')
  parent.appendChild(canvas)
  const context = canvas.getContext('2d')
  if (context === null) throw new Error('Canvas 2D indisponible')
  context.imageSmoothingEnabled = false

  return {
    update(state) {
      const frame = frameMinimap(state.playerX, state.playerY, map.tileSize, map.width, map.height, style.viewTiles)
      context.clearRect(0, 0, style.sizePx, style.sizePx)
      context.drawImage(base, frame.left * style.pixelsPerTile, frame.top * style.pixelsPerTile, frame.size * style.pixelsPerTile, frame.size * style.pixelsPerTile, 0, 0, style.sizePx, style.sizePx)

      // Les repères : un carré de leur couleur, cerné de sombre ; plus petit quand il est ramené au bord (hors du cadre).
      for (const marker of state.markers) {
        const dot = placeOnMinimap(marker.x, marker.y, map.tileSize, frame)
        const size = dot.isOnEdge ? style.edgeMarkerPx : style.markerPx
        const x = Math.round(dot.x * (style.sizePx - size))
        const y = Math.round(dot.y * (style.sizePx - size))
        context.fillStyle = style.outlineColor
        context.fillRect(x - 1, y - 1, size + 2, size + 2)
        context.fillStyle = marker.color
        context.fillRect(x, y, size, size)
      }

      // Le joueur : une flèche dans le sens de la marche ou de la voiture.
      const player = placeOnMinimap(state.playerX, state.playerY, map.tileSize, frame)
      const px = player.x * style.sizePx
      const py = player.y * style.sizePx
      const length = Math.sqrt((state.heading?.x ?? 0) ** 2 + (state.heading?.y ?? 0) ** 2)
      const hx = length > 0 ? (state.heading?.x ?? 0) / length : 0
      const hy = length > 0 ? (state.heading?.y ?? 0) / length : -1
      const tip = style.playerPx
      context.fillStyle = style.playerColor
      context.strokeStyle = style.outlineColor
      context.lineWidth = 1.5
      context.beginPath()
      context.moveTo(px + hx * tip, py + hy * tip)
      context.lineTo(px - hx * tip * 0.6 - hy * tip * 0.6, py - hy * tip * 0.6 + hx * tip * 0.6)
      context.lineTo(px - hx * tip * 0.6 + hy * tip * 0.6, py - hy * tip * 0.6 - hx * tip * 0.6)
      context.closePath()
      context.fill()
      context.stroke()
    },
    setVisible(isVisible) {
      canvas.style.display = isVisible ? 'block' : 'none'
    },
  }
}
