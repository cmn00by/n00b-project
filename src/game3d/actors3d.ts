// Le joueur et les voitures de l'essai 3D, en style voxel : de petits blocs assemblés par le code.
// Expose : createActors3d(), Actors3d.
// Pourquoi : pas encore de visuels de personnages ni de voitures en 3D ; des blocs aux couleurs du jeu suffisent pour juger le rendu,
// et c'est l'approche « voxel » proposée pour les personnages. Ils lisent l'état du monde, ne le modifient jamais, et sont dessinés
// entre deux pas de simulation (interpolation), comme dans la version Phaser.

import * as THREE from 'three'
import { findEntitiesWith } from '../sim/core'
import type { EntityId, World } from '../sim/core'
import { VEHICLE_REGISTRY } from '../data/vehicles'
import { MISSING_VEHICLE_COLOR, VEHICLE_COLORS } from '../game/constants'

export interface Actors3d {
  /** À appeler juste avant chaque pas de simulation : retient l'état d'avant le pas. */
  rememberStates(world: World): void
  /** À appeler à chaque image. */
  update(world: World, alpha: number, deltaSeconds: number): void
  /** Où est l'entité à l'écran (interpolée), pour la caméra. */
  findDisplayedPosition(entityId: EntityId): { x: number; y: number } | undefined
}

interface Snapshot {
  x: number
  y: number
  headingX: number
  headingY: number
}

const box = (width: number, height: number, depth: number, color: number): THREE.Mesh => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), new THREE.MeshLambertMaterial({ color }))
  mesh.castShadow = true
  return mesh
}

/** Le joueur : un petit personnage en blocs (chibi), qui fait face à l'avant (-z). Les jambes et les bras se balancent en marchant. */
function createPlayerModel() {
  const group = new THREE.Group()
  const legs = [-1, 1].map((side) => {
    const pivot = new THREE.Group()
    const leg = box(5, 9, 5, 0x3e4152)
    leg.position.y = -4.5
    pivot.add(leg)
    pivot.position.set(side * 3, 10, 0)
    group.add(pivot)
    return pivot
  })
  const arms = [-1, 1].map((side) => {
    const pivot = new THREE.Group()
    const arm = box(3, 9, 3, 0xffd23f)
    arm.position.y = -4
    pivot.add(arm)
    pivot.position.set(side * 7.5, 19, 0)
    group.add(pivot)
    return pivot
  })
  const body = box(11, 10, 7, 0xffd23f)
  body.position.y = 15
  const head = box(12, 11, 11, 0xe8b08a)
  head.position.y = 26
  const cap = box(13, 3, 12, 0xe5383b)
  cap.position.y = 33
  const visor = box(11, 1.5, 5, 0xe5383b)
  visor.position.set(0, 32, -7)
  group.add(body, head, cap, visor)
  for (const side of [-1, 1]) {
    const eye = box(2, 2.5, 1, 0x2b1e3a)
    eye.position.set(side * 3, 27, -5.6)
    group.add(eye)
  }
  return { group, legs, arms }
}

/** Une voiture : caisse, habitacle, pare-brise et roues, à la taille du modèle, nez vers l'avant (-z). */
function createCarModel(modelId: string): THREE.Group {
  const def = VEHICLE_REGISTRY.get(modelId)
  const color = VEHICLE_COLORS[modelId] ?? MISSING_VEHICLE_COLOR
  const group = new THREE.Group()
  const chassis = box(def.width, 9, def.length, color)
  chassis.position.y = 8
  const cabin = box(def.width - 4, 8, def.length * 0.48, color)
  cabin.position.set(0, 16.5, def.length * 0.06)
  const windshield = box(def.width - 5, 6, 1.5, 0x3e4152)
  windshield.position.set(0, 16, -def.length * 0.18)
  const rearWindow = box(def.width - 5, 5, 1.5, 0x3e4152)
  rearWindow.position.set(0, 16, def.length * 0.3)
  group.add(chassis, cabin, windshield, rearWindow)
  for (const [side, end] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ] as const) {
    const wheel = box(3, 7, 9, 0x2b1e3a)
    wheel.position.set(side * (def.width / 2), 4, end * def.length * 0.32)
    group.add(wheel)
  }
  for (const side of [-1, 1]) {
    const headlight = box(4, 3, 1, 0xfff8ec)
    headlight.position.set(side * (def.width / 2 - 4), 9, -def.length / 2 - 0.5)
    group.add(headlight)
  }
  return group
}

