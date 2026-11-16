// Le suivi des doigts : qui tient le joystick, qui tient le bouton d'action, qui vient d'appuyer sur « E ».
// Expose : TouchTracker, TouchState, createTouchTracker().
// Pourquoi : cette partie ne dépend pas du navigateur, donc elle se teste dans Node (touchInput.ts la branche sur les vrais événements).
// Chaque doigt est suivi par son identifiant : un pouce gauche pilote le joystick pendant qu'un pouce droit tient « courir ». Un doigt garde le rôle qu'il a eu en se posant,
// même s'il glisse ensuite sur un bouton. Le joystick est « flottant » : son centre est l'endroit où le pouce s'est posé.

import { TOUCH_CONTROLS } from '../constants'
import { clampToRadius, readJoystickKeys } from './joystick'
import type { JoystickKeys } from './joystick'
import { findTouchRole } from './touchLayout'
import type { TouchRole } from './touchLayout'

/** Ce que l'affichage a besoin de savoir : où est le joystick (s'il y a un doigt dessus) et si les boutons sont tenus. */
export interface TouchState {
  /** Le joystick tenu : son centre (là où le pouce s'est posé) et la position de la manette, ramenée dans le cercle. */
  joystick: { baseX: number; baseY: number; thumbX: number; thumbY: number } | undefined
  /** Le bouton d'action est tenu (« courir » à pied, « frein à main » en voiture). */
  isActionHeld: boolean
  /** Le bouton « E » est tenu. */
  isInteractHeld: boolean
}

export interface TouchTracker {
  /** Un doigt se pose en (x, y) ; l'écran fait screenWidth × screenHeight. */
  press(pointerId: number, x: number, y: number, screenWidth: number, screenHeight: number): void
  /** Un doigt posé bouge. Sans effet pour un doigt inconnu. */
  move(pointerId: number, x: number, y: number): void
  /** Un doigt se lève (ou son toucher est interrompu). Sans effet pour un doigt inconnu. */
  release(pointerId: number): void
  /** Lâche tout : la fenêtre perd le focus, ou on quitte le mode tactile. */
  releaseAll(): void
  /** Les directions demandées par le joystick à cet instant. */
  readJoystickKeys(): JoystickKeys
  /** Le bouton d'action est tenu. */
  isActionHeld(): boolean
  /** Vrai une seule fois par appui sur « E ». */
  consumeInteract(): boolean
  /** L'état à afficher. */
  readState(): TouchState
}

interface Finger {
  role: TouchRole
  startX: number
  startY: number
  x: number
  y: number
}

export function createTouchTracker(): TouchTracker {
  const fingers = new Map<number, Finger>()
  let isInteractPending = false

  const findFingerWithRole = (role: TouchRole): Finger | undefined => [...fingers.values()].find((finger) => finger.role === role)

  return {
    press(pointerId, x, y, screenWidth, screenHeight) {
      const role = findTouchRole(x, y, screenWidth, screenHeight)
      if (role === undefined) return
      // Un seul doigt par commande : un deuxième doigt sur le joystick ou sur un même bouton est ignoré.
      if (findFingerWithRole(role) !== undefined && !fingers.has(pointerId)) return
      fingers.set(pointerId, { role, startX: x, startY: y, x, y })
      if (role === 'interact') isInteractPending = true
    },

    move(pointerId, x, y) {
      const finger = fingers.get(pointerId)
      if (finger === undefined) return
      finger.x = x
      finger.y = y
    },

    release(pointerId) {
      fingers.delete(pointerId)
    },

    releaseAll() {
      fingers.clear()
      isInteractPending = false
    },

    readJoystickKeys() {
      const finger = findFingerWithRole('joystick')
      if (finger === undefined) return { up: false, down: false, left: false, right: false }
      return readJoystickKeys(finger.x - finger.startX, finger.y - finger.startY, TOUCH_CONTROLS.deadZone)
    },

    isActionHeld() {
      return findFingerWithRole('action') !== undefined
    },

    consumeInteract() {
      const wasPending = isInteractPending
      isInteractPending = false
      return wasPending
    },

    readState() {
      const finger = findFingerWithRole('joystick')
      const thumb = finger === undefined ? undefined : clampToRadius(finger.x - finger.startX, finger.y - finger.startY, TOUCH_CONTROLS.joystickRadius)
      return {
        joystick: finger === undefined || thumb === undefined ? undefined : { baseX: finger.startX, baseY: finger.startY, thumbX: finger.startX + thumb.x, thumbY: finger.startY + thumb.y },
        isActionHeld: findFingerWithRole('action') !== undefined,
        isInteractHeld: findFingerWithRole('interact') !== undefined,
      }
    },
  }
}
