// Le sol de la ville : toute la ville peinte une fois dans une grande texture posée à plat, et l'eau animée dessous.
// Expose : createGround(), Ground.
// Pourquoi : les règles (groundLayout.ts) disent quoi peindre ; ici on le peint dans une texture. L'eau n'est pas peinte :
// la texture du sol est transparente à cet endroit, et deux couches d'eau qui glissent se voient à travers.

import * as THREE from 'three'
import type { TileMap } from '../../sim/core'
import { computeGroundLayout } from './groundLayout'
import type { Segment } from './groundLayout'
import { pixelTexture } from './textures'
import type { Textures } from './textures'

export interface Ground {
  update(timeSeconds: number): void
}

const CURB_COLOR = '#8e8678'
const DASH_COLOR = '#f2efe6'
const FOAM_COLOR = 'rgba(255,248,236,0.55)'

/** Un trait droit de `thickness` pixels, dessiné en rectangle plein (net, sans lissage). */
function strokeSegment(context: CanvasRenderingContext2D, segment: Segment, thickness: number) {
  const isHorizontal = segment.y1 === segment.y2
  const half = Math.floor(thickness / 2)
  if (isHorizontal) context.fillRect(Math.min(segment.x1, segment.x2), segment.y1 - half, Math.abs(segment.x2 - segment.x1), thickness)
  else context.fillRect(segment.x1 - half, Math.min(segment.y1, segment.y2), thickness, Math.abs(segment.y2 - segment.y1))
}

export function createGround(scene: THREE.Scene, map: TileMap, textures: Textures): Ground {
  const width = map.width * map.tileSize
  const height = map.height * map.tileSize
  const layout = computeGroundLayout(map)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (context === null) throw new Error('Canvas 2D indisponible')
  context.imageSmoothingEnabled = false
  const half = map.tileSize / 2
  for (const tile of layout.tiles) {
    const image = textures.tiles[tile.texture].image as CanvasImageSource
    const x = tile.tileX * map.tileSize
    const y = tile.tileY * map.tileSize
    if (tile.isRotated) {
      context.save()
      context.translate(x + half, y + half)
      context.rotate(Math.PI / 2)
      context.drawImage(image, -half, -half, map.tileSize, map.tileSize)
      context.restore()
    } else {
      context.drawImage(image, x, y, map.tileSize, map.tileSize)
    }
  }
  context.fillStyle = CURB_COLOR
  for (const curb of layout.curbs) strokeSegment(context, curb, 2)
  context.fillStyle = DASH_COLOR
  for (const dash of layout.laneDashes) strokeSegment(context, dash, 2)
  context.fillStyle = FOAM_COLOR
  for (const shore of layout.shores) strokeSegment(context, shore, 3)

  // Un plan couché au sol : x du monde = x de la simulation, z du monde = y de la simulation.
  const groundTexture = pixelTexture(new THREE.CanvasTexture(canvas))
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshLambertMaterial({ map: groundTexture, transparent: true, alphaTest: 0.5 }))
  ground.rotation.x = -Math.PI / 2
  ground.position.set(width / 2, 0, height / 2)
  ground.receiveShadow = true
  scene.add(ground)

  // L'eau : deux couches de la même texture, répétée, qui glissent en sens contraire.
  const makeWater = (tileScale: number, y: number, opacity: number) => {
    const texture = textures.tiles.eau.clone()
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(width / (map.tileSize * tileScale), height / (map.tileSize * tileScale))
    texture.needsUpdate = true
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshLambertMaterial({ map: texture, transparent: opacity < 1, opacity }))
    mesh.rotation.x = -Math.PI / 2
    mesh.position.set(width / 2, y, height / 2)
    mesh.receiveShadow = true
    scene.add(mesh)
    return texture
  }
  const water = makeWater(1, -4, 1)
  const ripples = makeWater(2, -3, 0.35)

  return {
    update(timeSeconds) {
      water.offset.set(timeSeconds * 0.05, timeSeconds * 0.025)
      ripples.offset.set(-timeSeconds * 0.02, timeSeconds * 0.03)
    },
  }
}
