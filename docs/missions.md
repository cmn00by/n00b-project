# Écrire une mission

Une mission est **une fiche de données** dans `src/data/missions/` : on l'écrit sans toucher au code du moteur.
Le moteur (brique [`missions`](../src/sim/systems/missions/README.md)) la lance, suit ses objectifs et ses chronos, et dit si elle réussit ou échoue.
Bloc **8. Missions** de [features.md](features.md), issue #9.

## 1. En trois étapes

1. **Créer le fichier** `src/data/missions/maMission.ts` (nom en camelCase, id en kebab-case), sur le modèle de l'exemple ci-dessous.
2. **L'ajouter à la liste** dans `src/data/missions/index.ts` : `export const MISSIONS = [essaiLivraison, maMission]`.
3. **Lancer `npm test`** : la fiche est vérifiée (objectifs cohérents, cases dans la carte et pas dans un mur). Puis `npm run dev` pour la jouer.

## 2. L'exemple : la mission d'essai

```ts
import type { MissionDef } from '../../sim/core'

export const essaiLivraison: MissionDef = {
  id: 'essai-livraison',
  title: 'Essai : le colis pressé',
  briefing: 'Un colis attend au parking du centre-ville. Le capitaine du port le veut dans deux minutes, et il ne veut pas savoir ce qu’il y a dedans.',
  mapId: 'test-town',
  start: { tileX: 18, tileY: 10, radiusTiles: 1.2 },
  timeLimitSeconds: 120,
  reward: { money: 150 },
  objectives: [
    { type: 'pickup', text: 'Récupère le colis au parking du centre-ville', item: 'colis-suspect', place: { tileX: 47, tileY: 26, radiusTiles: 1.5 } },
    { type: 'deliver', text: 'Livre le colis au capitaine, sur le ponton du port', item: 'colis-suspect', place: { tileX: 50, tileY: 34, radiusTiles: 1.5 }, travel: 'foot' },
  ],
}
```

## 3. Les champs

| Champ              | Obligatoire | Ce que c'est                                                                                      |
| ------------------ | ----------- | ------------------------------------------------------------------------------------------------- |
| `id`               | oui         | identifiant unique, en kebab-case (`livraison-absurde`) ; utilisé par les sauvegardes             |
| `title`            | oui         | le titre affiché dans le panneau                                                                  |
| `briefing`         | oui         | une ou deux phrases affichées au lancement : le ton du jeu (parodie, absurde)                     |
| `mapId`            | oui         | la carte où elle se joue (`test-town` pour l'instant)                                             |
| `start`            | oui         | le **point de départ** : la mission commence quand le joueur y entre (un repère jaune le signale) |
| `timeLimitSeconds` | non         | un chrono pour **toute** la mission                                                               |
| `reward.money`     | oui         | ce que rapporte la mission réussie (0 possible)                                                   |
| `objectives`       | oui         | les objectifs, **dans l'ordre** (au moins un)                                                     |

### Un lieu

`{ tileX, tileY, radiusTiles? }` : une **case** de la carte (colonne, ligne, à partir de 0 en haut à gauche) et un **rayon en cases** (1 par défaut).
Pour trouver une case : dans `src/data/maps/testTown.ts`, la ligne `tileY` (en comptant depuis 0) et le caractère `tileX` de cette ligne.

### Un objectif

| Champ              | Ce que c'est                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------- |
| `type`             | `reach` (aller au lieu), `pickup` (y prendre `item`), `deliver` (y apporter `item`)      |
| `text`             | la consigne affichée (« Livre la pizza avant qu'elle refroidisse »)                      |
| `place`            | où aller (un lieu)                                                                       |
| `item`             | pour `pickup` et `deliver` : un nom libre (`pizza-froide`) ; il faut le ramasser d'abord |
| `travel`           | `foot` (à pied), `vehicle` (au volant) ou `any` (par défaut)                             |
| `timeLimitSeconds` | un chrono propre à cet objectif, qui part quand l'objectif commence                      |

## 4. Ce qui se passe en jeu

- Un **repère jaune** (anneau, colonne de lumière, losange) marque le départ des missions à faire. Une mission réussie n'est plus proposée.
- Pendant la mission, un **repère turquoise** marque l'objectif en cours, et un **panneau** en haut affiche le titre, la consigne et le chrono (rouge sous 15 s).
- **Échec** : chrono écoulé (mission ou objectif), ou abandon. On peut la relancer en ressortant puis en revenant sur son départ.
- **Réussite** : le message affiche la récompense. L'argent n'existe pas encore dans la simulation : la brique d'économie écoutera l'événement `mission:succeeded`.

## 5. Ce qui viendra

D'autres sortes d'objectifs (suivre une voiture, semer la police, parler à un PNJ, attendre), des dialogues (bloc 9), et des missions en coop.
Ajouter une sorte d'objectif touche le moteur : voir la fiche de la brique `missions`.
