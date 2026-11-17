// Les pièces de l'atelier sur le modèle de voiture en blocs : ce qui se voit (peinture, bandes, jantes, aileron, galerie, pare-buffle, néons, moteur).
// Expose : CarLook, describeCarLook(), addCarParts().
// Pourquoi : la personnalisation est une recette en données (sim/core/vehiclePart.ts). describeCarLook la traduit en couleurs par emplacement (règle pure, testée) ;
// addCarParts ajoute les blocs correspondants à la voiture. Les néons sont une plaque lumineuse sous la caisse : discrets le jour, superbes la nuit.

import * as THREE from 'three'
import type { Registry, VehicleCustomization, VehiclePartDef, VehiclePartSlot } from '../../sim/core'

/** La couleur (nombre 0xrrggbb) de chaque emplacement équipé d'une pièce visible ; un emplacement d'origine est absent. */
export type CarLook = Partial<Record<VehiclePartSlot, number>>

/** Les couleurs des pièces installées. Une pièce sans couleur (des pneus) n'apparaît pas ; une pièce inconnue est ignorée. */
export function describeCarLook(customization: VehicleCustomization | undefined, parts: Registry<VehiclePartDef>): CarLook {
  const look: CarLook = {}
  for (const [slot, partId] of Object.entries(customization ?? {}) as Array<[VehiclePartSlot, string | undefined]>) {
    const color = partId === undefined ? undefined : parts.find(partId)?.color
    if (color !== undefined) look[slot] = Number.parseInt(color.slice(1), 16)
  }
  return look
}

const block = (width: number, height: number, depth: number, color: number): THREE.Mesh => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), new THREE.MeshLambertMaterial({ color }))
  mesh.castShadow = true
  return mesh
}

/** Ajoute à la voiture (nez vers -z, caisse de `width` × `length`) les blocs des pièces visibles. La peinture et les jantes sont posées par le modèle lui-même. */
export function addCarParts(group: THREE.Group, width: number, length: number, look: CarLook): void {
  if (look.stripes !== undefined) {
    // Deux bandes de course, du capot au coffre, par-dessus la caisse et l'habitacle.
    for (const side of [-1, 1]) {
      const hood = block(2.5, 0.6, length * 0.98, look.stripes)
      hood.position.set(side * 3, 12.8, 0)
      const roof = block(2.5, 0.6, length * 0.48, look.stripes)
      roof.position.set(side * 3, 20.8, length * 0.06)
      group.add(hood, roof)
    }
  }
  if (look.spoiler !== undefined) {
    const wing = block(width, 1.5, 5, look.spoiler)
    wing.position.set(0, 17, length / 2 - 3)
    group.add(wing)
    for (const side of [-1, 1]) {
      const post = block(1.5, 4, 1.5, look.spoiler)
      post.position.set(side * (width / 2 - 4), 14.5, length / 2 - 3)
      group.add(post)
    }
  }
  if (look.roof !== undefined) {
    const rack = block(width - 6, 2, length * 0.36, look.roof)
    rack.position.set(0, 21.5, length * 0.06)
    group.add(rack)
  }
  if (look.bumper !== undefined) {
    const bar = block(width + 2, 5, 2, look.bumper)
    bar.position.set(0, 7, -length / 2 - 1.5)
    group.add(bar)
  }
  if (look.engine !== undefined) {
    // Une prise d'air sur le capot : le moteur gonflé se voit.
    const scoop = block(8, 3, 9, look.engine)
    scoop.position.set(0, 14, -length * 0.3)
    group.add(scoop)
  }
  if (look.neon !== undefined) {
    // Les néons : une plaque qui ne reçoit pas la lumière et s'ajoute à ce qu'il y a dessous, un peu plus grande que la caisse.
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(width + 26, length + 26),
      new THREE.MeshBasicMaterial({ color: look.neon, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false }),
    )
    glow.rotation.x = -Math.PI / 2
    glow.position.y = 0.8
    glow.renderOrder = 1
    group.add(glow)
  }
}
