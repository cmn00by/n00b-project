# Identité visuelle et guide de génération

Ce document est **la référence unique** pour tout visuel du jeu : portraits, sprites, tuiles, véhicules, objets, interface, illustrations.
Toute génération d'image **part des blocs de prompt de ce document**, sans exception. Un visuel qui ne respecte pas ce guide n'entre pas dans le jeu.

> **Pour Claude** : avant de générer ou de proposer un prompt, lire ce document en entier. Assembler le prompt à partir des blocs
> [STYLE](#41-le-bloc-style-toujours-en-premier), [FOND](#42-le-bloc-fond), du bloc de la catégorie, puis de la description.
> Ne jamais réécrire un bloc « à sa façon ». Toujours joindre les images de référence prévues. Générer seulement avec un budget donné par le propriétaire du repo.

> **Rendu en jeu (depuis le 2026-11-16)** : le jeu est en **3D dessinée en basse résolution** (three.js, voir `docs/decisions.md`).
> Les **sols** et les **toits** (vus de dessus) sont des textures plaquées sur le sol et le dessus des immeubles ; les **façades** sont dessinées par le code ;
> la **déco** est affichée en découpes debout ; **personnages et véhicules** sont pour l'instant en **voxel** (blocs assemblés par le code).
> Les **portraits** de dialogue restent des images. Les règles de ce guide (palette, blocs de prompt, bible) s'appliquent à toutes les textures générées.

## Sommaire

1. [L'univers en une phrase](#1-lunivers-en-une-phrase)
2. [Les règles visuelles](#2-les-règles-visuelles)
3. [La palette](#3-la-palette)
4. [Les blocs de prompt](#4-les-blocs-de-prompt)
5. [Les catégories d'assets](#5-les-catégories-dassets)
6. [Les quartiers](#6-les-quartiers)
7. [La chaîne de production](#7-la-chaîne-de-production)
8. [Les références (« la bible »)](#8-les-références--la-bible-)
9. [Nommage et rangement](#9-nommage-et-rangement)
10. [Contrôle qualité](#10-contrôle-qualité)
11. [Budget et registre des générations](#11-budget-et-registre-des-générations)

---

## 1. L'univers en une phrase

**Une petite ville ensoleillée et un peu kitsch, vue d'en haut, en pixel art 16 bits aux couleurs vives, où tout est légèrement exagéré pour faire rire.**

Les mots-clés de l'univers : _ensoleillé, coloré, cartoon, kitsch, exagéré, bon enfant, rétro années 90._
Ce qu'il n'est **pas** : sombre, réaliste, gore, sale, néon cyberpunk, sérieux.

## 2. Les règles visuelles

Ces règles valent pour **toutes** les catégories. Elles sont déjà traduites dans le bloc STYLE.

| Règle                           | Valeur                                                                                                                                                                                | Pourquoi                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Style**                       | pixel art 16 bits, façon jeux de console de 1993-1996                                                                                                                                 | lisible, nostalgique, réalisable par l'IA                                          |
| **Unité de grille**             | **32 × 32 px** (1 tuile)                                                                                                                                                              | assez grand pour que l'IA garde des détails après réduction ; adoptée (#4)         |
| **Échelle à l'écran**           | automatique : la scène fait environ 540 px de haut (×2 en 1080p, ×3 en 1440p), toujours entier, `image-rendering: pixelated`                                                          | pixels nets, jamais flous, même finesse sur tous les écrans                        |
| **Perspective du monde**        | **vue de dessus « trois-quarts »** : le sol vu du dessus, les bâtiments, personnages et objets montrent leur **face sud** et leur **toit**                                            | standard des jeux en vue de dessus, plus lisible qu'une vue à la verticale stricte |
| **Perspective des véhicules**   | **vue strictement du dessus**, nez vers le **haut** (nord)                                                                                                                            | le jeu les fait pivoter : la vue de dessus tourne sans paraître fausse             |
| **Lumière**                     | soleil **en haut à gauche** ; ombres portées vers le bas à droite                                                                                                                     | cohérence de toutes les ombres                                                     |
| **Ombres portées**              | ovale ou forme **unie, sombre, sans dégradé** (couleur `ombre` de la palette)                                                                                                         | lisibles et simples à superposer                                                   |
| **Contour**                     | contour **sombre de 1 px** autour des personnages, véhicules et objets ; **pas de contour noir pur** (couleur `contour`). En 3D : une coque `contour` autour des personnages en blocs | détache les éléments du décor                                                      |
| **Tuiles de sol**               | **sans contour**, texture discrète                                                                                                                                                    | le sol ne doit pas voler la vedette                                                |
| **Ombrage**                     | 2 ou 3 tons par matière, **sans dégradé lisse, sans tramage** (dithering)                                                                                                             | rendu net, palette tenue                                                           |
| **Proportions des personnages** | **« chibi »** : tête grande (≈ 1/3 de la hauteur), corps trapu, membres courts                                                                                                        | humour et lisibilité à petite taille                                               |
| **Transparence**                | binaire : un pixel est opaque ou transparent, rien entre les deux                                                                                                                     | requis par le pixel art                                                            |
| **Couleurs**                    | palette du jeu uniquement (section 3), 48 couleurs max par image                                                                                                                      | cohérence entre toutes les images                                                  |
| **Texte dans les images**       | **jamais** : les enseignes et panneaux sont laissés vides, le texte est ajouté par le jeu                                                                                             | l'IA écrit mal, et on traduit plus facilement                                      |

## 3. La palette

> **Statut : proposée, à valider à deux (#4).** Cette palette est celle qu'utilisent déjà la bible et le jeu en 3D. Elle est adoptée quand cmn00by **et** Baghorror12
> ont approuvé la PR qui la fixe ; la décision est alors notée dans `docs/decisions.md`.

Une palette **commune à tout le jeu**, vive et chaude. Elle sert de référence dans les prompts et pour le contrôle qualité.
L'outil de réduction (section 7) peut forcer les images sur cette palette.

| Rôle            | Nom                                              | Hex                                                       |
| --------------- | ------------------------------------------------ | --------------------------------------------------------- |
| Contour         | `contour`                                        | `#2B1E3A`                                                 |
| Ombre portée    | `ombre`                                          | `#3A2F5B`                                                 |
| Asphalte        | `asphalte-fonce` / `asphalte` / `asphalte-clair` | `#3E4152` / `#565A6E` / `#6F7489`                         |
| Marquage au sol | `marquage-blanc` / `marquage-jaune`              | `#F2EFE6` / `#F5C84C`                                     |
| Trottoir, béton | `beton-fonce` / `beton` / `beton-clair`          | `#9C9389` / `#BDB4A6` / `#DCD4C4`                         |
| Herbe           | `herbe-fonce` / `herbe` / `herbe-claire`         | `#3F8F4A` / `#5DB65A` / `#8ED46B`                         |
| Eau             | `eau-fonce` / `eau` / `eau-claire`               | `#2A6FB5` / `#3E9BE0` / `#7CC7F2`                         |
| Sable, terre    | `sable-fonce` / `sable` / `sable-clair`          | `#C98E54` / `#E3B676` / `#F3D9A4`                         |
| Tuile de toit   | `toit-fonce` / `toit` / `toit-clair`             | `#9E3B33` / `#C9533F` / `#E9805D`                         |
| Bois            | `bois-fonce` / `bois` / `bois-clair`             | `#6B4228` / `#8E5B36` / `#B47E4E`                         |
| Rouge vif       | `rouge`                                          | `#E5383B`                                                 |
| Orange          | `orange`                                         | `#F28C28`                                                 |
| Jaune           | `jaune`                                          | `#FFD23F`                                                 |
| Vert vif        | `vert`                                           | `#43C46B`                                                 |
| Turquoise       | `turquoise`                                      | `#2EC4B6`                                                 |
| Bleu vif        | `bleu`                                           | `#3A86FF`                                                 |
| Violet          | `violet`                                         | `#8E5CE0`                                                 |
| Rose            | `rose`                                           | `#FF6FA8`                                                 |
| Peaux           | `peau-1` à `peau-5`                              | `#F6D3B8` / `#E8B08A` / `#C98A5E` / `#9C6440` / `#6A4128` |
| Blanc chaud     | `blanc`                                          | `#FFF8EC`                                                 |
| Gris neutre     | `gris`                                           | `#8A8797`                                                 |
| Gris violet     | `gris-violet` (icônes vides du HUD)              | `#6F6488`                                                 |
| Façades pastel  | `facade-sable` / `facade-rose` / `facade-bleue`  | `#E9C8A0` / `#D9A6A0` / `#A8C6D9`                         |
|                 | `facade-verte` / `facade-lilas`                  | `#C8D9A8` / `#D4B8E0`                                     |
| Fenêtres        | `fenetre` / `fenetre-allumee`                    | `#5A7A99` / `#FFD27A`                                     |

**Règles d'usage**

- Les couleurs vives (`rouge`, `jaune`, `bleu`, `rose`…) sont réservées à ce qui doit **attirer l'œil** : personnages, véhicules, objets interactifs, interface.
- Le décor (sol, murs, toits) reste dans les tons **moyens et doux**, pour que le joueur repère d'un coup d'œil ce qui compte.
- Les **façades** piochent dans les pastels (et `marquage-blanc`, `sable`) : des tons doux et variés, qui laissent ressortir les personnages et les voitures.
- Les **lumières** du rendu 3D (soleil, ciel de nuit, lampadaires, phares, dans `src/game/render/lighting.ts`) ne sont pas des couleurs de peinture : elles teintent la scène
  et ne font pas partie de la palette.
- Le **magenta `#FF00FF`** est **interdit** dans les visuels : il est réservé au fond de génération (section 4.2).

## 4. Les blocs de prompt

Un prompt se construit **toujours** dans cet ordre, en anglais (les modèles d'image le comprennent mieux) :

```
[STYLE] + [FOND] + [CATÉGORIE] + [DESCRIPTION] + [PLANCHE] + [INTERDITS]
```

Seule la **DESCRIPTION** change d'une image à l'autre. Les autres blocs se **copient tels quels**.

### 4.1 Le bloc STYLE (toujours en premier)

```
16-bit pixel art in the style of mid-1990s console games, crisp hard-edged pixels, no anti-aliasing, no gradients, no dithering,
2 to 3 flat shading tones per material, warm sunny cartoon look, bright saturated colors for characters and vehicles,
softer muted tones for the ground and buildings, light coming from the top-left, flat dark shadows to the bottom-right,
1-pixel dark purple-brown outline (#2B1E3A) around characters, vehicles and props, never pure black outlines,
playful parody tone, slightly exaggerated cartoon proportions, consistent with the attached reference images.
```

### 4.2 Le bloc FOND

Pour **tout ce qui sera détouré** (personnages, véhicules, objets, portraits, icônes) :

```
Solid flat pure magenta background (#FF00FF) filling the whole image, no floor, no shadow on the background, no gradient, no texture,
nothing else in magenta, every element fully separated from the others by magenta space.
```

Pour **les tuiles et les illustrations plein cadre** : pas de bloc FOND (l'image remplit le cadre).

### 4.3 Les blocs CATÉGORIE

Voir la section 5 : chaque catégorie a son bloc à copier.

### 4.4 Le bloc PLANCHE

On génère **plusieurs éléments par image**, en grille, pour qu'ils partagent exactement le même style.

```
Sprite sheet laid out as a strict grid of {C} columns by {R} rows, equal cells, one element centered in each cell,
same scale and same camera angle for every element, generous magenta margin inside each cell.
```

Grilles conseillées : **4 × 4** (16 petits éléments), **3 × 3** (9 éléments moyens), **2 × 2** (4 grands éléments).

### 4.5 Le bloc INTERDITS (toujours en dernier)

```
No text, no letters, no numbers, no logos, no watermark, no signature, no UI frame, no real brands, no real people,
no realistic rendering, no 3D render, no blur, no photo, no gore, no blood.
```

### 4.6 Joindre les références

**Chaque génération joint 1 à 3 images de la « bible »** (section 8) : c'est ce qui garantit la cohérence, bien plus que le texte.
Exemple : pour un nouveau personnage, joindre la planche de personnages validée ; pour un véhicule, la planche de véhicules validée.

---

## 5. Les catégories d'assets

Pour chaque catégorie : les dimensions finales, le bloc de prompt, et un exemple complet de DESCRIPTION.

### 5.1 Portraits de dialogue

|               |                                                            |
| ------------- | ---------------------------------------------------------- |
| Taille finale | **96 × 96 px**, buste cadré des épaules au sommet du crâne |
| Couleurs      | 48 max                                                     |
| Planche       | 2 × 2 (4 portraits) ou 3 × 3                               |
| Fichiers      | `public/assets/portraits/<perso>-<expression>.png`         |

**Bloc CATÉGORIE**

```
Character dialogue portrait, head-and-shoulders bust, facing the viewer at a slight three-quarter angle toward the right,
big expressive cartoon face, large readable eyes and eyebrows, exaggerated features, simple flat clothing,
same framing and same head size in every cell.
```

**Expressions standard** (chaque personnage nommé les a toutes, sur une même planche 2 × 2) : `neutre`, `content`, `fache`, `surpris`.
Si besoin, une seconde planche : `triste`, `rigolard`, `gene`, `louche`.

**Exemple de DESCRIPTION**

```
The same character in 4 expressions (neutral, happy, angry, surprised): Gégé, a sunburnt middle-aged dock worker,
bushy grey moustache, tiny sailor cap, orange high-visibility vest over a striped tank top, a toothpick in his mouth.
```

**Règles**

- Un personnage nommé a une **fiche** dans `docs/personnages.md` (nom, rôle, quartier, description visuelle **en anglais**, copiée telle quelle dans tous ses prompts).
- Pour une nouvelle expression d'un personnage existant : joindre **son** portrait `neutre` en référence.

### 5.2 Sprites de personnages (en jeu)

|               |                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------- |
| Taille finale | **32 × 32 px** par image, le personnage fait ≈ 28 px de haut, pieds en bas de la case    |
| Couleurs      | 32 max                                                                                   |
| Directions    | **4** : bas (face), haut (dos), gauche, droite (la droite peut être la gauche retournée) |
| Fichiers      | `public/assets/characters/<perso>.png` (feuille d'animation)                             |

**Bloc CATÉGORIE**

```
Top-down three-quarter view game character sprite, super-deformed chibi proportions like town NPCs in 16-bit RPGs: about 2.5 heads tall,
the head as big as the torso, very short stubby limbs, full body visible, standing on the ground, small flat dark oval shadow under the feet,
readable silhouette at very small size, same size and same proportions in every cell.
```

**Feuille d'animation standard** (une planche 4 colonnes × 4 lignes) :

| Ligne | Contenu                                                         |
| ----- | --------------------------------------------------------------- |
| 1     | vers le **bas** : debout, marche 1, debout, marche 2            |
| 2     | vers le **haut** : idem                                         |
| 3     | vers la **gauche** : idem                                       |
| 4     | **actions** : course, coup de poing, porter un objet, KO au sol |

```
Animation sheet, 4 columns by 4 rows. Row 1: facing down (idle, walk step left foot, idle, walk step right foot).
Row 2: facing up, same poses. Row 3: facing left, side view, same poses. Row 4: running, punching, carrying a box above the head, knocked out lying on the ground.
```

> L'IA tient mal la cohérence image par image d'une animation. Prévoir des **retouches dans Aseprite ou Piskel** (gratuits) : aligner les pieds, harmoniser les tailles. C'est normal et attendu.

**Piétons génériques** : une planche de 16 piétons « debout face caméra » par quartier (section 6), puis les animations seulement pour ceux qu'on garde.

### 5.3 Véhicules

|               |                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------- |
| Taille finale | voiture **32 × 64 px** (1 × 2 tuiles), camionnette / bus **48 × 96**, voiturette **32 × 48** |
| Couleurs      | 32 max                                                                                       |
| Orientation   | **vue strictement de dessus, nez vers le haut**                                              |
| Fichiers      | `public/assets/vehicles/<modele>.png`, `<modele>-abime.png`, `<modele>-epave.png`            |

**Bloc CATÉGORIE**

```
Vehicle seen strictly from directly above (bird's-eye top view, not three-quarter), front of the vehicle (hood, headlights) pointing UP toward the top edge of the image and the rear (trunk, tail lights) toward the bottom,
perfectly symmetrical left and right, visible roof, windshield and hood, small flat shadow offset to the bottom-right,
cartoonish slightly rounded exaggerated shape, same scale for every vehicle in the sheet.
```

**Exemple de DESCRIPTION** (planche 2 × 2)

```
Four parody cars: a tiny old granny hatchback in pastel mint green with a lace doily on the rear shelf;
a boxy white delivery van with an empty blank side panel; a flashy low sports car in bright yellow with an oversized rear wing;
a small golf cart in white and turquoise with a striped canopy.
```

**Sens** : le modèle dessine parfois le nez vers le bas ; vérifier et tourner de 180° si besoin (voir `docs/registre-visuels.md`).

**États** : chaque modèle a 3 versions (**neuf**, **abîmé** : bosses, vitre fêlée, **épave** : noirci, fumant). Joindre la version neuve en référence pour générer les deux autres.
**Recoloration** : le modèle de base est généré dans **une seule couleur vive** de carrosserie ; le jeu peut recolorer cette teinte pour varier le trafic.

### 5.4 Tuiles de carte (tileset)

|               |                                                                 |
| ------------- | --------------------------------------------------------------- |
| Taille finale | **32 × 32 px** par tuile                                        |
| Couleurs      | 48 max par jeu de tuiles                                        |
| Fichiers      | `public/assets/tiles/<theme>.png` (planche importée dans Tiled) |

**Bloc CATÉGORIE**

```
Top-down three-quarter view tileset for a 2D city game, each cell is one square ground tile seen from directly above,
seamless edges meant to tile with their neighbours, low-contrast texture so characters stay readable on top,
no outline on ground tiles, no shadows from outside the tile, consistent scale across all tiles.
```

**Ce qui marche, et ce qui ne marche pas** avec l'IA :

| Type                                                         | Méthode                                                                                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **Sols unis** (asphalte, herbe, pavés, sable, eau, trottoir) | générer une **texture carrée** qui se répète, puis découper ; vérifier le raccord en répétant 3 × 3                             |
| **Routes** (lignes, passages piétons, carrefours, virages)   | générer la **planche de base**, puis **assembler et corriger à la main** dans Aseprite : l'IA ne fait pas des raccords parfaits |
| **Transitions** (herbe ↔ trottoir, sable ↔ eau)              | générer une planche « 3 × 3 de bord » (coins, bords, centre), puis retoucher ; elle servira à l'auto-tile de Tiled              |
| **Bâtiments**                                                | **pas en tuiles** : un bâtiment est **un objet entier** (section 5.5), posé sur la carte                                        |

**Exemple de DESCRIPTION**

```
Sheet of 16 ground tiles, 4 by 4: plain asphalt, asphalt with a white dashed lane line, asphalt with a yellow center line,
zebra crossing, sidewalk paving, sidewalk with a curb on the top edge, grass, grass with small flowers, cobblestones,
sand, shallow water, wooden dock planks, gravel, dirt path, parking lot with a white bay line, manhole cover on asphalt.
```

### 5.5 Bâtiments

|               |                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------- |
| Taille finale | multiples de 32 : petite maison **96 × 96**, immeuble **128 × 160**, entrepôt **192 × 128** |
| Couleurs      | 48 max                                                                                      |
| Fichiers      | `public/assets/buildings/<quartier>-<nom>.png`                                              |

**Bloc CATÉGORIE**

```
Top-down front view building for a 2D city game, NOT isometric, NOT rotated, NO side walls visible: the camera looks north and down at the building,
so the image shows only two flat parts stacked vertically, the roof seen from above as a flat rectangle on top, and directly below it the front (south)
facade seen straight on, its bottom edge perfectly horizontal and parallel to the bottom of the image, left and right edges perfectly vertical,
entrance door centered on the facade, blank empty sign boards with no text, flat shadow cast to the bottom-right, cartoon parody architecture,
same scale and same camera angle for every building, exactly like the houses in classic 16-bit top-down RPG towns.
```

**Exemple de DESCRIPTION**

```
Four buildings for the city center: a small town hall with a ridiculous oversized clock; a narrow kebab shop with a blank sign;
a pink pharmacy with a giant neon cross shape; a tiny bank with exaggerated columns.
```

Les enseignes sont **vides** : le texte (« Kébab Royal ») est un objet séparé ajouté par le jeu.

### 5.6 Objets (props)

|               |                                                               |
| ------------- | ------------------------------------------------------------- |
| Taille finale | **32 × 32** (petits), **32 × 64** ou **64 × 64** (grands)     |
| Couleurs      | 32 max                                                        |
| États         | si destructible : **intact** et **cassé** sur la même planche |
| Fichiers      | `public/assets/props/<objet>.png`, `<objet>-casse.png`        |

**Bloc CATÉGORIE**

```
Top-down three-quarter view small game props, each object standing on the ground with a small flat dark shadow to the bottom-right,
readable at small size, same scale and same camera angle for every prop.
```

**Exemple de DESCRIPTION**

```
16 street props, 4 by 4: green trash bin, the same trash bin knocked over with litter, orange traffic cone, red fire hydrant,
wooden bench, street lamp, phone booth with a blank sign, vending machine, garden gnome, plastic flamingo, market stall with fruit,
the same market stall smashed, crowd barrier, cardboard boxes, newspaper stand, mailbox.
```

### 5.7 Effets (FX)

|               |                                                                  |
| ------------- | ---------------------------------------------------------------- |
| Taille finale | **32 × 32** ou **64 × 64** par image, 4 à 6 images par animation |
| Couleurs      | 16 max                                                           |
| Fichiers      | `public/assets/fx/<effet>.png`                                   |

**Bloc CATÉGORIE**

```
Cartoon pixel art visual effect animation frames, bold simple shapes, few colors, punchy and comic,
each cell is the next frame of the same animation, same size and same center in every cell.
```

Exemples : fumée de moteur, explosion comique (nuage + étoiles), étincelles de choc, poussière de dérapage, étoiles de KO, gyrophare.

### 5.8 Interface et icônes

|               |                                                                    |
| ------------- | ------------------------------------------------------------------ |
| Taille finale | icônes **16 × 16** ou **24 × 24** ; cadres en 9 tranches (9-slice) |
| Couleurs      | 16 max par icône                                                   |
| Fichiers      | `public/assets/ui/`                                                |

**Bloc CATÉGORIE**

```
Pixel art game UI icons, front view, bold and readable at tiny size, thick dark outline, 2 tones per color,
same size and same visual weight for every icon.
```

Le **téléphone du joueur** (cadre, icônes d'applis) suit le même bloc. Les applis sont des **parodies** sans logo réel.

### 5.9 Illustrations (écran titre, fins de mission)

|               |                                            |
| ------------- | ------------------------------------------ |
| Taille finale | **320 × 180 px** (16:9), affichée ×3 ou ×4 |
| Couleurs      | 64 max                                     |
| Fichiers      | `public/assets/illus/<nom>.png`            |

**Bloc CATÉGORIE**

```
Full-frame pixel art scene illustration, 16:9, cinematic cartoon composition, side or three-quarter view allowed,
characters drawn in the same design as the attached portraits, comic exaggerated situation.
```

---

## 6. Les quartiers

Chaque quartier a une **ambiance** propre, mais **la même palette et les mêmes règles**. Ajouter la ligne du quartier à la DESCRIPTION.

| Quartier                  | Ambiance                         | Couleurs dominantes                           | Ligne à ajouter au prompt                                                                 |
| ------------------------- | -------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Le Centre**             | animé, commerçant, kitsch        | pavés beiges, façades pastel, enseignes vives | `Lively small-town city center, pastel facades, cobblestones, cluttered shop fronts.`     |
| **Les Docks**             | industriel, rouillé, louche      | bleus, gris, orange rouille, bois             | `Harbor docks district, containers, rusty cranes, wooden piers, seagulls.`                |
| **La Zone Pavillonnaire** | proprette, ridicule de normalité | verts, toits rouges, blanc                    | `Suburban housing estate, identical little houses, perfect lawns, hedges, garden gnomes.` |
| **La Colline**            | luxe tape-à-l'œil                | blanc, turquoise, doré (`jaune`), rose        | `Wealthy hillside, flashy villas, swimming pools, palm trees, golf course.`               |

**Les piétons de chaque quartier** (planche de 16 par quartier) :

- **Centre** : touristes, livreurs, commerçants, mamies, ados, un mime.
- **Docks** : dockers, pêcheurs, gros bras, contrebandiers en imper.
- **Zone Pavillonnaire** : retraités, joggeurs, voisins en peignoir, enfants.
- **Colline** : golfeurs, nouveaux riches, coachs sportifs, majordomes.

## 7. La chaîne de production

Reprise de la chaîne de GRINTA, qui a fait ses preuves.

```
1. Prompt (ce document) + références ──► 2. Génération OpenRouter ──► assets/raw/  (non versionné)
                                                                         │
                       public/assets/ ◄── 4. Retouches (si besoin) ◄── 3. Pixelisation (script)
                            │
                            └──► 5. Page « Identité visuelle » + registre
```

1. **Prompt** : assemblé à partir des blocs (section 4), avec les références (section 8).
2. **Génération** (modèle par défaut : **Gemini 3 Pro Image**, ≈ 0,14 $ par planche) : `node scripts/art/gen-image.mjs --out assets/raw/<nom>.png --prompt-file assets/raw/<nom>.txt --ref <ref1> --ref <ref2> --aspect 1:1`
   - Pour des essais en masse à moindre coût : `--model google/gemini-3.1-flash-image` (≈ 0,07 $), mais il suit moins bien les consignes.
   - La clé `OPENROUTER_API_KEY` est dans `.env` (non versionné), **jamais affichée ni commitée**.
   - Le script affiche le **coût** de chaque image et la note dans `assets/raw/journal.tsv`, pour remplir le registre (section 11).
3. **Pixelisation** : `node scripts/art/pixelize.mjs --in <planche> --grid 4x4 --size 32x32 --colors 32 --mode sprite --out <dossier> --names a,b,c…`
   - détoure le fond magenta (et le liseré rose) ;
   - découpe la planche selon sa grille ;
   - réduit chaque case à sa **taille finale** (section 5) ;
   - rend la transparence **binaire** ;
   - limite la palette (PNG8) au nombre de couleurs de la catégorie.
4. **Retouches** : dans Aseprite ou Piskel, si le contrôle qualité l'exige (alignement, raccords, détails).
5. **Intégration** : l'asset rejoint `public/assets/`, la page **Identité visuelle** du jeu (à créer, comme dans GRINTA) et le registre.

> Mode d'emploi complet des deux scripts (installation, options, exemples par catégorie) : [scripts/art/README.md](../scripts/art/README.md).

## 8. Les références (« la bible »)

La cohérence vient surtout des **images de référence jointes à chaque prompt**. On les construit **en premier**, avant tout le reste.

**Étape 1 : les planches fondatrices** (à générer, choisir et valider à deux, une seule fois)

| Référence               | Contenu                              | Sert de référence pour          |
| ----------------------- | ------------------------------------ | ------------------------------- |
| `bible/personnages.png` | 4 piétons variés, debout face caméra | tous les sprites de personnages |
| `bible/portraits.png`   | 4 portraits de styles différents     | tous les portraits              |
| `bible/vehicules.png`   | 4 véhicules                          | tous les véhicules              |
| `bible/sol.png`         | 16 tuiles de sol                     | toutes les tuiles               |
| `bible/batiments.png`   | 4 bâtiments                          | tous les bâtiments et objets    |
| `bible/scene.png`       | une scène de rue complète assemblée  | contrôle global de cohérence    |

**Étape 2 : chaque nouvelle génération** joint la ou les planches bible de sa catégorie (et, si utile, une image proche déjà validée).

Les planches bible sont rangées dans `docs/bible/` (versionnées). **On ne les change pas** sans décision notée dans `docs/decisions.md` : changer la bible, c'est changer tout le jeu.

## 9. Nommage et rangement

```
assets/raw/                    rendus bruts de l'IA (non versionnés, dans .gitignore)
docs/bible/                    les planches de référence validées (versionnées)
public/assets/
  portraits/   gege-neutre.png, gege-fache.png …
  characters/  joueur.png, pieton-docks-01.png …
  vehicles/    mamie-car.png, mamie-car-abime.png, mamie-car-epave.png …
  tiles/       sol-ville.png, routes.png, docks.png …
  buildings/   centre-mairie.png, docks-entrepot-01.png …
  props/       poubelle.png, poubelle-casse.png …
  fx/          explosion.png, fumee.png …
  ui/          icone-argent.png, cadre-dialogue.png …
  illus/       titre.png, mission-reussie.png …
```

- Noms en **français**, **minuscules**, mots séparés par des **tirets**, sans accent.
- Un même objet garde le **même préfixe** pour toutes ses variantes (`poubelle`, `poubelle-casse`).
- Les textures sont chargées sous le nom du fichier sans extension, listées à **un seul endroit** du code (`src/game/assets.ts`).

## 10. Contrôle qualité

Avant d'ajouter un visuel au jeu, cocher :

- [ ] Prompt assemblé à partir des blocs de ce document, références jointes
- [ ] Bonne perspective : trois-quarts pour le monde, vue de dessus stricte pour les véhicules
- [ ] Lumière en haut à gauche, ombre en bas à droite
- [ ] Contour sombre de 1 px (sauf tuiles de sol), pas de noir pur
- [ ] Taille finale exacte, multiple de la grille de 32 px
- [ ] Transparence binaire, aucun liseré rose
- [ ] Palette respectée, nombre de couleurs dans la limite
- [ ] Aucun texte, logo ou marque réelle
- [ ] Posé **dans une vraie scène du jeu** à côté des assets existants : même taille de pixel, même style, même saturation
- [ ] Tuiles : répétées en 3 × 3, sans couture visible
- [ ] Ajouté à la page Identité visuelle et au registre

**Validation** : un nouvel asset est relu par **l'autre développeur** dans la PR (capture de la scène jointe).

## 11. Budget et registre des générations

- **Chaque génération coûte de l'argent.** Elle se fait uniquement dans le cadre d'un **budget fixé par le propriétaire du repo** (`cmn00by`), par issue ou par lot.
- Avant de générer : estimer le nombre d'images et le coût, et le dire.
- **Générer en planches** (plusieurs éléments par image) : c'est moins cher et plus cohérent.
- Le registre `docs/registre-visuels.md` garde une ligne par génération retenue :

```markdown
| Date       | Fichier          | Catégorie | Références jointes  | Coût   | Remarques        |
| ---------- | ---------------- | --------- | ------------------- | ------ | ---------------- |
| 2026-11-20 | vehicules-01.png | véhicules | bible/vehicules.png | 0,04 $ | aileron retouché |
```

Il sert à retrouver comment un visuel a été obtenu, à le refaire ou à en faire une variante, et à suivre la dépense.
