// Le sol de la ville : toute la ville peinte une fois, par morceaux de texture posés à plat, et l'eau animée dessous.
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
/** La taille d'un morceau de sol, en cases (32 cases de 32 px : des images de 1024 px, bien acceptées partout). */
const CHUNK_TILES = 32

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

  // Le sol est peint par morceaux de CHUNK_TILES × CHUNK_TILES cases : une seule image pour toute la ville dépasserait la taille de texture
  // qu'acceptent les téléphones (souvent 4096 px de côté) dès que la carte grandit.
  const chunkSize = CHUNK_TILES * map.tileSize
  const chunksX = Math.ceil(width / chunkSize)
  const chunksY = Math.ceil(height / chunkSize)
  const half = map.tileSize / 2
  for (let chunkY = 0; chunkY < chunksY; chunkY++) {
    for (let chunkX = 0; chunkX < chunksX; chunkX++) {
      const left = chunkX * chunkSize
      const top = chunkY * chunkSize
      const chunkWidth = Math.min(chunkSize, width - left)
      const chunkHeight = Math.min(chunkSize, height - top)
      const canvas = document.createElement('canvas')
      canvas.width = chunkWidth
      canvas.height = chunkHeight
      const context = canvas.getContext('2d')
      if (context === null) throw new Error('Canvas 2D indisponible')
      context.imageSmoothingEnabled = false
      context.translate(-left, -top)
      const isInChunk = (x: number, y: number) => x >= left - map.tileSize && x < left + chunkWidth && y >= top - map.tileSize && y < top + chunkHeight
      for (const tile of layout.tiles) {
        const x = tile.tileX * map.tileSize
        const y = tile.tileY * map.tileSize
        if (!isInChunk(x, y)) continue
        const image = textures.tiles[tile.texture].image as CanvasImageSource
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
      // Les traits (bordures, marquages, écume) : seulement ceux qui touchent ce morceau ; le reste est coupé par les bords de l'image.
      const touches = (segment: Segment) =>
        Math.max(segment.x1, segment.x2) >= left - 4 &&
        Math.min(segment.x1, segment.x2) <= left + chunkWidth + 4 &&
        Math.max(segment.y1, segment.y2) >= top - 4 &&
        Math.min(segment.y1, segment.y2) <= top + chunkHeight + 4
      context.fillStyle = CURB_COLOR
      for (const curb of layout.curbs) if (touches(curb)) strokeSegment(context, curb, 2)
      context.fillStyle = DASH_COLOR
      for (const dash of layout.laneDashes) if (touches(dash)) strokeSegment(context, dash, 2)
      context.fillStyle = FOAM_COLOR
      for (const shore of layout.shores) if (touches(shore)) strokeSegment(context, shore, 3)

      // Un plan couché au sol : x du monde = x de la simulation, z du monde = y de la simulation.
      const texture = pixelTexture(new THREE.CanvasTexture(canvas))
      const piece = new THREE.Mesh(new THREE.PlaneGeometry(chunkWidth, chunkHeight), new THREE.MeshLambertMaterial({ map: texture, transparent: true, alphaTest: 0.5 }))
      piece.rotation.x = -Math.PI / 2
      piece.position.set(left + chunkWidth / 2, 0, top + chunkHeight / 2)
      piece.receiveShadow = true
      scene.add(piece)
    }
  }

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
