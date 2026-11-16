// Point d'entrée du jeu dans le navigateur : crée la simulation, l'affichage three.js et la boucle de jeu.
// La ville est construite en vraie 3D, dessinée en basse résolution puis agrandie sans lissage : un rendu pixel art (docs/decisions.md).
// Cette boucle ne décide d'aucune règle du jeu : elle transmet les commandes à la simulation et affiche son état.

import * as THREE from 'three'
import { STEP_SECONDS, createSimulation, createTileMap, createWorld, findEntity, getTileCenter, loadMap, spawnEntity } from './sim/core'
import type { Command } from './sim/core'
import { SYSTEMS } from './sim/systems'
import { spawnVehicle } from './sim/systems/driving'
import { MAP_REGISTRY } from './data/maps'
import { TILE_KIND_REGISTRY } from './data/tileKinds'
import { VEHICLE_REGISTRY } from './data/vehicles'
import { CAMERA_LOOKAHEAD_MAX_PX, CAMERA_LOOKAHEAD_SECONDS, CAMERA_LOOKAHEAD_SMOOTHING, DAY_NIGHT_TRANSITION_SECONDS, GAME_SEED } from './game/constants'
import { createFixedStepLoop } from './game/fixedStepLoop'
import { createKeyboard, toDriveCommand, toMoveCommand } from './game/input'
import { createActors, createBuildings, createCamera, createDecor, createGround, createLighting, loadTextures } from './game/render'

/** Combien de pixels de la fenêtre pour un pixel de la scène : c'est ce qui donne le grain pixel art. P passe de l'un à l'autre. */
const PIXEL_SCALES = [3, 4, 2] as const
const MAP_ID = 'test-town'

