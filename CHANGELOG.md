# Journal des modifications

Toutes les évolutions du projet, de la plus récente à la plus ancienne.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versions selon le [versionnage sémantique](https://semver.org/lang/fr/).

**Règle** : chaque PR ajoute sa ligne dans **« Non publié »**, sous la bonne rubrique, avec le numéro d'issue.
À chaque fin d'étape de la roadmap, « Non publié » devient une version datée et `version` est mise à jour dans `package.json`.

| Rubrique          | Pour                                                         |
| ----------------- | ------------------------------------------------------------ |
| **Ajouté**        | une nouvelle fonctionnalité                                  |
| **Modifié**       | un changement de comportement existant                       |
| **Corrigé**       | un bug corrigé                                               |
| **Retiré**        | une fonctionnalité supprimée                                 |
| **Technique**     | outils, architecture, dépendances (invisible pour le joueur) |
| **Documentation** | docs seules                                                  |

## [Non publié]

### Ajouté

- La concession et le garage : deux nouveaux bâtiments (Bon Plan Auto au parking du centre-ville, avec sa vitrine et son enseigne ; un garage à porte basculante chez les pavillons), qui s'allument la nuit. À la concession, on achète la Mamie, la Livreuse ou la Frimeuse (touches 1 à 9 ou un clic) : la voiture attend au parking. Au garage, on range la voiture garée devant (même volée : elle devient à soi) et on la ressort plus tard (#53)
- L'argent est réel : on commence avec 120 €, une mission réussie verse sa récompense, et le HUD affiche le vrai solde ; les futures boutiques paieront par la commande `economy:spend`, refusée s'il manque de l'argent (#52)
- Les missions : un repère jaune marque leur départ, on y entre pour les lancer ; un repère turquoise montre où aller, un panneau affiche la consigne et le chrono ; réussite, échec (chrono écoulé) ou abandon. Une mission d'essai : récupérer un colis au parking et le livrer au port en deux minutes. Les missions s'écrivent en données, sans coder (`docs/missions.md`) (#9)
- Des piétons peuplent la ville : ils naissent hors de l'écran sur les trottoirs, se promènent case par case, s'arrêtent parfois, regardent puis fuient quand on court vers eux (une pastille « ! » rouge s'allume), et disparaissent quand on s'éloigne ; chacun est assemblé en blocs avec ses propres couleurs et son accessoire (#10)
- Essai d'affichage en 3D pixel art (three.js) sur la page `three.html`, à comparer avec le jeu : même ville, même simulation ; vraies ombres, lampadaires et phares qui éclairent les façades
- Une vraie petite ville, variée et texturée : pavillons et jardins, place pavée avec fontaine et bancs, parc et étang, centre-ville, parking, plage, mer et pontons ; passages piétons, marquages, plaques d'égout, lampadaires, arbres qui ondulent au vent, eau animée, toits variés (piscine, panneaux solaires, linge qui sèche…), façades pastel avec leurs fenêtres ; N pour passer à la nuit (immeubles assombris, fenêtres allumées, halos des lampadaires, phares des voitures)
- Essai de rendu 2.5D : les immeubles prennent du relief (façades en perspective, toits décalés) et projettent leur ombre au sol ; R pour comparer avec et sans (#26)
- On peut conduire ! E pour monter dans une voiture garée et en descendre ; trois modèles (la Mamie, la Livreuse, la Frimeuse) ; accélérer, freiner, reculer, déraper, frein à main sur Espace ; la caméra regarde devant la voiture (#8)
- Une ville de test : routes, trottoirs, ruelles, un parc et des immeubles qu'on ne traverse plus ; on glisse le long des murs (#6)
- Un carré jaune se déplace dans la ville : flèches, ZQSD ou WASD pour marcher, Maj pour courir, la caméra le suit (#3)
- Bible visuelle en Gemini 3 Pro : 7 planches de référence (personnages, animation, portraits, véhicules, sol, bâtiments, scène) et leurs prompts (#4)
- Le HUD : en haut à droite, la santé (cœurs), la recherche (trois étoiles) et l'argent, en petites icônes pixel art ; valeurs factices pour l'instant, en attendant que la simulation les fournisse (#11)
- Commandes tactiles : sur téléphone, un joystick qui apparaît sous le pouce gauche pour marcher et conduire, un bouton rond (courir à pied, frein à main en voiture) et un bouton « E » pour monter et descendre ; le jeu reconnaît tout seul un écran tactile et suit la dernière entrée utilisée (un toucher, une touche) ; `?controls=touch` ou `?controls=keyboard` force le mode (#20)

### Modifié

- Rendu plus net : la taille des pixels s'adapte à l'écran (×2 en 1080p au lieu de ×3), P passe à automatique, ×1, ×2 ou ×3 ; les personnages sont plus grands et cernés d'un contour sombre, lisibles de jour comme de nuit (#43)
- Le jeu s'affiche désormais en pixel art 3D (three.js) : vrais immeubles, vraies ombres, lumière de nuit réelle ; Phaser et l'essai de relief 2.5D sont retirés

### Technique

- Mise en ligne : un Worker Cloudflare sert le jeu ; `/api/sante` répond, `/api/` est réservé au serveur du jeu (les futurs salons multijoueurs) ; `npm run deploy` et `npm run preview:worker` ; voir `docs/deploiement.md` (#12)
- Brique `pedestrians` (naissance, promenade, états, peur) et types de PNJ en données pures (`src/data/npcTypes` : personnalité, vitesses, apparence), prêts pour le futur panneau admin ; le noyau gagne le composant `pedestrian` et l'événement `pedestrian:scared` ; la brique reçoit ses types par un registre : `createPedestriansSystem(NPC_TYPE_REGISTRY)` ; l'apparence est tirée par l'affichage d'après l'id du piéton (#10)
- Bascule du moteur d'affichage : le code 3D rejoint `src/game` (`render/`, `input/`), ESLint interdit three.js dans la simulation ; le clavier lit la position physique des touches (#21)
- Brique `driving` (physique arcade déterministe, cap en vecteur), modèles de véhicules en données, `isSpaceClear` dans le noyau ; la brique `collision` bloque aussi contre les autres entités, coupe la vitesse au choc et annonce `entity:blocked` (#8)
- Format de carte en données (`MapDef`), carte chargée dans le monde (`world.map`), brique `collision` et tranche `SYSTEM_ORDER.collision` (#6)
- Règle ESLint du noyau corrigée : elle interdit tout import qui sort du dossier `core` au lieu de se fier aux noms de fichiers

- Scripts de génération et de pixelisation des visuels, repris de GRINTA (#15)
- Noyau de la simulation : `Rng` déterministe, `TUNING`, monde et entités à composants, bus d'événements, registres, commandes, boucle à pas fixe avec affichage interpolé, première brique `walking` (#3)

- Initialisation du projet : Vite, TypeScript strict, Phaser 3, Vitest, Prettier (#2)
- Garde-fous de l'architecture en briques : règles d'imports ESLint, détection des dépendances circulaires avec madge (#2)
- Vérifications automatiques de chaque PR par GitHub Actions : lint, cycles, tests, build (#2)

### Documentation

- Deux nouveaux blocs de fonctionnalités : **19. Garage** (acheter ses véhicules, les ranger, les personnaliser à l'atelier : peinture, pièces, néons, performances, autocollants générés) et **20. Personnage** (création et garde-robe) ; l'argent du joueur précisé dans le bloc 11
- Registre des générations et leçons tirées de la bible (#4)
- Perspective 3/4 confirmée par un test (3 directions + miroir), véhicules en vue du dessus ; Gemini 3 Pro par défaut (#4)

- Journal des modifications et roadmap (#2)
- Répartition du prototype : le code d'abord, les visuels plus tard (#16)
- Architecture modulaire « LEGO » et conventions de nommage (#14)
- GDD v0.1, stack Phaser, guide Git, liste des fonctionnalités, identité visuelle (#1)
- Règles de travail du projet pour Claude (`CLAUDE.md`)
