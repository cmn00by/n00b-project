// L'éclairage de nuit : un voile sombre sur la ville, percé là où il y a de la lumière (lampadaires, phares), et des halos chauds.
// Expose : createLighting(), Lighting, LightSpot, LightBeam.
// Pourquoi : pas besoin de vrais calculs de lumière pour une ambiance réussie. On recouvre l'écran d'un voile bleu nuit, et on y découpe
// des taches de lumière dégradées ; par-dessus, un halo coloré en mode « addition » fait briller les lampes.
// Le voile passe sous les immeubles : eux s'assombrissent eux-mêmes et allument leurs fenêtres (buildingRelief.ts).

import Phaser from 'phaser'
import { HEADLIGHT_LENGTH_PX, HEADLIGHT_WIDTH_PX, LAMP_GLOW_COLOR, NIGHT_SHADE_ALPHA, NIGHT_SHADE_COLOR } from '../constants'

/** Une lumière ronde (un lampadaire), centrée sur (x, y). */
export interface LightSpot {
  x: number
  y: number
  radius: number
}

/** Un faisceau (les phares d'une voiture) qui part de (x, y) dans la direction (directionX, directionY). */
export interface LightBeam {
  x: number
  y: number
  directionX: number
  directionY: number
}

export interface Lighting {
  /** À appeler à chaque image. `night` va de 0 (jour : rien n'est dessiné) à 1 (pleine nuit). */
  update(view: Phaser.Geom.Rectangle, night: number, spots: readonly LightSpot[], beams: readonly LightBeam[]): void
}

/** Profondeurs : le voile au-dessus du joueur, des voitures et de la déco haute ; les halos juste au-dessus ; les immeubles (15) au-dessus. */
const SHADE_DEPTH = 14
const GLOW_DEPTH = 14.5
const TEXTURE_SIZE = 128
const SPOT_KEY = 'light:spot'
const BEAM_KEY = 'light:beam'

/** Crée une fois les deux formes de lumière : une tache ronde et un faisceau en cône, dégradées du centre vers le bord. */
function createLightTextures(scene: Phaser.Scene) {
  if (!scene.textures.exists(SPOT_KEY)) {
    const spot = scene.textures.createCanvas(SPOT_KEY, TEXTURE_SIZE, TEXTURE_SIZE)
    const context = spot?.getContext()
    if (spot && context) {
      const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64)
      gradient.addColorStop(0, 'rgba(255,255,255,1)')
      gradient.addColorStop(0.45, 'rgba(255,255,255,0.75)')
      gradient.addColorStop(1, 'rgba(255,255,255,0)')
      context.fillStyle = gradient
      context.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)
      spot.refresh()
    }
  }
  if (!scene.textures.exists(BEAM_KEY)) {
    const beam = scene.textures.createCanvas(BEAM_KEY, TEXTURE_SIZE, TEXTURE_SIZE)
    const context = beam?.getContext()
    if (beam && context) {
      // Un cône qui part du bas (les phares) et s'ouvre vers le haut, de plus en plus faible.
      const gradient = context.createLinearGradient(0, TEXTURE_SIZE, 0, 0)
      gradient.addColorStop(0, 'rgba(255,255,255,0.95)')
      gradient.addColorStop(1, 'rgba(255,255,255,0)')
      context.fillStyle = gradient
      context.beginPath()
      context.moveTo(54, TEXTURE_SIZE)
      context.lineTo(74, TEXTURE_SIZE)
      context.lineTo(TEXTURE_SIZE, 0)
      context.lineTo(0, 0)
      context.closePath()
      context.fill()
      beam.refresh()
    }
  }
}

export function createLighting(scene: Phaser.Scene): Lighting {
  createLightTextures(scene)
  const shade = scene.add.renderTexture(0, 0, 16, 16).setOrigin(0).setDepth(SHADE_DEPTH)
  const spotStamp = scene.make.image({ x: 0, y: 0, key: SPOT_KEY, add: false }).setOrigin(0.5)
  const beamStamp = scene.make.image({ x: 0, y: 0, key: BEAM_KEY, add: false }).setOrigin(0.5, 1)
  // Les halos : une réserve d'images réutilisées d'une image à l'autre.
  const glows: Phaser.GameObjects.Image[] = []
  const glowAt = (index: number): Phaser.GameObjects.Image => {
    let glow = glows[index]
    if (glow === undefined) {
      glow = scene.add.image(0, 0, SPOT_KEY).setDepth(GLOW_DEPTH).setBlendMode(Phaser.BlendModes.ADD).setTint(LAMP_GLOW_COLOR)
      glows.push(glow)
    }
    return glow
  }

  return {
    update(view, night, spots, beams) {
      const isNight = night > 0.01
      shade.setVisible(isNight)
      if (!isNight) {
        for (const glow of glows) glow.setVisible(false)
        return
      }

      // Le voile couvre exactement ce que voit la caméra (plus une marge, pour les arrondis).
      const width = Math.ceil(view.width) + 4
      const height = Math.ceil(view.height) + 4
      if (shade.width !== width || shade.height !== height) shade.resize(width, height)
      shade.setPosition(Math.floor(view.x) - 2, Math.floor(view.y) - 2)
      shade.clear()
      shade.fill(NIGHT_SHADE_COLOR, NIGHT_SHADE_ALPHA * night)

      const isVisible = (x: number, y: number, margin: number) => x > view.x - margin && x < view.right + margin && y > view.y - margin && y < view.bottom + margin
      let glowCount = 0
      for (const spot of spots) {
        if (!isVisible(spot.x, spot.y, spot.radius)) continue
        spotStamp.setScale((spot.radius * 2) / TEXTURE_SIZE)
        shade.erase(spotStamp, spot.x - shade.x, spot.y - shade.y)
        const glow = glowAt(glowCount++)
        glow
          .setVisible(true)
          .setPosition(spot.x, spot.y)
          .setScale((spot.radius * 1.1) / TEXTURE_SIZE)
          .setAlpha(0.45 * night)
      }
      for (let index = glowCount; index < glows.length; index++) glows[index]?.setVisible(false)

      for (const beam of beams) {
        if (!isVisible(beam.x, beam.y, HEADLIGHT_LENGTH_PX)) continue
        beamStamp.setScale(HEADLIGHT_WIDTH_PX / TEXTURE_SIZE, HEADLIGHT_LENGTH_PX / TEXTURE_SIZE)
        // L'angle n'est calculé que pour l'affichage : faisceau vers le haut = angle 0.
        beamStamp.setRotation(Math.atan2(beam.directionX, -beam.directionY))
        shade.erase(beamStamp, beam.x - shade.x, beam.y - shade.y)
      }
    },
  }
}
