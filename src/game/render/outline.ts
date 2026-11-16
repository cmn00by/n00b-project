// Le contour sombre des personnages : une coque un peu plus grande que chaque bloc, dessinée à l'envers (on n'en voit que le bord).
// Expose : addOutline().
// Pourquoi : à la distance de la caméra, un personnage en blocs se fond dans le sol. Le contour sombre de docs/style.md le détache du décor,
// de jour comme de nuit (la coque ne reçoit pas la lumière). Il ne coûte qu'une copie de chaque bloc, qui partage sa géométrie.

import * as THREE from 'three'

const outlineMaterials = new Map<string, THREE.MeshBasicMaterial>()

function outlineMaterial(color: string): THREE.MeshBasicMaterial {
  let material = outlineMaterials.get(color)
  if (material === undefined) {
    material = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide })
    outlineMaterials.set(color, material)
  }
  return material
}

/** Ajoute à chaque bloc (boîte) du groupe une coque de `thickness` unités de chaque côté. Les pivots et les animations sont conservés : la coque suit son bloc. */
export function addOutline(group: THREE.Object3D, color: string, thickness: number): void {
  const blocks: THREE.Mesh[] = []
  group.traverse((object) => {
    if (object instanceof THREE.Mesh && object.geometry instanceof THREE.BoxGeometry) blocks.push(object)
  })
  for (const block of blocks) {
    const { width, height, depth } = (block.geometry as THREE.BoxGeometry).parameters
    const shell = new THREE.Mesh(block.geometry, outlineMaterial(color))
    shell.scale.set((width + 2 * thickness) / width, (height + 2 * thickness) / height, (depth + 2 * thickness) / depth)
    shell.castShadow = false
    block.add(shell)
  }
}
