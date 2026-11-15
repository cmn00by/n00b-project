# Décisions

Les choix importants du projet : ce qu'on a choisi, ce qu'on a écarté, et pourquoi.
Une nouvelle décision s'ajoute **en haut**. Une décision remise en cause n'est pas effacée : on ajoute une nouvelle entrée qui la remplace.

---

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

## 2026-11-15 : Stack technique (proposition, à valider)

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