async function start() {
  const container = document.getElementById('game')
  if (container === null) throw new Error('Élément #game introuvable')

  // Le rendu : sans lissage, à la taille de la scène en basse résolution ; le canvas est ensuite agrandi par le CSS (pixelated).
  const renderer = new THREE.WebGLRenderer({ antialias: false })
  renderer.setPixelRatio(1)
  container.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  const camera3d = createCamera(16 / 9)
  let pixelScaleIndex = 0
  let lowHeight = 270
  const resize = () => {
    const scale = PIXEL_SCALES[pixelScaleIndex] ?? 3
    const lowWidth = Math.max(160, Math.floor(window.innerWidth / scale))
    lowHeight = Math.max(90, Math.floor(window.innerHeight / scale))
    renderer.setSize(lowWidth, lowHeight, false)
    renderer.domElement.style.width = `${lowWidth * scale}px`
    renderer.domElement.style.height = `${lowHeight * scale}px`
    camera3d.resize(lowWidth / lowHeight)
  }
  resize()
  window.addEventListener('resize', resize)

  // La simulation : la carte, le joueur à son point de départ, les voitures garées.
  const textures = await loadTextures()
  const mapDef = MAP_REGISTRY.get(MAP_ID)
  const map = createTileMap(mapDef, TILE_KIND_REGISTRY)
  const world = createWorld(GAME_SEED)
  loadMap(world, map)
  const simulation = createSimulation(world, SYSTEMS)
  const spawn = getTileCenter(map, mapDef.spawns.player)
  const player = spawnEntity(world, 'player', { position: { x: spawn.x, y: spawn.y, angle: 0 }, body: { width: 24, height: 24, isSolid: true } })
  for (const vehicleSpawn of mapDef.spawns.vehicles ?? []) {
    const center = getTileCenter(map, vehicleSpawn)
    spawnVehicle(world, vehicleSpawn.modelId, center.x, center.y, vehicleSpawn.facing)
  }

  const ground = createGround(scene, map, textures)
  const buildings = createBuildings(scene, map, textures)
  const decor = createDecor(scene, map, textures)
  const actors = createActors(scene)
  const lighting = createLighting(scene, renderer)
  const keyboard = createKeyboard(window)
  const fixedStepLoop = createFixedStepLoop(STEP_SECONDS)
  let night = 0
  let nightTarget = 0
  const lookahead = { x: 0, y: 0 }
  keyboard.onPress('KeyN', () => (nightTarget = nightTarget === 0 ? 1 : 0))
  keyboard.onPress('KeyC', () => camera3d.nextTilt())
  keyboard.onPress('KeyP', () => {
    pixelScaleIndex = (pixelScaleIndex + 1) % PIXEL_SCALES.length
    resize()
  })
  document.getElementById('loading')?.remove()

  const runSimulationStep = () => {
    actors.rememberStates(world)
    const commands: Command[] = []
    if (keyboard.consumeInteract()) commands.push({ type: 'player:interact', entityId: player.id })
    const command = player.driver !== undefined ? toDriveCommand(player.id, keyboard.readDriveKeys()) : toMoveCommand(player.id, keyboard.readPressedKeys())
    if (command !== undefined) commands.push(command)
    simulation.step(commands)
  }

  let lastTime = performance.now()
  let displaySeconds = 0
  const frame = (now: number) => {
    const deltaSeconds = Math.min(0.1, (now - lastTime) / 1000)
    lastTime = now
    displaySeconds += deltaSeconds
    const alpha = fixedStepLoop.advance(deltaSeconds, runSimulationStep)
    const step = deltaSeconds / DAY_NIGHT_TRANSITION_SECONDS
    night = night < nightTarget ? Math.min(nightTarget, night + step) : Math.max(nightTarget, night - step)

    actors.update(world, alpha, deltaSeconds)

    // La caméra suit le joueur, ou sa voiture ; au volant, elle regarde devant, d'autant plus que la voiture va vite.
    const vehicleId = player.driver?.vehicleId
    const vehicle = vehicleId === undefined ? undefined : findEntity(world, vehicleId)
    const focus = actors.findDisplayedPosition(vehicleId ?? player.id) ?? { x: spawn.x, y: spawn.y }
    let targetX = (vehicle?.velocity?.vx ?? 0) * CAMERA_LOOKAHEAD_SECONDS
    let targetY = (vehicle?.velocity?.vy ?? 0) * CAMERA_LOOKAHEAD_SECONDS
    const distance = Math.sqrt(targetX * targetX + targetY * targetY)
    if (distance > CAMERA_LOOKAHEAD_MAX_PX) {
      targetX *= CAMERA_LOOKAHEAD_MAX_PX / distance
      targetY *= CAMERA_LOOKAHEAD_MAX_PX / distance
    }
    const smoothing = Math.min(1, deltaSeconds * CAMERA_LOOKAHEAD_SMOOTHING)
    lookahead.x += (targetX - lookahead.x) * smoothing
    lookahead.y += (targetY - lookahead.y) * smoothing
    const cameraFocus = { x: focus.x + lookahead.x, y: focus.y + lookahead.y }
    camera3d.follow(cameraFocus.x, cameraFocus.y, lowHeight)

    let headlight: { x: number; y: number; headingX: number; headingY: number } | undefined
    if (vehicle?.vehicle !== undefined && vehicleId !== undefined) {
      const carPosition = actors.findDisplayedPosition(vehicleId) ?? focus
      const halfLength = VEHICLE_REGISTRY.get(vehicle.vehicle.modelId).length / 2
      const { headingX, headingY } = vehicle.vehicle
      headlight = { x: carPosition.x + headingX * halfLength, y: carPosition.y + headingY * halfLength, headingX, headingY }
    }

    ground.update(displaySeconds)
    decor.update(displaySeconds, night)
    buildings.setNight(night)
    lighting.update(cameraFocus, night, decor.lamps, headlight)
    renderer.render(scene, camera3d.camera)
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

start().catch((error: unknown) => {
  const loading = document.getElementById('loading')
  if (loading) loading.textContent = `Erreur au chargement : ${error instanceof Error ? error.message : String(error)}`
  throw error
})
