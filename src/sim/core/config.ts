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
}
