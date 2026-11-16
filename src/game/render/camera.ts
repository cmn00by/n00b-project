// La caméra du jeu : elle suit le joueur (ou sa voiture) de haut et de biais, et se cale sur la grille de pixels.
// Expose : createCamera(), GameCamera, snapToPixelGrid().
// Pourquoi : la scène est dessinée en basse résolution puis agrandie. Si la caméra bouge d'une fraction de pixel, tous les pixels de la ville
// « nagent ». En calant la cible sur la taille d'un pixel à l'écran, la ville glisse pixel par pixel, nette.

import * as THREE from 'three'

/** Les inclinaisons proposées (degrés au-dessus de l'horizon) : C passe de l'une à l'autre. */
const TILTS_DEGREES = [62, 76, 48] as const
const DISTANCE = 620
const FIELD_OF_VIEW_DEGREES = 40

export interface GameCamera {
  camera: THREE.PerspectiveCamera
  /** Place la caméra au-dessus de la cible (en coordonnées de la simulation : x à droite, y vers le bas). */
  follow(targetX: number, targetY: number, screenHeightPx: number): void
  nextTilt(): void
  resize(aspect: number): void
}

/** Arrondit une valeur au multiple le plus proche de `step` (la taille d'un pixel de l'écran, dans le monde). */
export function snapToPixelGrid(value: number, step: number): number {
  return step > 0 ? Math.round(value / step) * step : value
}

export function createCamera(aspect: number): GameCamera {
  const camera = new THREE.PerspectiveCamera(FIELD_OF_VIEW_DEGREES, aspect, 10, 4000)
  let tiltIndex = 0

  return {
    camera,
    follow(targetX, targetY, screenHeightPx) {
      const tilt = THREE.MathUtils.degToRad(TILTS_DEGREES[tiltIndex] ?? 62)
      // La taille d'un pixel de l'écran à la distance de la cible.
      const pixelSize = (2 * DISTANCE * Math.tan(THREE.MathUtils.degToRad(FIELD_OF_VIEW_DEGREES / 2))) / Math.max(1, screenHeightPx)
      const x = snapToPixelGrid(targetX, pixelSize)
      const z = snapToPixelGrid(targetY, pixelSize)
      // Caméra au sud de la cible, en hauteur, qui regarde vers le nord et vers le bas.
      camera.position.set(x, Math.sin(tilt) * DISTANCE, z + Math.cos(tilt) * DISTANCE)
      camera.lookAt(x, 0, z)
    },
    nextTilt() {
      tiltIndex = (tiltIndex + 1) % TILTS_DEGREES.length
    },
    resize(newAspect) {
      camera.aspect = newAspect
      camera.updateProjectionMatrix()
    },
  }
}
