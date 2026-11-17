// Les bâtiments remarquables : la concession (une vitrine), les garages (une porte basculante) et les ateliers (une baie ouverte), chacun avec son enseigne.
// Expose : createLandmarks(), Landmarks.
// Pourquoi : on doit reconnaître de loin où acheter et où ranger ses voitures (bloc 19). Ces bâtiments sont des types de case à part
// (showroom, garage) : ils sont construits ici, d'un seul tenant comme les immeubles, avec une façade dessinée par le code. La nuit, vitrine et enseigne s'allument.

import * as THREE from 'three'
import type { TileMap } from '../../sim/core'
import { LANDMARK_VIEW } from '../constants'
import { findBuildingBlocks } from './buildingBlocks'
import type { BuildingBlock } from './buildingBlocks'
import { PIXEL_FONT_HEIGHT, drawPixelText, measurePixelText } from './pixelFont'
import { pixelTexture } from './textures'
import type { Textures } from './textures'

export interface Landmarks {
  /** `night` va de 0 (jour) à 1 (pleine nuit) : règle l'éclat des vitrines et des enseignes. */
  setNight(night: number): void
}

/** Taille d'un pixel des façades, en pixels du monde (comme les immeubles). */
const TEXEL = 2

interface Painter {
  draw(context: CanvasRenderingContext2D, glow: CanvasRenderingContext2D, width: number, height: number): void
}

/** Une façade en pixels : on peint en « texels » (TEXEL px du monde chacun), avec un calque lumineux pour la nuit. */
function paintFacade(width: number, height: number, painter: Painter): { map: THREE.Texture; glow: THREE.Texture } {
  const texelsWide = Math.max(1, Math.round(width / TEXEL))
  const texelsHigh = Math.max(1, Math.round(height / TEXEL))
  const make = () => {
    const canvas = document.createElement('canvas')
    canvas.width = texelsWide
    canvas.height = texelsHigh
    const context = canvas.getContext('2d')
    if (context === null) throw new Error('Canvas 2D indisponible')
    return { canvas, context }
  }
  const facade = make()
  const glow = make()
  glow.context.fillStyle = '#000000'
  glow.context.fillRect(0, 0, texelsWide, texelsHigh)
  painter.draw(facade.context, glow.context, texelsWide, texelsHigh)
  return { map: pixelTexture(new THREE.CanvasTexture(facade.canvas)), glow: pixelTexture(new THREE.CanvasTexture(glow.canvas)) }
}

/** Une enseigne : un bandeau de couleur et un texte clair centré, qui s'allume la nuit. */
function paintSign(context: CanvasRenderingContext2D, glow: CanvasRenderingContext2D, text: string, top: number, width: number, bandColor: string) {
  const cell = 1
  const bandHeight = PIXEL_FONT_HEIGHT + 4
  context.fillStyle = bandColor
  context.fillRect(0, top, width, bandHeight)
  let shown = text
  while (shown.length > 0 && measurePixelText(shown) > width - 4) shown = shown.slice(0, -1)
  const left = Math.floor((width - measurePixelText(shown)) / 2)
  context.fillStyle = LANDMARK_VIEW.signTextColor
  drawPixelText(context, shown, left, top + 2, cell)
  glow.fillStyle = LANDMARK_VIEW.signTextColor
  drawPixelText(glow, shown, left, top + 2, cell)
}

/** La concession : un mur clair, une grande vitrine au rez-de-chaussée (côté rue, au sud) et l'enseigne au-dessus. */
const showroomFront = (name: string): Painter => ({
  draw(context, glow, width, height) {
    context.fillStyle = LANDMARK_VIEW.showroomWall
    context.fillRect(0, 0, width, height)
    const signTop = 3
    paintSign(context, glow, name, signTop, width, LANDMARK_VIEW.showroomSign)
    const glassTop = signTop + PIXEL_FONT_HEIGHT + 7
    context.fillStyle = LANDMARK_VIEW.glass
    context.fillRect(2, glassTop, width - 4, height - glassTop - 2)
    glow.fillStyle = LANDMARK_VIEW.glassGlow
    glow.fillRect(2, glassTop, width - 4, height - glassTop - 2)
    // Les montants de la vitrine, et un reflet en haut.
    context.fillStyle = LANDMARK_VIEW.frame
    for (let x = 2; x < width - 2; x += 10) context.fillRect(x, glassTop, 1, height - glassTop - 2)
    context.fillStyle = 'rgba(255,255,255,0.35)'
    context.fillRect(2, glassTop, width - 4, 1)
  },
})

