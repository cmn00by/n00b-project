# Fonctionnalités : le jeu découpé en blocs

Ce document liste **tout ce qui est attendu**, bloc par bloc, pour se répartir le travail.
Le **pourquoi** est dans [GDD.md](GDD.md). Ici, c'est le **quoi** : chaque case à cocher devient une issue sur le [tableau](https://github.com/users/cmn00by/projects/3).

## Comment lire ce document

Chaque bloc donne :

- **Objectif** : ce que le joueur doit ressentir.
- **Fonctionnalités** par étape : **V0** (prototype), **V1** (solo complet), **Plus tard** (coop, online, mobile, bonus).
- **Dépend de** : les blocs à faire avant.
- **Fichiers** : où vit le code, pour savoir si deux personnes risquent de se marcher dessus.
- **Profil** : 🔧 _moteur_ (logique, algos, maths) ou 🎨 _contenu_ (carte, données, textes, assets), et la difficulté ⭐ à ⭐⭐⭐.
- **Fini quand** : ce qu'on doit constater en jouant.

**Règle de répartition** : deux personnes ne prennent pas deux blocs qui touchent les mêmes fichiers en même temps.
Grâce à l'architecture en briques ([architecture.md](architecture.md)), chaque bloc vit dans **ses propres dossiers** : seuls le noyau et les listes d'enregistrement sont partagés.

## Vue d'ensemble

