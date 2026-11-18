# pedestrians : la foule de la ville

Fait vivre les piétons : ils naissent autour des joueurs (hors de l'écran, sur un trottoir), se promènent de case de trottoir en case de trottoir, s'arrêtent parfois,
**remarquent** un joueur qui court vers eux, puis **fuient**. Ils disparaissent quand ils sont loin de tous les joueurs.
Passe dans la tranche `ai`, avant les déplacements ; la brique `collision` s'occupe ensuite des murs.

- **Lit** : `world.map` ; `world.commands` (les `player:move` des joueurs : direction et course) ; composants `position`, `pedestrian`
- **Écrit** : composants `position`, `pedestrian` ; crée et retire des entités `pedestrian` (avec `body`, `sprite`)
- **Émet** : `pedestrian:scared` (`{ entityId }`) : un piéton vient d'avoir peur et fuit
- **Écoute** : rien
- **Réglages** : `TUNING.pedestrians` (foule : nombre, distances, probabilités ; types de case praticables). Ce qui est propre à un genre de piéton est dans sa fiche
- **Contenu** : `src/data/npcTypes` (`NpcTypeDef`), reçu par `createPedestriansSystem(registre)`
- **Dépend de** : core uniquement

## Comment ça marche

Un piéton est une entité `pedestrian` avec un composant `pedestrian` : son type, son **état** (un texte), le temps restant dans cet état,
son **courage** et sa **patience** (tirés à sa naissance dans les plages de son type), la case qu'il vise et sa direction.

| État        | Ce qu'il fait                                                                 |
| ----------- | ----------------------------------------------------------------------------- |
| `walking`   | se promène : tout droit, en tournant parfois, sans jamais quitter le trottoir |
| `pausing`   | s'est arrêté un moment (plus longtemps s'il est patient)                      |
| `noticing`  | a remarqué quelqu'un qui fonce sur lui : il s'arrête et le regarde            |
| `curious`   | s'approche de ce qui l'intrigue (sur le trottoir), puis regarde               |
| `filming`   | s'arrête et filme avec son téléphone                                          |
| `angry`     | s'arrête et râle, sans coups                                                  |
| `fleeing`   | s'enfuit, plus vite, vers la case voisine la plus éloignée du danger          |
| `launched`  | projeté par un véhicule qui roule : il vole dans le sens du véhicule          |
| `down`      | assommé au sol un moment, puis il se relève et réagit selon son type          |
| `returning` | revenu à pied vers le trottoir le plus proche s'il a atterri sur la route     |

- **Ce qui fait peur** : un joueur qui avance **plus vite que `scaringSpeed`** (le joueur qui court, pas celui qui marche), **vers** le piéton, à moins de `noticeDistance`.
  Un courageux le regarde de loin et ne fuit que de près ; un peureux fuit de loin. Un **véhicule en mouvement** compte aussi : sa vitesse est lue dans le composant `velocity`
  (la brique ne connaît pas la conduite) ; une voiture à l'arrêt ne fait peur à personne.
- **Être renversé** (#40) : un véhicule qui roule (vitesse ≥ `hitMinSpeed`) dont le rectangle touche le piéton le **projette**, façon dessin animé : le véhicule n'est pas ralenti, le piéton vole
  dans son sens (petit écart aléatoire de direction et de force : `launchSpread`, `launchPowerJitter`, à 0 ils disparaissent), s'arrête contre les murs, reste au sol, puis se relève et
  réagit selon les poids de son type (râler, regarder, filmer ; jamais s'approcher). Il annonce l'événement `pedestrian:hit`. Posé hors du trottoir, il y revient (`returning`).
  Les piétons projetés traversent les véhicules garés : seuls les murs de la carte les arrêtent.
- **Quelle réaction** : au moment où il remarque (et pas à chaque pas), il tire au hasard (`world.rng`) entre regarder, s'approcher, filmer et râler, selon les poids `reactionWeights`
  de la fiche de son type (`reactionChoice.ts`). Un poids à 0 interdit la réaction. Il la garde tant que ça continue, et **fuit quand même** si ça se rapproche.
- **Éviter les autres** : un piéton attend derrière un autre trop près de lui, seulement s'il a un id plus grand : deux piétons face à face ne s'attendent jamais l'un l'autre.
- **Hasard** : tout passe par `world.rng`. Même graine et mêmes commandes : même foule.

## Ajouter un comportement

Une nouvelle réaction est **un état de plus** dans `stateMachine.ts`, **un poids de plus** dans `ReactionWeights` (`src/sim/core/npcType.ts`) et dans `reactionChoice.ts`, avec ses durées dans `TUNING.pedestrians`.
Ce qui reste : la police (#45), les bulles de texte (#46) et les coups (#47).

## Fichiers

| Fichier                                               | Rôle                                                                                |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `pedestriansSystem.ts`                                | le système : naissance, disparition, puis un pas de vie par piéton                  |
| `pedestrianStep.ts`                                   | le pas d'un piéton : réagir, changer d'état, marcher, attendre, fuir                |
| `population.ts`                                       | faire naître et retirer des piétons autour des joueurs                              |
| `threats.ts`                                          | ce qui fait peur (joueurs qui courent, véhicules lancés) et la position des joueurs |
| `reaction.ts`, `reactionChoice.ts`, `stateMachine.ts` | les règles pures : réaction, choix de la réaction, états (testées dans Node)        |
| `impact.ts`, `impactStep.ts`                          | le choc : détection, vitesse de départ, vol contre les murs, retour au trottoir     |
| `tiles.ts`, `movement.ts`                             | les règles pures : choix de case (marcher, fuir, approcher), déplacement            |
| `personality.ts`, `stepTime.ts`, `tuning.ts`          | personnalité tirée à la naissance, secondes en pas, type des réglages               |
| `testMap.ts`                                          | une petite carte dessinée en caractères, pour les tests                             |
