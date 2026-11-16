// L'affichage du HUD : santé, recherche et argent, en HTML/CSS par-dessus le jeu, en haut à droite.
// Expose : HudView, createHudView().
// Pourquoi : l'interface est en HTML (docs/decisions.md), pas dans la scène 3D. Les cœurs et les étoiles sont de petites icônes pixel art dessinées « case par case » en SVG
// (nettes à toutes les tailles, sans fichier d'image). Le HUD ne reçoit aucun toucher et ne décide de rien : il dessine l'état que main.ts lui donne.

import { HUD_STYLE } from '../constants'
import { computeHearts, computeStars, formatMoney } from './hudModel'
import type { HudState } from './hudModel'

export interface HudView {
  /** À appeler quand l'état change (ou à chaque image : rien n'est réécrit si rien n'a changé). */
  update(state: HudState): void
  setVisible(isVisible: boolean): void
}

// Les icônes : une chaîne par ligne, X = case colorée.
const HEART = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...']
const STAR = ['...X...', '...X...', 'XXXXXXX', '.XXXXX.', '..XXX..', '.XX.XX.', '.X...X.']

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

/** Une icône pixel art : un petit SVG fait de carrés, net à n'importe quelle taille. */
function createPixelIcon(grid: readonly string[], color: string): SVGSVGElement {
  const scale = HUD_STYLE.iconScale
  const width = (grid[0] ?? '').length
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg')
  svg.setAttribute('width', String(width * scale))
  svg.setAttribute('height', String(grid.length * scale))
  svg.setAttribute('viewBox', `0 0 ${width} ${grid.length}`)
  svg.setAttribute('shape-rendering', 'crispEdges')
  svg.style.display = 'block'
  grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] !== 'X') continue
      const cell = document.createElementNS(SVG_NAMESPACE, 'rect')
      cell.setAttribute('x', String(x))
      cell.setAttribute('y', String(y))
      cell.setAttribute('width', '1')
      cell.setAttribute('height', '1')
      cell.setAttribute('fill', color)
      svg.appendChild(cell)
    }
  })
  return svg
}

/** Une rangée d'icônes : pleines en couleur, vides en gris violet. */
function createRow(isFilled: readonly boolean[], grid: readonly string[], color: string): HTMLDivElement {
  const row = document.createElement('div')
  row.style.cssText = `display:flex;gap:${HUD_STYLE.iconScale}px;align-items:center;min-height:${HUD_STYLE.iconScale * 7}px`
  for (const filled of isFilled) row.appendChild(createPixelIcon(grid, filled ? color : HUD_STYLE.emptyColor))
  return row
}

export function createHudView(parent: HTMLElement): HudView {
  const root = document.createElement('div')
  root.style.cssText = [
    'position:fixed',
    `top:calc(${HUD_STYLE.margin}px + env(safe-area-inset-top, 0px))`,
    `right:calc(${HUD_STYLE.margin}px + env(safe-area-inset-right, 0px))`,
    'z-index:9',
    'display:flex',
    'flex-direction:column',
    'align-items:flex-end',
    'gap:6px',
    'padding:8px 10px',
    `background:${HUD_STYLE.panelFill}`,
    `border:2px solid ${HUD_STYLE.textColor}`,
    `color:${HUD_STYLE.textColor}`,
    'font:bold 16px monospace',
    'text-shadow:1px 1px 0 #2b1e3a',
    'pointer-events:none',
    'user-select:none',
    '-webkit-user-select:none',
  ].join(';')
  parent.appendChild(root)

  // Ce qui est déjà dessiné : on ne reconstruit pas le HUD à chaque image.
  let lastPaint = ''

  return {
    setVisible(isVisible) {
      root.style.display = isVisible ? 'flex' : 'none'
    },

    update(state) {
      const paint = JSON.stringify(state)
      if (paint === lastPaint) return
      lastPaint = paint

      const money = document.createElement('div')
      money.textContent = formatMoney(state.money)
      root.replaceChildren(
        createRow(computeHearts(state.health, state.maxHealth), HEART, HUD_STYLE.heartColor),
        createRow(computeStars(state.wantedLevel, state.maxWantedLevel), STAR, HUD_STYLE.starColor),
        money,
      )
    },
  }
}
