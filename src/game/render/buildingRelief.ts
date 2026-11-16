// Le relief des immeubles (essai #26) : façades en perspective avec leurs fenêtres, toits texturés, ombres portées au sol, et la nuit.
// Expose : createBuildingRelief(), BuildingRelief.
// Pourquoi : la ville reste en 2D pour la simulation (collisions, conduite, coop), mais l'affichage donne du volume aux immeubles.
// Les toits s'écartent du centre de l'écran selon leur hauteur : quand la caméra bouge, les façades apparaissent et disparaissent.
// La nuit, les immeubles s'assombrissent et une partie des fenêtres s'allume.
// Il lit la carte et ne la modifie jamais. Il se coupe avec setEnabled(false) pour comparer.

import Phaser from 'phaser'
import type { TileMap } from '../../sim/core'
import { roofKey } from '../assets'
import type { RoofTexture } from '../assets'
import { COLORS, FACADE_COLORS, LIT_WINDOW_COLOR, NIGHT_TINT, RELIEF_EYE_HEIGHT_PX, SHADOW_ALPHA, SHADOW_COLOR, SHADOW_OFFSET_PER_PX, WALL_SHADES, WINDOW_COLOR } from '../constants'
import { hashToUnit } from '../hash'
import { findBuildingBlocks } from './buildingBlocks'
import type { BuildingBlock } from './buildingBlocks'
import { isWallFacingCamera, projectRaised } from './perspective'
import type { WallSide, WorldPoint } from './perspective'

export interface BuildingRelief {
  /** À appeler à chaque image : redessine les immeubles vus depuis le centre de la caméra. `night` va de 0 (jour) à 1 (pleine nuit). */
  update(cameraCenter: WorldPoint, night: number): void
  setEnabled(isEnabled: boolean): void
  isEnabled(): boolean
}

/** Profondeurs : ombres au ras du sol ; immeubles au-dessus de tout le reste (ils cachent ce qui passe derrière), et de l'obscurité de la nuit. */
const SHADOW_DEPTH = 1
const BUILDING_DEPTH = 15
/** Petit écart de profondeur entre deux immeubles, pour les ranger du plus loin au plus proche. */
const DEPTH_STEP = 0.001

/** Les toits des maisons basses (pentus) et des immeubles (plats, avec de quoi raconter une histoire). */
const PITCHED_ROOFS: readonly RoofTexture[] = ['tuiles-rouges', 'ardoise', 'tuiles-roses', 'zinc']
const FLAT_ROOFS: readonly RoofTexture[] = [
  'beton-clim',
  'gravier-ventilation',
  'jardin',
  'piscine',
  'panneaux-solaires',
  'verrieres',
  'goudron-cheminee',
  'terrasse-barbecue',
  'chateau-eau',
  'verre',
  'paraboles',
  'linge',
]
/** Hauteur d'un étage, en px : sert à compter les rangées de fenêtres. */
const FLOOR_HEIGHT_PX = 20
/** Largeur occupée par une fenêtre et son mur, en px. */
const WINDOW_SPACING_PX = 14
/** Part des fenêtres allumées la nuit. */
const LIT_WINDOW_RATE = 0.55

/** Une couleur multipliée par un facteur (assombrie si < 1). */
function shade(color: number, factor: number): number {
  const channel = (shift: number) => Math.min(255, Math.round(((color >> shift) & 0xff) * factor))
  return (channel(16) << 16) | (channel(8) << 8) | channel(0)
}

/** Le mélange de deux couleurs (t = 0 : la première, t = 1 : la seconde). */
function mix(from: number, to: number, t: number): number {
  const channel = (shift: number) => Math.round(((from >> shift) & 0xff) * (1 - t) + ((to >> shift) & 0xff) * t)
  return (channel(16) << 16) | (channel(8) << 8) | channel(0)
}

/** Un point d'une façade : u le long du mur (0 → 1), v en hauteur (0 = sol, 1 = toit). */
function pointOnWall(baseFrom: WorldPoint, baseTo: WorldPoint, topFrom: WorldPoint, topTo: WorldPoint, u: number, v: number): Phaser.Math.Vector2 {
  const bottomX = baseFrom.x + (baseTo.x - baseFrom.x) * u
  const bottomY = baseFrom.y + (baseTo.y - baseFrom.y) * u
  const topX = topFrom.x + (topTo.x - topFrom.x) * u
  const topY = topFrom.y + (topTo.y - topFrom.y) * u
  return new Phaser.Math.Vector2(bottomX + (topX - bottomX) * v, bottomY + (topY - bottomY) * v)
}

interface BlockView {
  block: BuildingBlock
  walls: Phaser.GameObjects.Graphics
  roof: Phaser.GameObjects.Image
  facadeColor: number
  seed: number
}

