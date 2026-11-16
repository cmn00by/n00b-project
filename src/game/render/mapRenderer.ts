// Le renderer de la carte : dessine chaque case comme un rectangle de couleur (en attendant les tuiles, #4).
// Expose : drawMap().
// Pourquoi : la carte ne bouge pas, on la dessine donc une seule fois, dans un seul objet graphique (rapide même pour une grande ville).
// Il lit la carte du monde et ne la modifie jamais.

import Phaser from 'phaser'
import type { TileMap } from '../../sim/core'
import { BUILDING_EDGE_COLOR, MISSING_TILE_COLOR, TILE_COLORS } from '../constants'

/** Profondeur d'affichage du sol : sous tout le reste. */
const MAP_DEPTH = 0

/** Dessine toute la carte. Renvoie l'objet graphique créé. */
export function drawMap(scene: Phaser.Scene, map: TileMap): Phaser.GameObjects.Graphics {
  const graphics = scene.add.graphics().setDepth(MAP_DEPTH)
  const size = map.tileSize

  for (let tileY = 0; tileY < map.height; tileY++) {
    for (let tileX = 0; tileX < map.width; tileX++) {
      const tileKindId = map.tileKindIds[tileY * map.width + tileX] ?? ''
      graphics.fillStyle(TILE_COLORS[tileKindId] ?? MISSING_TILE_COLOR, 1)
      graphics.fillRect(tileX * size, tileY * size, size, size)
    }
  }

  // Le contour de chaque case de bâtiment, d'un ton plus sombre : on distingue les immeubles et les ruelles.
  graphics.lineStyle(1, BUILDING_EDGE_COLOR, 1)
  for (let tileY = 0; tileY < map.height; tileY++) {
    for (let tileX = 0; tileX < map.width; tileX++) {
      if (map.tileKindIds[tileY * map.width + tileX] === 'building') graphics.strokeRect(tileX * size + 0.5, tileY * size + 0.5, size - 1, size - 1)
    }
  }

  return graphics
}
