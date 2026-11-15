# game : l'affichage Phaser

- `scenes/` : une scène par rôle (`BootScene`, `CityScene`, puis `HudScene`, `MenuScene`).
- `render/` : un renderer par type d'entité ; lit l'état du monde, ne le modifie jamais.
- `input/` : clavier, manette, tactile → commandes.
- `fx/`, `hud/` : effets et widgets, qui écoutent les événements.
- `assets.ts` : toutes les clés d'assets.

Aucune règle de jeu ici : elles vivent dans `src/sim`. Voir [docs/architecture.md](../../docs/architecture.md), section 9.
