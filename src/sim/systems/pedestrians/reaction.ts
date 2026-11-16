// La réaction d'un piéton à quelque chose qui fonce sur lui : l'ignorer, le remarquer, ou fuir.
// Expose : Threat, Reaction, computeFleeDistance(), decideReaction().
// Pourquoi : cette partie ne dépend que de nombres, donc elle se teste dans Node. Pour l'instant seul le joueur qui court fait peur ;
// une voiture (#8) fournira simplement sa vitesse et sa direction de la même façon.
// Un piéton ne fuit que si ça fonce VERS lui : quelqu'un qui court en s'éloignant ne l'effraie pas.

import type { PedestrianTuning } from './tuning'

/** Ce qui peut faire peur : sa position, sa direction (vecteur, pas forcément unitaire) et sa vitesse en px par seconde. */
export interface Threat {
  x: number
  y: number
  directionX: number
  directionY: number
  speed: number
}

export type Reaction = 'ignore' | 'notice' | 'flee'

/** À quelle distance un piéton prend la fuite : loin pour un peureux (courage 0), tout près pour un courageux (courage 1). */
export function computeFleeDistance(courage: number, tuning: PedestrianTuning): number {
  return tuning.fleeDistanceMax + (tuning.fleeDistanceMin - tuning.fleeDistanceMax) * courage
}

/**
 * Ce que le piéton fait en voyant `threat` : rien si ça ne fonce pas vite, ou si c'est loin, ou si ça s'éloigne ;
 * sinon il le remarque (il s'arrête et regarde) tant que c'est assez loin pour son courage, et il fuit quand c'est plus près.
 */
export function decideReaction(pedestrianX: number, pedestrianY: number, courage: number, threat: Threat, tuning: PedestrianTuning): Reaction {
  if (threat.speed < tuning.scaringSpeed) return 'ignore'
  const towardX = pedestrianX - threat.x
  const towardY = pedestrianY - threat.y
  const distance = Math.sqrt(towardX * towardX + towardY * towardY)
  if (distance > tuning.noticeDistance) return 'ignore'
  const isApproaching = threat.directionX * towardX + threat.directionY * towardY > 0 || distance === 0
  if (!isApproaching) return 'ignore'
  return distance <= computeFleeDistance(courage, tuning) ? 'flee' : 'notice'
}
