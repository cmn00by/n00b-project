# collision : les murs de la carte

Empêche les entités de traverser les cases qui bloquent le passage (bâtiments, bord de la carte) **et les autres entités solides** (voitures, joueur…). Passe **après tous les déplacements** :
une brique qui déplace une entité (marche, conduite, piétons…) n'a rien à faire pour respecter les murs.
Une entité qui longe un mur en diagonale **glisse** le long du mur (résolution axe par axe).

- **Lit** : `world.map` ; composants `position`, `body`, `velocity`
- **Écrit** : composants `position`, `lastFreePosition`, `velocity` (coupée sur l'axe bloqué)
- **Émet** : `entity:blocked` (avec la vitesse perdue dans le choc)
- **Écoute** : rien
- **Réglages** : aucun
- **Dépend de** : core uniquement

Sans carte chargée (`world.map` absent), seules les entités solides bloquent.
Une entité sans corps (par exemple le joueur au volant, dont le corps est mis de côté) n'est ni bloquée ni bloquante.
Limite connue : un déplacement de plus d'une case en un seul pas pourrait sauter un mur fin. La marche en est très loin (moins de 4 px par pas) ; la vitesse des véhicules est plafonnée à 16 px par pas par les tests de `src/data/vehicles`.
