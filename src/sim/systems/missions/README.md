# missions : le moteur de missions

Lance les missions, suit leurs objectifs et leurs chronos, et annonce leur réussite ou leur échec. Les missions sont **des données**
(`src/data/missions`) : ce moteur n'en connaît aucune par son nom. Passe dans la tranche `rules`, après les déplacements et les collisions.

- **Lit** : `world.map` ; `world.commands` (`mission:start`, `mission:abandon`) ; composants `position`, `driver` (le joueur est-il au volant ?)
- **Écrit** : composant `missionProgress` des joueurs (mission en cours, objectif, chronos, objets portés, missions réussies)
- **Émet** : `mission:started`, `mission:objective-completed`, `mission:succeeded` (avec la récompense `money`), `mission:failed` (`time-out` ou `abandoned`)
- **Écoute** : rien
- **Réglages** : aucun ; tout est dans la fiche de chaque mission
- **Contenu** : `src/data/missions` (`MissionDef`), reçu par `createMissionsSystem(registre)`
- **Dépend de** : core uniquement

## Comment ça marche

- **Départ** : un joueur sans mission en cours qui **entre sur le point de départ** d'une mission de la carte la lance (ou par la commande `mission:start`).
  Une mission réussie n'est plus proposée. Une mission échouée ne repart que quand le joueur est **sorti** de son point de départ puis y est revenu.
- **Objectifs** : dans l'ordre. `reach` (aller au lieu), `pickup` (y prendre un objet), `deliver` (y apporter un objet porté). Un objectif peut exiger d'arriver
  **à pied** ou **au volant** (`travel`). Un lieu est une case et un rayon, en cases.
- **Chronos** : un pour toute la mission, et un par objectif, tous deux facultatifs. Ils se comptent en **pas de simulation** (déterministe), et partent au pas qui lance la mission
  (ou l'objectif).
- **Récompense** : annoncée par `mission:succeeded`. L'argent n'existe pas encore dans la simulation : la future brique d'économie écoutera cet événement.

## Ajouter une sorte d'objectif

Chaque sorte d'objectif est une petite brique dans `objectives/` (un `ObjectiveHandler` : « l'objectif est-il rempli ? », et son effet).
Ajouter une sorte : son type dans `MISSION_OBJECTIVE_TYPES` et `MissionObjectiveDef` (`sim/core/mission.ts`), sa validation, un fichier dans `objectives/` et sa ligne dans `objectives/index.ts`,
avec ses tests. Le moteur lui-même ne change pas.
Exemples à venir : suivre une voiture, semer la police, attendre, parler à un PNJ.

## Fichiers

| Fichier                  | Rôle                                                       |
| ------------------------ | ---------------------------------------------------------- |
| `missionsSystem.ts`      | le système : départ, chronos, objectifs, réussite, échec   |
| `places.ts`              | le joueur est-il dans un lieu, et arrivé de la bonne façon |
| `missionsSystem.test.ts` | les tests (le moteur seul, sans les autres briques)        |
