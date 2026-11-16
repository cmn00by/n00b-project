// La porte d'entrée du module input : les autres modules n'importent que ce fichier.
export { createKeyboard } from './keyboard'
export type { Keyboard } from './keyboard'
export { toDriveCommand } from './driveCommand'
export type { DriveKeys } from './driveCommand'
export { toMoveCommand } from './moveCommand'
export type { PressedKeys } from './moveCommand'
