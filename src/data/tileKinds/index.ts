// Les types de case de la carte : ce que veut dire chaque case, et si elle bloque le passage.
// Ajouter un type de case = une ligne ici, puis une couleur dans src/game/constants.ts (en attendant les tuiles, #4).
import { createRegistry } from '../../sim/core'
import type { TileKindDef } from '../../sim/core'

export const TILE_KINDS: TileKindDef[] = [
  { id: 'road', isSolid: false }, // route : piétons et véhicules
  { id: 'sidewalk', isSolid: false }, // trottoir et ruelles
  { id: 'grass', isSolid: false }, // herbe des parcs
  { id: 'building', isSolid: true }, // bâtiment : on ne traverse pas les murs
  { id: 'plaza', isSolid: false }, // place pavée
  { id: 'water', isSolid: true }, // mer et étang : ni à pied, ni en voiture
  { id: 'sand', isSolid: false }, // plage
  { id: 'dock', isSolid: false }, // pontons du port
  { id: 'parking', isSolid: false }, // places de parking
]

export const TILE_KIND_REGISTRY = createRegistry('Type de case', TILE_KINDS)
