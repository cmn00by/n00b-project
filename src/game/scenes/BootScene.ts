// Chargement des ressources du jeu, puis passage à la ville.
// Les visuels arriveront plus tard (issue #4) : pour l'instant, rien à charger.
import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  create() {
    this.scene.start('CityScene')
  }
}
