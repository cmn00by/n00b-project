// La ville : fait tourner la simulation, relie le clavier, dessine le joueur et les véhicules, et fait suivre la caméra.
// Cette scène ne décide d'aucune règle du jeu : elle transmet les commandes à la simulation et affiche son état.
// La carte est la ville de test (#6), dessinée en formes de couleur en attendant les tuiles (#4).
import Phaser from 'phaser'
import { STEP_SECONDS, createSimulation, createTileMap, createWorld, findEntitiesWith, findEntity, getTileCenter, loadMap, spawnEntity } from '../../sim/core'
import type { Command, Entity, EntityId, Simulation } from '../../sim/core'
import { SYSTEMS } from '../../sim/systems'
import { spawnVehicle } from '../../sim/systems/driving'
import { MAP_REGISTRY } from '../../data/maps'
import { TILE_KIND_REGISTRY } from '../../data/tileKinds'
import { VEHICLE_REGISTRY } from '../../data/vehicles'
import { CAMERA_LOOKAHEAD_MAX_PX, CAMERA_LOOKAHEAD_SECONDS, CAMERA_LOOKAHEAD_SMOOTHING, CAMERA_ZOOM, COLORS, DAY_NIGHT_TRANSITION_SECONDS, GAME_SEED } from '../constants'
import { createFixedStepLoop } from '../fixedStepLoop'
import { createKeyboardInput, toDriveCommand, toMoveCommand } from '../input'
import type { KeyboardInput } from '../input'
import { createBuildingRelief, createDecor, createGround, createLighting, createPlayerRenderer, createVehicleRenderer } from '../render'
import type { BuildingRelief, Decor, Ground, LightBeam, Lighting, PlayerRenderer, VehicleRenderer } from '../render'

/** La carte jouée. Fixe pendant le prototype : le choix de la carte viendra avec les vraies parties. */
const MAP_ID = 'test-town'

export class CityScene extends Phaser.Scene {
  private simulation!: Simulation
  private player!: Entity
  private keyboard!: KeyboardInput
  private playerRenderer!: PlayerRenderer
  private vehicleRenderer!: VehicleRenderer
  private buildingRelief!: BuildingRelief
  private ground!: Ground
  private decor!: Decor
  private lighting!: Lighting
  /** Le temps d'affichage écoulé (eau, feuillage), en secondes : il n'a rien à voir avec la simulation. */
  private displaySeconds = 0
  /** La nuit : 0 = jour, 1 = pleine nuit ; elle glisse vers sa cible quand on appuie sur N. */
  private night = 0
  private nightTarget = 0
  private readonly fixedStepLoop = createFixedStepLoop(STEP_SECONDS)
  /** L'entité que la caméra suit (le joueur à pied, ou sa voiture) et l'objet affiché correspondant. */
  private cameraTarget: { entityId: EntityId; displayObject: Phaser.GameObjects.GameObject } | undefined
  /** Le décalage actuel de la caméra vers l'avant, lissé d'une image à l'autre. */
  private readonly lookahead = { x: 0, y: 0 }

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
    for (const vehicleSpawn of mapDef.spawns.vehicles ?? []) {
      const center = getTileCenter(map, vehicleSpawn)
      spawnVehicle(world, vehicleSpawn.modelId, center.x, center.y, vehicleSpawn.facing)
    }

    this.keyboard = createKeyboardInput(this)
    this.playerRenderer = createPlayerRenderer(this)
    this.vehicleRenderer = createVehicleRenderer(this)

