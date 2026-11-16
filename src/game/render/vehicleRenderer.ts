// Le renderer des véhicules : dessine chaque véhicule comme un rectangle de couleur tourné selon son cap, avec un pare-brise
// qui montre l'avant (en attendant les sprites, #4).
// Expose : createVehicleRenderer(), VehicleRenderer.
// Pourquoi : il lit l'état du monde et dessine, sans jamais le modifier. Comme pour le joueur, il dessine entre l'état d'avant
// le dernier pas et l'état actuel (interpolation), position ET cap, pour un mouvement fluide à toutes les fréquences d'écran.

import Phaser from 'phaser'
import { findEntitiesWith } from '../../sim/core'
import type { EntityId, World } from '../../sim/core'
import { VEHICLE_REGISTRY } from '../../data/vehicles'
import { COLORS, MISSING_VEHICLE_COLOR, VEHICLE_COLORS, WINDSHIELD_COLOR } from '../constants'

export interface VehicleRenderer {
  /** À appeler juste avant chaque pas de simulation : retient l'état d'avant le pas, point de départ de l'interpolation. */
  rememberStates(world: World): void
  /** À appeler à chaque image : dessine les véhicules entre leur état d'avant le dernier pas (alpha = 0) et l'état actuel (alpha = 1). */
  draw(world: World, alpha: number): void
  /** L'objet Phaser qui représente le véhicule (pour que la caméra le suive), une fois dessiné. */
  findDisplayObject(entityId: EntityId): Phaser.GameObjects.GameObject | undefined
}

interface VehicleView {
  container: Phaser.GameObjects.Container
  previous: { x: number; y: number; headingX: number; headingY: number }
}

/** Profondeur d'affichage des véhicules : au-dessus du sol, sous le joueur et les textes. */
const VEHICLE_DEPTH = 5

export function createVehicleRenderer(scene: Phaser.Scene): VehicleRenderer {
  const viewByEntityId = new Map<EntityId, VehicleView>()
  const lerp = (from: number, to: number, alpha: number): number => from + (to - from) * alpha

  /** Le véhicule dessiné nez vers le haut, centré sur (0, 0) : la rotation du conteneur l'oriente. */
  function createView(modelId: string): Phaser.GameObjects.Container {
    const def = VEHICLE_REGISTRY.get(modelId)
    const bodyShape = scene.add.rectangle(0, 0, def.width, def.length, VEHICLE_COLORS[modelId] ?? MISSING_VEHICLE_COLOR).setStrokeStyle(1, COLORS.outline)
    const windshield = scene.add.rectangle(0, -def.length * 0.18, def.width - 6, def.length * 0.18, WINDSHIELD_COLOR)
    return scene.add.container(0, 0, [bodyShape, windshield]).setDepth(VEHICLE_DEPTH)
  }

  return {
    rememberStates(world) {
      for (const vehicle of findEntitiesWith(world, ['position', 'vehicle'])) {
        const view = viewByEntityId.get(vehicle.id)
        if (view === undefined) continue
        view.previous = { x: vehicle.position.x, y: vehicle.position.y, headingX: vehicle.vehicle.headingX, headingY: vehicle.vehicle.headingY }
      }
    },

    draw(world, alpha) {
      const seenIds = new Set<EntityId>()
      for (const vehicle of findEntitiesWith(world, ['position', 'vehicle'])) {
        seenIds.add(vehicle.id)
        const current = { x: vehicle.position.x, y: vehicle.position.y, headingX: vehicle.vehicle.headingX, headingY: vehicle.vehicle.headingY }
        let view = viewByEntityId.get(vehicle.id)
        if (view === undefined) {
          view = { container: createView(vehicle.vehicle.modelId), previous: current }
          viewByEntityId.set(vehicle.id, view)
        }
        const headingX = lerp(view.previous.headingX, current.headingX, alpha)
        const headingY = lerp(view.previous.headingY, current.headingY, alpha)
        view.container.setPosition(Math.round(lerp(view.previous.x, current.x, alpha)), Math.round(lerp(view.previous.y, current.y, alpha)))
        // L'angle n'est calculé que pour l'affichage (la simulation garde un vecteur) : nez vers le haut = angle 0.
        view.container.setRotation(Math.atan2(headingX, -headingY))
      }

      for (const [entityId, view] of viewByEntityId) {
        if (seenIds.has(entityId)) continue
        view.container.destroy()
        viewByEntityId.delete(entityId)
      }
    },

    findDisplayObject(entityId) {
      return viewByEntityId.get(entityId)?.container
    },
  }
}
