// Le relief des immeubles (essai #26) : façades en perspective, toits décalés, ombres portées au sol.
// Expose : createBuildingRelief(), BuildingRelief.
// Pourquoi : la ville reste en 2D pour la simulation (collisions, conduite, coop), mais l'affichage donne du volume aux immeubles.
// Les toits s'écartent du centre de l'écran selon leur hauteur : quand la caméra bouge, les façades apparaissent et disparaissent.
// Il lit la carte et ne la modifie jamais. Il se coupe avec setEnabled(false) pour comparer.

import Phaser from 'phaser'
import type { TileMap } from '../../sim/core'
import { BUILDING_EDGE_COLOR, COLORS, RELIEF_EYE_HEIGHT_PX, SHADOW_ALPHA, SHADOW_COLOR, SHADOW_OFFSET_PER_PX, TILE_COLORS, WALL_SHADES } from '../constants'
import { findBuildingBlocks } from './buildingBlocks'
import type { BuildingBlock } from './buildingBlocks'
import { isWallFacingCamera, projectRaised } from './perspective'
import type { WallSide, WorldPoint } from './perspective'

export interface BuildingRelief {
  /** À appeler à chaque image, une fois la caméra placée : redessine les immeubles vus depuis le centre de la caméra. */
  update(cameraCenter: WorldPoint): void
  setEnabled(isEnabled: boolean): void
  isEnabled(): boolean
}

/** Profondeurs d'affichage : les ombres au ras du sol (sous les voitures), les immeubles au-dessus du joueur et des voitures (ils les cachent quand ils sont devant). */
const SHADOW_DEPTH = 1
const BUILDING_DEPTH = 15

/** Une couleur assombrie (facteur < 1). */
function shade(color: number, factor: number): number {
  const red = Math.round(((color >> 16) & 0xff) * factor)
  const green = Math.round(((color >> 8) & 0xff) * factor)
  const blue = Math.round((color & 0xff) * factor)
  return (red << 16) | (green << 8) | blue
}

export function createBuildingRelief(scene: Phaser.Scene, map: TileMap): BuildingRelief {
  const blocks = findBuildingBlocks(map)
  const roofColor = TILE_COLORS.building ?? 0xc9533f
  const shadows = scene.add.graphics().setDepth(SHADOW_DEPTH)
  const buildings = scene.add.graphics().setDepth(BUILDING_DEPTH)
  let enabled = true

  // Les ombres ne dépendent pas de la caméra : on les dessine une fois. Ombre = le bloc « étiré » vers le bas à droite.
  shadows.fillStyle(SHADOW_COLOR, SHADOW_ALPHA)
  for (const block of blocks) {
    const dx = block.elevation * SHADOW_OFFSET_PER_PX.x
    const dy = block.elevation * SHADOW_OFFSET_PER_PX.y
    const right = block.x + block.width
    const bottom = block.y + block.height
    shadows.fillPoints(
      [
        { x: right, y: block.y },
        { x: right + dx, y: block.y + dy },
        { x: right + dx, y: bottom + dy },
        { x: block.x + dx, y: bottom + dy },
        { x: block.x, y: bottom },
      ].map((point) => new Phaser.Math.Vector2(point.x, point.y)),
      true,
    )
  }

  function drawBlock(block: BuildingBlock, cameraCenter: WorldPoint) {
    const corners = {
      northWest: { x: block.x, y: block.y },
      northEast: { x: block.x + block.width, y: block.y },
      southEast: { x: block.x + block.width, y: block.y + block.height },
      southWest: { x: block.x, y: block.y + block.height },
    }
    const raise = (point: WorldPoint): WorldPoint => projectRaised(point, block.elevation, cameraCenter, RELIEF_EYE_HEIGHT_PX)
    const walls: Array<[WallSide, WorldPoint, WorldPoint]> = [
      ['north', corners.northWest, corners.northEast],
      ['east', corners.northEast, corners.southEast],
      ['south', corners.southEast, corners.southWest],
      ['west', corners.southWest, corners.northWest],
    ]

    for (const [side, from, to] of walls) {
      if (!isWallFacingCamera(side, block, cameraCenter)) continue
      const quad = [from, to, raise(to), raise(from)].map((point) => new Phaser.Math.Vector2(point.x, point.y))
      buildings.fillStyle(shade(roofColor, WALL_SHADES[side]), 1)
      buildings.fillPoints(quad, true)
      buildings.lineStyle(1, COLORS.outline, 0.6)
      buildings.strokePoints(quad, true)
    }

    const roof = [corners.northWest, corners.northEast, corners.southEast, corners.southWest].map(raise).map((point) => new Phaser.Math.Vector2(point.x, point.y))
    buildings.fillStyle(roofColor, 1)
    buildings.fillPoints(roof, true)
    buildings.lineStyle(1, COLORS.outline, 1)
    buildings.strokePoints(roof, true)
    // Un rebord intérieur, d'un ton plus sombre : on lit mieux la forme du toit.
    const inset = 4
    const ledge = [
      { x: block.x + inset, y: block.y + inset },
      { x: block.x + block.width - inset, y: block.y + inset },
      { x: block.x + block.width - inset, y: block.y + block.height - inset },
      { x: block.x + inset, y: block.y + block.height - inset },
    ]
      .map(raise)
      .map((point) => new Phaser.Math.Vector2(point.x, point.y))
    buildings.lineStyle(1, BUILDING_EDGE_COLOR, 1)
    buildings.strokePoints(ledge, true)
  }

  return {
    update(cameraCenter) {
      buildings.clear()
      if (!enabled) return
      // Du plus loin au plus proche du centre : un immeuble proche passe devant un immeuble lointain.
      const distance = (block: BuildingBlock): number => {
        const dx = block.x + block.width / 2 - cameraCenter.x
        const dy = block.y + block.height / 2 - cameraCenter.y
        return dx * dx + dy * dy
      }
      const ordered = [...blocks].sort((first, second) => distance(second) - distance(first))
      for (const block of ordered) drawBlock(block, cameraCenter)
    },
    setEnabled(isEnabled) {
      enabled = isEnabled
      shadows.setVisible(isEnabled)
      if (!isEnabled) buildings.clear()
    },
    isEnabled: () => enabled,
  }
}
