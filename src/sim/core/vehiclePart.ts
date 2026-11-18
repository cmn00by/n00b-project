// Les pièces de l'atelier : ce qu'on installe sur un véhicule (peinture, jantes, néons, moteur…), décrit en données.
// Expose : VEHICLE_PART_SLOTS, VehiclePartSlot, VEHICLE_STATS, VehicleStat, VehiclePartDef, VehicleCustomization,
// PART_STAT_MIN, PART_STAT_MAX, validateVehiclePartDef(), applyVehicleParts().
// Pourquoi : un véhicule personnalisé est une recette (une pièce par emplacement), que l'affichage assemble en blocs et que la conduite lit pour ses réglages.
// Pas d'image par variante : toutes les combinaisons sont possibles. Une pièce de performance multiplie des réglages du modèle, dans des bornes fixes.

import type { ContentDef, Registry, VehicleDef } from './registry'

/** Les emplacements : une seule pièce par emplacement. Ils sont neuf, comme les touches 1 à 9 de l'atelier. */
export const VEHICLE_PART_SLOTS = ['paint', 'stripes', 'wheels', 'spoiler', 'roof', 'bumper', 'neon', 'engine', 'tires'] as const
export type VehiclePartSlot = (typeof VEHICLE_PART_SLOTS)[number]

/** Les réglages qu'une pièce de performance peut modifier (champs de VehicleDef). */
export const VEHICLE_STATS = ['maxSpeed', 'acceleration', 'braking', 'grip', 'handbrakeGrip'] as const
export type VehicleStat = (typeof VEHICLE_STATS)[number]

/** Bornes d'un multiplicateur de réglage, pour une pièce et pour toutes les pièces réunies : une voiture reste conduisible. */
export const PART_STAT_MIN = 0.5
export const PART_STAT_MAX = 1.6

/** Une pièce. */
export interface VehiclePartDef extends ContentDef {
  /** Le nom affiché (en français). */
  name: string
  slot: VehiclePartSlot
  /** Le prix, en euros entiers. */
  price: number
  /** Sa couleur (`#rrggbb`), pour les pièces qui se voient : peinture, bandes, jantes, néons… */
  color?: string
  /** Les réglages qu'elle multiplie (1,2 = +20 %). */
  stats?: Partial<Record<VehicleStat, number>>
}

/** La personnalisation d'un véhicule : l'id de la pièce installée à chaque emplacement (absent : d'origine). Données simples, sauvegardables. */
export type VehicleCustomization = Partial<Record<VehiclePartSlot, string>>

const isColor = (value: string): boolean => /^#[0-9a-f]{6}$/i.test(value)

/** Vérifie une pièce : emplacement connu, prix entier positif, couleur valable, multiplicateurs dans les bornes. */
export function validateVehiclePartDef(def: VehiclePartDef): string[] {
  const errors: string[] = []
  if (!(VEHICLE_PART_SLOTS as readonly string[]).includes(def.slot)) errors.push(`emplacement inconnu '${def.slot}'`)
  if (!Number.isInteger(def.price) || def.price <= 0) errors.push('le prix doit être un nombre entier d’euros, positif')
  if (def.color !== undefined && !isColor(def.color)) errors.push(`couleur invalide '${def.color}'`)
  for (const [stat, factor] of Object.entries(def.stats ?? {})) {
    if (!(VEHICLE_STATS as readonly string[]).includes(stat)) errors.push(`réglage inconnu '${stat}'`)
    if (typeof factor !== 'number' || !(factor >= PART_STAT_MIN && factor <= PART_STAT_MAX)) errors.push(`le multiplicateur de '${stat}' doit être entre ${PART_STAT_MIN} et ${PART_STAT_MAX}`)
  }
  return errors
}

/** Les réglages du modèle une fois les pièces installées : chaque réglage est multiplié par celui de chaque pièce, le total restant dans les bornes. */
export function applyVehicleParts(def: VehicleDef, customization: VehicleCustomization | undefined, parts: Registry<VehiclePartDef>): VehicleDef {
  if (customization === undefined) return def
  const factors: Record<VehicleStat, number> = { maxSpeed: 1, acceleration: 1, braking: 1, grip: 1, handbrakeGrip: 1 }
  for (const partId of Object.values(customization)) {
    const part = partId === undefined ? undefined : parts.find(partId)
    for (const stat of VEHICLE_STATS) factors[stat] *= part?.stats?.[stat] ?? 1
  }
  const clamp = (factor: number) => Math.min(PART_STAT_MAX, Math.max(PART_STAT_MIN, factor))
  const result: VehicleDef = { ...def }
  for (const stat of VEHICLE_STATS) result[stat] = def[stat] * clamp(factors[stat])
  return result
}
