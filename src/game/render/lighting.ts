// La lumière : le soleil et ses ombres nettes, le ciel, puis la nuit avec les lampadaires et les phares.
// Expose : createLighting(), Lighting.
// Pourquoi : en vraie 3D, la lumière éclaire vraiment les façades et le sol, et les immeubles projettent leur ombre selon le soleil.
// Les ombres sont « dures » (sans flou), comme en pixel art. Pour rester rapide, seuls les lampadaires les plus proches du joueur
// deviennent de vraies lumières ; les autres ne gardent que leur halo.

import * as THREE from 'three'
import type { LampPost } from './decor'

export interface Lighting {
  /** `focus` : là où regarde la caméra (coordonnées de la simulation). `headlight` : l'avant de la voiture conduite et son cap, s'il y en a une. */
  update(focus: { x: number; y: number }, night: number, lamps: readonly LampPost[], headlight: { x: number; y: number; headingX: number; headingY: number } | undefined): void
}

/** Réglages de lumière. Les intensités suivent les unités de three.js (le Lambert divise par π : d'où des valeurs autour de 3). */
const DAY = { sun: 2.9, sky: 1.7, background: 0x9fd8ef, sunColor: 0xfff1d6, skyColor: 0xfff8ec, groundColor: 0x6a6a8a }
const NIGHT = { sun: 0.35, sky: 0.55, background: 0x0c0a24, sunColor: 0x8fa2ff, skyColor: 0x5a6aa8, groundColor: 0x1a1830 }
/** Le soleil vient du nord-ouest, en hauteur (en haut à gauche de l'écran, comme dans docs/style.md). */
const SUN_OFFSET = new THREE.Vector3(-260, 520, -220)
const SHADOW_HALF_SIZE = 520
const LAMP_LIGHTS = 10
const LAMP = { intensity: 7, distance: 130, color: 0xffc870 }
const HEADLIGHT = { intensity: 14, distance: 280, angle: 0.5, penumbra: 0.55, color: 0xfff1c8 }

export function createLighting(scene: THREE.Scene, renderer: THREE.WebGLRenderer): Lighting {
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.BasicShadowMap // ombres dures, pixelisées

  const sky = new THREE.HemisphereLight(DAY.skyColor, DAY.groundColor, DAY.sky)
  scene.add(sky)
  const sun = new THREE.DirectionalLight(DAY.sunColor, DAY.sun)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  const shadowCamera = sun.shadow.camera
  shadowCamera.left = -SHADOW_HALF_SIZE
  shadowCamera.right = SHADOW_HALF_SIZE
  shadowCamera.top = SHADOW_HALF_SIZE
  shadowCamera.bottom = -SHADOW_HALF_SIZE
  shadowCamera.near = 10
  shadowCamera.far = 2000
  sun.shadow.bias = -0.0015
  scene.add(sun, sun.target)

  // Une réserve fixe de lumières (jamais ajoutées ni retirées en cours de jeu : three.js recompilerait ses shaders).
  const lampLights = Array.from({ length: LAMP_LIGHTS }, () => {
    const light = new THREE.PointLight(LAMP.color, 0, LAMP.distance, 0)
    scene.add(light)
    return light
  })
  const headlight = new THREE.SpotLight(HEADLIGHT.color, 0, HEADLIGHT.distance, HEADLIGHT.angle, HEADLIGHT.penumbra, 0)
  scene.add(headlight, headlight.target)

  const background = new THREE.Color()
  const mixColors = (day: number, nightColor: number, t: number) => new THREE.Color(day).lerp(new THREE.Color(nightColor), t)

  return {
    update(focus, night, lamps, car) {
      // Le soleil suit la caméra : ses ombres restent précises là où on regarde.
      sun.position.set(focus.x + SUN_OFFSET.x, SUN_OFFSET.y, focus.y + SUN_OFFSET.z)
      sun.target.position.set(focus.x, 0, focus.y)
      sun.intensity = DAY.sun + (NIGHT.sun - DAY.sun) * night
      sun.color.copy(mixColors(DAY.sunColor, NIGHT.sunColor, night))
      sky.intensity = DAY.sky + (NIGHT.sky - DAY.sky) * night
      sky.color.copy(mixColors(DAY.skyColor, NIGHT.skyColor, night))
      sky.groundColor.copy(mixColors(DAY.groundColor, NIGHT.groundColor, night))
      background.copy(mixColors(DAY.background, NIGHT.background, night))
      scene.background = background

      // Les lampadaires les plus proches deviennent de vraies lumières.
      const nearest = [...lamps].sort((first, second) => (first.x - focus.x) ** 2 + (first.y - focus.y) ** 2 - ((second.x - focus.x) ** 2 + (second.y - focus.y) ** 2))
      lampLights.forEach((light, index) => {
        const lamp = nearest[index]
        light.intensity = lamp === undefined ? 0 : LAMP.intensity * night
        if (lamp !== undefined) light.position.set(lamp.x, lamp.lampHeight, lamp.y)
      })

      headlight.intensity = car === undefined ? 0 : HEADLIGHT.intensity * night
      if (car !== undefined) {
        headlight.position.set(car.x, 12, car.y)
        headlight.target.position.set(car.x + car.headingX * 160, 0, car.y + car.headingY * 160)
      }
    },
  }
}
