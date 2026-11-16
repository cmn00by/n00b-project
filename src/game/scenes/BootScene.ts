// Chargement des ressources du jeu, puis passage à la ville.
import Phaser from 'phaser'
import { preloadAssets } from '../assets'

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  preload() {
    preloadAssets(this)
  }

  create() {
    this.scene.start('CityScene')
  }
}
