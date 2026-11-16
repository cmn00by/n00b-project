# Décisions

Les choix importants du projet : ce qu'on a choisi, ce qu'on a écarté, et pourquoi.
Une nouvelle décision s'ajoute **en haut**. Une décision remise en cause n'est pas effacée : on ajoute une nouvelle entrée qui la remplace.

---

## 2026-11-16 : Les missions en données, et une brique par sorte d'objectif

**Choix** : une mission est une **fiche en JSON pur** (`MissionDef` dans `sim/core/mission.ts` : départ, objectifs, chronos, récompense), écrite dans `src/data/missions/` en TypeScript
pour être vérifiée par le compilateur. Le moteur (brique `missions`) reçoit leur registre et n'en connaît aucune par son nom. Chaque **sorte d'objectif** (`reach`, `pickup`, `deliver`)
est un petit module de `missions/objectives/`. L'avancement est un composant du joueur (`missionProgress`), les chronos se comptent en pas de simulation.
La récompense est **annoncée** par l'événement `mission:succeeded` ; l'argent viendra avec la brique d'économie.

**Raison** : écrire une mission sans toucher au moteur (#13), la valider par les tests (cases dans la carte, objet livré après avoir été ramassé), et garder un état sauvegardable et partageable (coop).

**Alternatives écartées** : des fichiers `.json` chargés à l'exécution (pas de vérification du compilateur, et rien à gagner tant qu'il n'y a pas d'éditeur) ; un script par mission
(du code au lieu de données : impossible à éditer depuis le futur panneau admin) ; l'avancement dans une entité « mission » séparée (plus de liens à suivre pour rien).

---

## 2026-11-16 : Mise en ligne par Workers Builds, /api/ réservé aux salons multijoueurs

