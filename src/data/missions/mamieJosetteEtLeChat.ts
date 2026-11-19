// La première vraie mission du jeu (#13) : un gâteau pour les 100 ans de Mamie Josette, qui tourne très mal.
// Elle traverse toute la grande ville : à pied dans le centre, au volant jusqu'à l'île industrielle (par le pont ouest) puis jusqu'au quartier d'affaires, et à pied jusqu'à la plage.
// Écrite avec ce que le moteur sait faire (aller, ramasser, livrer, chronos) : le gâteau ne s'abîme pas encore quand on dérape, voir l'issue notée dans #13.
import type { MissionDef } from '../../sim/core'

export const mamieJosetteEtLeChat: MissionDef = {
  id: 'mamie-josette-et-le-chat',
  title: 'Mamie Josette et le chat de l’enfer',
  briefing: 'Mamie Josette fête ses 100 ans sur l’île, et elle attend son gâteau à six étages. Le pâtissier jure qu’il est prêt. Ce qu’il ne dit pas, c’est que la journée va déraper.',
  mapId: 'test-town',
  // Sur le trottoir, à l'ouest de la place, à deux pas du point de départ du joueur.
  start: { tileX: 5, tileY: 10, radiusTiles: 1.2 },
  timeLimitSeconds: 240,
  reward: { money: 500 },
  objectives: [
    { type: 'pickup', text: 'Récupère le gâteau à six étages chez le pâtissier, à pied et sans le renifler', item: 'gateau-six-etages', place: { tileX: 29, tileY: 14, radiusTiles: 1.5 } },
    {
      type: 'deliver',
      text: 'Apporte le gâteau à Mamie Josette sur l’île, au volant, avant que la bougie ne fonde',
      item: 'gateau-six-etages',
      place: { tileX: 14, tileY: 52, radiusTiles: 1.5 },
      travel: 'vehicle',
      timeLimitSeconds: 70,
    },
    {
      type: 'pickup',
      text: 'Mamie dit que ce n’est pas son gâteau. Prends le paquet qui gigote, sans poser de question',
      item: 'paquet-qui-gigote',
      place: { tileX: 22, tileY: 52, radiusTiles: 1.5 },
    },
    {
      type: 'deliver',
      text: 'Porte le paquet au concours félin du quartier d’affaires, au volant, vite : il miaule',
      item: 'paquet-qui-gigote',
      place: { tileX: 84, tileY: 10, radiusTiles: 1.5 },
      travel: 'vehicle',
      timeLimitSeconds: 80,
    },
    {
      type: 'reach',
      text: 'Le chat de concours, très vexé, s’est échappé : rattrape-le à pied, jusqu’à la plage',
      place: { tileX: 100, tileY: 34, radiusTiles: 2 },
      travel: 'foot',
      timeLimitSeconds: 55,
    },
  ],
}
