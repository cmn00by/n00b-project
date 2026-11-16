// La ville : fait tourner la simulation, relie le clavier, dessine le joueur et fait suivre la caméra.
// Cette scène ne décide d'aucune règle du jeu : elle transmet les commandes à la simulation et affiche son état.
// La carte est la ville de test (#6), dessinée en formes de couleur en attendant les tuiles (#4).
import Phaser from 'phaser'
import { STEP_SECONDS, createSimulation, createTileMap, createWorld, getTileCenter, loadMap, spawnEntity } from '../../sim/core'
import type { Entity, Simulation } from '../../sim/core'
import { SYSTEMS } from '../../sim/systems'
import { MAP_REGISTRY } from '../../data/maps'
import { TILE_KIND_REGISTRY } from '../../data/tileKinds'
import { CAMERA_ZOOM, COLORS, GAME_SEED } from '../constants'
import { createFixedStepLoop } from '../fixedStepLoop'
import { createKeyboardInput, toMoveCommand } from '../input'
import type { KeyboardInput } from '../input'
import { createPlayerRenderer, drawMap } from '../render'
import type { PlayerRenderer } from '../render'

/** La carte jouée. Fixe pendant le prototype : le choix de la carte viendra avec les vraies parties. */
const MAP_ID = 'test-town'

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
    const mapDef = MAP_REGISTRY.get(MAP_ID)
    const map = createTileMap(mapDef, TILE_KIND_REGISTRY)
    const world = createWorld(GAME_SEED)
    loadMap(world, map)
    this.simulation = createSimulation(world, SYSTEMS)

    const spawn = getTileCenter(map, mapDef.spawns.player)
    this.player = spawnEntity(world, 'player', {
      position: { x: spawn.x, y: spawn.y, angle: 0 },
      body: { width: 24, height: 24, isSolid: true },
    })

    this.keyboard = createKeyboardInput(this)
    this.playerRenderer = createPlayerRenderer(this)

    drawMap(this, map)
    this.drawHelp(spawn)

    // Un premier dessin pour que la caméra ait un objet à suivre dès la première image.
    this.playerRenderer.draw(this.simulation.world, 1)
    const camera = this.cameras.main
    camera.setZoom(CAMERA_ZOOM)
    camera.setRoundPixels(true)
    // La caméra ne montre jamais ce qui est hors de la ville.
    camera.setBounds(0, 0, map.width * map.tileSize, map.height * map.tileSize)
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

  /** Rappel des touches, posé dans le monde près du point de départ (le vrai HUD viendra avec #11). */
  private drawHelp(spawn: { x: number; y: number }) {
    this.add
      .text(spawn.x, spawn.y - 40, 'Flèches ou ZQSD / WASD selon le clavier : se déplacer\nMaj : courir', { fontFamily: 'monospace', fontSize: '12px', color: COLORS.text, align: 'center' })
      .setOrigin(0.5)
      .setDepth(20)
  }
}
