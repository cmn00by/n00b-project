# Roadmap

Les grandes étapes du jeu, et où on en est. Le détail de chaque bloc est dans [features.md](features.md), ce qui a changé dans [CHANGELOG.md](../CHANGELOG.md).

**Règle** : quand une PR ferme une issue, elle **coche sa case ici** (et dans `features.md`). Une étape est finie quand toutes ses cases sont cochées et ses critères vérifiés en jouant.

## Où on en est

| Étape                           | Objectif                                                            | Avancement           |
| ------------------------------- | ------------------------------------------------------------------- | -------------------- |
| **Cadrage**                     | docs, règles, organisation                                          | ✅ terminé           |
| **V0 : prototype codé**         | un quartier de test, à pied et en voiture, des piétons, une mission | 🚧 en cours (3 / 10) |
| **V0.5 : visuels du prototype** | identité visuelle, bible, premier quartier dans Tiled               | ⏳ à venir           |
| **V1 : solo**                   | 4 quartiers, police, ~10 missions, progression, sauvegarde          | ⏳ à venir           |
| **V2 : coop**                   | 2 à 4 joueurs dans la même ville                                    | ⏳ à venir           |
| **V3 : mini online**            | comptes, classements, ville persistante                             | ⏳ à venir           |

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
- [ ] #7 Déplacement à pied (Baghorror12)
- [ ] #8 Conduite arcade (cmn00by)

**Phase 3 : une ville vivante**

- [ ] #9 Moteur de missions (cmn00by)
- [ ] #10 Piétons (Baghorror12)
- [ ] #11 HUD (Baghorror12)

**Phase 4 : en ligne**

- [ ] #12 Mise en ligne sur Cloudflare (cmn00by)
- [ ] #13 Première mission (Baghorror12)

**Fini quand** : on lance le jeu en ligne, on marche, on vole une voiture, on dérape, les piétons fuient, et on réussit une livraison.

## ⏳ V0.5 : visuels du prototype

- [x] #15 Scripts de génération et de pixelisation
- [x] #4 Identité visuelle : planches bible
- [ ] #5 Premier quartier dans Tiled
- [ ] Remplacer les formes de couleur par les visuels

## ⏳ V1 : solo

Voir les cases **V1** de chaque bloc dans [features.md](features.md) : 4 quartiers, trafic, environnement interactif, police, missions, dialogues, interface, progression, sauvegarde, audio, admin.

## ⏳ V2 : coop · V3 : mini online · Mobile

Voir les blocs 16, 17 et 18 de [features.md](features.md).
