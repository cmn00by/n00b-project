# walking : le déplacement à pied

Déplace le joueur selon ses commandes : marcher dans toutes les directions (en diagonale à la même vitesse), courir en maintenant la touche.
C'est la première brique du jeu : elle sert d'exemple pour écrire les suivantes (voir [docs/architecture.md](../../../../docs/architecture.md), section 10).

- **Lit** : commandes `player:move` ; composant `position`
- **Écrit** : composant `position`
- **Émet** : rien
- **Écoute** : rien
- **Réglages** : `TUNING.walking` (`walkSpeed`, `runSpeed`)
- **Dépend de** : core uniquement

Pas de collisions ici : elles viendront avec #7 (déplacement à pied) et #6 (carte de test), dans leurs propres briques.
