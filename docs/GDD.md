# GDD : n00b-project

> Document de game design. Il décrit **ce qu'on fait et pourquoi**. Le **comment** technique est dans `architecture.md` et `decisions.md`.
> Statut : **brouillon v0.1**, à valider à deux. Tout ce qui est marqué _(à trancher)_ reste ouvert.

## 1. Le pitch

Un **mini monde ouvert en vue de dessus**, en pixel art, dans une **ville parodique** qui ne se prend pas au sérieux.
Tu débarques à **Bourg-la-Bricole** _(nom provisoire)_, une petite ville où tout le monde a une combine, et tu enchaînes
les petits boulots louches, les livraisons absurdes et les courses-poursuites avec une police aussi zélée qu'incompétente.

**Trois mots** : liberté, chaos, humour.

**Inspirations de genre** : les jeux de ville libre en vue de dessus des années 90, l'humour des parodies.
Univers, noms, lieux et personnages **100 % originaux** : aucune référence à une licence existante.

## 2. Les piliers

1. **La ville réagit** : les PNJ parlent, râlent, fuient, filment, appellent la police. Les objets se cassent, se poussent, se ramassent.
2. **L'humour partout** : dialogues, noms de rues, missions, pubs, radios. Une blague par écran au minimum.
3. **Tout de suite fun** : en 30 secondes, on conduit, on fait n'importe quoi, et la ville répond.
4. **Pensé pour jouer à plusieurs** : solo d'abord, mais le moteur est construit dès le début pour la coop puis le mini online.

## 3. La boucle de jeu

```
Explorer la ville ──► Trouver un boulot (PNJ, téléphone, panneau)
       ▲                        │
       │                        ▼
 Dépenser (planque,     Réaliser la mission (conduire, livrer,
 voitures, tenues)       échapper à la police, improviser)
       ▲                        │
       └──── Argent + réputation ◄┘
```

- **Boucle courte (minutes)** : une mission, ou du chaos libre qui fait monter la jauge de recherche.
- **Boucle moyenne (heures)** : débloquer des quartiers, des véhicules, des contacts.
- **Boucle longue** : devenir la légende (ou la honte) de la ville. _(à trancher : une petite histoire principale ?)_

## 4. Le contenu de la V1 (solo, PC)

Objectif : **une petite ville jouable de bout en bout**, pas un gros jeu inachevé.

### La ville

- **4 quartiers** à l'ambiance distincte, par exemple :
  - **Le Centre** : mairie, boutiques, embouteillages permanents.
  - **Les Docks** : entrepôts, conteneurs, trafics en tout genre.
  - **La Zone Pavillonnaire** : voisins vigilants, nains de jardin, barbecues.
  - **La Colline** : villas, golf, gens riches et très susceptibles.
- Une carte en tuiles, éditée avec **Tiled**, d'environ 2 à 3 minutes de traversée en voiture.

### Le joueur

- À pied : marcher, courir, frapper, ramasser et lancer un objet, parler.
- En voiture : monter, voler (le conducteur PNJ proteste), conduire, klaxonner, sortir.
- Santé, argent, jauge de recherche.

### Les véhicules

