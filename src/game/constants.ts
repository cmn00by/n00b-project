// Constantes d'affichage partagées par les modules de src/game.
// Les réglages de lumière (soleil, nuit, lampadaires, phares) sont dans render/lighting.ts, ceux de la caméra dans render/camera.ts.

/** Graine de la partie. Fixe pendant le prototype pour que deux lancements donnent la même partie ; une graine variable viendra avec les nouvelles parties. */
export const GAME_SEED = 2026

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

/**
 * Le HUD : santé, argent, recherche. L'argent vient de la simulation (brique economy, #52) ; la santé et la recherche n'existent pas encore (bloc 7) :
 * en attendant, le HUD affiche ces valeurs factices.
 * Quand ils existeront, seul ce qui fournit l'état au HUD change (main.ts), pas l'affichage.
 */
export const HUD_PLACEHOLDER = {
  health: 3, // points de vie factices
  maxHealth: 5, // points de vie au maximum
  wantedLevel: 1, // niveau de recherche factice, de 0 à maxWantedLevel
  maxWantedLevel: 3, // la jauge de recherche a 3 niveaux (docs/GDD.md)
} as const

/** L'allure du HUD : le blanc chaud, le rouge et le jaune vif de la palette, sur un fond violet sombre translucide qui laisse voir la ville. */
export const HUD_STYLE = {
  textColor: '#fff8ec',
  panelFill: 'rgba(43, 30, 58, 0.55)',
  heartColor: '#e5383b',
  starColor: '#ffd23f',
  emptyColor: '#6f6488', // une icône vide (cœur perdu, étoile pas encore gagnée)
  iconScale: 3, // taille d'une « case » des icônes pixel art, en pixels d'écran
  margin: 12, // distance au bord de l'écran
} as const

/** Les repères sur la carte (missions, concession, garage) : un anneau au sol, une colonne de lumière et un losange qui flotte. */
export const PLACE_MARKER_VIEW = {
  // Une couleur de la palette par sorte de lieu.
  colors: {
    start: 0xffd23f, // un départ de mission (jaune)
    objective: 0x2ec4b6, // l'objectif en cours (turquoise)
    dealership: 0x3a86ff, // une concession (bleu)
    garage: 0x8e5ce0, // un garage (violet)
    workshop: 0xf28c28, // un atelier (orange)
  },
  // Les sortes de lieu qui ont une colonne de lumière, visible de loin. La concession et le garage n'en ont pas : leur bâtiment et son enseigne suffisent.
  beamKinds: ['start', 'objective'],
  beamHeight: 140, // hauteur de la colonne de lumière, en px
  beamOpacity: 0.4,
  diamondSize: 12, // taille du losange, en px
  diamondHeight: 70, // hauteur du losange au-dessus du sol, en px
  bobHeight: 6, // de combien il monte et descend, en px
  bobSpeed: 2.5, // vitesse de ce mouvement, en radians par seconde
  spinSpeed: 1.6, // vitesse de rotation du losange, en radians par seconde
} as const

/** Le panneau de la mission en cours, en haut au centre. */
export const MISSION_PANEL_STYLE = {
  titleColor: '#ffd23f',
  textColor: '#fff8ec',
  urgentColor: '#e5383b', // le chrono quand il reste peu de temps
  urgentSeconds: 15, // en dessous, le chrono passe en rouge
  panelFill: 'rgba(43, 30, 58, 0.7)',
  messageSeconds: 6, // durée d'un message (mission réussie, échouée), en secondes
} as const

/** Les bâtiments remarquables (src/game/render/landmarks.ts) : la concession et les garages, en couleurs de la palette. */
export const LANDMARK_VIEW = {
  showroomName: 'BON PLAN AUTO', // l'enseigne (lettres de render/pixelFont.ts)
  garageName: 'GARAGE',
  workshopName: 'ATELIER',
  showroomHeight: 64, // hauteur, en px du monde : un grand rez-de-chaussée vitré
  garageHeight: 48,
  workshopHeight: 52,
  showroomWall: '#fff8ec', // blanc chaud
  showroomSign: '#3a86ff', // bleu (comme le repère de la concession)
  garageWall: '#bdb4a6', // béton
  garageSign: '#8e5ce0', // violet (comme le repère du garage)
  garageDoor: '#8a8797', // gris neutre
  workshopWall: '#e3b676', // sable
  workshopSign: '#f28c28', // orange (comme le repère de l'atelier)
  workshopInside: '#3e4152', // l'intérieur sombre de la baie
  workshopTools: '#9c9389', // l'établi et les outils
  glass: '#7cc7f2', // eau-claire : la vitrine
  glassGlow: '#ffd27a', // la vitrine allumée la nuit
  frame: '#3e4152', // montants et lames
  signTextColor: '#fff8ec',
} as const

/** À l'atelier, la voiture tourne sur elle-même pour qu'on la voie sous toutes ses coutures, en radians par seconde. */
export const CAR_SHOWCASE_SPIN = 0.9

/** Le panneau de la concession et du garage, à droite, sous le HUD. */
export const SHOP_PANEL_STYLE = {
  titleColor: '#3a86ff',
  textColor: '#fff8ec',
  disabledColor: '#8a8797', // un choix impossible (trop cher, garage plein)
  panelFill: 'rgba(43, 30, 58, 0.8)',
  choiceFill: 'rgba(58, 134, 255, 0.25)',
  margin: 12, // distance au bord droit de l'écran
  top: 120, // distance au haut de l'écran : sous le HUD
} as const

/** Réglages des commandes tactiles (joystick virtuel et boutons), en pixels d'écran : ils ne dépendent pas du zoom de la caméra. */
export const TOUCH_CONTROLS = {
  /** Rayon du joystick : jusqu'où le pouce peut s'éloigner de son point de départ. */
  joystickRadius: 56,
  /** En dessous de cette distance, le pouce ne fait rien : évite d'avancer sans le vouloir quand le doigt tremble. */
  deadZone: 14,
  /** Rayon du bouton d'action : « courir » à pied, « frein à main » en voiture. */
  actionButtonRadius: 40,
  /** Rayon du bouton « E » : monter dans un véhicule ou en descendre. */
  interactButtonRadius: 32,
  /** Les boutons réagissent un peu au-delà de leur dessin (multiple du rayon), car un pouce n'est pas précis. */
  buttonGrab: 1.4,
  /** Espace entre les deux boutons. */
  buttonGap: 18,
  /** Distance entre les commandes et les bords de l'écran. */
  margin: 28,
} as const

/** Les couleurs des commandes tactiles (blanc chaud et violet sombre de la palette), pour qu'elles se lisent sur la ville sans la masquer. */
export const TOUCH_STYLE = {
  line: '#fff8ec',
  fill: 'rgba(43, 30, 58, 0.45)',
  pressedFill: 'rgba(255, 210, 63, 0.75)',
  pressedText: '#2b1e3a',
  /** Opacité du repère du joystick tant qu'aucun doigt n'est posé, et quand il est tenu. */
  hintOpacity: 0.55,
  heldOpacity: 0.95,
} as const

/** Les personnages (joueur et piétons) sont dessinés plus grands que leur place dans la simulation : on les lit mieux de loin (convention du genre). */
export const CHARACTER_VIEW = {
  scale: 1.4, // agrandissement à l'écran, sans effet sur les collisions
  outlineColor: '#2b1e3a', // contour sombre (le contour de la palette, docs/style.md)
  outlineThickness: 0.7, // épaisseur du contour, en unités du modèle (avant agrandissement)
} as const

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
