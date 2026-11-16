// Le chargement des textures de l'essai 3D, toutes en pixel art net (filtre « au plus proche », jamais lissé).
// Expose : Textures3d, loadTextures3d(), pixelTexture().

import * as THREE from 'three'
import { PROP_TEXTURES, ROOF_TEXTURES, TILE_TEXTURES } from '../game/assets'
import type { PropTexture, RoofTexture, TileTexture } from '../game/assets'

export interface Textures3d {
  tiles: Record<TileTexture, THREE.Texture>
  roofs: Record<RoofTexture, THREE.Texture>
  props: Record<PropTexture, THREE.Texture>
}

/** Règle une texture pour le pixel art : pixels nets, pas de mipmaps (qui flouteraient au loin), couleurs sRGB. */
export function pixelTexture<T extends THREE.Texture>(texture: T): T {
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestFilter
  texture.generateMipmaps = false
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

async function loadAll<K extends string>(names: readonly K[], folder: string): Promise<Record<K, THREE.Texture>> {
  const loader = new THREE.TextureLoader()
  const entries = await Promise.all(names.map(async (name) => [name, pixelTexture(await loader.loadAsync(`assets/${folder}/${name}.png`))] as const))
  return Object.fromEntries(entries) as Record<K, THREE.Texture>
}

export async function loadTextures3d(): Promise<Textures3d> {
  const [tiles, roofs, props] = await Promise.all([loadAll(TILE_TEXTURES, 'tiles'), loadAll(ROOF_TEXTURES, 'roofs'), loadAll(PROP_TEXTURES, 'props')])
  return { tiles, roofs, props }
}