| #   | Bloc                                                                                           | Profil | Difficulté | Dépend de | Responsable                             |
| --- | ---------------------------------------------------------------------------------------------- | ------ | ---------- | --------- | --------------------------------------- |
| 0   | [Socle technique](#0-socle-technique)                                                          | 🔧     | ⭐⭐       | aucun     | cmn00by (#2), Baghorror12 (#3)          |
| 1   | [Déplacement à pied](#1-déplacement-à-pied)                                                    | 🔧     | ⭐         | 0         | Baghorror12                             |
| 2   | [Ville et carte](#2-ville-et-carte)                                                            | 🎨     | ⭐⭐       | 0         | cmn00by (carte de test)                 |
| 3   | [Conduite et véhicules](#3-conduite-et-véhicules)                                              | 🔧     | ⭐⭐⭐     | 1, 2      | cmn00by                                 |
| 4   | [PNJ piétons](#4-pnj-piétons)                                                                  | 🔧     | ⭐⭐       | 1, 2      | Baghorror12                             |
| 5   | [Trafic](#5-trafic)                                                                            | 🔧     | ⭐⭐⭐     | 2, 3      | _à attribuer_                           |
| 6   | [Environnement interactif](#6-environnement-interactif)                                        | 🔧🎨   | ⭐⭐       | 1, 2      | _à attribuer_                           |
| 7   | [Police et recherche](#7-police-et-recherche)                                                  | 🔧     | ⭐⭐⭐     | 3, 4      | _à attribuer_                           |
| 8   | [Missions](#8-missions)                                                                        | 🔧🎨   | ⭐⭐       | 1, 3      | cmn00by (moteur), Baghorror12 (contenu) |
| 9   | [Dialogues et humour](#9-dialogues-et-humour)                                                  | 🎨     | ⭐         | 4         | _à attribuer_                           |
| 10  | [Interface (HUD, menus, téléphone)](#10-interface-hud-menus-téléphone)                         | 🔧🎨   | ⭐⭐       | 0         | Baghorror12                             |
| 11  | [Progression et économie](#11-progression-et-économie)                                         | 🔧🎨   | ⭐⭐       | 8         | _à attribuer_                           |
| 12  | [Sauvegarde](#12-sauvegarde)                                                                   | 🔧     | ⭐         | 11        | _à attribuer_                           |
| 13  | [Audio](#13-audio)                                                                             | 🎨     | ⭐         | 0         | _à attribuer_                           |
| 14  | [Graphismes et assets](#14-graphismes-et-assets)                                               | 🎨     | ⭐⭐       | aucun     | plus tard                               |
| 15  | [Mise en ligne et admin](#15-mise-en-ligne-et-admin)                                           | 🔧     | ⭐⭐       | 0         | cmn00by                                 |
| 16  | [Coop](#16-coop-v2)                                                                            | 🔧     | ⭐⭐⭐     | V1 finie  | plus tard                               |
| 17  | [Mini online](#17-mini-online-v3)                                                              | 🔧     | ⭐⭐⭐     | 16        | plus tard                               |
| 18  | [Mobile](#18-mobile)                                                                           | 🔧🎨   | ⭐⭐       | 10        | plus tard                               |
| 19  | [Garage : véhicules à soi et personnalisation](#19-garage-véhicules-à-soi-et-personnalisation) | 🔧🎨   | ⭐⭐⭐     | 3, 11     | _à attribuer_                           |
| 20  | [Personnage : création et garde-robe](#20-personnage-création-et-garde-robe)                   | 🔧🎨   | ⭐⭐       | 4, 11     | _à attribuer_                           |

### L'ordre de construction

```
0 Socle ──┬─► 1 À pied ──┬─► 3 Conduite ──┬─► 5 Trafic
          │              │                ├─► 7 Police ◄── 4 PNJ
          ├─► 2 Ville ───┤                └─► 8 Missions ─► 11 Progression ─┬─► 12 Sauvegarde
          │              │                                                  ├─► 19 Garage (véhicules, personnalisation)
          │              │                                                  └─► 20 Personnage (création, garde-robe)
          │              ├─► 4 PNJ ─► 9 Dialogues
          │              └─► 6 Environnement
          ├─► 10 Interface
          ├─► 13 Audio
          └─► 15 Mise en ligne
14 Graphismes : en parallèle de tout
```

---

## 0. Socle technique

**Objectif** : un projet qui se lance, se teste et se déploie, sur lequel tout le reste se branche.

**V0**

- [x] Projet Vite + TypeScript (Phaser 3 au départ, remplacé par three.js), `npm run dev` affiche une scène (#2)
- [x] Vitest configuré, un premier test qui passe (#2)
- [x] Prettier configuré (style du `CLAUDE.md`) (#2)
- [x] Structure des dossiers selon `docs/architecture.md` (#2)
- [x] ESLint (règles d'imports), madge (cycles) et GitHub Action de vérification des PR (#2)
- [x] Noyau `src/sim/core` : monde, entités et composants, systèmes (`SYSTEMS`, `SYSTEM_ORDER`), bus d'événements typé, registres (#3)
- [x] `Rng` déterministe (`src/sim/core/rng.ts`) avec ses tests (#3)
- [x] Boucle à pas fixe : `createSimulation(world, systems)` puis `simulation.step(commands)`, affichage interpolé (#3)
- [x] Système de commandes (`src/sim/core/commands.ts`) et lecture clavier → commandes (#3)
- [x] `TUNING` (`src/sim/core/config.ts`) (#3)
- [x] Caméra qui suit une cible, zoom pixel art net (#3)

**Plus tard**

- [ ] Mode debug : afficher les collisions, les chemins des PNJ, les FPS (touche F3)
- [ ] Rejouer une partie à partir de la graine et des commandes enregistrées

**Fichiers** : `src/sim/core/`, `src/game/scenes/`, `src/game/input/`, config du projet.
**Profil** : 🔧 ⭐⭐. À faire **en premier, par une seule personne**, car tout le monde en dépend.
**Fini quand** : un carré se déplace au clavier dans une scène, la caméra le suit, et `npm test` passe.

## 1. Déplacement à pied

**Objectif** : se déplacer dans la ville doit être agréable et réactif.

**V0**

- [x] Marcher dans 8 directions, courir (touche maintenue) (brique `walking`, #19)
- [x] Collisions avec les murs et bâtiments de la carte (brique `collision`, #6)
- [ ] Animation de marche et de course (3 directions + miroir) (#7, attend les visuels)

**V1**

- [ ] Frapper (coup de poing cartoon), recevoir des coups, santé
- [ ] Ramasser, porter et lancer un objet léger
- [ ] Bouton d'interaction contextuel (« E : parler », « E : monter »)
- [ ] Chute KO comique, puis réapparition à l'hôpital (avec facture)

**Plus tard**

- [ ] Sauter par-dessus les petits obstacles, plonger pour esquiver une voiture

**Dépend de** : 0. **Fichiers** : `src/sim/systems/walking/`, `src/game/render/playerRenderer.ts`.
**Profil** : 🔧 ⭐ (bon premier bloc pour apprendre la structure).
**Fini quand** : on parcourt un quartier à pied sans traverser les murs, et on peut ramasser une poubelle et la lancer.

## 2. Ville et carte

**Objectif** : une ville petite mais dense, lisible, pleine de détails drôles.

**V0**

- [x] Tuiles du Centre générées selon `style.md` (sols de la bible, toits et déco générés)
- [ ] Un quartier dans **Tiled** : routes, trottoirs, bâtiments, calques de collision (#5)
- [x] Carte de test en données (grille de cases : route, trottoir, mur), collisions branchées sur la simulation (#6)
- [ ] Chargement des cartes Tiled (quand #5 sera faite)
- [ ] Calques d'objets dans Tiled : points d'apparition, zones, portes (#5)

**V1**

- [ ] Les 4 quartiers : Centre, Docks, Zone Pavillonnaire, Colline
- [ ] Le réseau routier décrit pour le trafic : voies, sens, carrefours, feux (calque Tiled dédié)
- [ ] Zones de quartier (pour la réputation, les PNJ, la musique)
- [ ] Noms de rues et lieux parodiques, panneaux et pubs absurdes
- [ ] Mini-carte et carte complète (avec le bloc 10)

**Plus tard**

- [ ] Intérieurs simples (planque, garage, boutiques)
- [x] Cycle jour / nuit : éclairage, fenêtres, lampadaires, phares (les PNJ de nuit viendront avec les piétons)
- [ ] Météo (pluie qui rend la route glissante)

**Dépend de** : 0. **Fichiers** : `public/maps/`, `src/game/scenes/City.ts`, `src/sim/map.ts`, `src/data/places.ts`.
**Profil** : 🎨 ⭐⭐ (surtout du travail dans Tiled, peu de code). **Idéal en parallèle des blocs 0 et 1.**
**Fini quand** : on charge un quartier complet, routes et bâtiments sont cohérents, et les collisions tombent juste.

## 3. Conduite et véhicules

**Objectif** : conduire doit être **fun avant d'être réaliste** : dérapages, chocs, chaos.

**V0**

- [x] Monter et descendre d'une voiture (bouton d'interaction) (#8)
- [x] Physique arcade : accélération, freinage, marche arrière, direction, frein à main, dérapage (#8)
- [x] Collisions voiture / bâtiments / objets / autres voitures (#8)
- [x] Caméra qui regarde devant la voiture avec la vitesse (au lieu de reculer : le zoom reste entier pour garder des pixels nets) (#8)

**V1**

- [ ] 5 ou 6 modèles avec des réglages différents (en données : `src/data/vehicles.ts`) : voiture de mamie, camionnette, sportive, voiturette de golf, bus, police
- [ ] Voler une voiture occupée : le conducteur est éjecté et proteste (avec le bloc 9)
- [ ] Dégâts visibles (fumée, carrosserie), puis panne, puis explosion comique
- [ ] Renverser un piéton : il est projeté de façon cartoon, se relève et râle (pas de violence réaliste)
- [ ] Klaxon (et les PNJ réagissent)
- [ ] Radio : changer de station (avec le bloc 13)

**Plus tard**

- [ ] Deux-roues (scooter, vélo de livraison)
- [ ] Personnalisation au garage : voir le bloc **19**

**Dépend de** : 1, 2. **Fichiers** : `src/sim/systems/driving/`, `src/data/vehicles/`, `src/game/render/vehicleRenderer.ts`.
**Profil** : 🔧 ⭐⭐⭐ (le cœur du jeu : à soigner et à régler longtemps).
**Fini quand** : on a envie de faire le tour du quartier en voiture juste pour s'amuser à déraper.

## 4. PNJ piétons

**Objectif** : la ville a l'air vivante et **réagit** à ce que fait le joueur.

**V0**

- [x] Piétons qui apparaissent autour du joueur et disparaissent hors champ (pas de PNJ simulés partout) (#10)
- [x] Marche sur les trottoirs, d'un point à un autre (#10)
- [x] Machine à états simple : se promener, s'arrêter, fuir (#10)
- [x] Types de PNJ en données (personnalité, vitesses, apparence en recette), personnages en voxel assemblés par le code (#10)

**V1**

- [ ] Réactions : peur (fuir), colère (insulter, frapper), curiosité (s'approcher), filmer avec son téléphone
- [ ] Appeler la police quand ils voient un délit (avec le bloc 7)
- [ ] Types de PNJ par quartier (dockers, retraités, golfeurs, touristes…) avec un comportement propre
- [ ] Bulles de texte au-dessus des PNJ (avec le bloc 9)
- [ ] Personnages nommés qui donnent des missions (avec le bloc 8)

**Plus tard**

- [ ] Routines (aller au travail le matin, au bar le soir)
- [ ] PNJ qui interagissent entre eux (disputes, conversations)

**Dépend de** : 1, 2. **Fichiers** : `src/sim/systems/pedestrians/`, `src/data/npcTypes/`, `src/game/render/pedestrianActors.ts` (avec `pedestrianModel.ts`, `pedestrianAppearance.ts`).
**Profil** : 🔧 ⭐⭐.
**Fini quand** : quand on fait n'importe quoi dans la rue, les gens fuient, râlent ou filment.

## 5. Trafic

**Objectif** : des rues animées, avec des voitures qu'on peut emprunter… ou percuter.

**V1**

- [ ] Voitures PNJ qui suivent le réseau routier (bloc 2), à droite de la chaussée
- [ ] Tourner aux carrefours, s'arrêter aux feux (plus ou moins bien)
- [ ] Éviter les obstacles, freiner derrière une voiture, klaxonner
- [ ] Réagir aux chocs : le conducteur sort et s'énerve, ou s'enfuit
- [ ] Apparition et disparition autour du joueur, densité par quartier

**Plus tard**

- [ ] Bus sur une ligne avec arrêts, camions de livraison
- [ ] Embouteillages volontaires au Centre

**Dépend de** : 2, 3. **Fichiers** : `src/sim/systems/traffic/` (réutilise le composant `vehicle` : **ajouter**, ne pas modifier `driving/`).
**Profil** : 🔧 ⭐⭐⭐.
**Fini quand** : on peut regarder un carrefour fonctionner tout seul pendant une minute sans voiture coincée.

## 6. Environnement interactif

**Objectif** : tout ce qui traîne peut servir de jouet.

**V1**

- [ ] Objets poussables ou destructibles : poubelles, barrières, cartons, cônes, bornes, étals
- [ ] Débris et effets (fumée, papiers qui volent) qui disparaissent après un moment
- [ ] Interactions : distributeur (argent ou boisson), cabine téléphonique (missions), borne d'arcade (mini-jeu absurde), porte de garage
- [ ] Objets placés depuis Tiled (calque d'objets)

**Plus tard**

- [ ] Bouches d'incendie qui arrosent, feux d'artifice, pièges à la Zone Pavillonnaire
- [ ] Objets à collectionner cachés dans la ville (nains de jardin dorés…)

**Dépend de** : 1, 2. **Fichiers** : `src/sim/systems/props/`, `src/data/props/`, `src/game/render/propRenderer.ts`.
**Profil** : 🔧🎨 ⭐⭐.
**Fini quand** : traverser le marché en voiture est un spectacle.

## 7. Police et recherche

**Objectif** : une pression qui monte, des poursuites drôles et tendues, une police zélée mais incompétente.

**V1**

- [ ] Jauge de recherche à 3 niveaux, qui monte selon les délits vus (par un PNJ ou un agent)
- [ ] Niveau 1 : un agent à pied qui poursuit et sermonne
- [ ] Niveau 2 : voitures de patrouille qui poursuivent et tentent de bloquer
- [ ] Niveau 3 : barrages routiers
- [ ] Perdre la police : sortir de leur champ de vision, se cacher, changer de voiture, garage de repeinte
- [ ] Se faire arrêter : amende, retour au commissariat, perte d'une partie de l'argent
- [ ] Répliques absurdes des agents (avec le bloc 9)

**Plus tard**

- [ ] Hélicoptère de police (une drone ridicule ?)
- [ ] Policiers corruptibles

**Dépend de** : 3, 4. **Fichiers** : `src/sim/systems/wanted/`, `src/sim/systems/police/`.
**Profil** : 🔧 ⭐⭐⭐.
**Fini quand** : une course-poursuite de niveau 2 dure une minute, se perd ou se gagne, et fait rire.

## 8. Missions

**Objectif** : des objectifs variés et absurdes, **écrits en données** pour en ajouter sans coder.

**V0**

- [x] Moteur de missions : étapes, objectifs (chaque type d'objectif est une brique enregistrée), conditions de réussite et d'échec (#9)
- [x] Format de mission en données (`src/data/missions/`), documenté dans `docs/missions.md` (#9)
- [x] Repères à l'écran (départ, objectif en cours) et panneau de mission avec chrono (#9)
- [ ] Une mission de livraison complète : prendre un colis, aller à un point, chrono (#13)

**V1**

- [ ] Briques d'objectifs : aller à, livrer, poursuivre, semer, récupérer un véhicule, provoquer N dégâts, survivre X secondes, parler à
- [ ] Contraintes : chrono, colis fragile, ne pas être vu, véhicule imposé
- [ ] Marqueurs à l'écran et sur la mini-carte, flèche de direction
- [ ] Écran de fin de mission (réussite drôle, échec drôle) et récompenses
- [ ] Environ 10 missions réparties dans les 4 quartiers, avec des donneurs de mission nommés

**Plus tard**

- [ ] Petits jobs à répétition (taxi, livraison de pizzas, dépanneuse)
- [ ] Une courte histoire principale (si décidée)

**Dépend de** : 1, 3. **Fichiers** : `src/sim/systems/missions/` (🔧), `src/data/missions/` (🎨).
**Profil** : 🔧🎨 ⭐⭐. **Se partage bien** : un développeur fait le moteur, l'autre écrit les missions.
**Fini quand** : on écrit une nouvelle mission en JSON, sans toucher au code, et elle se joue.

## 9. Dialogues et humour

**Objectif** : l'humour est un pilier. Chaque PNJ, panneau ou écran peut faire sourire.

**V1**

- [ ] Système de répliques par situation : PNJ bousculé, voiture volée, police, mission, klaxon…
- [ ] Banques de répliques en données (`src/data/barks/`), plusieurs variantes tirées au hasard (via `Rng`)
- [ ] Boîtes de dialogue des donneurs de mission (portrait + texte)
- [ ] Noms de lieux, enseignes, pubs, radios parodiques
- [ ] Une charte de ton dans `docs/ton.md` : ce qui est drôle pour nous, ce qu'on s'interdit

**Plus tard**

- [ ] Voix courtes (onomatopées, borborygmes) plutôt que des vraies voix
- [ ] Fil d'actu parodique de la ville qui commente les exploits du joueur

**Dépend de** : 4. **Fichiers** : `src/data/barks/`, `src/sim/systems/barks/`, `docs/ton.md`.
**Profil** : 🎨 ⭐ (surtout de l'écriture : parfait pour s'amuser).
**Fini quand** : on a ri au moins une fois en testant.

## 10. Interface (HUD, menus, téléphone)

**Objectif** : une interface claire, discrète et dans le ton.

**V0**

- [x] HUD : santé, argent, jauge de recherche (#11), avec des valeurs factices tant que les systèmes n'existent pas
- [ ] Indication d'interaction (« E : monter ») (#38)

**V1**

- [ ] Mini-carte et carte complète avec marqueurs
- [ ] Menu titre, pause, options (volume, touches)
- [ ] Téléphone du joueur : messages des contacts, missions disponibles, appli parodique
- [ ] Notifications (mission réussie, recherche perdue, argent gagné)
- [ ] Écran d'aide des commandes

**Plus tard**

- [ ] Remappage des touches, prise en charge de la manette
- [ ] Interface tactile (bloc 18)

**Dépend de** : 0. **Fichiers** : `src/game/hud/`.
**Profil** : 🔧🎨 ⭐⭐.
**Fini quand** : quelqu'un qui découvre le jeu comprend quoi faire sans explication.

## 11. Progression et économie

**Objectif** : une raison de continuer à jouer.

**V1**

- [x] L'argent du joueur dans la simulation : gagné (récompense des missions, `mission:succeeded`), dépensé, affiché par le HUD à la place de la valeur factice (#52)
- [ ] Argent gagné (missions, distributeurs, petits jobs) et perdu (amendes, hôpital, réparations)
- [ ] Réputation par quartier, qui débloque contacts et missions
- [ ] Planque : point de sauvegarde et garage pour stocker un véhicule
- [ ] Boutiques : véhicules et pièces (bloc **19**), tenues (bloc **20**)
- [ ] Prix et gains dans `TUNING`, équilibrés pour une V1 d'environ 2 heures

**Plus tard**

- [ ] Succès et défis parodiques
- [ ] Statistiques du joueur (voitures volées, distance parcourue, amendes payées)

**Dépend de** : 8. **Fichiers** : `src/sim/systems/economy/`, `src/data/shops/`.
**Profil** : 🔧🎨 ⭐⭐.
**Fini quand** : on a un objectif d'achat en tête après chaque mission.

## 12. Sauvegarde

**Objectif** : ne jamais perdre sa partie.

**V1**

- [ ] Sauvegarde locale dans le navigateur (IndexedDB), à la planque et automatiquement après une mission
- [ ] Format versionné avec migrations : une vieille sauvegarde se charge toujours (repris de GRINTA)
- [ ] Plusieurs emplacements de sauvegarde
- [ ] Export et import d'un fichier de sauvegarde (utile pour déboguer)

**Plus tard**

- [ ] Sauvegarde en ligne liée à un compte (bloc 17)

**Dépend de** : 11. **Fichiers** : `src/sim/save.ts`, `src/game/saves.ts`.
**Profil** : 🔧 ⭐.
**Fini quand** : on ferme le navigateur, on revient, et tout est là.

## 13. Audio

**Objectif** : un son qui renforce le fun et l'humour.

**V1**

- [ ] Effets : pas, moteurs, chocs, klaxons, explosions, sirènes, interface
- [ ] Ambiance par quartier (mouettes aux Docks, tondeuses à la Zone Pavillonnaire)
- [ ] Radios dans les voitures : 2 ou 3 stations parodiques (musiques libres + jingles absurdes)
- [ ] Réglages de volume (général, musique, effets)

**Dépend de** : 0. **Fichiers** : `public/assets/audio/`, `src/game/audio.ts`.
**Profil** : 🎨 ⭐.
**Fini quand** : le jeu sans le son paraît vide.

## 14. Graphismes et assets

**Objectif** : un style 100 % cohérent, généré par IA, sans bloquer le développement. Référence : [style.md](style.md).

**V0**

- [x] Reprendre et adapter les scripts de GRINTA (`scripts/art/gen-image.mjs`, `pixelize.mjs`), `assets/raw/` dans `.gitignore` (#15)
- [ ] Confirmer la grille de 32 × 32 px et la palette (#4)
- [x] Générer et valider les **planches bible** : personnages, portraits, véhicules, sol, bâtiments, scène (#4)
- [ ] Tuiles du premier quartier (Centre) et quelques objets, pour le premier quartier dans Tiled
- [ ] Sprite du joueur (4 directions, marche) et une voiture

**V1**

- [ ] Portraits des personnages nommés (4 expressions chacun), fiches dans `docs/personnages.md`
- [ ] Planches de piétons par quartier, véhicules avec leurs 3 états, bâtiments et objets des 4 quartiers
- [ ] Effets (fumée, explosion, étincelles, gyrophare), icônes et cadres d'interface
- [ ] Écran titre et illustrations des fins de mission
- [ ] Page **Identité visuelle** dans le jeu (comme dans GRINTA) et `docs/registre-visuels.md` à jour

**Dépend de** : aucun (les scripts dépendent juste de Node). **Fichiers** : `scripts/art/`, `docs/bible/`, `public/assets/`, `docs/registre-visuels.md`.
**Profil** : 🎨 ⭐⭐. Se fait **en parallèle de tout le reste**, dans le budget fixé par `cmn00by`.
**Fini quand** : tout le jeu a l'air de venir du même univers, et n'importe qui peut produire un nouvel asset cohérent en suivant `style.md`.

## 15. Mise en ligne et admin

**Objectif** : chaque merge sur `main` met le jeu en ligne, et on peut le régler sans redéployer.

**V0**

- [x] Worker Cloudflare qui sert le jeu, connecté au repo (déploiement au merge, preview par PR) (#12)
- [x] `docs/deploiement.md` (#12)
- [x] `/api/` réservé au serveur du jeu, prêt pour les salons de la coop (#12)

**V1**

- [ ] Assets lourds servis depuis R2
- [ ] Panneau admin (Worker séparé, protégé par Cloudflare Access) : modifier les valeurs de `TUNING` et les publier
- [ ] Dans le panneau admin : éditer les types de PNJ (personnalité, vitesses, couleurs et accessoires de leur apparence), qui sont des données pures (`src/data/npcTypes`)
- [ ] Retours des joueurs : un formulaire dans le jeu, lu dans l'admin (D1)
- [ ] Mesure d'audience anonyme simple (D1)

**Dépend de** : 0. **Fichiers** : `worker/`, `wrangler.jsonc`, `src/admin/`.
**Profil** : 🔧 ⭐⭐.
**Fini quand** : un merge sur `main` met le jeu en ligne, et un réglage publié dans l'admin change le jeu sans redéploiement.

## 16. Coop (V2)

**Objectif** : jouer à 2 à 4 dans la même ville, en se rejoignant avec un code de partie.

- [ ] Salon de jeu dans un Durable Object (un salon = une partie)
- [ ] Connexion WebSocket, rejoindre avec un code : toutes les connexions du même code arrivent dans la même partie
- [ ] Plusieurs connexions par salon (2 à 4 joueurs), et reconnexion d'un joueur (coupure, autre appareil) sans perdre sa place
- [ ] Le serveur fait tourner la simulation (`src/sim`), les clients envoient leurs commandes
- [ ] Prédiction locale et correction, pour que ça reste fluide
- [ ] Missions en coop (un conduit, l'autre…)

**Dépend de** : V1 terminée, et la séparation simulation / affichage respectée partout.
**Fichiers** : `src/net/`, `worker/salon.ts`. Schéma : [deploiement.md](deploiement.md), section 5. **Profil** : 🔧 ⭐⭐⭐.

## 17. Mini online (V3)

**Objectif** : une ville partagée et persistante.

- [ ] Comptes (D1) et sauvegarde en ligne
- [ ] Classements (missions chronométrées, poursuites les plus longues)
- [ ] Ville persistante : les quartiers basculent selon l'activité de tous les joueurs
- [ ] Salons publics de quelques joueurs

**Dépend de** : 16. **Profil** : 🔧 ⭐⭐⭐.

## 18. Mobile

**Objectif** : jouable sur téléphone.

- [x] Joystick virtuel et boutons tactiles (courir ou frein à main, monter et descendre) qui produisent les mêmes commandes que le clavier (#20)
- [ ] Interface adaptée aux petits écrans
- [ ] Performances : tester sur un téléphone d'entrée de gamme

**Dépend de** : 10. **Profil** : 🔧🎨 ⭐⭐.

## 19. Garage : véhicules à soi et personnalisation

**Objectif** : l'aspect **matériel** d'un mini GTA. On achète ses voitures, on les retrouve au garage, on les transforme à son goût, et on a envie de les montrer.

**Comment** : les véhicules sont déjà des **blocs assemblés par le code** (voxel). Une personnalisation est donc **une recette en données** (couleurs et pièces) que l'affichage
assemble, comme l'apparence des piétons. Pas une image par variante : toutes les combinaisons sont possibles sans rien dessiner. Les **autocollants** (logos, flammes,
numéros de course) sont des images **générées par IA** puis pixelisées (chaîne de `docs/style.md`), plaquées sur le capot, le toit et les portières.

**V1**

- [x] Posséder des véhicules : la liste des véhicules du joueur (modèle + personnalisation), sauvegardable telle quelle (#53)
- [x] **Concession** sur la carte (un repère comme les missions) : choisir un modèle, voir son prix et ses réglages, l'acheter (#53)
- [x] **Garage** (lié à la planque du bloc 11) : y ranger un véhicule, en ressortir un ; un véhicule volé peut y être gardé (#53)
- [ ] **Atelier** : peinture (palette, deux tons, bandes), jantes, aileron, galerie de toit, pare-buffle, pot d'échappement, néons sous la caisse (beaux de nuit), klaxons ridicules (#54)
- [ ] **Performances** : moteur, freins, adhérence, qui modifient les réglages du modèle (bornés, en données) (#54)
- [x] Bâtiments à part pour la concession (vitrine, enseigne) et le garage (porte basculante, enseigne), qui s'allument la nuit (#53)
- [ ] Écran d'atelier : aperçu de la voiture qui tourne, essai des pièces avant d'acheter (#54)
- [ ] Pièces et prix en données (`src/data/vehicleParts/`), validés par les tests (#54)
- [ ] Autocollants générés par IA, à poser sur la voiture (#55)

**Plus tard**

- [ ] Garage de repeinte qui fait baisser la recherche (bloc 7)
- [ ] Assurance parodique : récupérer sa voiture détruite contre une franchise absurde
- [ ] Montrer sa voiture en coop (bloc 16)

**Dépend de** : 3, 11. **Fichiers** : `src/sim/systems/garage/`, `src/data/vehicleParts/`, `src/game/render/vehicleModel.ts`, `src/game/hud/` (écrans).
**Profil** : 🔧🎨 ⭐⭐⭐.
**Fini quand** : après une mission, on court à l'atelier mettre des néons roses sur sa voiture de mamie.

## 20. Personnage : création et garde-robe

**Objectif** : un personnage **à soi**, qu'on crée au début et qu'on habille au fil de la partie.

**Comment** : le joueur est assemblé **comme les piétons** : une apparence en données (teint, cheveux, haut, bas, accessoire, taille), que l'affichage assemble.
Créer son personnage = choisir ces valeurs au lieu de les tirer au hasard ; une tenue achetée = une pièce de plus dans la liste.

**V1**

- [ ] Le joueur utilise le même modèle que les piétons (`pedestrianModel.ts`), avec son apparence à lui, sauvegardée (#56)
- [ ] Création au premier lancement : teint, coiffure et couleur, haut, bas, accessoire ; aperçu qui tourne ; bouton « au hasard » (#56)
- [ ] **Boutique de vêtements** sur la carte : tenues ridicules (costume de hot-dog, survêtement doré, casque de chantier…), en données (`src/data/outfits/`) (#57)
- [ ] Garde-robe à la planque : changer de tenue (#57)
- [ ] Nouvelles pièces de modèle : coiffures, chapeaux, lunettes, sacs (le modèle en blocs les assemble) (#56)

**Plus tard**

- [ ] Tenues qui ont un effet (gilet fluo : la police vous laisse tranquille quelques secondes)
- [ ] Les PNJ commentent votre tenue (bloc 9)
- [ ] Se reconnaître entre joueurs en coop (bloc 16)

**Dépend de** : 4 (le modèle des piétons), 11. **Fichiers** : `src/data/outfits/`, `src/game/render/pedestrianModel.ts`, `src/game/hud/` (écrans).
**Profil** : 🔧🎨 ⭐⭐.
**Fini quand** : on reconnaît son personnage au premier coup d'œil, et on a une tenue préférée.

---

## Répartition du prototype (V0) : le code d'abord

**Décision du 2026-11-15** : on code d'abord le prototype **sans visuels**. Le jeu tourne avec des formes de couleur
(rectangles pour les voitures, cercles pour les piétons, carte de test simple). Les visuels (#4) et la carte Tiled (#5) viendront ensuite,
et remplaceront les formes **sans toucher à la simulation**, grâce à l'architecture en briques.

| Phase         | cmn00by                                                            | Baghorror12                                                                                                    |
| ------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| **1**         | **#2 Initialiser le projet** (outils, dossiers, garde-fous)        | **#3 Le noyau** (à commencer dès que #2 est mergée ; en attendant, lire `architecture.md` et `conventions.md`) |
| **2**         | **#6 Carte de test** (sans Tiled pour l'instant) + **#8 Conduite** | **#10 Piétons** (la #7 n'attend plus que les visuels)                                                          |
| **3**         | **#9 Moteur de missions**                                          | **#11 HUD** + **#21 Clavier ZQSD = WASD**                                                                      |
| **4**         | **#12 Mise en ligne**                                              | **#13 Première mission** en données                                                                            |
| **Plus tard** | **#4 Identité visuelle** (bible, scripts prêts dans `scripts/art`) | **#5 Premier quartier dans Tiled** + **#7 Animations à pied**                                                  |

Chaque phase donne à chacun des dossiers différents, donc peu de conflits. La seule dépendance forte : **#3 attend #2**.

## Tenir ce document à jour

- Quand une case devient une issue, ajouter son numéro : `- [ ] Klaxon (#23)`.
- Quand l'issue est fermée, cocher la case.
- Un nouveau besoin découvert → l'ajouter au bon bloc, dans la même PR que le code ou dans une PR `docs/`.
- Remplir la colonne **Responsable** de la vue d'ensemble au fil de la répartition.
