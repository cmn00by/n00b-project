// Le joueur et les voitures, en style voxel : de petits blocs assemblés par le code.
// Expose : createActors(), Actors.
// Pourquoi : des blocs aux couleurs du jeu, assemblés par le code : variété et animation sans dessin image par image
// (l'approche « voxel » retenue pour l'instant pour les personnages et les véhicules, voir docs/decisions.md). Ils lisent l'état du monde, ne le modifient jamais, et sont dessinés
// entre deux pas de simulation (interpolation), pour un mouvement fluide à toutes les fréquences d'écran.

import * as THREE from 'three'
import { findEntitiesWith } from '../../sim/core'
import type { EntityId, VehicleCustomization, World } from '../../sim/core'
import { VEHICLE_REGISTRY } from '../../data/vehicles'
import { VEHICLE_PART_REGISTRY } from '../../data/vehicleParts'
import { CAR_SHOWCASE_SPIN, CHARACTER_VIEW } from '../constants'
import { createVehicleModel } from './vehicleModel'
import { addOutline } from './outline'
import { createPedestrianActors } from './pedestrianActors'
import { computeYaw } from './pedestrianPose'

export interface Actors {
  /** À appeler juste avant chaque pas de simulation : retient l'état d'avant le pas. */
  rememberStates(world: World): void
  /** À appeler à chaque image. */
  update(world: World, alpha: number, deltaSeconds: number): void
  /** Où est l'entité à l'écran (interpolée), pour la caméra. */
  findDisplayedPosition(entityId: EntityId): { x: number; y: number } | undefined
  /** L'atelier : la voiture montrée tourne sur elle-même et porte les pièces à essayer (`preview`). `undefined` arrête la vitrine. */
  setShowcase(showcase: { vehicleId: EntityId; preview: VehicleCustomization | undefined } | undefined): void
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
  addOutline(group, CHARACTER_VIEW.outlineColor, CHARACTER_VIEW.outlineThickness)
  group.scale.setScalar(CHARACTER_VIEW.scale)
  return { group, legs, arms }
}

/** Retire un modèle de la scène et libère ses blocs (une voiture repeinte est reconstruite). */
function removeModel(scene: THREE.Scene, model: THREE.Group): void {
  scene.remove(model)
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    object.geometry.dispose()
    ;(object.material as THREE.Material).dispose()
  })
}

export function createActors(scene: THREE.Scene): Actors {
  const previous = new Map<EntityId, Snapshot>()
  const displayed = new Map<EntityId, { x: number; y: number }>()
  const cars = new Map<EntityId, { model: THREE.Group; lookKey: string }>()
  let showcase: { vehicleId: EntityId; preview: VehicleCustomization | undefined } | undefined
  let showcaseYaw = 0
  const players = new Map<EntityId, ReturnType<typeof createPlayerModel> & { walkPhase: number; yaw: number }>()
  const pedestrians = createPedestrianActors(scene)

  const snapshotOf = (x: number, y: number, headingX = 0, headingY = -1): Snapshot => ({ x, y, headingX, headingY })

  return {
    rememberStates(world) {
      pedestrians.rememberStates(world)
      for (const entity of findEntitiesWith(world, ['position'])) {
        previous.set(entity.id, snapshotOf(entity.position.x, entity.position.y, entity.vehicle?.headingX, entity.vehicle?.headingY))
      }
    },

    update(world, alpha, deltaSeconds) {
      pedestrians.update(world, alpha, deltaSeconds)
      const stillThere = new Set<EntityId>()
      showcaseYaw += deltaSeconds * CAR_SHOWCASE_SPIN
      for (const vehicle of findEntitiesWith(world, ['position', 'vehicle'])) {
        stillThere.add(vehicle.id)
        // La voiture est reconstruite quand ses pièces changent (ou quand on en essaie une à l'atelier).
        const isShown = showcase?.vehicleId === vehicle.id
        const customization = isShown && showcase?.preview !== undefined ? showcase.preview : vehicle.vehicle.customization
        const lookKey = JSON.stringify(customization ?? {})
        let entry = cars.get(vehicle.id)
        if (entry === undefined || entry.lookKey !== lookKey) {
          if (entry !== undefined) removeModel(scene, entry.model)
          entry = { model: createVehicleModel(VEHICLE_REGISTRY.get(vehicle.vehicle.modelId), customization, VEHICLE_PART_REGISTRY), lookKey }
          scene.add(entry.model)
          cars.set(vehicle.id, entry)
        }
        const model = entry.model
        const before = previous.get(vehicle.id) ?? snapshotOf(vehicle.position.x, vehicle.position.y, vehicle.vehicle.headingX, vehicle.vehicle.headingY)
        const x = before.x + (vehicle.position.x - before.x) * alpha
        const y = before.y + (vehicle.position.y - before.y) * alpha
        model.position.set(x, 0, y)
        model.rotation.y = isShown
          ? showcaseYaw
          : computeYaw(before.headingX + (vehicle.vehicle.headingX - before.headingX) * alpha, before.headingY + (vehicle.vehicle.headingY - before.headingY) * alpha)
        displayed.set(vehicle.id, { x, y })
      }
      // Une voiture qui a quitté la ville (rangée au garage) disparaît aussi de l'écran.
      for (const [id, entry] of cars) {
        if (stillThere.has(id)) continue
        removeModel(scene, entry.model)
        cars.delete(id)
        previous.delete(id)
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
        if (isMoving) model.yaw = computeYaw(dx, dy)
        model.walkPhase = isMoving ? model.walkPhase + deltaSeconds * 12 : 0
        const swing = Math.sin(model.walkPhase) * 0.7
        model.legs.forEach((leg, index) => (leg.rotation.x = index === 0 ? swing : -swing))
        model.arms.forEach((arm, index) => (arm.rotation.x = index === 0 ? -swing : swing))
        model.group.position.set(x, isMoving ? Math.abs(Math.cos(model.walkPhase)) * 1.2 : 0, y)
        model.group.rotation.y = model.yaw
      }
    },

    findDisplayedPosition: (entityId) => displayed.get(entityId),

    setShowcase(next) {
      if (next?.vehicleId !== showcase?.vehicleId) showcaseYaw = 0
      showcase = next
    },
  }
}