/** L'angle (autour de la verticale) qui tourne l'avant d'un modèle (-z) vers le cap (headingX, headingY) de la simulation. */
const yawOf = (headingX: number, headingY: number) => Math.atan2(-headingX, -headingY)

export function createActors3d(scene: THREE.Scene): Actors3d {
  const previous = new Map<EntityId, Snapshot>()
  const displayed = new Map<EntityId, { x: number; y: number }>()
  const cars = new Map<EntityId, THREE.Group>()
  const players = new Map<EntityId, ReturnType<typeof createPlayerModel> & { walkPhase: number; yaw: number }>()

  const snapshotOf = (x: number, y: number, headingX = 0, headingY = -1): Snapshot => ({ x, y, headingX, headingY })

  return {
    rememberStates(world) {
      for (const entity of findEntitiesWith(world, ['position'])) {
        previous.set(entity.id, snapshotOf(entity.position.x, entity.position.y, entity.vehicle?.headingX, entity.vehicle?.headingY))
      }
    },

    update(world, alpha, deltaSeconds) {
      for (const vehicle of findEntitiesWith(world, ['position', 'vehicle'])) {
        let model = cars.get(vehicle.id)
        if (model === undefined) {
          model = createCarModel(vehicle.vehicle.modelId)
          scene.add(model)
          cars.set(vehicle.id, model)
        }
        const before = previous.get(vehicle.id) ?? snapshotOf(vehicle.position.x, vehicle.position.y, vehicle.vehicle.headingX, vehicle.vehicle.headingY)
        const x = before.x + (vehicle.position.x - before.x) * alpha
        const y = before.y + (vehicle.position.y - before.y) * alpha
        model.position.set(x, 0, y)
        model.rotation.y = yawOf(before.headingX + (vehicle.vehicle.headingX - before.headingX) * alpha, before.headingY + (vehicle.vehicle.headingY - before.headingY) * alpha)
        displayed.set(vehicle.id, { x, y })
      }

      for (const player of findEntitiesWith(world, ['position'])) {
        if (player.kind !== 'player') continue
        let model = players.get(player.id)
        if (model === undefined) {
          model = { ...createPlayerModel(), walkPhase: 0, yaw: 0 }
          scene.add(model.group)
          players.set(player.id, model)
        }
        const before = previous.get(player.id) ?? snapshotOf(player.position.x, player.position.y)
        const x = before.x + (player.position.x - before.x) * alpha
        const y = before.y + (player.position.y - before.y) * alpha
        displayed.set(player.id, { x, y })
        // Au volant, le joueur est dans la voiture : on ne le dessine pas.
        model.group.visible = player.driver === undefined
        // Il regarde là où il va, et balance bras et jambes tant qu'il bouge.
        const dx = player.position.x - before.x
        const dy = player.position.y - before.y
        const isMoving = Math.abs(dx) + Math.abs(dy) > 0.01
        if (isMoving) model.yaw = yawOf(dx, dy)
        model.walkPhase = isMoving ? model.walkPhase + deltaSeconds * 12 : 0
        const swing = Math.sin(model.walkPhase) * 0.7
        model.legs.forEach((leg, index) => (leg.rotation.x = index === 0 ? swing : -swing))
        model.arms.forEach((arm, index) => (arm.rotation.x = index === 0 ? -swing : swing))
        model.group.position.set(x, isMoving ? Math.abs(Math.cos(model.walkPhase)) * 1.2 : 0, y)
        model.group.rotation.y = model.yaw
      }
    },

    findDisplayedPosition: (entityId) => displayed.get(entityId),
  }
}
