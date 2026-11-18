// Le modèle d'un véhicule en blocs, assemblé d'après sa silhouette en données (VehicleLook) et les pièces de l'atelier.
// Expose : createVehicleModel().
// Pourquoi : chaque modèle (src/data/vehicles) décrit sa forme (hauteur de caisse, habitacle, accessoires) au lieu d'être dessiné à la main :
// ajouter un véhicule est une fiche de données, et toutes les pièces de l'atelier s'adaptent à sa taille. Le nez regarde vers -z, comme les autres modèles.

import * as THREE from 'three'
import type { Registry, VehicleCustomization, VehicleDef, VehicleExtra, VehiclePartDef } from '../../sim/core'
import { MISSING_VEHICLE_COLOR } from '../constants'
import { addCarParts, describeCarLook } from './carParts'
import type { VehicleFrame } from './carParts'

/** La hauteur du dessous de caisse : la place des roues. */
const BODY_BOTTOM = 3.5
const WINDOW_COLOR = 0x3e4152

const toNumber = (color: string): number => Number.parseInt(color.slice(1), 16)

const box = (width: number, height: number, depth: number, color: number, isUnlit = false): THREE.Mesh => {
  const material = isUnlit ? new THREE.MeshBasicMaterial({ color }) : new THREE.MeshLambertMaterial({ color })
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material)
  mesh.castShadow = !isUnlit
  return mesh
}

const at = (mesh: THREE.Mesh, x: number, y: number, z: number): THREE.Mesh => {
  mesh.position.set(x, y, z)
  return mesh
}

function addExtras(group: THREE.Group, frame: VehicleFrame, extras: readonly VehicleExtra[], bodyColor: number) {
  const { width, length, bodyTop, roofTop, cabinCenter, cabinLength } = frame
  for (const extra of extras) {
    switch (extra) {
      case 'taxi-sign':
        group.add(at(box(10, 3, 4, 0xffd23f, true), 0, roofTop + 1.5, cabinCenter), at(box(10.5, 0.8, 4.5, 0x2b1e3a), 0, roofTop + 0.4, cabinCenter))
        break
      case 'siren':
        group.add(at(box(5, 2.5, 3, 0xe5383b, true), -3, roofTop + 1.25, cabinCenter), at(box(5, 2.5, 3, 0x3a86ff, true), 3, roofTop + 1.25, cabinCenter))
        break
      case 'pickup-bed': {
        // La benne : deux ridelles et un hayon, à l'arrière de l'habitacle.
        const bedStart = cabinCenter + cabinLength / 2
        const bedLength = length / 2 - bedStart
        for (const side of [-1, 1]) group.add(at(box(1.5, 4, bedLength, bodyColor), side * (width / 2 - 0.75), bodyTop + 2, bedStart + bedLength / 2))
        group.add(at(box(width, 4, 1.5, bodyColor), 0, bodyTop + 2, length / 2 - 0.75))
        break
      }
      case 'golf-roof':
        // Un toit léger sur quatre montants.
        for (const [side, end] of [
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ] as const) {
          group.add(at(box(1.2, 11, 1.2, 0x8a8797), side * (width / 2 - 1.5), bodyTop + 5.5, end * length * 0.3))
        }
        group.add(at(box(width + 2, 1.5, length * 0.7, 0x43c46b), 0, bodyTop + 11.5, 0))
        break
      case 'side-windows': {
        // Une rangée de vitres sur chaque flanc : en haut de la caisse pour un bus, sur l'habitacle pour une limousine.
        const hasCabin = roofTop > bodyTop
        const top = hasCabin ? roofTop : bodyTop
        const zoneLength = hasCabin ? cabinLength : length * 0.86
        const zoneCenter = hasCabin ? cabinCenter : 0
        const count = Math.max(2, Math.floor(zoneLength / 10))
        for (let index = 0; index < count; index++) {
          const z = zoneCenter - zoneLength / 2 + ((index + 0.5) * zoneLength) / count
          for (const side of [-1, 1]) group.add(at(box(0.6, 4, (zoneLength / count) * 0.7, WINDOW_COLOR), side * (width / 2 + (hasCabin ? -1.7 : 0.2)), top - 3.5, z))
        }
        break
      }
    }
  }
}

/** Le modèle d'un véhicule : caisse, habitacle et vitres, roues et phares, accessoires de sa silhouette, puis pièces de l'atelier. */
export function createVehicleModel(def: VehicleDef, customization: VehicleCustomization | undefined, parts: Registry<VehiclePartDef>): THREE.Group {
  const look = def.look ?? { color: `#${MISSING_VEHICLE_COLOR.toString(16).padStart(6, '0')}`, bodyHeight: 9, cabin: { length: 0.48, offset: 0.06, height: 8 } }
  const carLook = describeCarLook(customization, parts)
  const bodyColor = carLook.paint ?? toNumber(look.color)
  const cabinColor = carLook.paint ?? toNumber(look.cabinColor ?? look.color)
  const { width, length } = def
  const bodyTop = BODY_BOTTOM + look.bodyHeight
  const cabinLength = length * look.cabin.length
  const cabinCenter = length * look.cabin.offset
  const roofTop = bodyTop + look.cabin.height
  const frame: VehicleFrame = { width, length, bodyTop, roofTop, cabinCenter, cabinLength }

  const group = new THREE.Group()
  group.add(at(box(width, look.bodyHeight, length, bodyColor), 0, BODY_BOTTOM + look.bodyHeight / 2, 0))
  if (look.cabin.height > 0 && cabinLength > 0) {
    group.add(at(box(width - 4, look.cabin.height, cabinLength, cabinColor), 0, bodyTop + look.cabin.height / 2, cabinCenter))
    const glassHeight = Math.max(1, look.cabin.height - 2)
    group.add(at(box(width - 5, glassHeight, 1.5, WINDOW_COLOR), 0, bodyTop + glassHeight / 2 + 0.5, cabinCenter - cabinLength / 2 - 0.2))
    group.add(at(box(width - 5, glassHeight * 0.8, 1.5, WINDOW_COLOR), 0, bodyTop + glassHeight / 2 + 0.5, cabinCenter + cabinLength / 2 + 0.2))
  } else {
    // Sans habitacle (un bus) : le pare-brise est en haut de la face avant.
    group.add(at(box(width - 4, look.bodyHeight * 0.4, 1.2, WINDOW_COLOR), 0, bodyTop - look.bodyHeight * 0.25, -length / 2 - 0.3))
  }

  // Les roues : un peu plus grandes et plus écartées sur un long véhicule.
  const isLong = length > 70
  const wheelHeight = isLong ? 9 : look.bodyHeight < 8 ? 5.5 : 7
  const axle = length * (isLong ? 0.36 : 0.32)
  for (const side of [-1, 1]) {
    for (const end of [-1, 1]) {
      group.add(at(box(3, wheelHeight, wheelHeight + 2, 0x2b1e3a), side * (width / 2), wheelHeight / 2, end * axle))
      if (carLook.wheels !== undefined) group.add(at(box(1, wheelHeight * 0.55, wheelHeight * 0.6, carLook.wheels), side * (width / 2 + 1.6), wheelHeight / 2, end * axle))
    }
    group.add(at(box(4, 3, 1, 0xfff8ec), side * (width / 2 - 4), BODY_BOTTOM + look.bodyHeight * 0.6, -length / 2 - 0.5))
  }

  addExtras(group, frame, look.extras ?? [], bodyColor)
  addCarParts(group, frame, carLook)
  return group
}
