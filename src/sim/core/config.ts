// Les réglages d'équilibrage du jeu (TUNING) et les constantes fixes de la simulation.
// Expose : STEPS_PER_SECOND, STEP_SECONDS, TUNING.
// Pourquoi : aucune valeur d'équilibrage n'est écrite en dur dans les systèmes. Tout ce qu'on voudra régler
// (vitesses, dégâts, durées, probabilités) vit ici, groupé par module, avec son unité en commentaire.

/** Nombre de pas de simulation par seconde : la simulation avance à pas fixe, sur toutes les machines. */
export const STEPS_PER_SECOND = 30

/** Durée d'un pas de simulation, en secondes. */
export const STEP_SECONDS = 1 / STEPS_PER_SECOND

/** Les réglages, groupés par module (le nom du groupe est celui du dossier du module). */
export const TUNING = {
  walking: {
    walkSpeed: 60, // vitesse de marche du joueur, en px par seconde
    runSpeed: 110, // vitesse de course du joueur, en px par seconde
  },
  driving: {
    enterDistance: 48, // distance maximale entre le joueur et le centre d'un véhicule pour y monter, en px
    exitGap: 4, // espace laissé entre le flanc du véhicule et le joueur qui en descend, en px
    fullTurnSpeed: 80, // vitesse à partir de laquelle le volant tourne à fond, en px par seconde (on ne tourne pas à l'arrêt)
    rollingDrag: 90, // ralentissement quand on n'accélère pas, en px par seconde²
    handbrakeDrag: 160, // ralentissement supplémentaire au frein à main, en px par seconde²
  },
}
