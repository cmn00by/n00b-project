// Le modèle d'un piéton en blocs : tête, cheveux, corps, bras, jambes et accessoire, assemblés d'après son apparence.
// Expose : PedestrianModel, createPedestrianModel().
// Pourquoi : pas un sprite à dessiner et à animer par variante, mais un petit personnage assemblé par le code (même gabarit que le joueur, voir actors.ts) :
// changer une couleur ou un accessoire dans la recette d'un type de PNJ suffit à varier toute la foule. Il regarde vers -z, comme les autres modèles.

import * as THREE from 'three'
import { PEDESTRIAN_VIEW } from '../constants'
import type { PedestrianAppearance } from './pedestrianAppearance'

export interface PedestrianModel {
  /** Le point d'ancrage : sa position est celle du piéton au sol, son échelle est sa taille. Il ne tourne pas. */
  root: THREE.Group
  /** Le corps et ses accessoires : c'est lui qui tourne vers où regarde le piéton. */
  body: THREE.Group
  /** Les deux jambes et les deux bras (pivots en haut), à balancer en marchant. */
  legs: THREE.Group[]
  arms: THREE.Group[]
  /** La pastille « ! » au-dessus de la tête, visible quand il prend la fuite. Elle ne tourne pas avec le corps. */
  alertMark: THREE.Group
  /** La pastille « ? » d'un curieux et la croix d'un piéton qui râle, au même endroit que le « ! » (une seule visible à la fois). */
  curiousMark: THREE.Group
  angryMark: THREE.Group
  /** Le téléphone au bout du bras droit, visible seulement quand il filme. */
  phone: THREE.Group
}

// Les blocs de même taille et de même couleur partagent leur géométrie et leur matière : avec toute une foule, on ne recrée pas des centaines de ressources.
const geometries = new Map<string, THREE.BoxGeometry>()
const materials = new Map<string, THREE.Material>()

function block(width: number, height: number, depth: number, color: string, options: { isUnlit?: boolean } = {}): THREE.Mesh {
  const geometryKey = `${width}x${height}x${depth}`
  let geometry = geometries.get(geometryKey)
  if (geometry === undefined) {
    geometry = new THREE.BoxGeometry(width, height, depth)
    geometries.set(geometryKey, geometry)
  }
  const materialKey = `${options.isUnlit === true ? 'unlit' : 'lit'}:${color}`
  let material = materials.get(materialKey)
  if (material === undefined) {
    material = options.isUnlit === true ? new THREE.MeshBasicMaterial({ color }) : new THREE.MeshLambertMaterial({ color })
    materials.set(materialKey, material)
  }
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = options.isUnlit !== true
  return mesh
}

function placed(mesh: THREE.Mesh, x: number, y: number, z: number): THREE.Mesh {
  mesh.position.set(x, y, z)
  return mesh
}

/** Un membre (jambe ou bras) : un pivot placé en haut du membre, pour qu'il se balance depuis l'épaule ou la hanche. */
function createLimb(width: number, length: number, depth: number, color: string, x: number, y: number): THREE.Group {
  const pivot = new THREE.Group()
  pivot.add(placed(block(width, length, depth, color), 0, -length / 2, 0))
  pivot.position.set(x, y, 0)
  return pivot
}

/** Les cheveux : un dessus et une nuque, un peu plus larges que la tête pour la recouvrir. */
function createHair(color: string): THREE.Mesh[] {
  return [placed(block(12.6, 3, 11.6, color), 0, 32.2, 0), placed(block(12.6, 8, 2.4, color), 0, 27, 5.2)]
}

/** Les blocs de l'accessoire porté. */
function createAccessory(accessory: NonNullable<PedestrianAppearance['accessory']>, color: string): THREE.Mesh[] {
  switch (accessory) {
    case 'cap':
      return [placed(block(13, 3, 12, color), 0, 33, 0), placed(block(11, 1.5, 5, color), 0, 32, -7)]
    case 'hat':
      return [placed(block(17, 1.5, 17, color), 0, 32.2, 0), placed(block(10, 5, 10, color), 0, 35.2, 0)]
    case 'glasses':
      return [placed(block(11.5, 2, 1, PEDESTRIAN_VIEW.glassesColor), 0, 27, -5.8)]
    case 'backpack':
      return [placed(block(8, 10, 4, color), 0, 16, 5.5)]
    case 'cane':
      return [placed(block(1.5, 15, 1.5, PEDESTRIAN_VIEW.caneColor), 9.5, 7.5, -2), placed(block(3.5, 1.5, 1.5, PEDESTRIAN_VIEW.caneColor), 8.7, 15.2, -2)]
  }
}

