// La déco de la ville : arbres, bancs, lampadaires… en découpes debout dans la scène, à l'échelle du jeu, avec une ombre au sol.
// Expose : createDecor(), Decor, LampPost.
// Pourquoi : placement par des règles (placeDecor.ts) et tailles à l'échelle du jeu (propStyles.ts). Les images toujours
// tournées vers la caméra gardent leur pixel art intact ; le feuillage ondule autour de son pied.
// Affichage seulement : la déco ne bloque pas encore le passage (voir docs/decisions.md).

import * as THREE from 'three'
import type { TileMap } from '../../sim/core'
import { LAMP_GLOW_COLOR } from '../constants'
import { placeDecor } from '../decor/placeDecor'
import { PROP_STYLES } from '../decor/propStyles'
import { hashToUnit } from '../hash'
import { createGlowTexture } from './glowTexture'
import type { Textures } from './textures'

/** Un lampadaire : sa position au sol (coordonnées de la simulation) et la hauteur de sa lampe. */
export interface LampPost {
  x: number
  y: number
  lampHeight: number
}

export interface Decor {
  update(timeSeconds: number, night: number): void
  lamps: readonly LampPost[]
}

/** Les éléments hauts sont un peu étirés en hauteur : debout dans une scène vue de biais, ils paraîtraient sinon tassés. */
const TALL_STRETCH = 1.35
const SWAY_RADIANS = 0.045

export function createDecor(scene: THREE.Scene, map: TileMap, textures: Textures): Decor {
  const shadowMaterial = new THREE.MeshBasicMaterial({ color: 0x2b1e3a, transparent: true, opacity: 0.32, depthWrite: false })
  const shadowGeometry = new THREE.CircleGeometry(0.5, 12)
  const glowTexture = createGlowTexture()
  const sharedMaterials = new Map<string, THREE.SpriteMaterial>()
  const swaying: Array<{ material: THREE.SpriteMaterial; phase: number; speed: number }> = []
  const glows: THREE.Sprite[] = []
  const lamps: LampPost[] = []

  for (const item of placeDecor(map)) {
    const style = PROP_STYLES[item.prop]
    // Les éléments qui ondulent ont chacun leur matériau (chacun son rythme) ; les autres partagent le leur.
    let material = sharedMaterials.get(item.prop)
    if (style.sways || material === undefined) {
      material = new THREE.SpriteMaterial({ map: textures.props[item.prop], alphaTest: 0.5 })
      if (!style.sways) sharedMaterials.set(item.prop, material)
    }
    const sprite = new THREE.Sprite(material)
    sprite.center.set(0.5, 0) // posé au sol par le bas de l'image
    sprite.scale.set(style.size, style.size * (style.isTall ? TALL_STRETCH : 1), 1)
    sprite.position.set(item.x, 0, item.y + style.size * 0.2)
    scene.add(sprite)

    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial)
    shadow.rotation.x = -Math.PI / 2
    shadow.scale.set(style.shadow.width, style.shadow.height * 1.6, 1)
    shadow.position.set(item.x + style.size * 0.15, 0.5, item.y + style.size * 0.25)
    scene.add(shadow)

    if (style.sways) swaying.push({ material, phase: hashToUnit(Math.round(item.x), Math.round(item.y), 3) * Math.PI * 2, speed: 0.9 + hashToUnit(Math.round(item.x), Math.round(item.y), 4) * 0.6 })
    if (style.lightRadius !== undefined) {
      const lampHeight = style.size * TALL_STRETCH * 0.85
      lamps.push({ x: item.x, y: item.y + style.size * 0.2, lampHeight })
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: LAMP_GLOW_COLOR, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }))
      glow.scale.set(34, 34, 1)
      glow.position.set(item.x, lampHeight, item.y + style.size * 0.2 + 1)
      scene.add(glow)
      glows.push(glow)
    }
  }

  return {
    update(timeSeconds, night) {
      for (const { material, phase, speed } of swaying) material.rotation = Math.sin(timeSeconds * speed + phase) * SWAY_RADIANS
      for (const glow of glows) (glow.material as THREE.SpriteMaterial).opacity = night * 0.85
    },
    lamps,
  }
}
