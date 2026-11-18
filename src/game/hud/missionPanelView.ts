// Le panneau de mission, en haut au centre : le titre, la consigne en cours, le chrono, et les messages (mission lancée, réussie, échouée).
// Expose : MissionPanelView, createMissionPanelView().
// Pourquoi : comme le reste de l'interface, il est en HTML par-dessus le jeu (docs/decisions.md). Il dessine ce que main.ts lui donne
// (describeMissions, et les événements de la brique missions) et ne décide de rien. Il ne reçoit aucun toucher.

import { MISSION_PANEL_STYLE } from '../constants'
import { formatSeconds } from '../missionGuide'
import type { MissionPanel } from '../missionGuide'

export interface MissionPanelView {
  /** À appeler à chaque image : rien n'est réécrit si rien n'a changé. */
  update(panel: MissionPanel | undefined): void
  /** Un message bref sous le panneau (« Mission réussie ! +150 € »), qui s'efface tout seul. */
  showMessage(text: string, isGood: boolean): void
}

const style = MISSION_PANEL_STYLE

export function createMissionPanelView(parent: HTMLElement): MissionPanelView {
  const root = document.createElement('div')
  root.style.cssText = [
    'position:fixed',
    'top:calc(12px + env(safe-area-inset-top, 0px))',
    'left:50%',
    'transform:translateX(-50%)',
    'max-width:min(460px, 60vw)',
    'z-index:9',
    'display:flex',
    'flex-direction:column',
    'align-items:center',
    'gap:6px',
    'font:bold 14px monospace',
    'text-align:center',
    'text-shadow:1px 1px 0 #2b1e3a',
    'pointer-events:none',
    'user-select:none',
    '-webkit-user-select:none',
  ].join(';')
  const panel = document.createElement('div')
  panel.style.cssText = `display:none;padding:6px 12px;background:${style.panelFill};border:2px solid ${style.textColor};color:${style.textColor};line-height:1.45`
  const message = document.createElement('div')
  message.style.cssText = `display:none;padding:4px 10px;background:${style.panelFill};font-size:15px`
  root.append(panel, message)
  parent.appendChild(root)

  let lastPaint = ''
  let messageTimer: ReturnType<typeof setTimeout> | undefined

  return {
    update(state) {
      const paint = state === undefined ? '' : JSON.stringify(state)
      if (paint === lastPaint) return
      lastPaint = paint
      panel.style.display = state === undefined ? 'none' : 'block'
      panel.replaceChildren()
      if (state === undefined) return
      const title = document.createElement('div')
      title.style.color = style.titleColor
      title.textContent = `${state.title} · ${state.objectiveNumber}/${state.objectiveCount}`
      const text = document.createElement('div')
      text.textContent = state.objectiveText
      panel.append(title, text)
      if (state.secondsLeft === undefined) return
      const timer = document.createElement('div')
      timer.style.cssText = `font-size:18px;color:${state.secondsLeft <= style.urgentSeconds ? style.urgentColor : style.textColor}`
      timer.textContent = `⏱ ${formatSeconds(state.secondsLeft)}`
      panel.append(timer)
    },
    showMessage(text, isGood) {
      message.textContent = text
      message.style.color = isGood ? style.titleColor : style.urgentColor
      message.style.display = 'block'
      clearTimeout(messageTimer)
      messageTimer = setTimeout(() => (message.style.display = 'none'), style.messageSeconds * 1000)
    },
  }
}
