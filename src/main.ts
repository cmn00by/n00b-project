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
import { MISSION_REGISTRY } from './data/missions'
import { VEHICLE_REGISTRY } from './data/vehicles'
import { CAMERA_LOOKAHEAD_MAX_PX, CAMERA_LOOKAHEAD_SECONDS, CAMERA_LOOKAHEAD_SMOOTHING, DAY_NIGHT_TRANSITION_SECONDS, GAME_SEED, HUD_PLACEHOLDER } from './game/constants'
import { createFixedStepLoop } from './game/fixedStepLoop'
import { createHudView, createMissionPanelView, createTouchControlsView } from './game/hud'
import { chooseStartMode, createKeyboard, createTouchInput, parseControlsOverride, switchMode, toDriveCommand, toMoveCommand } from './game/input'
import type { ControlMode } from './game/input'
import { describeMissions } from './game/missionGuide'
import { createActors, createBuildings, createCamera, createDecor, createGround, createLighting, createMissionMarkers, loadTextures } from './game/render'

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
  const hud = createHudView(document.body)
  const missionMarkers = createMissionMarkers(scene)
  const missionPanel = createMissionPanelView(document.body)
  // Les messages de mission : le panneau écoute la simulation, il ne décide de rien.
  world.events.on('mission:started', ({ missionId }) => missionPanel.showMessage(MISSION_REGISTRY.get(missionId).briefing, true))
  world.events.on('mission:succeeded', ({ money }) => missionPanel.showMessage(`Mission réussie ! +${money} €`, true))
  world.events.on('mission:failed', ({ reason }) => missionPanel.showMessage(reason === 'time-out' ? 'Trop tard… Mission échouée' : 'Mission abandonnée', false))
  const touch = createTouchInput(window)
  const touchView = createTouchControlsView(document.body)
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
  // Santé, argent et recherche n'existent pas encore dans la simulation : le HUD affiche des valeurs factices (voir HUD_PLACEHOLDER).
  hud.update(HUD_PLACEHOLDER)

  // Le mode de commandes : clavier ou tactile, choisi selon l'appareil, puis il suit la dernière entrée utilisée (un toucher, une touche). ?controls=touch|keyboard le force.
  const help = document.getElementById('help')
  const keyboardHelp = help?.innerHTML ?? ''
  const override = parseControlsOverride(window.location.search)
  let mode: ControlMode = chooseStartMode(override, window.matchMedia('(pointer: coarse)').matches)
  const applyMode = (newMode: ControlMode) => {
    mode = newMode
    touch.setEnabled(mode === 'touch')
    touchView.setVisible(mode === 'touch')
    if (help === null) return
    // Au toucher, l'aide passe en haut de l'écran : le bas est pris par les commandes.
    help.innerHTML = mode === 'touch' ? 'Joystick à gauche : se déplacer, conduire<br />Bouton rond : courir (à pied), frein à main (en voiture) · E : monter, descendre' : keyboardHelp
    help.style.top = mode === 'touch' ? '10px' : 'auto'
    help.style.bottom = mode === 'touch' ? 'auto' : '10px'
  }
  applyMode(mode)
  touch.onTouchUsed(() => applyMode(switchMode('touch', override)))
  window.addEventListener('keydown', () => applyMode(switchMode('keyboard', override)))
  document.getElementById('loading')?.remove()

  const runSimulationStep = () => {
    actors.rememberStates(world)
    const commands: Command[] = []
    const input = mode === 'touch' ? touch : keyboard
    if (input.consumeInteract()) commands.push({ type: 'player:interact', entityId: player.id })
    const command = player.driver !== undefined ? toDriveCommand(player.id, input.readDriveKeys()) : toMoveCommand(player.id, input.readPressedKeys())
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

    const missionGuide = describeMissions(player.missionProgress, MISSION_REGISTRY.all, map)
    missionMarkers.update(missionGuide.markers, displaySeconds)
    missionPanel.update(missionGuide.panel)
    ground.update(displaySeconds)
    decor.update(displaySeconds, night)
    buildings.setNight(night)
    lighting.update(cameraFocus, night, decor.lamps, headlight)
    if (mode === 'touch') touchView.update(touch.readState(), { isDriving: player.driver !== undefined, screenWidth: window.innerWidth, screenHeight: window.innerHeight })
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