/** Le garage : un mur, l'enseigne, et une large porte basculante à lames (côté rue, au sud). */
const garageFront = (name: string): Painter => ({
  draw(context, glow, width, height) {
    context.fillStyle = LANDMARK_VIEW.garageWall
    context.fillRect(0, 0, width, height)
    const signTop = 2
    paintSign(context, glow, name, signTop, width, LANDMARK_VIEW.garageSign)
    const doorTop = signTop + PIXEL_FONT_HEIGHT + 6
    context.fillStyle = LANDMARK_VIEW.garageDoor
    context.fillRect(2, doorTop, width - 4, height - doorTop)
    context.fillStyle = LANDMARK_VIEW.frame
    for (let y = doorTop + 2; y < height; y += 3) context.fillRect(2, y, width - 4, 1)
  },
})

/** L'atelier : l'enseigne, et une large baie ouverte sur un intérieur sombre où brille un établi (côté rue, au sud). */
const workshopFront = (name: string): Painter => ({
  draw(context, glow, width, height) {
    context.fillStyle = LANDMARK_VIEW.workshopWall
    context.fillRect(0, 0, width, height)
    const signTop = 2
    paintSign(context, glow, name, signTop, width, LANDMARK_VIEW.workshopSign)
    const bayTop = signTop + PIXEL_FONT_HEIGHT + 6
    context.fillStyle = LANDMARK_VIEW.workshopInside
    context.fillRect(3, bayTop, width - 6, height - bayTop)
    // L'établi et ses outils, éclairés : on devine qu'on y bricole.
    context.fillStyle = LANDMARK_VIEW.workshopTools
    context.fillRect(6, height - 6, width - 12, 2)
    for (let x = 8; x < width - 8; x += 5) context.fillRect(x, bayTop + 3, 1, 4)
    glow.fillStyle = LANDMARK_VIEW.glassGlow
    glow.fillRect(3, bayTop, width - 6, 2)
  },
})

/** Les autres côtés : un mur simple, de la couleur du bâtiment. */
const plainWall = (color: string): Painter => ({
  draw(context, _glow, width, height) {
    context.fillStyle = color
    context.fillRect(0, 0, width, height)
    context.fillStyle = 'rgba(43,30,58,0.18)'
    context.fillRect(0, height - 2, width, 2)
  },
})

export function createLandmarks(scene: THREE.Scene, map: TileMap, textures: Textures): Landmarks {
  const glowingMaterials: THREE.MeshLambertMaterial[] = []
  const material = (texture: { map: THREE.Texture; glow: THREE.Texture }) => {
    const created = new THREE.MeshLambertMaterial({ map: texture.map, emissive: 0xffffff, emissiveMap: texture.glow, emissiveIntensity: 0 })
    glowingMaterials.push(created)
    return created
  }

  const build = (block: BuildingBlock, front: Painter, wallColor: string, height: number, roof: THREE.Texture) => {
    const wall = (faceWidth: number) => material(paintFacade(faceWidth, height, plainWall(wallColor)))
    const roofMaterial = new THREE.MeshLambertMaterial({ map: roof })
    const bottom = new THREE.MeshLambertMaterial({ color: 0x2b1e3a })
    // Ordre des faces d'une boîte three.js : +x (est), -x (ouest), +y (toit), -y (dessous), +z (sud, la rue), -z (nord).
    const materials = [wall(block.height), wall(block.height), roofMaterial, bottom, material(paintFacade(block.width, height, front)), wall(block.width)]
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(block.width, height, block.height), materials)
    mesh.position.set(block.x + block.width / 2, height / 2, block.y + block.height / 2)
    mesh.castShadow = true
    mesh.receiveShadow = true
    scene.add(mesh)
  }

  for (const block of findBuildingBlocks(map, 'showroom')) build(block, showroomFront(LANDMARK_VIEW.showroomName), LANDMARK_VIEW.showroomWall, LANDMARK_VIEW.showroomHeight, textures.roofs.verrieres)
  for (const block of findBuildingBlocks(map, 'workshop'))
    build(block, workshopFront(LANDMARK_VIEW.workshopName), LANDMARK_VIEW.workshopWall, LANDMARK_VIEW.workshopHeight, textures.roofs['beton-clim'])
  for (const block of findBuildingBlocks(map, 'garage')) build(block, garageFront(LANDMARK_VIEW.garageName), LANDMARK_VIEW.garageWall, LANDMARK_VIEW.garageHeight, textures.roofs.zinc)

  let currentNight = -1
  return {
    setNight(night) {
      if (Math.abs(night - currentNight) < 0.005) return
      currentNight = night
      for (const glowing of glowingMaterials) glowing.emissiveIntensity = night * 1.2
    },
  }
}
