// Les piétons à l'écran : un petit personnage en blocs par piéton de la simulation, qui marche, s'arrête, se retourne, s'enfuit, filme ou râle.
// Expose : PedestrianActors, createPedestrianActors().
// Pourquoi : la simulation décide (où il va, ce qu'il fait), ce module ne fait que dessiner. Les piétons sont dessinés entre deux pas de simulation (interpolation),
// comme le joueur et les voitures. Leur apparence vient de la recette de leur type (src/data/npcTypes), tirée d'après leur id : voir pedestrianAppearance.ts.

import * as THREE from 'three'
import { STEP_SECONDS, TUNING, findEntitiesWith } from '../../sim/core'
import type { EntityId, World } from '../../sim/core'
import { PEDESTRIAN_STATES } from '../../sim/systems/pedestrians'
import { NPC_TYPE_REGISTRY } from '../../data/npcTypes'
import { PEDESTRIAN_VIEW } from '../constants'
import { chooseAppearance } from './pedestrianAppearance'
import { computeFallPose, computeFallVariant } from './pedestrianFall'
import type { FallVariant } from './pedestrianFall'
import { createPedestrianModel } from './pedestrianModel'
import type { PedestrianModel } from './pedestrianModel'
import { computeArmAngles, computeYaw, turnToward } from './pedestrianPose'

export interface PedestrianActors {
  /** À appeler juste avant chaque pas de simulation : retient l'état d'avant le pas. */
  rememberStates(world: World): void
  /** À appeler à chaque image : place, oriente et anime les piétons, et retire ceux qui ont disparu de la simulation. */
  update(world: World, alpha: number, deltaSeconds: number): void
}

interface Shown {
  model: PedestrianModel
  yaw: number
  walkPhase: number
  fall: FallVariant
}

export function createPedestrianActors(scene: THREE.Scene): PedestrianActors {
  const previous = new Map<EntityId, { x: number; y: number }>()
  const shown = new Map<EntityId, Shown>()
  let elapsedSeconds = 0

  return {
    rememberStates(world) {
      for (const pedestrian of findEntitiesWith(world, ['position', 'pedestrian'])) previous.set(pedestrian.id, { x: pedestrian.position.x, y: pedestrian.position.y })
    },

    update(world, alpha, deltaSeconds) {
      elapsedSeconds += deltaSeconds
      const stillThere = new Set<EntityId>()
      for (const pedestrian of findEntitiesWith(world, ['position', 'pedestrian'])) {
        const type = NPC_TYPE_REGISTRY.find(pedestrian.pedestrian.typeId)
        if (type === undefined) continue
        stillThere.add(pedestrian.id)
        const heading = computeYaw(Math.cos(pedestrian.position.angle), Math.sin(pedestrian.position.angle))

        let entry = shown.get(pedestrian.id)
        if (entry === undefined) {
          const model = createPedestrianModel(chooseAppearance(type.look, pedestrian.id))
          // Ordre « Y puis X » : le corps s'incline autour de son propre axe, après avoir été tourné vers son cap.
          model.body.rotation.order = 'YXZ'
          scene.add(model.root)
          entry = { model, yaw: heading, walkPhase: 0, fall: computeFallVariant(pedestrian.id, PEDESTRIAN_VIEW) }
          shown.set(pedestrian.id, entry)
        }

        const before = previous.get(pedestrian.id) ?? pedestrian.position
        const x = before.x + (pedestrian.position.x - before.x) * alpha
        const y = before.y + (pedestrian.position.y - before.y) * alpha
        const isMoving = Math.abs(pedestrian.position.x - before.x) + Math.abs(pedestrian.position.y - before.y) > 0.01
        const isFleeing = pedestrian.pedestrian.state === PEDESTRIAN_STATES.fleeing

        // Il se tourne vite vers sa direction (sans pivoter d'un coup), balance bras et jambes tant qu'il bouge, et rebondit à chaque pas.
        entry.yaw = turnToward(entry.yaw, heading, PEDESTRIAN_VIEW.turnSpeed * deltaSeconds)
        entry.walkPhase = isMoving ? entry.walkPhase + deltaSeconds * (isFleeing ? PEDESTRIAN_VIEW.fleePhaseSpeed : PEDESTRIAN_VIEW.walkPhaseSpeed) : 0
        const swing = Math.sin(entry.walkPhase) * (isFleeing ? PEDESTRIAN_VIEW.fleeSwing : PEDESTRIAN_VIEW.walkSwing)
        const { model } = entry
        model.legs.forEach((leg, index) => (leg.rotation.x = index === 0 ? swing : -swing))
        const armAngles = computeArmAngles(pedestrian.pedestrian.state, swing, elapsedSeconds, PEDESTRIAN_VIEW)
        model.arms.forEach((arm, index) => (arm.rotation.x = armAngles[index] ?? 0))
        model.root.position.set(x, isMoving ? Math.abs(Math.cos(entry.walkPhase)) * PEDESTRIAN_VIEW.bobHeight : 0, y)
        model.body.rotation.y = entry.yaw

        // Projeté ou au sol : le corps culbute, vole en arc, s'allonge puis se redresse (pivote autour de l'axe avant/arrière du corps, déjà tourné vers son cap).
        const fall = computeFallPose(
          pedestrian.pedestrian.state,
          pedestrian.pedestrian.stateStepsLeft * STEP_SECONDS,
          { launchSeconds: TUNING.pedestrians.launchSeconds, downSeconds: TUNING.pedestrians.downSeconds },
          entry.fall,
          PEDESTRIAN_VIEW,
        )
        model.body.rotation.x = fall.pitch
        model.body.position.set(Math.sin(entry.yaw) * fall.shift, fall.lift, Math.cos(entry.yaw) * fall.shift)

        // Une seule pastille au-dessus de la tête, selon ce qu'il fait : « ! » en fuyant, « ? » s'il est curieux, une croix s'il râle. Elle tressaute. Celui qui filme montre son téléphone.
        const state = pedestrian.pedestrian.state
        model.alertMark.visible = isFleeing
        model.curiousMark.visible = state === PEDESTRIAN_STATES.curious
        model.angryMark.visible = state === PEDESTRIAN_STATES.angry
        model.phone.visible = state === PEDESTRIAN_STATES.filming
        const markHeight = PEDESTRIAN_VIEW.alertHeight + Math.sin(elapsedSeconds * PEDESTRIAN_VIEW.alertBobSpeed) * PEDESTRIAN_VIEW.alertBob
        model.alertMark.position.y = markHeight
        model.curiousMark.position.y = markHeight
        model.angryMark.position.y = markHeight
      }

      // Un piéton disparu de la simulation (trop loin du joueur) disparaît aussi de l'écran. Les blocs sont partagés : rien d'autre à libérer.
      for (const [id, entry] of shown) {
        if (stillThere.has(id)) continue
        scene.remove(entry.model.root)
        shown.delete(id)
        previous.delete(id)
      }
    },
  }
}
