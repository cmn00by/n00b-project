# Roadmap

Les grandes étapes du jeu, et où on en est. Le détail de chaque bloc est dans [features.md](features.md), ce qui a changé dans [CHANGELOG.md](../CHANGELOG.md).

**Règle** : quand une PR ferme une issue, elle **coche sa case ici** (et dans `features.md`). Une étape est finie quand toutes ses cases sont cochées et ses critères vérifiés en jouant.

## Où on en est

| Étape                           | Objectif                                                            | Avancement                  |
| ------------------------------- | ------------------------------------------------------------------- | --------------------------- |
| **Cadrage**                     | docs, règles, organisation                                          | ✅ terminé                  |
| **V0 : prototype codé**         | un quartier de test, à pied et en voiture, des piétons, une mission | 🚧 en cours (5 / 10)        |
| **V0.5 : visuels du prototype** | identité visuelle, bible, ville variée, moteur 3D pixel art         | 🚧 ville et moteur 3D faits |
| **V1 : solo**                   | 4 quartiers, police, ~10 missions, progression, sauvegarde          | ⏳ à venir                  |
| **V2 : coop**                   | 2 à 4 joueurs dans la même ville                                    | ⏳ à venir                  |
| **V3 : mini online**            | comptes, classements, ville persistante                             | ⏳ à venir                  |

---

## ✅ Cadrage

- [x] Repo, protection de `main`, tableau de tâches, invitation (#1)
- [x] GDD, stack, guide Git, fonctionnalités, identité visuelle (#1)
- [x] Architecture modulaire et conventions de nommage (#14)
- [x] Répartition du prototype (#16)

## 🚧 V0 : prototype codé

Le jeu tourne avec des formes de couleur, sans visuels.

**Phase 1 : les fondations**

- [x] #2 Initialiser le projet (cmn00by)
- [x] #3 Le noyau (Baghorror12)

**Phase 2 : bouger dans la ville**

- [x] #6 Carte de test en données, avec les collisions (cmn00by)
- [x] #8 Conduite arcade (cmn00by)
- [x] #10 Piétons (Baghorror12)

**Phase 3 : une ville vivante**

- [x] #9 Moteur de missions (cmn00by)
- [x] #11 HUD (Baghorror12)
- [x] #21 Clavier ZQSD = WASD (Baghorror12)
- [x] #20 Commandes tactiles (Baghorror12)

**Phase 4 : en ligne**

- [x] #12 Mise en ligne sur Cloudflare (cmn00by) : repo connecté, chaque merge sur `main` met le jeu en ligne (`docs/deploiement.md`)
- [x] #13 Première mission (Baghorror12)

**Fini quand** : on lance le jeu en ligne, on marche, on vole une voiture, on dérape, les piétons fuient, et on réussit une livraison.

## ⏳ V0.5 : visuels du prototype

- [x] #15 Scripts de génération et de pixelisation
- [x] #4 Identité visuelle : planches bible
- [ ] #5 Premier quartier dans Tiled
- [ ] #7 Animations à pied (la marche et la course sont faites dans #19)
- [x] Remplacer les formes de couleur par les visuels : ville variée texturée (#29)
- [x] Moteur d'affichage : three.js, 3D pixel art (#32)

## ⏳ V1 : solo

Voir les cases **V1** de chaque bloc dans [features.md](features.md) : 4 quartiers, trafic, environnement interactif, police, missions, dialogues, interface, progression, sauvegarde, audio, admin,
**garage** (acheter et personnaliser ses véhicules) et **personnage** (création et garde-robe).

## ⏳ V2 : coop · V3 : mini online · Mobile

Voir les blocs 16, 17 et 18 de [features.md](features.md).
