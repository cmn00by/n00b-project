// La mission d'essai du moteur (#9) : récupérer un colis au parking et le livrer au port, en deux minutes.
// Elle sert à tester le moteur de bout en bout. La vraie première mission, avec son histoire, est #13.
import type { MissionDef } from '../../sim/core'

export const essaiLivraison: MissionDef = {
  id: 'essai-livraison',
  title: 'Essai : le colis pressé',
  briefing: 'Un colis attend au parking du centre-ville. Le capitaine du port le veut dans deux minutes, et il ne veut pas savoir ce qu’il y a dedans.',
  mapId: 'test-town',
  // Sur le trottoir, à quelques pas à droite du point de départ du joueur.
  start: { tileX: 18, tileY: 10, radiusTiles: 1.2 },
  timeLimitSeconds: 120,
  reward: { money: 150 },
  objectives: [
    { type: 'pickup', text: 'Récupère le colis au parking du centre-ville', item: 'colis-suspect', place: { tileX: 47, tileY: 26, radiusTiles: 1.5 } },
    { type: 'deliver', text: 'Livre le colis au capitaine, sur le ponton du port', item: 'colis-suspect', place: { tileX: 50, tileY: 34, radiusTiles: 1.5 }, travel: 'foot' },
  ],
}
