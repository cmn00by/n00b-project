// La ville. Pour l'instant une scène de départ : un quadrillage de cases de 32 px et un message.
// Le noyau (#3) et la carte de test (#6) viendront la remplir.
import Phaser from 'phaser'
import { TILE_SIZE } from '../constants'

export class CityScene extends Phaser.Scene {
  constructor() {
    super('CityScene')
  }

  create() {
    this.drawGrid()
    this.add.text(16, 16, 'n00b-project\nle projet est initialisé : place au noyau (#3)', { fontFamily: 'monospace', fontSize: '16px', color: '#fff8ec' }).setScrollFactor(0)
  }

  /** Quadrillage de repère, à l'échelle des futures tuiles. */
  private drawGrid() {
    const { width, height } = this.scale
    const grid = this.add.graphics()
    grid.lineStyle(1, 0x3a2f5b, 1)
    for (let x = 0; x <= width; x += TILE_SIZE) grid.lineBetween(x, 0, x, height)
    for (let y = 0; y <= height; y += TILE_SIZE) grid.lineBetween(0, y, width, y)
  }
}