    this.ground = createGround(this, map)
    this.decor = createDecor(this, map)
    this.lighting = createLighting(this)
    this.buildingRelief = createBuildingRelief(this, map)
    // Essai #26 : R coupe ou remet le relief, pour comparer.
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R).on('down', () => this.buildingRelief.setEnabled(!this.buildingRelief.isEnabled()))
    // N fait passer du jour à la nuit, et inversement.
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.N).on('down', () => (this.nightTarget = this.nightTarget === 0 ? 1 : 0))
    this.drawHelp(spawn)

    const camera = this.cameras.main
    camera.setZoom(CAMERA_ZOOM)
    camera.setRoundPixels(true)
    // Un léger vignettage : l'œil va au centre, là où est le joueur (seulement avec WebGL).
    if (this.renderer.type === Phaser.WEBGL) camera.postFX?.addVignette(0.5, 0.5, 0.95, 0.22)
    // La caméra ne montre jamais ce qui est hors de la ville.
    camera.setBounds(0, 0, map.width * map.tileSize, map.height * map.tileSize)
    // Un premier dessin pour que la caméra ait un objet à suivre dès la première image.
    this.drawWorld(1, 0)
  }

  override update(_time: number, deltaMilliseconds: number) {
    const alpha = this.fixedStepLoop.advance(deltaMilliseconds / 1000, () => this.runSimulationStep())
    this.drawWorld(alpha, deltaMilliseconds / 1000)
  }

  /** Un pas de simulation : les touches deviennent des commandes, que la simulation applique. */
  private runSimulationStep() {
    const world = this.simulation.world
    this.playerRenderer.rememberPositions(world)
    this.vehicleRenderer.rememberStates(world)

    const commands: Command[] = []
    if (this.keyboard.consumeInteract()) commands.push({ type: 'player:interact', entityId: this.player.id })
    // Au volant, les mêmes touches conduisent ; à pied, elles font marcher.
    const command = this.player.driver !== undefined ? toDriveCommand(this.player.id, this.keyboard.readDriveKeys()) : toMoveCommand(this.player.id, this.keyboard.readPressedKeys())
    if (command !== undefined) commands.push(command)
    this.simulation.step(commands)
  }

  /** Dessine le monde à l'instant `alpha` entre deux pas, puis cadre la caméra. */
  private drawWorld(alpha: number, deltaSeconds: number) {
    const world = this.simulation.world
    this.vehicleRenderer.draw(world, alpha)
    this.playerRenderer.draw(world, alpha)
    this.followCameraTarget()
    this.updateLookahead(deltaSeconds)
    this.displaySeconds += deltaSeconds
    const step = deltaSeconds / DAY_NIGHT_TRANSITION_SECONDS
    this.night = this.night < this.nightTarget ? Math.min(this.nightTarget, this.night + step) : Math.max(this.nightTarget, this.night - step)
    this.ground.update(this.displaySeconds)
    this.decor.update(this.displaySeconds)
    // Le relief et l'éclairage se calculent depuis ce que voit la caméra.
    const camera = this.cameras.main
    this.buildingRelief.update({ x: camera.midPoint.x, y: camera.midPoint.y }, this.night)
    this.lighting.update(camera.worldView, this.night, this.decor.lights, this.findHeadlights())
  }

  /** Les phares des voitures qui ont quelqu'un au volant : ils partent de l'avant de la voiture, dans le sens du nez. */
  private findHeadlights(): LightBeam[] {
    const beams: LightBeam[] = []
    for (const vehicle of findEntitiesWith(this.simulation.world, ['position', 'vehicle'])) {
      if (vehicle.vehicle.driverId === undefined) continue
      const halfLength = VEHICLE_REGISTRY.get(vehicle.vehicle.modelId).length / 2
      const { headingX, headingY } = vehicle.vehicle
      beams.push({ x: vehicle.position.x + headingX * halfLength, y: vehicle.position.y + headingY * halfLength, directionX: headingX, directionY: headingY })
    }
    return beams
  }

  /** La caméra suit le joueur à pied, ou sa voiture quand il conduit (le joueur n'est alors plus dessiné : il est dans la voiture). */
  private followCameraTarget() {
    const vehicleId = this.player.driver?.vehicleId
    const entityId = vehicleId ?? this.player.id
    const displayObject = vehicleId !== undefined ? this.vehicleRenderer.findDisplayObject(vehicleId) : this.playerRenderer.findDisplayObject(this.player.id)
    if (displayObject === undefined || (this.cameraTarget?.entityId === entityId && this.cameraTarget.displayObject === displayObject)) return
    this.cameraTarget = { entityId, displayObject }
    this.cameras.main.startFollow(displayObject, true)
  }

  /** Au volant, la caméra regarde devant la voiture, d'autant plus loin qu'elle va vite : on voit arriver les virages. */
  private updateLookahead(deltaSeconds: number) {
    const vehicleId = this.player.driver?.vehicleId
    const velocity = vehicleId === undefined ? undefined : findEntity(this.simulation.world, vehicleId)?.velocity
    let targetX = (velocity?.vx ?? 0) * CAMERA_LOOKAHEAD_SECONDS
    let targetY = (velocity?.vy ?? 0) * CAMERA_LOOKAHEAD_SECONDS
    const distance = Math.sqrt(targetX * targetX + targetY * targetY)
    if (distance > CAMERA_LOOKAHEAD_MAX_PX) {
      targetX *= CAMERA_LOOKAHEAD_MAX_PX / distance
      targetY *= CAMERA_LOOKAHEAD_MAX_PX / distance
    }
    const smoothing = Math.min(1, deltaSeconds * CAMERA_LOOKAHEAD_SMOOTHING)
    this.lookahead.x += (targetX - this.lookahead.x) * smoothing
    this.lookahead.y += (targetY - this.lookahead.y) * smoothing
    // Phaser retire ce décalage de la position suivie : pour regarder devant, on le donne en négatif.
    this.cameras.main.setFollowOffset(-Math.round(this.lookahead.x), -Math.round(this.lookahead.y))
  }

  /** Rappel des touches, posé dans le monde près du point de départ (le vrai HUD viendra avec #11). */
  private drawHelp(spawn: { x: number; y: number }) {
    const help = 'Flèches, ZQSD ou WASD : se déplacer · Maj : courir\nE ou Entrée : monter / descendre · Espace : frein à main\nR : relief des immeubles (essai) · N : jour / nuit'
    this.add
      .text(spawn.x, spawn.y - 44, help, { fontFamily: 'monospace', fontSize: '10px', color: COLORS.text, align: 'center' })
      .setOrigin(0.5)
      .setDepth(20)
  }
}
