// Le sol de la ville : textures, marquages, bordures, et l'eau animée.
// Expose : createGround(), Ground.
// Pourquoi : le sol ne bouge pas : on le peint une seule fois dans une grande image (rapide à afficher). L'eau, elle, vit : elle est dessinée
// dessous, sur deux couches qui glissent lentement en sens contraire, et se voit à travers les trous laissés dans le sol.
// Il lit la carte et ne la modifie jamais.

import Phaser from 'phaser'
import type { TileMap } from '../../sim/core'
import { tileKey } from '../assets'
import { computeGroundLayout } from './groundLayout'

export interface Ground {
  /** À appeler à chaque image : fait onduler l'eau. */
  update(timeSeconds: number): void
}

/** Profondeurs : l'eau sous le sol, les marquages juste au-dessus. */
const WATER_DEPTH = -2
const GROUND_DEPTH = 0
const MARKINGS_DEPTH = 0.5

/** Couleurs des marquages (palette de docs/style.md). */
const DASH_COLOR = 0xf2efe6
const CURB_COLOR = 0x8e8678
const FOAM_COLOR = 0xfff8ec

export function createGround(scene: Phaser.Scene, map: TileMap): Ground {
  const width = map.width * map.tileSize
  const height = map.height * map.tileSize
  const layout = computeGroundLayout(map)

  // L'eau : deux couches de la même texture, la seconde plus grande et transparente, qui glissent l'une sur l'autre.
  const water = scene.add.tileSprite(0, 0, width, height, tileKey('eau')).setOrigin(0).setDepth(WATER_DEPTH)
  const ripples = scene.add
    .tileSprite(0, 0, width, height, tileKey('eau'))
    .setOrigin(0)
    .setDepth(WATER_DEPTH + 0.1)
    .setAlpha(0.35)
    .setTileScale(2)

  // Le sol, peint une fois. Les cases tournées (passages piétons des routes verticales) passent par un tampon tourné d'un quart de tour.
  const ground = scene.add.renderTexture(0, 0, width, height).setOrigin(0).setDepth(GROUND_DEPTH)
  const rotatedStamp = scene.make
    .image({ x: 0, y: 0, key: tileKey('asphalte'), add: false })
    .setOrigin(0.5)
    .setAngle(90)
  const half = map.tileSize / 2
  for (const tile of layout.tiles) {
    const x = tile.tileX * map.tileSize
    const y = tile.tileY * map.tileSize
    if (tile.isRotated) {
      rotatedStamp.setTexture(tileKey(tile.texture))
      ground.draw(rotatedStamp, x + half, y + half)
    } else {
      ground.draw(tileKey(tile.texture), x, y)
    }
  }
  rotatedStamp.destroy()

  const markings = scene.add.graphics().setDepth(MARKINGS_DEPTH)
  markings.lineStyle(2, CURB_COLOR, 1)
  for (const curb of layout.curbs) markings.lineBetween(curb.x1, curb.y1, curb.x2, curb.y2)
  markings.lineStyle(2, DASH_COLOR, 0.85)
  for (const dash of layout.laneDashes) markings.lineBetween(dash.x1, dash.y1, dash.x2, dash.y2)
  markings.lineStyle(3, FOAM_COLOR, 0.55)
  for (const shore of layout.shores) markings.lineBetween(shore.x1, shore.y1, shore.x2, shore.y2)

  return {
    update(timeSeconds) {
      water.tilePositionX = timeSeconds * 6
      water.tilePositionY = timeSeconds * 3
      ripples.tilePositionX = -timeSeconds * 4
      ripples.tilePositionY = timeSeconds * 5
      // L'écume respire doucement le long des rivages.
      markings.setAlpha(0.9 + Math.sin(timeSeconds * 1.6) * 0.1)
    },
  }
}
