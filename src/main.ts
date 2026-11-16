// Point d'entrée du jeu dans le navigateur : crée le jeu Phaser et ses scènes.
import Phaser from 'phaser'
import { BootScene } from './game/scenes/BootScene'
import { CityScene } from './game/scenes/CityScene'
import { TouchControlsScene } from './game/scenes/TouchControlsScene'

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#2b1e3a',
  // Pixel art : pas de lissage, les pixels restent nets à toutes les échelles.
  pixelArt: true,
  scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
  // Les commandes tactiles sont une scène posée par-dessus la ville : la ville la lance quand elle démarre.
  scene: [BootScene, CityScene, TouchControlsScene],
})
