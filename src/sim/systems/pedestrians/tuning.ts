// Le type des réglages de la foule, pour que les fonctions pures reçoivent leurs réglages en paramètre (faciles à faire varier dans les tests).
import { TUNING } from '../../core'

export type PedestrianTuning = typeof TUNING.pedestrians
