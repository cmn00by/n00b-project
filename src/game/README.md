# game : l'affichage Phaser

- `scenes/` : une scène par rôle (`BootScene`, `CityScene`, puis `HudScene`, `MenuScene`). `CityScene` fait tourner la simulation, relie le clavier et dessine.
- `render/` : le sol (`groundRenderer`, règles dans `groundLayout`), la déco (`decorRenderer`), le relief des immeubles (`buildingRelief`), la nuit (`lighting`), et un renderer par type d'entité (`playerRenderer`) ; lit l'état du monde, ne le modifie jamais, interpole entre deux pas de simulation.
- `input/` : clavier, manette, tactile → commandes. Le clavier lit les touches (flèches, ZQSD, WASD, Maj), `moveCommand.ts` les traduit en commande `player:move`.
- `fixedStepLoop.ts` : combien de pas de simulation (30 par seconde) jouer à chaque image affichée, et la part de pas écoulée pour l'interpolation.
- `fx/`, `hud/` : effets et widgets, qui écoutent les événements.
- `decor/` : où poser la déco (`placeDecor`) et à quelle taille (`propStyles`, à l'échelle du jeu).
- `assets.ts` : toutes les clés d'assets et leur chargement.
- `hash.ts` : un hasard d'affichage stable (toujours la même ville). `constants.ts` : taille de case, zoom de la caméra, couleurs provisoires.

Aucune règle de jeu ici : elles vivent dans `src/sim`. Voir [docs/architecture.md](../../docs/architecture.md), section 9.
