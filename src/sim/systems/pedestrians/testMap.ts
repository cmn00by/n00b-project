// Une petite carte pour les tests de la brique : un dessin en caractères ('s' trottoir, 'r' route, '#' bâtiment).
import type { TileMap } from '../../core'

const KIND_BY_CHARACTER: Readonly<Record<string, { id: string; isSolid: boolean }>> = {
  s: { id: 'sidewalk', isSolid: false },
  r: { id: 'road', isSolid: false },
  '#': { id: 'building', isSolid: true },
}

export function makeTestMap(rows: readonly string[], tileSize = 32): TileMap {
  const tileKindIds: string[] = []
  const solid: boolean[] = []
  for (const row of rows) {
    for (const character of row) {
      const kind = KIND_BY_CHARACTER[character]
      if (kind === undefined) throw new Error(`Caractère de carte inconnu : '${character}'`)
      tileKindIds.push(kind.id)
      solid.push(kind.isSolid)
    }
  }
  return { mapId: 'test', width: rows[0]?.length ?? 0, height: rows.length, tileSize, tileKindIds, solid }
}
