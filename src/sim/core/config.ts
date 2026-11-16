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
  // Les règles de la foule. Ce qui est propre à un genre de piéton (vitesses, courage, patience, pauses) est dans sa fiche : src/data/npcTypes.
  pedestrians: {
    maxCount: 14, // nombre maximum de piétons en vie en même temps : la ville a l'air vivante sans tout simuler
    spawnMinDistance: 260, // un piéton naît au moins à cette distance du joueur, en px (hors de l'écran)
    spawnMaxDistance: 420, // ...et au plus à cette distance, en px
    despawnDistance: 560, // au-delà de cette distance du joueur, un piéton disparaît, en px
    spawnIntervalSeconds: 0.8, // on tente de faire naître au plus un piéton à cet intervalle, en secondes
    noticeDistance: 150, // à cette distance, un piéton remarque un joueur qui court, en px
    fleeDistanceMin: 55, // distance de fuite d'un piéton très courageux (courage = 1), en px
    fleeDistanceMax: 130, // distance de fuite d'un piéton peureux (courage = 0), en px
    fleeSeconds: 3, // un piéton fuit au moins cette durée après avoir eu peur, en secondes
    turnChance: 0.25, // probabilité de tourner à chaque case de trottoir (sinon il continue tout droit)
    pauseChance: 0.12, // probabilité de s'arrêter à chaque case de trottoir
    bodySize: 14, // côté du corps d'un piéton, en px (plus étroit qu'une case de 32 px : il marche au milieu du trottoir)
    minSeparation: 18, // distance minimale que deux piétons gardent entre eux, en px
    scaringSpeed: 80, // vitesse (px par seconde) au-delà de laquelle ce qui fonce sur un piéton lui fait peur : le joueur qui court (110) oui, qui marche (60) non
    noticeSeconds: 1.2, // un piéton qui remarque quelqu'un qui fonce sur lui s'arrête et le regarde au moins cette durée, en secondes
    spawnTries: 24, // nombre d'endroits tirés au hasard pour faire naître un piéton avant de laisser tomber (jusqu'à la prochaine tentative)
    walkableTileKinds: ['sidewalk'], // les types de case sur lesquels les piétons marchent (ids de src/data/tileKinds)
  },
}
