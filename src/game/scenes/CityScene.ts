// La ville : fait tourner la simulation, relie le clavier, dessine le joueur et fait suivre la caméra.
// Cette scène ne décide d'aucune règle du jeu : elle transmet les commandes à la simulation et affiche son état.
// Le sol est pour l'instant un quadrillage de repère ; la carte de test (#6) le remplacera.
import Phaser from 'phaser'
import { STEP_SECONDS, createSimulation, createWorld, spawnEntity } from '../../sim/core'
import type { Entity, Simulation } from '../../sim/core'
import { SYSTEMS } from '../../sim/systems'
import { CAMERA_ZOOM, COLORS, GAME_SEED, TILE_SIZE } from '../constants'
import { createFixedStepLoop } from '../fixedStepLoop'
import { createKeyboardInput, toMoveCommand } from '../input'
import type { KeyboardInput } from '../input'
import { createPlayerRenderer } from '../render'
import type { PlayerRenderer } from '../render'

/** Largeur et hauteur du quadrillage de repère, en cases. */
const GRID_TILES = 100

export class CityScene extends Phaser.Scene {
  private simulation!: Simulation
  private player!: Entity
  private keyboard!: KeyboardInput
  private playerRenderer!: PlayerRenderer
  private readonly fixedStepLoop = createFixedStepLoop(STEP_SECONDS)

  constructor() {
    super('CityScene')
  }

  create() {
    this.simulation = createSimulation(createWorld(GAME_SEED), SYSTEMS)
    this.player = spawnEntity(this.simulation.world, 'player', {
      position: { x: 10 * TILE_SIZE, y: 10 * TILE_SIZE, angle: 0 },
      body: { width: 24, height: 24, isSolid: true },
    })

    this.keyboard = createKeyboardInput(this)
    this.playerRenderer = createPlayerRenderer(this)

    this.drawGrid()
    this.drawHelp()

    // Un premier dessin pour que la caméra ait un objet à suivre dès la première image.
    this.playerRenderer.draw(this.simulation.world, 1)
    const camera = this.cameras.main
    camera.setZoom(CAMERA_ZOOM)
    camera.setRoundPixels(true)
    const target = this.playerRenderer.findDisplayObject(this.player.id)
    if (target !== undefined) camera.startFollow(target, true)
  }

  override update(_time: number, deltaMilliseconds: number) {
    const alpha = this.fixedStepLoop.advance(deltaMilliseconds / 1000, () => this.runSimulationStep())
    this.playerRenderer.draw(this.simulation.world, alpha)
  }

  /** Un pas de simulation : les touches tenues deviennent une commande, que la simulation applique. */
  private runSimulationStep() {
    this.playerRenderer.rememberPositions(this.simulation.world)
    const command = toMoveCommand(this.player.id, this.keyboard.readPressedKeys())
    this.simulation.step(command === undefined ? [] : [command])
  }

  /** Quadrillage de repère, à l'échelle des futures tuiles : sans lui, on ne verrait pas le carré bouger. */
  private drawGrid() {
    const size = GRID_TILES * TILE_SIZE
    const grid = this.add.graphics()
    grid.lineStyle(1, COLORS.gridLine, 1)
    for (let line = 0; line <= GRID_TILES; line++) {
      grid.lineBetween(line * TILE_SIZE, 0, line * TILE_SIZE, size)
      grid.lineBetween(0, line * TILE_SIZE, size, line * TILE_SIZE)
    }
  }

  /** Rappel des touches, posé dans le monde près du point de départ (le vrai HUD viendra avec #11). */
  private drawHelp() {
    this.add.text(10 * TILE_SIZE, 8 * TILE_SIZE, 'Flèches, ZQSD ou WASD : se déplacer\nMaj : courir', { fontFamily: 'monospace', fontSize: '12px', color: COLORS.text, align: 'center' }).setOrigin(0.5)
  }
}