- 5 ou 6 modèles parodiques (voiture de mamie, camionnette de livraison, sportive tape-à-l'œil, voiturette de golf, bus, police).
- Conduite arcade : dérapages, chocs, dégâts visibles, explosion comique.

### Les PNJ

- **Piétons** avec une petite IA à états : se promener, réagir (peur, colère, curiosité), fuir, appeler la police, filmer avec leur téléphone.
- **Personnages nommés** qui donnent des missions, avec des dialogues courts et drôles.
- **Trafic** qui suit les routes, s'arrête aux feux (plus ou moins), klaxonne, et s'énerve.

### L'environnement interactif

- Objets destructibles ou déplaçables : poubelles, bornes, barrières, cabines, étals de marché.
- Interactions simples : distributeurs, cabines téléphoniques, portes de garage, bornes d'arcade.
- Un cycle jour / nuit léger _(à trancher : V1 ou plus tard)_.

### Les missions (environ 10 en V1)

Construites à partir de **briques réutilisables** décrites en données (JSON), pour qu'on puisse en écrire sans coder :

- **Livraison** : aller de A à B, avec contraintes (chrono, colis fragile, ne pas être vu).
- **Poursuite** : rattraper ou semer quelqu'un.
- **Récupération** : voler un véhicule ou un objet et le ramener.
- **Chaos** : provoquer N dégâts en X secondes.
- **Absurde** : promener le chien du maire, livrer une pizza en voiture de golf…

### La police

- Jauge de recherche à **3 niveaux** (contre 5 dans les jeux du genre, pour rester simple) : 1. un agent à pied, 2. voitures de patrouille, 3. barrages.
- On la fait baisser en se cachant, en changeant de voiture, ou en passant par un garage de repeinte.

### La progression

- Argent : acheter une planque, des véhicules, des tenues ridicules.
- **L'aspect matériel** : ses voitures à soi, rangées au garage et **personnalisées** à l'atelier (peinture, pièces, néons, performances, autocollants), et un **personnage à soi**,
  créé au début et habillé à la boutique. Tout est en **voxel assemblé par le code** : chaque combinaison est possible sans dessiner d'image (blocs 19 et 20 de [features.md](features.md)).
- Réputation par quartier : débloque des contacts et des missions.
- Sauvegarde locale (navigateur), puis en ligne avec un compte.

## 5. Les étapes du projet

| Étape                | Contenu                                                           | Cloudflare utilisé                    |
| -------------------- | ----------------------------------------------------------------- | ------------------------------------- |
| **V0 : prototype**   | un quartier, marcher, conduire, quelques PNJ, une mission         | Workers (servir le jeu)               |
| **V1 : solo**        | 4 quartiers, ~10 missions, police, progression, sauvegarde locale | Workers, R2 (assets)                  |
| **V2 : coop**        | 2 à 4 joueurs dans la même ville, sur invitation (code de partie) | Durable Objects (salons temps réel)   |
| **V3 : mini online** | ville persistante partagée, classements, profils                  | D1 (comptes, scores), Durable Objects |
| **Mobile**           | commandes tactiles, interface adaptée                             | aucun en plus                         |

**Pourquoi la coop est réaliste** : un **Durable Object** = un salon de jeu, qui garde l'état d'une partie et relaie les actions des joueurs par WebSocket.
C'est inclus dans l'offre à 5 $. La condition, c'est que le moteur soit **pensé pour ça dès le prototype** (voir section 7).

## 6. Direction artistique

- **Pixel art en vue de dessus**, couleurs vives et saturées, contours marqués.
- Grille de **32 × 32 px** _(à confirmer)_, affichée en `pixelated` à l'échelle ×2 ou ×3. Détails dans [style.md](style.md).
- Interface façon téléphone et panneaux publicitaires parodiques.

### Production des graphismes

Tous les visuels sont **générés par IA (OpenRouter) puis pixelisés**, selon le guide [style.md](style.md) :
palette commune, blocs de prompt figés, tailles par catégorie, planches de référence (« bible ») jointes à chaque génération.

### Le son

- Effets : packs gratuits (Kenney, freesound en CC0).
- Radios parodiques dans les voitures : courtes boucles et jingles absurdes _(à trancher : voix générées ou texte affiché)_.

## 7. Contraintes techniques qui touchent au design

- **Navigateur, PC d'abord** : clavier + souris, et manette si c'est facile.
- **Mobile plus tard** : l'interface est pensée dès le début pour pouvoir accueillir des commandes tactiles (pas d'action qui exige 10 touches).
- **Prêt pour le multijoueur** :
  - la **simulation** (positions, règles, PNJ) est séparée de l'**affichage** ;
  - le jeu avance à **pas de temps fixe** ;
  - les actions des joueurs passent par des **commandes** (`accélérer`, `monter dans le véhicule`…) et pas par des appels directs.
    C'est ce qui permettra d'envoyer ces commandes à un serveur pour la coop sans tout réécrire.
- **Léger** : le jeu complet doit se charger vite (objectif : moins de 20 Mo d'assets en V1).

## 8. Ce qu'on ne fait PAS (pour finir le projet)

- Pas de 3D réaliste : de la 3D simple, dessinée en basse résolution, pour un rendu pixel art (voir `decisions.md`).
- Pas de grande histoire scénarisée en V1.
- Pas de ville immense : mieux vaut 4 quartiers vivants que 20 quartiers vides.
- Pas de violence réaliste ni de contenu choquant : le ton reste **cartoon et comique**.
- Pas de nom, lieu, personnage, musique ou logo issu d'un jeu, d'une marque ou d'une personne réels.

## 9. Questions ouvertes

- [ ] Le nom du jeu et de la ville.
- [ ] Confirmer la grille de 32 × 32 px (proposée dans `style.md`).
- [ ] Cycle jour / nuit en V1 ?
- [ ] Une petite histoire principale, ou uniquement des missions libres ?
- [ ] Armes : cartoon (tapette géante, pistolet à eau, lance-pizzas) ou pas d'armes du tout ?
- [ ] Budget OpenRouter alloué aux visuels.
