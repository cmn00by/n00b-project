// La physique arcade d'un véhicule pour un pas de simulation.
// Expose : DriveInput, VehicleMotion, steerHeading(), computeVelocity(), computeBodySize(), NO_INPUT.
// Pourquoi : conduire doit être fun avant d'être réaliste. Le nez tourne avec le volant (seulement si la voiture roule), mais la vitesse
// garde un moment sa direction : c'est le dérapage. L'adhérence ramène peu à peu la vitesse dans l'axe de la voiture ; le frein à main
// la coupe, et la voiture glisse. Tout est calculé avec + − × ÷ et des racines carrées : même résultat sur toutes les machines (coop).

import { TUNING, computeVehicleBodySize } from '../../core'
import type { VehicleDef } from '../../core'

/** Ce que demande le conducteur pour ce pas. */
export interface DriveInput {
  throttle: number // de -1 (frein, puis marche arrière) à 1 (accélérer)
  steer: number // de -1 (à gauche) à 1 (à droite)
  isHandbraking: boolean
}

/** Aucune action : la voiture roule en roue libre. */
export const NO_INPUT: DriveInput = { throttle: 0, steer: 0, isHandbraking: false }

/** L'état de mouvement d'un véhicule : sa vitesse (px/s) et son cap (vecteur de longueur 1). */
export interface VehicleMotion {
  vx: number
  vy: number
  headingX: number
  headingY: number
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))
const towardZero = (value: number, amount: number): number => (value > 0 ? Math.max(0, value - amount) : Math.min(0, value + amount))

/**
 * Le nouveau cap après un coup de volant. On ne tourne pas à l'arrêt ; le volant prend tout son effet à TUNING.driving.fullTurnSpeed ;
 * en marche arrière, la direction s'inverse (comme une vraie voiture).
 */
export function steerHeading(motion: VehicleMotion, input: DriveInput, def: VehicleDef, dt: number): { x: number; y: number } {
  const forwardSpeed = motion.vx * motion.headingX + motion.vy * motion.headingY
  const turnFactor = clamp(forwardSpeed / TUNING.driving.fullTurnSpeed, -1, 1)
  const angle = clamp(input.steer, -1, 1) * def.turnRate * dt * turnFactor
  if (angle === 0) return { x: motion.headingX, y: motion.headingY }

  // Rotation d'un petit angle (exacte au millième près pour les angles d'un pas), puis on remet le vecteur à la longueur 1.
  const x = motion.headingX - angle * motion.headingY
  const y = motion.headingY + angle * motion.headingX
  const length = Math.sqrt(x * x + y * y)
  return { x: x / length, y: y / length }
}

/**
 * La nouvelle vitesse, pour un véhicule dont le cap vient d'être mis à jour (steerHeading).
 * La vitesse est séparée en une part dans l'axe (que le moteur et les freins changent) et une part de côté (le dérapage, que l'adhérence efface).
 */
export function computeVelocity(motion: VehicleMotion, input: DriveInput, def: VehicleDef, dt: number): { vx: number; vy: number } {
  const { headingX, headingY } = motion
  // Le flanc droit de la voiture : le cap tourné d'un quart de tour.
  const rightX = -headingY
  const rightY = headingX

  let forward = motion.vx * headingX + motion.vy * headingY
  let sideways = motion.vx * rightX + motion.vy * rightY
  const throttle = clamp(input.throttle, -1, 1)

  if (throttle > 0) {
    forward = forward < 0 ? Math.min(0, forward + def.braking * throttle * dt) : Math.min(def.maxSpeed, forward + def.acceleration * throttle * dt)
  } else if (throttle < 0) {
    forward = forward > 0 ? Math.max(0, forward + def.braking * throttle * dt) : Math.max(-def.maxReverseSpeed, forward + def.acceleration * throttle * dt)
  } else {
    forward = towardZero(forward, TUNING.driving.rollingDrag * dt)
  }
  if (input.isHandbraking) forward = towardZero(forward, TUNING.driving.handbrakeDrag * dt)

  const grip = input.isHandbraking ? def.handbrakeGrip : def.grip
  sideways *= Math.max(0, 1 - grip * dt)
  // Les restes infimes deviennent 0 : une voiture à l'arrêt est vraiment à l'arrêt.
  if (Math.abs(sideways) < 0.01) sideways = 0
  if (Math.abs(forward) < 0.01) forward = 0

  return { vx: headingX * forward + rightX * sideways, vy: headingY * forward + rightY * sideways }
}

/** La taille du corps de la voiture selon son cap (la recette est dans le noyau, partagée avec la brique garage). */
export const computeBodySize = computeVehicleBodySize
