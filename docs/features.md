# Fonctionnalités : le jeu découpé en blocs

Ce document liste **tout ce qui est attendu**, bloc par bloc, pour se répartir le travail.
Le **pourquoi** est dans [GDD.md](GDD.md). Ici, c'est le **quoi** : chaque case à cocher devient une issue sur le [tableau](https://github.com/users/cmn00by/projects/3).

## Comment lire ce document

Chaque bloc donne :

- **Objectif** : ce que le joueur doit ressentir.
- **Fonctionnalités** par étape : **V0** (prototype), **V1** (solo complet), **Plus tard** (coop, online, mobile, bonus).
- **Dépend de** : les blocs à faire avant.
- **Fichiers** : où vit le code, pour savoir si deux personnes risquent de se marcher dessus.
- **Profil** : 🔧 *moteur* (logique, algos, maths) ou 🎨 *contenu* (carte, données, textes, assets), et la difficulté ⭐ à ⭐⭐⭐.
- **Fini quand** : ce qu'on doit constater en jouant.

**Règle de répartition** : deux personnes ne prennent pas deux blocs qui touchent les mêmes fichiers en même temps.

## Vue d'ensemble

| # | Bloc | Profil | Difficulté | Dépend de | Responsable |
|---|---|---|---|---|---|
| 0 | [Socle technique](#0-socle-technique) | 🔧 | ⭐⭐ | aucun | _à attribuer_ |
| 1 | [Déplacement à pied](#1-déplacement-à-pied) | 🔧 | ⭐ | 0 | _à attribuer_ |
| 2 | [Ville et carte](#2-ville-et-carte) | 🎨 | ⭐⭐ | 0 | _à attribuer_ |
| 3 | [Conduite et véhicules](#3-conduite-et-véhicules) | 🔧 | ⭐⭐⭐ | 1, 2 | _à attribuer_ |
| 4 | [PNJ piétons](#4-pnj-piétons) | 🔧 | ⭐⭐ | 1, 2 | _à attribuer_ |
| 5 | [Trafic](#5-trafic) | 🔧 | ⭐⭐⭐ | 2, 3 | _à attribuer_ |
| 6 | [Environnement interactif](#6-environnement-interactif) | 🔧🎨 | ⭐⭐ | 1, 2 | _à attribuer_ |
| 7 | [Police et recherche](#7-police-et-recherche) | 🔧 | ⭐⭐⭐ | 3, 4 | _à attribuer_ |
| 8 | [Missions](#8-missions) | 🔧🎨 | ⭐⭐ | 1, 3 | _à attribuer_ |
| 9 | [Dialogues et humour](#9-dialogues-et-humour) | 🎨 | ⭐ | 4 | _à attribuer_ |
| 10 | [Interface (HUD, menus, téléphone)](#10-interface-hud-menus-téléphone) | 🔧🎨 | ⭐⭐ | 0 | _à attribuer_ |
| 11 | [Progression et économie](#11-progression-et-économie) | 🔧🎨 | ⭐⭐ | 8 | _à attribuer_ |
| 12 | [Sauvegarde](#12-sauvegarde) | 🔧 | ⭐ | 11 | _à attribuer_ |
| 13 | [Audio](#13-audio) | 🎨 | ⭐ | 0 | _à attribuer_ |
| 14 | [Graphismes et assets](#14-graphismes-et-assets) | 🎨 | ⭐ | aucun | _à attribuer_ |
| 15 | [Mise en ligne et admin](#15-mise-en-ligne-et-admin) | 🔧 | ⭐⭐ | 0 | _à attribuer_ |
| 16 | [Coop](#16-coop-v2) | 🔧 | ⭐⭐⭐ | V1 finie | plus tard |
| 17 | [Mini online](#17-mini-online-v3) | 🔧 | ⭐⭐⭐ | 16 | plus tard |
| 18 | [Mobile](#18-mobile) | 🔧🎨 | ⭐⭐ | 10 | plus tard |

### L'ordre de construction

```
0 Socle ──┬─► 1 À pied ──┬─► 3 Conduite ──┬─► 5 Trafic
          │              │                ├─► 7 Police ◄── 4 PNJ
          ├─► 2 Ville ───┤                └─► 8 Missions ─► 11 Progression ─► 12 Sauvegarde
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
- [ ] Projet Vite + TypeScript + Phaser 3, `npm run dev` affiche une scène vide (#2)
- [ ] Vitest configuré, un premier test qui passe (#2)
- [ ] Prettier configuré (style du `CLAUDE.md`) (#2)
- [ ] Structure des dossiers `src/sim`, `src/game`, `src/data` (voir `CLAUDE.md`) (#2)
- [ ] `Rng` déterministe (`src/sim/rng.ts`) avec ses tests (#3)
- [ ] Boucle à pas fixe : `step(world, commands, dt)`, affichage interpolé (#3)
- [ ] Système de commandes (`src/sim/commands.ts`) et lecture clavier → commandes (#3)
- [ ] `TUNING` (`src/sim/config.ts`) (#3)
- [ ] Caméra qui suit une cible, zoom pixel art net (#3)

**Plus tard**
- [ ] Mode debug : afficher les collisions, les chemins des PNJ, les FPS (touche F3)
- [ ] Rejouer une partie à partir de la graine et des commandes enregistrées

**Fichiers** : `src/sim/{rng,config,commands,world,types}.ts`, `src/game/scenes/`, `src/game/input/`, config du projet.
**Profil** : 🔧 ⭐⭐. À faire **en premier, par une seule personne**, car tout le monde en dépend.
**Fini quand** : un carré se déplace au clavier dans une scène, la caméra le suit, et `npm test` passe.

## 1. Déplacement à pied

**Objectif** : se déplacer dans la ville doit être agréable et réactif.

**V0**
- [ ] Marcher dans 8 directions, courir (touche maintenue) (#7)
- [ ] Collisions avec les murs et bâtiments de la carte (#7)
- [ ] Animation de marche et de course (4 directions minimum) (#7)

**V1**
- [ ] Frapper (coup de poing cartoon), recevoir des coups, santé
- [ ] Ramasser, porter et lancer un objet léger
- [ ] Bouton d'interaction contextuel (« E : parler », « E : monter »)
- [ ] Chute KO comique, puis réapparition à l'hôpital (avec facture)

**Plus tard**
- [ ] Sauter par-dessus les petits obstacles, plonger pour esquiver une voiture

**Dépend de** : 0. **Fichiers** : `src/sim/entities/player.ts`, `src/sim/systems/movement.ts`, `src/game/render/player.ts`.
**Profil** : 🔧 ⭐ (bon premier bloc pour apprendre la structure).
**Fini quand** : on parcourt un quartier à pied sans traverser les murs, et on peut ramasser une poubelle et la lancer.

## 2. Ville et carte

**Objectif** : une ville petite mais dense, lisible, pleine de détails drôles.

**V0**
- [ ] Choix du jeu de tuiles (voir bloc 14) et de la taille (16×16 ou 32×32) (#4)
- [ ] Un quartier dans **Tiled** : routes, trottoirs, bâtiments, calques de collision (#5)
- [ ] Chargement de la carte Tiled dans Phaser, collisions branchées sur la simulation (#6)
- [ ] Calques d'objets dans Tiled : points d'apparition, zones, portes (#5)

**V1**
- [ ] Les 4 quartiers : Centre, Docks, Zone Pavillonnaire, Colline
- [ ] Le réseau routier décrit pour le trafic : voies, sens, carrefours, feux (calque Tiled dédié)
- [ ] Zones de quartier (pour la réputation, les PNJ, la musique)
- [ ] Noms de rues et lieux parodiques, panneaux et pubs absurdes
- [ ] Mini-carte et carte complète (avec le bloc 10)

**Plus tard**
- [ ] Intérieurs simples (planque, garage, boutiques)
- [ ] Cycle jour / nuit (éclairage, PNJ différents la nuit)
- [ ] Météo (pluie qui rend la route glissante)

**Dépend de** : 0. **Fichiers** : `public/maps/`, `src/game/scenes/City.ts`, `src/sim/map.ts`, `src/data/places.ts`.
**Profil** : 🎨 ⭐⭐ (surtout du travail dans Tiled, peu de code). **Idéal en parallèle des blocs 0 et 1.**
**Fini quand** : on charge un quartier complet, routes et bâtiments sont cohérents, et les collisions tombent juste.

## 3. Conduite et véhicules

**Objectif** : conduire doit être **fun avant d'être réaliste** : dérapages, chocs, chaos.

**V0**
- [ ] Monter et descendre d'une voiture (bouton d'interaction) (#8)
- [ ] Physique arcade : accélération, freinage, marche arrière, direction, frein à main, dérapage (#8)
- [ ] Collisions voiture / bâtiments / objets / autres voitures (#8)
- [ ] Caméra qui recule avec la vitesse (#8)

**V1**
- [ ] 5 ou 6 modèles avec des réglages différents (en données : `src/data/vehicles.ts`) : voiture de mamie, camionnette, sportive, voiturette de golf, bus, police
- [ ] Voler une voiture occupée : le conducteur est éjecté et proteste (avec le bloc 9)
- [ ] Dégâts visibles (fumée, carrosserie), puis panne, puis explosion comique
- [ ] Renverser un piéton : il est projeté de façon cartoon, se relève et râle (pas de violence réaliste)
- [ ] Klaxon (et les PNJ réagissent)
- [ ] Radio : changer de station (avec le bloc 13)

**Plus tard**
- [ ] Deux-roues (scooter, vélo de livraison)
- [ ] Personnalisation au garage (peinture, klaxons ridicules)

**Dépend de** : 1, 2. **Fichiers** : `src/sim/entities/vehicle.ts`, `src/sim/systems/driving.ts`, `src/data/vehicles.ts`, `src/game/render/vehicle.ts`.
**Profil** : 🔧 ⭐⭐⭐ (le cœur du jeu : à soigner et à régler longtemps).
**Fini quand** : on a envie de faire le tour du quartier en voiture juste pour s'amuser à déraper.

## 4. PNJ piétons

**Objectif** : la ville a l'air vivante et **réagit** à ce que fait le joueur.

**V0**
- [ ] Piétons qui apparaissent autour du joueur et disparaissent hors champ (pas de PNJ simulés partout) (#10)
- [ ] Marche sur les trottoirs, d'un point à un autre (#10)
- [ ] Machine à états simple : se promener, s'arrêter, fuir (#10)

**V1**
- [ ] Réactions : peur (fuir), colère (insulter, frapper), curiosité (s'approcher), filmer avec son téléphone
- [ ] Appeler la police quand ils voient un délit (avec le bloc 7)
- [ ] Types de PNJ par quartier (dockers, retraités, golfeurs, touristes…) avec un comportement propre
- [ ] Bulles de texte au-dessus des PNJ (avec le bloc 9)
- [ ] Personnages nommés qui donnent des missions (avec le bloc 8)

**Plus tard**
- [ ] Routines (aller au travail le matin, au bar le soir)
- [ ] PNJ qui interagissent entre eux (disputes, conversations)

**Dépend de** : 1, 2. **Fichiers** : `src/sim/entities/pedestrian.ts`, `src/sim/systems/ai.ts`, `src/data/npcTypes.ts`.
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

**Dépend de** : 2, 3. **Fichiers** : `src/sim/systems/traffic.ts`, `src/sim/entities/vehicle.ts` (partagé avec le bloc 3 : **se coordonner**).
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

**Dépend de** : 1, 2. **Fichiers** : `src/sim/entities/prop.ts`, `src/data/props.ts`, `src/game/render/props.ts`.
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

**Dépend de** : 3, 4. **Fichiers** : `src/sim/systems/wanted.ts`, `src/sim/entities/police.ts`.
**Profil** : 🔧 ⭐⭐⭐.
**Fini quand** : une course-poursuite de niveau 2 dure une minute, se perd ou se gagne, et fait rire.

## 8. Missions

**Objectif** : des objectifs variés et absurdes, **écrits en données** pour en ajouter sans coder.

**V0**
- [ ] Moteur de missions : étapes, objectifs, conditions de réussite et d'échec (#9)
- [ ] Format de mission en données (`src/data/missions/`), documenté dans `docs/missions.md` (#9)
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

**Dépend de** : 1, 3. **Fichiers** : `src/sim/systems/missions.ts` (🔧), `src/data/missions/` (🎨).
**Profil** : 🔧🎨 ⭐⭐. **Se partage bien** : un développeur fait le moteur, l'autre écrit les missions.
**Fini quand** : on écrit une nouvelle mission en JSON, sans toucher au code, et elle se joue.

## 9. Dialogues et humour

**Objectif** : l'humour est un pilier. Chaque PNJ, panneau ou écran peut faire sourire.

**V1**
- [ ] Système de répliques par situation : PNJ bousculé, voiture volée, police, mission, klaxon…
- [ ] Banques de répliques en données (`src/data/lines/`), plusieurs variantes tirées au hasard (via `Rng`)
- [ ] Boîtes de dialogue des donneurs de mission (portrait + texte)
- [ ] Noms de lieux, enseignes, pubs, radios parodiques
- [ ] Une charte de ton dans `docs/ton.md` : ce qui est drôle pour nous, ce qu'on s'interdit

**Plus tard**
- [ ] Voix courtes (onomatopées, borborygmes) plutôt que des vraies voix
- [ ] Fil d'actu parodique de la ville qui commente les exploits du joueur

**Dépend de** : 4. **Fichiers** : `src/data/lines/`, `src/sim/systems/barks.ts`, `docs/ton.md`.
**Profil** : 🎨 ⭐ (surtout de l'écriture : parfait pour s'amuser).
**Fini quand** : on a ri au moins une fois en testant.

## 10. Interface (HUD, menus, téléphone)

**Objectif** : une interface claire, discrète et dans le ton.

**V0**
- [ ] HUD : santé, argent, jauge de recherche (#11)
- [ ] Indication d'interaction (« E : monter ») (#11)

**V1**
- [ ] Mini-carte et carte complète avec marqueurs
- [ ] Menu titre, pause, options (volume, touches)
- [ ] Téléphone du joueur : messages des contacts, missions disponibles, appli parodique
- [ ] Notifications (mission réussie, recherche perdue, argent gagné)
- [ ] Écran d'aide des commandes

**Plus tard**
- [ ] Remappage des touches, prise en charge de la manette
- [ ] Interface tactile (bloc 18)

**Dépend de** : 0. **Fichiers** : `src/game/scenes/Hud.ts`, `src/game/ui/`.
**Profil** : 🔧🎨 ⭐⭐.
**Fini quand** : quelqu'un qui découvre le jeu comprend quoi faire sans explication.

## 11. Progression et économie

**Objectif** : une raison de continuer à jouer.

**V1**
- [ ] Argent gagné (missions, distributeurs, petits jobs) et perdu (amendes, hôpital, réparations)
- [ ] Réputation par quartier, qui débloque contacts et missions
- [ ] Planque : point de sauvegarde et garage pour stocker un véhicule
- [ ] Boutiques : véhicules, tenues ridicules, améliorations
- [ ] Prix et gains dans `TUNING`, équilibrés pour une V1 d'environ 2 heures

**Plus tard**
- [ ] Succès et défis parodiques
- [ ] Statistiques du joueur (voitures volées, distance parcourue, amendes payées)

**Dépend de** : 8. **Fichiers** : `src/sim/systems/economy.ts`, `src/data/shops.ts`.
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

**Objectif** : un style cohérent, sans bloquer le développement.

**V0**
- [ ] Choisir les packs CC0 de base (Kenney : ville, véhicules et personnages en vue de dessus) et noter leurs licences dans `docs/credits.md` (#4)
- [ ] Organisation de `public/assets/` et chargement centralisé des clés (#4)

**V1**
- [ ] Palette et charte visuelle dans `docs/style.md`
- [ ] Portraits des personnages nommés (génération IA, budget fixé par le propriétaire du repo)
- [ ] Écran titre et illustrations des fins de mission
- [ ] Effets visuels : fumée, étincelles, débris, éclairs de sirène

**Plus tard**
- [ ] Remplacer progressivement par des graphismes maison

**Dépend de** : aucun. **Fichiers** : `public/assets/`, `docs/credits.md`, `docs/style.md`.
**Profil** : 🎨 ⭐. Se fait **en parallèle de tout le reste**.
**Fini quand** : tout le jeu a l'air de venir du même univers.

## 15. Mise en ligne et admin

**Objectif** : chaque merge sur `main` met le jeu en ligne, et on peut le régler sans redéployer.

**V0**
- [ ] Worker Cloudflare qui sert le jeu, connecté au repo (déploiement au merge, preview par PR) (#12)
- [ ] `docs/deploiement.md` (#12)

**V1**
- [ ] Assets lourds servis depuis R2
- [ ] Panneau admin (Worker séparé, protégé par Cloudflare Access) : modifier les valeurs de `TUNING` et les publier
- [ ] Retours des joueurs : un formulaire dans le jeu, lu dans l'admin (D1)
- [ ] Mesure d'audience anonyme simple (D1)

**Dépend de** : 0. **Fichiers** : `worker/`, `wrangler.jsonc`, `src/admin/`.
**Profil** : 🔧 ⭐⭐.
**Fini quand** : un merge sur `main` met le jeu en ligne, et un réglage publié dans l'admin change le jeu sans redéploiement.

## 16. Coop (V2)

**Objectif** : jouer à 2 à 4 dans la même ville, en se rejoignant avec un code de partie.

- [ ] Salon de jeu dans un Durable Object (un salon = une partie)
- [ ] Connexion WebSocket, rejoindre avec un code
- [ ] Le serveur fait tourner la simulation (`src/sim`), les clients envoient leurs commandes
- [ ] Prédiction locale et correction, pour que ça reste fluide
- [ ] Missions en coop (un conduit, l'autre…)

**Dépend de** : V1 terminée, et la séparation simulation / affichage respectée partout.
**Fichiers** : `src/net/`, `worker/room.ts`. **Profil** : 🔧 ⭐⭐⭐.

## 17. Mini online (V3)

**Objectif** : une ville partagée et persistante.

- [ ] Comptes (D1) et sauvegarde en ligne
- [ ] Classements (missions chronométrées, poursuites les plus longues)
- [ ] Ville persistante : les quartiers basculent selon l'activité de tous les joueurs
- [ ] Salons publics de quelques joueurs

**Dépend de** : 16. **Profil** : 🔧 ⭐⭐⭐.

## 18. Mobile

**Objectif** : jouable sur téléphone.

- [ ] Joystick virtuel et boutons tactiles qui produisent les mêmes commandes que le clavier
- [ ] Interface adaptée aux petits écrans
- [ ] Performances : tester sur un téléphone d'entrée de gamme

**Dépend de** : 10. **Profil** : 🔧🎨 ⭐⭐.

---

## Proposition de répartition pour le prototype (V0)

| Phase | cmn00by | Baghorror12 |
|---|---|---|
| 1 | **0. Socle technique** (#2, #3) | **14. Choix des assets** (#4) + **2. Premier quartier dans Tiled** (#5) |
| 2 | **3. Conduite** (#8) + **2. Chargement de la carte** (#6) | **1. Déplacement à pied** (#7, bon premier bloc de code) |
| 3 | **8. Moteur de missions** (#9) | **4. Piétons** (#10) + **10. HUD** (#11) |
| 4 | **15. Mise en ligne** (#12) | **8. Écrire la première mission** en données (#13) |

Cette répartition donne à chacun des fichiers différents à chaque phase, donc peu de conflits.
À ajuster ensemble : c'est une proposition, pas une obligation.

## Tenir ce document à jour

- Quand une case devient une issue, ajouter son numéro : `- [ ] Klaxon (#23)`.
- Quand l'issue est fermée, cocher la case.
- Un nouveau besoin découvert → l'ajouter au bon bloc, dans la même PR que le code ou dans une PR `docs/`.
- Remplir la colonne **Responsable** de la vue d'ensemble au fil de la répartition.
