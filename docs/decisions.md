# Décisions

Les choix importants du projet : ce qu'on a choisi, ce qu'on a écarté, et pourquoi.
Une nouvelle décision s'ajoute **en haut**. Une décision remise en cause n'est pas effacée : on ajoute une nouvelle entrée qui la remplace.

---

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

## 2026-11-15 : Graphismes

**Choix** : packs **CC0** (Kenney) pour la ville et les véhicules dès le prototype ; **génération IA** (OpenRouter) réservée aux portraits et illustrations,
avec un budget fixé par le propriétaire du repo.

**Raison** : coder sans attendre les graphismes ; l'IA peine à produire des tuiles qui se raccordent, mais réussit bien les images uniques.
