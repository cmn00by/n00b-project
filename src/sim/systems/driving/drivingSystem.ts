// Le système de conduite : monter et descendre, puis faire rouler, tourner et déraper les véhicules.
// Expose : drivingSystem.
// Pourquoi : il lit les commandes du conducteur (jamais le clavier) et fait avancer chaque véhicule selon sa physique arcade.
// Il ne gère pas les murs : la brique collision passe après lui et arrête les véhicules (et coupe leur vitesse) comme n'importe quelle entité.

import { SYSTEM_ORDER, findCommands, findEntitiesWith, findEntity, isSpaceClear, applyVehicleParts } from '../../core'
import type { CommandOf, EntityId, System } from '../../core'
import { VEHICLE_PART_REGISTRY } from '../../../data/vehicleParts'
import { VEHICLE_REGISTRY } from '../../../data/vehicles'
import { tryEnterVehicle, tryExitVehicle } from './vehicleSeat'
import { NO_INPUT, computeBodySize, computeVelocity, steerHeading } from './vehiclePhysics'
import type { DriveInput } from './vehiclePhysics'

export const drivingSystem: System = {
  id: 'driving',
  order: SYSTEM_ORDER.physics,
  step(world, dt) {
    // Monter ou descendre : une interaction par entité et par pas.
    const interactingIds = new Set(findCommands(world.commands, 'player:interact').map((command) => command.entityId))
    for (const entityId of interactingIds) {
      if (findEntity(world, entityId)?.driver !== undefined) tryExitVehicle(world, entityId)
      else tryEnterVehicle(world, entityId)
    }

    // La dernière commande de conduite de chaque conducteur.
    const driveByDriverId = new Map<EntityId, CommandOf<'vehicle:drive'>>()
    for (const command of findCommands(world.commands, 'vehicle:drive')) driveByDriverId.set(command.entityId, command)

    for (const vehicle of findEntitiesWith(world, ['position', 'velocity', 'body', 'vehicle'])) {
      // Les réglages du modèle, modifiés par les pièces de l'atelier (moteur, pneus…).
      const def = applyVehicleParts(VEHICLE_REGISTRY.get(vehicle.vehicle.modelId), vehicle.vehicle.customization, VEHICLE_PART_REGISTRY)
      const driverId = vehicle.vehicle.driverId
      const command = driverId === undefined ? undefined : driveByDriverId.get(driverId)
      const input: DriveInput = command ?? NO_INPUT
      const motion = { vx: vehicle.velocity.vx, vy: vehicle.velocity.vy, headingX: vehicle.vehicle.headingX, headingY: vehicle.vehicle.headingY }

      // Tourner, seulement si la voiture tournée tient à sa place (sinon on resterait coincé dans un mur en braquant).
      const heading = steerHeading(motion, input, def, dt)
      const size = computeBodySize(def, heading.x, heading.y)
      if (isSpaceClear(world, vehicle.position.x, vehicle.position.y, size.width, size.height, [vehicle.id])) {
        vehicle.vehicle.headingX = heading.x
        vehicle.vehicle.headingY = heading.y
        vehicle.body.width = size.width
        vehicle.body.height = size.height
      }

      const velocity = computeVelocity({ ...motion, headingX: vehicle.vehicle.headingX, headingY: vehicle.vehicle.headingY }, input, def, dt)
      vehicle.velocity.vx = velocity.vx
      vehicle.velocity.vy = velocity.vy
      vehicle.position.x += velocity.vx * dt
      vehicle.position.y += velocity.vy * dt

      // Le conducteur est dans la voiture : il la suit (il n'a pas de corps pendant la conduite, rien ne le gêne).
      const driver = driverId === undefined ? undefined : findEntity(world, driverId)
      if (driver?.position !== undefined) {
        driver.position.x = vehicle.position.x
        driver.position.y = vehicle.position.y
      }
    }
  },
}
