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

| État       | Ce qu'il fait                                                                 |
| ---------- | ----------------------------------------------------------------------------- |
| `walking`  | se promène : tout droit, en tournant parfois, sans jamais quitter le trottoir |
| `pausing`  | s'est arrêté un moment (plus longtemps s'il est patient)                      |
| `noticing` | a remarqué quelqu'un qui fonce sur lui : il s'arrête et le regarde            |
| `fleeing`  | s'enfuit, plus vite, vers la case voisine la plus éloignée du danger          |

- **Ce qui fait peur** : un joueur qui avance **plus vite que `scaringSpeed`** (le joueur qui court, pas celui qui marche), **vers** le piéton, à moins de `noticeDistance`.
  Un courageux le regarde de loin et ne fuit que de près ; un peureux fuit de loin. Une voiture (#8) fournira sa vitesse de la même façon.
- **Éviter les autres** : un piéton attend derrière un autre trop près de lui, seulement s'il a un id plus grand : deux piétons face à face ne s'attendent jamais l'un l'autre.
- **Hasard** : tout passe par `world.rng`. Même graine et mêmes commandes : même foule.

## Ajouter un comportement

Une nouvelle réaction (colère, curiosité, filmer : issue #31) est **un état de plus** dans `stateMachine.ts`, choisi selon la personnalité du type. Le noyau ne change pas.

## Fichiers

| Fichier                                                     | Rôle                                                                               |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `pedestriansSystem.ts`                                      | le système : naissance, disparition, puis un pas de vie par piéton                 |
| `pedestrianStep.ts`                                         | le pas d'un piéton : réagir, changer d'état, marcher, attendre, fuir               |
| `population.ts`                                             | faire naître et retirer des piétons autour des joueurs                             |
| `threats.ts`                                                | ce qui fait peur (les commandes des joueurs) et la position des joueurs            |
| `reaction.ts`, `stateMachine.ts`, `tiles.ts`, `movement.ts` | les règles pures : réaction, états, choix de case, déplacement (testées dans Node) |
| `personality.ts`, `stepTime.ts`, `tuning.ts`                | personnalité tirée à la naissance, secondes en pas, type des réglages              |
| `testMap.ts`                                                | une petite carte dessinée en caractères, pour les tests                            |
