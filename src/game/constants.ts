// Constantes d'affichage partagées par les modules de src/game.
// Les réglages de lumière (soleil, nuit, lampadaires, phares) sont dans render/lighting.ts, ceux de la caméra dans render/camera.ts.

/** Graine de la partie. Fixe pendant le prototype pour que deux lancements donnent la même partie ; une graine variable viendra avec les nouvelles parties. */
export const GAME_SEED = 2026

/** Couleur provisoire de chaque modèle de véhicule (id de src/data/vehicles), d'après la bible visuelle. */
export const VEHICLE_COLORS: Readonly<Record<string, number>> = {
  'mamie-car': 0x8ed4b4, // vert menthe pastel
  'delivery-van': 0xf2efe6, // blanc
  'sports-car': 0xffd23f, // jaune vif
}

/** Couleur d'un véhicule dont le modèle n'a pas (encore) de couleur : un rose voyant, pour qu'on la remarque. */
export const MISSING_VEHICLE_COLOR = 0xff6fa8

/** Au volant, la caméra regarde devant la voiture : de combien de secondes de trajet, et au plus de combien de pixels. */
export const CAMERA_LOOKAHEAD_SECONDS = 0.3
export const CAMERA_LOOKAHEAD_MAX_PX = 110
/** Vitesse à laquelle la caméra rejoint ce point d'avance (plus grand = plus vif). */
export const CAMERA_LOOKAHEAD_SMOOTHING = 3

/** Couleurs des façades (pastels de la palette), tirées au hasard pour chaque immeuble. */
export const FACADE_COLORS: readonly number[] = [0xe9c8a0, 0xd9a6a0, 0xa8c6d9, 0xc8d9a8, 0xf2efe6, 0xe3b676, 0xd4b8e0]
/** Fenêtres le jour, et fenêtres allumées la nuit. */
export const WINDOW_COLOR = 0x5a7a99
export const LIT_WINDOW_COLOR = 0xffd27a

/** Durée du passage du jour à la nuit, en secondes. */
export const DAY_NIGHT_TRANSITION_SECONDS = 1.6
/** Couleur du halo des lampadaires. */
export const LAMP_GLOW_COLOR = 0xffc870

/** Réglages de l'affichage des piétons (leur apparence vient de la recette de leur type, src/data/npcTypes). */
export const PEDESTRIAN_VIEW = {
  walkPhaseSpeed: 12, // vitesse du balancement des bras et des jambes en marchant, en radians par seconde
  fleePhaseSpeed: 20, // ...et en fuyant : il court
  walkSwing: 0.7, // amplitude du balancement en marchant, en radians
  fleeSwing: 0.95, // ...et en fuyant
  turnSpeed: 12, // vitesse à laquelle un piéton se tourne vers sa nouvelle direction, en radians par seconde
  bobHeight: 1.2, // de combien le corps rebondit à chaque pas, en px
  alertHeight: 46, // hauteur de la pastille « ! » au-dessus du sol, en px
  alertBob: 1.5, // de combien la pastille « ! » tressaute, en px
  alertBobSpeed: 10, // vitesse de ce tressautement, en radians par seconde
  alertColor: '#e5383b', // couleur de la pastille « ! » (rouge vif de la palette)
  caneColor: '#6b4228', // couleur de la canne (bois foncé de la palette)
  glassesColor: '#2b1e3a', // couleur des lunettes (le contour de la palette)
} as const
