// Les immeubles : de vraies boîtes, avec leur toit généré sur le dessus et des façades dessinées par le code.
// Expose : createBuildings(), Buildings.
// Pourquoi : en vraie 3D, le relief n'est pas un effet : la caméra voit vraiment les façades, et le soleil projette de vraies ombres.
// Les fenêtres sont aussi peintes dans une seconde texture « lumineuse » : la nuit, une partie d'entre elles s'allument.

import * as THREE from 'three'
import type { TileMap } from '../../sim/core'
import type { RoofTexture } from '../assets'
import { FACADE_COLORS, LIT_WINDOW_COLOR, WINDOW_COLOR } from '../constants'
import { hashToUnit } from '../hash'
import { findBuildingBlocks } from './buildingBlocks'
import { computeFacadeWindows } from './facadeLayout'
import { pixelTexture } from './textures'
import type { Textures } from './textures'

export interface Buildings {
  /** `night` va de 0 (jour) à 1 (pleine nuit) : règle l'éclat des fenêtres allumées. */
  setNight(night: number): void
}

/** En 3D, on exagère un peu la hauteur des immeubles : ils ont plus d'allure vus de biais. */
const HEIGHT_SCALE = 2.2
/** Taille d'un pixel des façades, en pixels du monde (2 : des façades au grain proche du reste de la ville). */
const FACADE_TEXEL = 2
const LIT_WINDOW_RATE = 0.55
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

const toCss = (color: number) => `#${color.toString(16).padStart(6, '0')}`

/** Dessine une façade (`color`, fenêtres, porte) et son calque lumineux (fenêtres allumées la nuit). */
function createFacade(width: number, height: number, color: number, seed: number, hasDoor: boolean): { map: THREE.Texture; glow: THREE.Texture } {
  const texelsWide = Math.max(1, Math.round(width / FACADE_TEXEL))
  const texelsHigh = Math.max(1, Math.round(height / FACADE_TEXEL))
  const makeCanvas = () => {
    const canvas = document.createElement('canvas')
    canvas.width = texelsWide
    canvas.height = texelsHigh
    const context = canvas.getContext('2d')
    if (context === null) throw new Error('Canvas 2D indisponible')
    context.scale(1 / FACADE_TEXEL, 1 / FACADE_TEXEL)
    return { canvas, context }
  }
  const facade = makeCanvas()
  const glow = makeCanvas()
  facade.context.fillStyle = toCss(color)
  facade.context.fillRect(0, 0, width, height)
  // Un soubassement plus sombre et une corniche claire : on lit mieux les étages.
  facade.context.fillStyle = 'rgba(43,30,58,0.18)'
  facade.context.fillRect(0, height - 4, width, 4)
  facade.context.fillStyle = 'rgba(255,248,236,0.35)'
  facade.context.fillRect(0, 0, width, 2)
  glow.context.fillStyle = '#000000'
  glow.context.fillRect(0, 0, width, height)

  const { windows, door } = computeFacadeWindows(width, height, hasDoor)
  for (const window of windows) {
    facade.context.fillStyle = toCss(WINDOW_COLOR)
    facade.context.fillRect(window.x, window.y, window.width, window.height)
    facade.context.fillStyle = 'rgba(255,255,255,0.25)'
    facade.context.fillRect(window.x, window.y, window.width, FACADE_TEXEL)
    if (hashToUnit(seed, window.floor * 97 + window.column, 13) < LIT_WINDOW_RATE) {
      glow.context.fillStyle = toCss(LIT_WINDOW_COLOR)
      glow.context.fillRect(window.x, window.y, window.width, window.height)
    }
  }
  if (door) {
    facade.context.fillStyle = '#6b4228'
    facade.context.fillRect(door.x, door.y, door.width, door.height)
    glow.context.fillStyle = 'rgba(255,210,122,0.5)'
    glow.context.fillRect(door.x, door.y, door.width, Math.round(door.height / 3))
  }
  return { map: pixelTexture(new THREE.CanvasTexture(facade.canvas)), glow: pixelTexture(new THREE.CanvasTexture(glow.canvas)) }
}

export function createBuildings(scene: THREE.Scene, map: TileMap, textures: Textures): Buildings {
  const facadeMaterials: THREE.MeshLambertMaterial[] = []

  for (const block of findBuildingBlocks(map)) {
    const seed = Math.round(block.x / map.tileSize) * 31 + Math.round(block.y / map.tileSize)
    const height = block.elevation * HEIGHT_SCALE
    const isLow = block.elevation <= 30
    const roofs = isLow ? PITCHED_ROOFS : FLAT_ROOFS
    const roofTexture = roofs[Math.floor(hashToUnit(seed, block.elevation, 11) * roofs.length)] ?? 'beton-clim'
    const color = FACADE_COLORS[Math.floor(hashToUnit(seed, 3, 12) * FACADE_COLORS.length)] ?? 0xe9c8a0

    // Une façade par côté : est et ouest ont la profondeur de l'immeuble, nord et sud sa largeur. La porte est au sud.
    const side = (faceWidth: number, faceSeed: number, hasDoor: boolean) => {
      const { map: facadeMap, glow } = createFacade(faceWidth, height, color, seed * 7 + faceSeed, hasDoor)
      const material = new THREE.MeshLambertMaterial({ map: facadeMap, emissive: 0xffffff, emissiveMap: glow, emissiveIntensity: 0 })
      facadeMaterials.push(material)
      return material
    }
    const roof = new THREE.MeshLambertMaterial({ map: textures.roofs[roofTexture] })
    const bottom = new THREE.MeshLambertMaterial({ color: 0x2b1e3a })
    // Ordre des faces d'une boîte three.js : +x (est), -x (ouest), +y (toit), -y (dessous), +z (sud), -z (nord).
    const materials = [side(block.height, 1, false), side(block.height, 2, false), roof, bottom, side(block.width, 3, true), side(block.width, 4, false)]
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(block.width, height, block.height), materials)
    mesh.position.set(block.x + block.width / 2, height / 2, block.y + block.height / 2)
    mesh.castShadow = true
    mesh.receiveShadow = true
    scene.add(mesh)
  }

  let currentNight = -1
  return {
    setNight(night) {
      // On ne touche aux matériaux que si la nuit a changé (elle ne change que pendant la transition).
      if (Math.abs(night - currentNight) < 0.005) return
      currentNight = night
      for (const material of facadeMaterials) material.emissiveIntensity = night * 1.1
    },
  }
}
