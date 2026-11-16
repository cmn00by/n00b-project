// Les repères des missions dans la ville : un anneau au sol, une colonne de lumière et un losange qui tourne au-dessus.
// Expose : MissionMarkers, createMissionMarkers().
// Pourquoi : le joueur doit voir de loin où commence une mission et où aller ensuite. Les repères ne reçoivent pas la lumière : ils restent visibles
// de jour comme de nuit. Ce module dessine la liste que lui donne describeMissions (src/game/missionGuide.ts), il ne décide de rien.

import * as THREE from 'three'
import { MISSION_MARKER_VIEW } from '../constants'
import type { MissionMarker } from '../missionGuide'

export interface MissionMarkers {
  /** À appeler à chaque image avec les repères à montrer ; ceux qui ne sont plus dans la liste disparaissent. */
  update(markers: readonly MissionMarker[], displaySeconds: number): void
}

interface Shown {
  group: THREE.Group
  diamond: THREE.Mesh
}

const view = MISSION_MARKER_VIEW

function createMarker(marker: MissionMarker): Shown {
  const color = marker.kind === 'start' ? view.startColor : view.objectiveColor
  const group = new THREE.Group()
  const ring = new THREE.Mesh(new THREE.RingGeometry(marker.radius * 0.62, marker.radius, 32), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }))
  ring.rotation.x = -Math.PI / 2
  // Un anneau plein, juste au-dessus du sol : net comme le reste du pixel art.
  ring.position.y = 1
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(marker.radius * 0.5, marker.radius * 0.5, view.beamHeight, 16, 1, true),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: view.beamOpacity, depthWrite: false, side: THREE.DoubleSide }),
  )
  beam.position.y = view.beamHeight / 2
  // Le sol est lui aussi dans la passe « transparente » (ses bords d'eau) : sans cet ordre forcé, il recouvrirait la colonne de lumière.
  beam.renderOrder = 1
  const diamond = new THREE.Mesh(new THREE.OctahedronGeometry(view.diamondSize), new THREE.MeshBasicMaterial({ color }))
  group.add(ring, beam, diamond)
  // Coordonnées : x de la simulation = x de three.js, y de la simulation = z de three.js.
  group.position.set(marker.x, 0, marker.y)
  return { group, diamond }
}

export function createMissionMarkers(scene: THREE.Scene): MissionMarkers {
  const shown = new Map<string, Shown>()

  return {
    update(markers, displaySeconds) {
      const wanted = new Set(markers.map((marker) => marker.key))
      for (const [key, entry] of shown) {
        if (wanted.has(key)) continue
        scene.remove(entry.group)
        entry.group.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return
          object.geometry.dispose()
          ;(object.material as THREE.Material).dispose()
        })
        shown.delete(key)
      }
      for (const marker of markers) {
        let entry = shown.get(marker.key)
        if (entry === undefined) {
          entry = createMarker(marker)
          scene.add(entry.group)
          shown.set(marker.key, entry)
        }
        entry.diamond.position.y = view.diamondHeight + Math.sin(displaySeconds * view.bobSpeed) * view.bobHeight
        entry.diamond.rotation.y = displaySeconds * view.spinSpeed
      }
    },
  }
}