/** Un petit pictogramme fait de cases (X = case colorée), qui ne reçoit pas la lumière. Il est centré sur son point d'ancrage et regarde vers la caméra. */
function createGlyph(rows: readonly string[], color: string): THREE.Group {
  const glyph = new THREE.Group()
  const cell = 2.4
  rows.forEach((row, rowIndex) => {
    for (let column = 0; column < row.length; column++) {
      if (row[column] !== 'X') continue
      glyph.add(placed(block(cell, cell, cell, color, { isUnlit: true }), (column - (row.length - 1) / 2) * cell, ((rows.length - 1) / 2 - rowIndex) * cell, 0))
    }
  })
  // Penché en arrière : la caméra regarde d'en haut, un pictogramme debout serait écrasé.
  glyph.rotation.x = -PEDESTRIAN_VIEW.glyphTilt
  glyph.position.y = PEDESTRIAN_VIEW.alertHeight
  glyph.visible = false
  return glyph
}

/**
 * Le téléphone : une plaque sombre avec son écran clair, au bout du bras droit. Dans le repère du bras, le bras pointe vers le bas (-y) :
 * quand il se tend vers l'avant, la plaque se retrouve debout face à celui qui filme, et son écran (côté +y) fait face à la caméra.
 */
function createPhone(): THREE.Group {
  const phone = new THREE.Group()
  phone.add(placed(block(4.5, 1.2, 6, PEDESTRIAN_VIEW.phoneColor), 0, -10, 0), placed(block(3.5, 0.4, 4.6, PEDESTRIAN_VIEW.phoneScreenColor, { isUnlit: true }), 0, -9.3, 0))
  phone.visible = false
  return phone
}

/** La pastille « ! » : un trait et un point, rouges, qui ne reçoivent pas la lumière (toujours lisibles, de jour comme de nuit). */
function createAlertMark(): THREE.Group {
  const mark = new THREE.Group()
  mark.add(placed(block(2.4, 6, 2.4, PEDESTRIAN_VIEW.alertColor, { isUnlit: true }), 0, 3, 0), placed(block(2.4, 2.4, 2.4, PEDESTRIAN_VIEW.alertColor, { isUnlit: true }), 0, -1.5, 0))
  mark.position.y = PEDESTRIAN_VIEW.alertHeight
  mark.visible = false
  return mark
}

/** Assemble un piéton d'après son apparence. */
export function createPedestrianModel(appearance: PedestrianAppearance): PedestrianModel {
  const { skinColor, hairColor, topColor, bottomColor, accessory, accessoryColor } = appearance
  const body = new THREE.Group()
  const legs = [-1, 1].map((side) => createLimb(5, 9, 5, bottomColor, side * 3, 10))
  const arms = [-1, 1].map((side) => createLimb(3, 9, 3, topColor, side * 7.5, 19))
  body.add(...legs, ...arms)
  body.add(placed(block(11, 10, 7, topColor), 0, 15, 0), placed(block(12, 11, 11, skinColor), 0, 26, 0))
  body.add(...createHair(hairColor))
  for (const side of [-1, 1]) body.add(placed(block(2, 2.5, 1, PEDESTRIAN_VIEW.glassesColor), side * 3, 27, -5.6))
  if (accessory !== undefined) body.add(...createAccessory(accessory, accessoryColor))

  // Le téléphone est sur le bras droit (index 1) : il suit le bras quand celui-ci se lève pour filmer. L'écran fait face à celui qui filme.
  const phone = createPhone()
  arms[1]?.add(phone)

  const alertMark = createAlertMark()
  const curiousMark = createGlyph(['XXX', '..X', '.XX', '...', '.X.'], PEDESTRIAN_VIEW.curiousColor)
  const angryMark = createGlyph(['X.X', '.X.', 'X.X'], PEDESTRIAN_VIEW.angryColor)
  const root = new THREE.Group()
  root.add(body, alertMark, curiousMark, angryMark)
  root.scale.setScalar(appearance.heightScale)
  return { root, body, legs, arms, alertMark, curiousMark, angryMark, phone }
}