**Choix** : un seul Worker (`n00b-project`) sert le jeu (`dist/`, en assets statiques) et réserve les adresses **`/api/`** au serveur du jeu.
Le déploiement passe par **Workers Builds** (l'intégration Git de Cloudflare) : merge sur `main` = mise en ligne, autre branche = adresse de preview commentée sur la PR.
Les parties à plusieurs passeront par `/api/salons/<code>` : **un Durable Object par salon**, où arrivent toutes les connexions du même code (2 à 4 joueurs, et la reconnexion).

**Raison** : aucun secret à gérer dans GitHub, des previews sans rien écrire, et une seule adresse pour le jeu et son serveur (pas de souci de CORS ni de domaines multiples le jour du multijoueur).

**Alternatives écartées** : GitHub Actions avec un jeton Cloudflare (un secret de plus, des previews à coder soi-même) ; Cloudflare Pages (les Workers le remplacent, et les Durable Objects y sont moins simples) ;
un Worker séparé pour l'API (deux adresses, deux déploiements à garder synchrones).

---

## 2026-11-16 : Les piétons : types en données pures, personnages voxel assemblés par le code

**Choix** : un type de PNJ est une **fiche en JSON pur** (`NpcTypeDef` : vitesses, plages de courage, de patience et de pause, et une recette d'apparence `look`), sans aucune fonction.
La brique `pedestrians` ne connaît aucun type par son nom et reçoit le registre des types à sa création. Les piétons sont des personnages **en voxel assemblés par le code** (tête, cheveux, corps,
bras, jambes, accessoire), dont les couleurs et l'accessoire sont tirés d'après l'id du piéton dans la recette de son type.

**Raison** : le panneau admin devra pouvoir éditer les types de PNJ sans toucher au code ; une fiche en données pures se lit, se modifie et se sauvegarde telle quelle.
Un personnage assemblé par le code évite de dessiner et d'animer un sprite par variante : ajouter une couleur dans une liste varie toute la foule.
Tirer l'apparence de l'id (hasard d'affichage) garde la simulation déterministe et sans rien à sauvegarder pour l'affichage.

**Alternatives écartées** : un sprite par variante de PNJ (trop de dessin et d'animation) ; des types de PNJ écrits en code avec des fonctions (non éditables par l'admin) ;
tirer l'apparence dans la simulation avec `Rng` (alourdit le composant et les sauvegardes pour un détail d'affichage).

**Conséquences** : la brique lit les **commandes des joueurs** (direction et course) pour savoir ce qui fait peur, faute de vitesse stockée par `walking` ; les voitures (#8) fourniront la leur de la même façon.
Le noyau gagne le composant `pedestrian` et l'événement `pedestrian:scared`.

## 2026-11-16 : three.js devient le moteur d'affichage (remplace Phaser)

**Choix** (cmn00by, après comparaison des deux versions) : l'affichage du jeu passe à **three.js** : la ville en vraie 3D, **dessinée en basse résolution puis agrandie** sans lissage,
pour un rendu pixel art cohérent. Phaser est retiré, avec l'essai de relief 2.5D (#26, abandonné).

**Ce qui ne change pas** : toute la simulation (noyau, marche, conduite, collisions), les données (carte, véhicules), les règles d'affichage pures
(sol, immeubles, déco, fenêtres) et les textures générées.

**Personnages et véhicules** : en **voxel** (blocs assemblés par le code) pour l'instant, comme dans l'essai : variété et animation sans dessin image par image.
À confirmer à deux.

**Raison** : le relief en Phaser abîmait le pixel art (toits ré-agrandis, tailles non entières, rotations) ; en 3D basse résolution, tout partage la même grille de pixels,
et ombres et lumières sont réelles. La séparation simulation / affichage a permis de changer de moteur sans toucher aux règles du jeu.

**Remplace** : « Stack technique » (Phaser 3) et l'essai « rendu 2.5D des immeubles ».

## 2026-11-16 : Essai d'affichage en 3D pixel art (three.js) — retenu

**Constat** : l'essai de relief en Phaser (#26, #29) se bat contre le pixel art : les toits sont ré-agrandis en continu, la déco est affichée à des tailles non entières, le feuillage tourne : des pixels inégaux qui scintillent.

**Essai** : la même ville et la même simulation, affichées en vraie 3D avec three.js, **dessinées en basse résolution puis agrandies sans lissage** : tout partage la même grille de pixels. Immeubles en boîtes (toits générés, façades par le code), vraies ombres (dures), lumière de nuit réelle (lampadaires proches, phares). Page `three.html`, à côté du jeu.

**À décider après comparaison, à deux** : garder Phaser ou passer l'affichage à three.js. La simulation ne change pas dans les deux cas.

**Ajout d'une dépendance** : `three` (et ses types), sur la branche d'essai seulement.

## 2026-11-16 : Une ville variée, texturée, de jour et de nuit

**Choix** :

- **Textures générées** (Gemini 3 Pro, 2 planches : toits vus de dessus et déco) **et sols de la bible** ; tout le reste par le code : marquages, passages piétons, bordures, rivages, fenêtres, eau animée.
- **Le sol est peint une fois** dans une grande image ; **l'eau vit dessous** (deux couches qui glissent) et se voit à travers les trous.
- **Toits texturés** sur le relief : la projection d'un rectangle reste un rectangle, l'image est simplement placée et étirée. Maisons basses : toits pentus ; immeubles : toits plats variés.
- **La déco est placée par des règles** (`placeDecor`) et à l'échelle du jeu (`PROP_STYLES` : case 32 px, joueur 24 px, voiture 26 × 46 px). **Affichage seulement** pour l'instant : elle ne bloque pas le passage ; elle deviendra des objets de la simulation avec le bloc « environnement interactif ».
- **La nuit** : un voile sombre percé là où il y a de la lumière (lampadaires, phares), des halos en mode addition ; le voile passe sous les immeubles, qui s'assombrissent eux-mêmes et allument leurs fenêtres (pour que l'ordre d'affichage reste juste).
- **Un hasard d'affichage stable** (`hashToUnit`) : la même ville pour tous, sans toucher au hasard de la simulation.

**Alternatives écartées** : éclairage par normal maps (il faudrait une carte de relief par image) ; un shader d'eau maison (deux couches qui glissent suffisent pour l'effet, et marchent partout).

## 2026-11-16 : Essai de rendu 2.5D des immeubles (#26) — abandonné (remplacé par three.js)

**Essai** : sans changer la simulation (qui reste en 2D), l'affichage donne du volume aux immeubles. Les cases de bâtiment sont regroupées en blocs ; chaque bloc a une hauteur ;
son toit est dessiné décalé vers l'extérieur de l'écran (`projectRaised`), et ses façades tournées vers la caméra relient le sol au toit. Les ombres portées sont dessinées au sol.
Touche **R** pour comparer.

**À décider après l'essai** : garder ou non. Si oui : la hauteur des immeubles passe dans les données de la carte (aujourd'hui provisoire, déduite de la position), et la planche bible des bâtiments
est refaite en « toits vus de dessus + textures de façade » (`docs/style.md`, section 5.5), puisque les façades ne sont plus peintes sur l'image.

**Alternatives** : vraie 3D (Three.js, caméra fixe) : bien plus lourd, changement de moteur ; ombres et éclairage seuls (normal maps) : moins de volume, mais compatibles avec la bible actuelle.

## 2026-11-16 : La conduite (#8)

**Choix** :

- **Physique arcade maison**, dans une brique `driving` : la vitesse est séparée en une part dans l'axe (moteur, freins) et une part de côté (le dérapage), que l'adhérence du modèle efface peu à peu ; le frein à main baisse l'adhérence. Simple à régler, et fun.
- **Le cap est un vecteur** (`vehicle.headingX/Y`), pas un angle : la rotation n'utilise que `+ − × ÷` et `Math.sqrt`, identiques sur toutes les machines (coop). L'angle n'est calculé que par l'affichage.
- **Corps du véhicule = rectangle aligné sur la grille qui englobe la voiture tournée** : les collisions restent celles de la brique `collision` (rectangles). Une voiture en diagonale est donc un peu « plus large » qu'en vrai : acceptable en arcade.
- **Le joueur au volant n'a plus de corps** (mis de côté dans `driver.storedBody`) : il ne gêne pas sa propre voiture et ne peut pas être percuté. Il est posé sur une place libre en descendant.
- **La brique `collision` s'étend aux entités** (voiture contre voiture, joueur contre voiture), coupe la vitesse sur l'axe bloqué et annonce `entity:blocked` avec la vitesse perdue (pour les dégâts, la police, les sons).
- **La caméra regarde devant la voiture** au lieu de reculer : un zoom non entier rendrait les pixels flous.
- **Vitesse maximale plafonnée à 16 px par pas** par les tests des données : au-delà, une voiture pourrait traverser un mur d'une case.

**Changement du noyau** (ajouts seulement) : composants `vehicle` et `driver`, type `VehicleDef`, `space.ts` (`isSpaceClear`, `findSolidOverlaps`), événements `entity:blocked`, `vehicle:entered`, `vehicle:exited`, commandes `player:interact`, `vehicle:drive`, véhicules garés dans `MapDef`, `TUNING.driving`.

**Alternatives écartées** : la physique Matter.js de Phaser (dans l'affichage, non déterministe d'une machine à l'autre) ; un angle avec `sin`/`cos` (résultat pouvant différer à la dernière décimale selon le navigateur).

**Limites connues** : les collisions entre entités sont testées une à une (O(n²)) : à revoir quand le trafic (#5 du GDD) mettra beaucoup de voitures. Si deux briques réagissent un jour à `player:interact` (parler à un PNJ), il faudra décider laquelle a la priorité.

## 2026-11-16 : La carte et les collisions (#6)

**Choix** :

- **La carte est décrite en données** (`src/data/maps`) : des lignes de caractères et une légende vers des types de case (`src/data/tileKinds`). Facile à lire, à modifier et à valider par les tests. Un futur chargeur Tiled (#5) produira la même grille (`TileMap`).
- **La grille vit dans le monde** (`world.map`, facultative) : de simples tableaux de textes et de booléens, qui se sauvegardent et s'envoient tels quels. N'importe quelle brique peut demander si un endroit est libre (`isAreaFree`).
- **Une brique `collision` séparée**, dans une nouvelle tranche `SYSTEM_ORDER.collision` (350, après les déplacements) : elle compare chaque entité à sa dernière position libre et la ramène au contact du mur, axe par axe (on glisse le long des murs). Les briques qui déplacent (marche, puis conduite, piétons) n'ont rien à faire pour respecter les murs.

**Changement du noyau** (ajouts seulement) : `map.ts`, `World.map`, `loadMap`, le composant `lastFreePosition`, la tranche `collision`. Relecture demandée aux deux, comme prévu par `architecture.md`.

**Alternatives écartées** : intégrer les collisions dans `walking` (il aurait fallu les refaire pour chaque façon de bouger) ; la physique arcade de Phaser (elle vit dans l'affichage, alors que la simulation doit tourner sans Phaser, pour la coop).

**Limite connue** : un déplacement de plus d'une case en un seul pas pourrait sauter un mur fin. Sans effet pour la marche ; la conduite rapide devra en tenir compte.

## 2026-11-15 : Les choix du noyau de la simulation (#3)

**Choix** :

- **Entités et composants maison**, rangés dans un dictionnaire par id (`world.entities`), sans bibliothèque ECS : l'état se sauvegarde et s'envoie tel quel (JSON), et l'ordre de parcours (ids croissants) est stable.
- **`createSimulation(world, systems)`** plutôt que `step(world, commands)` seul : le noyau n'a pas le droit d'importer la liste `SYSTEMS` (elle vit dans `src/sim/systems`), on la lui passe donc une fois ; ensuite `simulation.step(commands)` avance d'un pas. Les commandes du pas sont lues par les systèmes dans `world.commands`.
- **Le contrat `System` est dans `core/system.ts`** (singulier) : la règle de lint du noyau interdit tout import se terminant par `/systems`, qui attrapait aussi `core/systems.ts`. _Mise à jour : la règle a été corrigée (le noyau interdit désormais tout import qui sort de son dossier, `../…`, quel que soit le nom) ; le fichier garde son nom `system.ts`._
- **`Math.sqrt` plutôt que `Math.hypot` ou `Math.atan2`** dans la simulation : leur résultat peut différer à la dernière décimale selon le navigateur, alors que `sqrt` est exact partout. Condition de la coop (même simulation chez tous les joueurs).
- **Une seule commande par entité et par pas** dans `walking` (la dernière) : envoyer deux fois la même demande ne doit pas doubler la vitesse.

**Alternatives écartées** : une bibliothèque ECS (voir la décision sur l'architecture) ; renommer la règle de lint plutôt que le fichier (on ne touche pas aux garde-fous sans accord).

**Raison** : un noyau petit, testable dans Node, et dont le résultat est identique sur toutes les machines.

## 2026-11-15 : Perspective 3/4 confirmée, Gemini 3 Pro pour les visuels

**Choix** : personnages et bâtiments en vue **3/4**, avec **3 directions dessinées** (face, dos, profil gauche) et la droite en **miroir** ;
véhicules en vue **strictement du dessus**, que le jeu fait pivoter. Modèle de génération par défaut : **Gemini 3 Pro Image**.

**Alternatives testées et écartées** : la vraie vue du dessus pour tout (le modèle n'arrive pas à dessiner un personnage vu d'en haut) ;
Gemini 3.1 Flash Image (moitié prix, mais consignes mal suivies : isométrique, véhicules à l'envers).

**Raison** : un test de feuille d'animation 4 × 4 en Gemini 3 Pro garde le personnage identique sur les 16 poses : le 3/4 est produisible.
Détails et coûts dans [registre-visuels.md](registre-visuels.md).

## 2026-11-15 : Architecture modulaire « LEGO » et conventions de nommage

**Choix** : un noyau stable (`src/sim/core`) et des briques qui s'y enregistrent : systèmes (un dossier, une ligne dans `SYSTEMS`),
entités à composants, bus d'événements typé, contenus en données dans des registres. Règles d'import vérifiées par ESLint et madge.
Code en anglais, commentaires et textes en français, verbes de fonctions à sens fixe et glossaire. Détails : [architecture.md](architecture.md), [conventions.md](conventions.md).

**Alternatives écartées** : un ECS complet en bibliothèque (bitECS…) : plus performant mais plus abstrait pour débuter ; des systèmes qui s'appellent directement : plus simple au début, mais chaque ajout casse le voisin.

**Raison** : ajouter une fonctionnalité sans modifier les autres, travailler à deux dans des dossiers séparés, et garder un état simple à sauvegarder et à envoyer sur le réseau (coop).

## 2026-11-15 : Graphismes générés par IA (remplace « Graphismes » ci-dessous)

**Choix** : **tous les visuels** (portraits, sprites, tuiles, véhicules, bâtiments, objets, interface) sont générés en pixel art via **OpenRouter**,
puis pixelisés par script (chaîne reprise de GRINTA). La référence unique est [style.md](style.md) : blocs de prompt, palette, tailles, planches « bible ».
Grille de base proposée : **32 × 32 px** (à confirmer dans l'issue #4).

**Alternatives écartées** : packs CC0 (look moins unique), dessin à la main (trop lent pour débuter).

**Raison** : l'équipe maîtrise déjà cette chaîne sur GRINTA. La cohérence est garantie par des blocs de prompt figés et des images de référence jointes à chaque génération.
Les tuiles de route et les animations demanderont des retouches à la main (Aseprite ou Piskel).

## 2026-11-15 : Stack technique (Phaser remplacé par three.js le 2026-11-16)

**Choix**

- **Phaser 3** + **TypeScript** + **Vite** pour le jeu.
- **Vitest** pour les tests de la simulation.
- **Tiled** pour éditer la carte (export JSON lu par Phaser).
- **Cloudflare Workers** pour servir le jeu, **R2** pour les assets, **D1** et **Durable Objects** plus tard (comptes, coop).
- Interface hors jeu (menus, téléphone, inventaire) : en Phaser au début. _(à trancher : passer à du HTML/React par-dessus si les menus deviennent lourds.)_

**Alternatives écartées**

- **React + canvas maison** (stack de GRINTA) : très bien pour un jeu de menus, mais il faudrait réécrire caméra, collisions, sprites, tuiles. Phaser les fournit.
- **Moteur 3D (Three.js, Babylon)** : trop ambitieux pour un premier projet à deux.
- **Godot export web** : bon moteur, mais exports lourds et moins naturels à héberger et à brancher sur des Workers.

**Raison** : Phaser est le moteur web 2D le plus documenté, gère nativement les cartes Tiled, la physique arcade et la caméra.
TypeScript garde le code lisible à deux.

## 2026-11-15 : Simulation séparée de l'affichage

**Choix** : la logique du jeu (positions, règles, PNJ, police, missions) vit dans `src/sim/`, en TypeScript pur, sans Phaser.
Phaser ne fait qu'**afficher** l'état et **transmettre les commandes** du joueur.

**Raison** : c'est la condition pour la coop et l'online (V2, V3) : la même simulation pourra tourner dans un Durable Object.
C'est aussi ce qui rend la logique testable avec Vitest. Repris de la séparation moteur / interface de GRINTA.

## 2026-11-15 : Graphismes (remplacée par « Graphismes générés par IA »)

**Choix** : packs **CC0** (Kenney) pour la ville et les véhicules dès le prototype ; **génération IA** (OpenRouter) réservée aux portraits et illustrations,
avec un budget fixé par le propriétaire du repo.

**Raison** : coder sans attendre les graphismes ; l'IA peine à produire des tuiles qui se raccordent, mais réussit bien les images uniques.
