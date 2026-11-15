// La porte d'entrée du noyau : les autres modules n'importent que ce fichier.
export { createRng } from './rng'
export type { Rng } from './rng'
export { STEPS_PER_SECOND, STEP_SECONDS, TUNING } from './config'
