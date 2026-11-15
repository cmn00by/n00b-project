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

### Technique

- Initialisation du projet : Vite, TypeScript strict, Phaser 3, Vitest, Prettier (#2)
- Garde-fous de l'architecture en briques : règles d'imports ESLint, détection des dépendances circulaires avec madge (#2)
- Vérifications automatiques de chaque PR par GitHub Actions : lint, cycles, tests, build (#2)

### Documentation

- Journal des modifications et roadmap (#2)
- Répartition du prototype : le code d'abord, les visuels plus tard (#16)
- Architecture modulaire « LEGO » et conventions de nommage (#14)
- GDD v0.1, stack Phaser, guide Git, liste des fonctionnalités, identité visuelle (#1)
- Règles de travail du projet pour Claude (`CLAUDE.md`)