export function createBuildingRelief(scene: Phaser.Scene, map: TileMap): BuildingRelief {
  const shadows = scene.add.graphics().setDepth(SHADOW_DEPTH)
  let enabled = true

  const views: BlockView[] = findBuildingBlocks(map).map((block) => {
    const seed = Math.round(block.x / map.tileSize) * 31 + Math.round(block.y / map.tileSize)
    const isLow = block.elevation <= 30
    const roofs = isLow ? PITCHED_ROOFS : FLAT_ROOFS
    const roofTexture = roofs[Math.floor(hashToUnit(seed, block.elevation, 11) * roofs.length)] ?? 'beton-clim'
    const facadeColor = FACADE_COLORS[Math.floor(hashToUnit(seed, 3, 12) * FACADE_COLORS.length)] ?? 0xe9c8a0
    return {
      block,
      seed,
      facadeColor,
      walls: scene.add.graphics(),
      roof: scene.add.image(block.x, block.y, roofKey(roofTexture)).setOrigin(0),
    }
  })

  // Les ombres ne dépendent pas de la caméra : on les dessine une fois. Ombre = le bloc « étiré » vers le bas à droite.
  shadows.fillStyle(SHADOW_COLOR, SHADOW_ALPHA)
  for (const { block } of views) {
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

  function drawBlock(view: BlockView, cameraCenter: WorldPoint, night: number) {
    const { block, walls, roof } = view
    const raise = (point: WorldPoint): WorldPoint => projectRaised(point, block.elevation, cameraCenter, RELIEF_EYE_HEIGHT_PX)
    const northWest = { x: block.x, y: block.y }
    const northEast = { x: block.x + block.width, y: block.y }
    const southEast = { x: block.x + block.width, y: block.y + block.height }
    const southWest = { x: block.x, y: block.y + block.height }
    const sides: Array<[WallSide, WorldPoint, WorldPoint]> = [
      ['north', northEast, northWest],
      ['east', southEast, northEast],
      ['south', southWest, southEast],
      ['west', northWest, southWest],
    ]
    const darkness = 1 - night * 0.62
    const floors = Math.max(1, Math.round(block.elevation / FLOOR_HEIGHT_PX))

    walls.clear()
    sides.forEach(([side, from, to], sideIndex) => {
      if (!isWallFacingCamera(side, block, cameraCenter)) return
      const topFrom = raise(from)
      const topTo = raise(to)
      const wall = [from, to, topTo, topFrom].map((point) => new Phaser.Math.Vector2(point.x, point.y))
      walls.fillStyle(mix(shade(view.facadeColor, WALL_SHADES[side] * darkness), NIGHT_TINT, night * 0.35), 1)
      walls.fillPoints(wall, true)

      // Les fenêtres, étage par étage. La nuit, certaines s'allument (toujours les mêmes).
      const length = Math.abs(to.x - from.x) + Math.abs(to.y - from.y)
      const columns = Math.max(1, Math.floor(length / WINDOW_SPACING_PX))
      for (let floor = 0; floor < floors; floor++) {
        for (let column = 0; column < columns; column++) {
          const isLit = night > 0.05 && hashToUnit(view.seed * 7 + sideIndex, floor * 97 + column, 13) < LIT_WINDOW_RATE
          const color = isLit ? mix(WINDOW_COLOR, LIT_WINDOW_COLOR, night) : shade(WINDOW_COLOR, darkness)
          const u0 = (column + 0.28) / columns
          const u1 = (column + 0.72) / columns
          const v0 = (floor + 0.3) / floors
          const v1 = (floor + 0.72) / floors
          walls.fillStyle(color, 1)
          walls.fillPoints(
            [
              pointOnWall(from, to, topFrom, topTo, u0, v0),
              pointOnWall(from, to, topFrom, topTo, u1, v0),
              pointOnWall(from, to, topFrom, topTo, u1, v1),
              pointOnWall(from, to, topFrom, topTo, u0, v1),
            ],
            true,
          )
        }
      }
      walls.lineStyle(1, COLORS.outline, 0.7)
      walls.strokePoints(wall, true)
    })

    // Le toit : la projection d'un rectangle reste un rectangle (agrandi depuis le centre de la caméra) : l'image est simplement placée et étirée.
    const topLeft = raise(northWest)
    const bottomRight = raise(southEast)
    roof.setPosition(topLeft.x, topLeft.y).setDisplaySize(bottomRight.x - topLeft.x, bottomRight.y - topLeft.y)
    roof.setTint(mix(0xffffff, NIGHT_TINT, night * 0.75))
    walls.lineStyle(1, COLORS.outline, 1)
    walls.strokeRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y)
  }

  function setVisible(isVisible: boolean) {
    shadows.setVisible(isVisible)
    for (const view of views) {
      view.walls.setVisible(isVisible)
      view.roof.setVisible(isVisible)
    }
  }

  return {
    update(cameraCenter, night) {
      if (!enabled) return
      // Du plus loin au plus proche du centre : un immeuble proche passe devant un immeuble lointain.
      const distance = ({ block }: BlockView): number => {
        const dx = block.x + block.width / 2 - cameraCenter.x
        const dy = block.y + block.height / 2 - cameraCenter.y
        return dx * dx + dy * dy
      }
      const ordered = [...views].sort((first, second) => distance(second) - distance(first))
      ordered.forEach((view, rank) => {
        // Le toit juste au-dessus de ses propres façades, et sous l'immeuble suivant (plus proche).
        view.walls.setDepth(BUILDING_DEPTH + rank * DEPTH_STEP)
        view.roof.setDepth(BUILDING_DEPTH + rank * DEPTH_STEP + DEPTH_STEP / 2)
        drawBlock(view, cameraCenter, night)
      })
    },
    setEnabled(isEnabled) {
      enabled = isEnabled
      setVisible(isEnabled)
    },
    isEnabled: () => enabled,
  }
}
