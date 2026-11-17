// Le panneau de la concession et du garage : le nom du lieu, une aide, et les choix numérotés (touches 1 à 9, ou un clic / un toucher).
// Expose : ShopPanelView, createShopPanelView().
// Pourquoi : comme le reste de l'interface, il est en HTML par-dessus le jeu. Il dessine ce que lui donne describeShops (src/game/shopGuide.ts)
// et signale le choix du joueur par `onChoose` : main.ts envoie alors la commande du choix à la simulation. Il ne décide de rien.

import { SHOP_PANEL_STYLE } from '../constants'

/** Ce que le panneau affiche (la forme que produit describeShops) : un choix est actif s'il porte une commande ou une action d'interface. */
export interface ShopPanelState {
  title: string
  hint: string
  choices: Array<{ label: string; detail: string; command?: unknown; uiAction?: unknown }>
}

export interface ShopPanelView {
  /** À appeler à chaque image : rien n'est réécrit si rien n'a changé. */
  update(panel: ShopPanelState | undefined): void
  /** Appelé avec le rang du choix (à partir de 0) quand le joueur clique ou touche un choix actif. */
  onChoose(action: (index: number) => void): void
}

const style = SHOP_PANEL_STYLE

export function createShopPanelView(parent: HTMLElement): ShopPanelView {
  const root = document.createElement('div')
  root.style.cssText = [
    'position:fixed',
    `right:calc(${style.margin}px + env(safe-area-inset-right, 0px))`,
    `top:${style.top}px`,
    'width:min(320px, 70vw)',
    'z-index:9',
    'display:none',
    'padding:8px 10px',
    `background:${style.panelFill}`,
    `border:2px solid ${style.textColor}`,
    `color:${style.textColor}`,
    'font:bold 13px monospace',
    'text-shadow:1px 1px 0 #2b1e3a',
    'user-select:none',
    '-webkit-user-select:none',
  ].join(';')
  parent.appendChild(root)

  const listeners: Array<(index: number) => void> = []
  let lastPaint = ''

  return {
    update(panel) {
      const paint = panel === undefined ? '' : JSON.stringify(panel)
      if (paint === lastPaint) return
      lastPaint = paint
      root.style.display = panel === undefined ? 'none' : 'block'
      root.replaceChildren()
      if (panel === undefined) return
      const title = document.createElement('div')
      title.style.cssText = `color:${style.titleColor};font-size:15px`
      title.textContent = panel.title
      const hint = document.createElement('div')
      hint.style.cssText = 'font-weight:normal;font-size:11px;margin:2px 0 6px;opacity:0.85'
      hint.textContent = panel.hint
      root.append(title, hint)
      panel.choices.forEach((choice, index) => {
        const isActive = choice.command !== undefined || choice.uiAction !== undefined
        const button = document.createElement('button')
        button.type = 'button'
        button.disabled = !isActive
        button.style.cssText = [
          'display:flex',
          'justify-content:space-between',
          'gap:8px',
          'width:100%',
          'margin-top:4px',
          'padding:6px 8px',
          'font:inherit',
          'text-align:left',
          `color:${isActive ? style.textColor : style.disabledColor}`,
          `background:${isActive ? style.choiceFill : 'transparent'}`,
          `border:1px solid ${isActive ? style.textColor : style.disabledColor}`,
          `cursor:${isActive ? 'pointer' : 'default'}`,
          'touch-action:manipulation',
        ].join(';')
        const label = document.createElement('span')
        label.textContent = index < 9 ? `${index + 1}. ${choice.label}` : choice.label
        const detail = document.createElement('span')
        detail.textContent = choice.detail
        button.append(label, detail)
        // Le clic ne doit pas atteindre le jeu (ni les commandes tactiles en dessous).
        button.addEventListener('pointerdown', (event) => event.stopPropagation())
        button.addEventListener('click', () => {
          if (isActive) for (const listener of listeners) listener(index)
        })
        root.append(button)
      })
      if (panel.choices.length === 0) {
        const empty = document.createElement('div')
        empty.style.cssText = 'font-weight:normal;opacity:0.85'
        empty.textContent = 'Rien à faire ici pour l’instant.'
        root.append(empty)
      }
    },
    onChoose(action) {
      listeners.push(action)
    },
  }
}
