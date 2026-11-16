// La déco de la ville : arbres, bancs, lampadaires, fontaine, parasols…, avec leurs ombres, et le feuillage qui ondule au vent.
// Expose : createDecor(), Decor.
// Pourquoi : affichage seulement (la déco ne bloque pas encore le passage, voir placeDecor.ts). Les éléments hauts (arbres, lampadaires,
// parasols) passent au-dessus du joueur et des voitures ; les éléments bas restent au ras du sol.

import Phaser from 'phaser'
import type { TileMap } from '../../sim/core'
import { propKey } from '../assets'
import { placeDecor } from '../decor/placeDecor'
import { PROP_STYLES } from '../decor/propStyles'
import { hashToUnit } from '../hash'
import { SHADOW_COLOR } from '../constants'

/** Une source de lumière de nuit posée dans le monde (un lampadaire). */
export interface DecorLight {
  x: number
  y: number
  radius: number
}

export interface Decor {
  /** À appeler à chaque image : fait onduler le feuillage. */
  update(timeSeconds: number): void
  /** Les lampadaires, pour l'éclairage de nuit. */
  lights: readonly DecorLight[]
}

/** Profondeurs : ombres au sol, déco basse sous les voitures (5), déco haute au-dessus du joueur (10) et sous l'obscurité de la nuit (14). */
const SHADOW_DEPTH = 1
const LOW_DEPTH = 4
const TALL_DEPTH = 12
/** Ampleur du balancement du feuillage, en degrés. */
const SWAY_DEGREES = 2.5

export function createDecor(scene: Phaser.Scene, map: TileMap): Decor {
  const items = placeDecor(map)
  const shadows = scene.add.graphics().setDepth(SHADOW_DEPTH)
  const swaying: Array<{ image: Phaser.GameObjects.Image; phase: number; speed: number }> = []
  const lights: DecorLight[] = []

  for (const item of items) {
    const style = PROP_STYLES[item.prop]
    // L'ombre tombe en bas à droite (soleil en haut à gauche), un peu plus loin pour les éléments hauts.
    const offset = style.isTall ? style.size * 0.28 : style.size * 0.12
    shadows.fillStyle(SHADOW_COLOR, 0.35)
    shadows.fillEllipse(item.x + offset, item.y + offset * 0.8 + style.size * 0.2, style.shadow.width, style.shadow.height)

    const image = scene.add
      .image(Math.round(item.x), Math.round(item.y), propKey(item.prop))
      .setDisplaySize(style.size, style.size)
      .setDepth(style.isTall ? TALL_DEPTH : LOW_DEPTH)
    if (style.sways) {
      // Le feuillage tourne autour du pied : origine en bas.
      image.setOrigin(0.5, 0.9).setPosition(Math.round(item.x), Math.round(item.y + style.size * 0.4))
      swaying.push({ image, phase: hashToUnit(Math.round(item.x), Math.round(item.y), 3) * Math.PI * 2, speed: 0.9 + hashToUnit(Math.round(item.x), Math.round(item.y), 4) * 0.6 })
    }
    if (style.lightRadius !== undefined) lights.push({ x: item.x, y: item.y, radius: style.lightRadius })
  }

  return {
    update(timeSeconds) {
      for (const { image, phase, speed } of swaying) image.setAngle(Math.sin(timeSeconds * speed + phase) * SWAY_DEGREES)
    },
    lights,
  }
}
