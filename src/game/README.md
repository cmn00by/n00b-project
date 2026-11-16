# game : l'affichage Phaser

- `scenes/` : une scène par rôle (`BootScene`, `CityScene`, `TouchControlsScene`, puis `HudScene`, `MenuScene`). `CityScene` fait tourner la simulation, choisit le mode de commandes et dessine. `TouchControlsScene` est posée par-dessus : elle lit les doigts et dessine le joystick, avec sa propre caméra fixe.
- `render/` : un renderer par type d'entité (`playerRenderer`) ; lit l'état du monde, ne le modifie jamais, interpole entre deux pas de simulation.
- `input/` : clavier, manette, tactile → commandes. Le clavier suit les touches par leur place physique (flèches, rangée ZQSD sur AZERTY ou WASD sur QWERTY, Maj), `physicalKeys.ts` les lit, `moveCommand.ts` les traduit en commande `player:move`.
  Le tactile (`touchInput.ts`, `joystick.ts`, `touchLayout.ts`) produit les mêmes touches : un doigt à gauche pilote un joystick qui apparaît sous le pouce, un doigt sur le bouton « courir » le tient. `controlMode.ts` choisit clavier ou tactile selon l'appareil puis la dernière entrée utilisée ; `?controls=touch` ou `?controls=keyboard` dans l'adresse force le mode (pour tester sur PC).
- `fixedStepLoop.ts` : combien de pas de simulation (30 par seconde) jouer à chaque image affichée, et la part de pas écoulée pour l'interpolation.
- `fx/`, `hud/` : effets et widgets, qui écoutent les événements. Pour l'instant `hud/` ne contient que l'affichage des commandes tactiles (`touchControlsView.ts`).
- `assets.ts` : toutes les clés d'assets. `constants.ts` : taille de case, zoom de la caméra, couleurs provisoires.

Aucune règle de jeu ici : elles vivent dans `src/sim`. Voir [docs/architecture.md](../../docs/architecture.md), section 9.
