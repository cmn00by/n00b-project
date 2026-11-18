// Les pièces de l'atelier. Ajouter une pièce = une ligne ici (un emplacement, un prix, une couleur ou des réglages). Prix : premier jet, à équilibrer (bloc 11).
// Les couleurs viennent de la palette (docs/style.md, section 3). Les multiplicateurs restent entre PART_STAT_MIN et PART_STAT_MAX (sim/core/vehiclePart.ts).
import { createRegistry } from '../../sim/core'
import type { VehiclePartDef } from '../../sim/core'

const paint = (id: string, name: string, color: string): VehiclePartDef => ({ id: `peinture-${id}`, name, slot: 'paint', price: 60, color })
const neon = (id: string, name: string, color: string): VehiclePartDef => ({ id: `neons-${id}`, name, slot: 'neon', price: 120, color })

export const VEHICLE_PARTS: VehiclePartDef[] = [
  paint('rouge', 'Rouge pompier', '#e5383b'),
  paint('orange', 'Orange mécanique', '#f28c28'),
  paint('jaune', 'Jaune taxi', '#ffd23f'),
  paint('vert', 'Vert pomme', '#43c46b'),
  paint('bleu', 'Bleu électrique', '#3a86ff'),
  paint('violet', 'Violet aubergine', '#8e5ce0'),
  paint('rose', 'Rose bonbon', '#ff6fa8'),
  paint('noir', 'Noir corbeau', '#2b1e3a'),
  { id: 'bandes-blanches', name: 'Bandes de course blanches', slot: 'stripes', price: 40, color: '#fff8ec' },
  { id: 'bandes-noires', name: 'Bandes de course noires', slot: 'stripes', price: 40, color: '#2b1e3a' },
  { id: 'bandes-dorees', name: 'Bandes dorées (classe)', slot: 'stripes', price: 90, color: '#ffd23f' },
  { id: 'jantes-chromees', name: 'Jantes chromées', slot: 'wheels', price: 80, color: '#dcd4c4' },
  { id: 'jantes-dorees', name: 'Jantes dorées', slot: 'wheels', price: 140, color: '#ffd23f' },
  { id: 'aileron', name: 'Aileron de course', slot: 'spoiler', price: 150, color: '#2b1e3a', stats: { grip: 1.05 } },
  { id: 'galerie', name: 'Galerie de toit', slot: 'roof', price: 70, color: '#565a6e' },
  { id: 'gyrophare-pizza', name: 'Enseigne de pizzeria', slot: 'roof', price: 50, color: '#e5383b' },
  { id: 'pare-buffle', name: 'Pare-buffle', slot: 'bumper', price: 90, color: '#3e4152' },
  neon('rose', 'Néons roses', '#ff6fa8'),
  neon('bleu', 'Néons bleus', '#3a86ff'),
  neon('vert', 'Néons verts', '#43c46b'),
  { id: 'moteur-gonfle', name: 'Moteur gonflé', slot: 'engine', price: 200, color: '#e5383b', stats: { maxSpeed: 1.1, acceleration: 1.15 } },
  { id: 'moteur-fusee', name: 'Moteur « fusée »', slot: 'engine', price: 450, color: '#f28c28', stats: { maxSpeed: 1.2, acceleration: 1.3 } },
  { id: 'pneus-sport', name: 'Pneus sport', slot: 'tires', price: 180, stats: { grip: 1.15, braking: 1.15 } },
  { id: 'pneus-drift', name: 'Pneus de drift (savonnette)', slot: 'tires', price: 120, stats: { grip: 0.8, handbrakeGrip: 0.7 } },
]

export const VEHICLE_PART_REGISTRY = createRegistry('Pièce', VEHICLE_PARTS)
