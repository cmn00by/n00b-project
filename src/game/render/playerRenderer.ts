// Le renderer du joueur : dessine un carré de couleur à la position du joueur (en attendant les vrais visuels, #4).
// Expose : createPlayerRenderer(), PlayerRenderer.
// Pourquoi : il lit l'état du monde et dessine, sans jamais le modifier. La simulation avance à 30 pas par seconde,
// l'écran bien plus vite : le carré est dessiné entre sa position avant le dernier pas et sa position actuelle (interpolation),
// ce qui donne un mouvement fluide sans toucher à la simulation.

import Phaser from 'phaser'
import { findEntitiesWith } from '../../sim/core'
import type { EntityId, World } from '../../sim/core'
import { COLORS } from '../constants'

export interface PlayerRenderer {
  /** À appeler juste avant chaque pas de simulation : retient les positions d'avant le pas, point de départ de l'interpolation. */
  rememberPositions(world: World): void
  /** À appeler à chaque image : dessine les joueurs entre leur position d'avant le dernier pas (alpha = 0) et la position actuelle (alpha = 1). */
  draw(world: World, alpha: number): void
  /** L'objet Phaser qui représente le joueur (pour que la caméra le suive), une fois dessiné. */
  findDisplayObject(entityId: EntityId): Phaser.GameObjects.GameObject | undefined
}

interface PlayerView {
  rectangle: Phaser.GameObjects.Rectangle
  previousX: number
  previousY: number
}

const OUTLINE_WIDTH_PX = 1

export function createPlayerRenderer(scene: Phaser.Scene): PlayerRenderer {
  const viewByEntityId = new Map<EntityId, PlayerView>()

  const lerp = (from: number, to: number, alpha: number): number => from + (to - from) * alpha

  return {
    rememberPositions(world) {
      for (const player of findEntitiesWith(world, ['position'])) {
        const view = viewByEntityId.get(player.id)
        if (view === undefined) continue
        view.previousX = player.position.x
        view.previousY = player.position.y
      }
    },

    draw(world, alpha) {
      const playerIds = new Set<EntityId>()

      for (const player of findEntitiesWith(world, ['position', 'body'])) {
        if (player.kind !== 'player') continue
        playerIds.add(player.id)

        let view = viewByEntityId.get(player.id)
        if (view === undefined) {
          const rectangle = scene.add.rectangle(player.position.x, player.position.y, player.body.width, player.body.height, COLORS.player)
          rectangle.setStrokeStyle(OUTLINE_WIDTH_PX, COLORS.outline)
          rectangle.setDepth(10)
          view = { rectangle, previousX: player.position.x, previousY: player.position.y }
          viewByEntityId.set(player.id, view)
        }

        // Position arrondie au pixel : comme la caméra, pour que le carré reste net et ne tremble pas d'un pixel quand on avance.
        view.rectangle.setPosition(Math.round(lerp(view.previousX, player.position.x, alpha)), Math.round(lerp(view.previousY, player.position.y, alpha)))
      }

      // Un joueur qui a disparu du monde disparaît de l'écran.
      for (const [entityId, view] of viewByEntityId) {
        if (playerIds.has(entityId)) continue
        view.rectangle.destroy()
        viewByEntityId.delete(entityId)
      }
    },

    findDisplayObject(entityId) {
      return viewByEntityId.get(entityId)?.rectangle
    },
  }
}
