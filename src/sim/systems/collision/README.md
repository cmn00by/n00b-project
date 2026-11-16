# collision : les murs de la carte

Empêche les entités de traverser les cases qui bloquent le passage (bâtiments, bord de la carte). Passe **après tous les déplacements** :
une brique qui déplace une entité (marche, conduite, piétons…) n'a rien à faire pour respecter les murs.
Une entité qui longe un mur en diagonale **glisse** le long du mur (résolution axe par axe).

- **Lit** : `world.map` ; composants `position`, `body`
- **Écrit** : composants `position`, `lastFreePosition`
- **Émet** : rien
- **Écoute** : rien
- **Réglages** : aucun
- **Dépend de** : core uniquement

Sans carte chargée (`world.map` absent), la brique ne fait rien.
Limite connue : un déplacement de plus d'une case en un seul pas pourrait sauter un mur fin. La marche en est très loin (moins de 4 px par pas) ; la conduite rapide devra en tenir compte.
