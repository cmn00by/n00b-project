// La porte d'entrée du module input : les autres modules n'importent que ce fichier.
export { createKeyboardInput } from './keyboardInput'
export type { KeyboardInput } from './keyboardInput'
export { toMoveCommand } from './moveCommand'
export type { PressedKeys } from './moveCommand'
