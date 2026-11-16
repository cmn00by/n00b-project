# systems : les briques de règles du jeu

Un dossier par système, chacun avec `index.ts`, ses tests et son `README.md` (fiche : lit, écrit, émet, écoute, réglages).
La liste de tous les systèmes, `SYSTEMS`, est dans `index.ts` : ajouter une brique = une ligne. Un système n'importe jamais un autre système.

Systèmes actuels :

- [`walking`](walking/README.md) : le déplacement à pied (marcher, courir). Sert d'exemple pour écrire les suivants.
- [`pedestrians`](pedestrians/README.md) : la foule (naissance autour du joueur, promenade sur les trottoirs, peur et fuite). Reçoit ses types de PNJ par un registre de `src/data`.
- [`missions`](missions/README.md) : le moteur de missions (départ, objectifs, chronos, réussite et échec). Reçoit les missions par un registre de `src/data`.

Recette pour ajouter un système : [docs/architecture.md](../../../docs/architecture.md), section 10.
