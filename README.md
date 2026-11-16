# n00b-project

Un mini monde ouvert **parodique** vu de haut, en **pixel art 3D** (three.js), qui tourne dans le navigateur.
Tu débarques dans une petite ville où tout le monde a une combine : livraisons absurdes, voitures « empruntées », police zélée mais incompétente.

> 🚧 **Prototype en cours** : où on en est dans la [roadmap](docs/roadmap.md), ce qui a changé dans le [journal](CHANGELOG.md).

## Lancer le jeu en local

Il faut [Node.js](https://nodejs.org) 22 ou plus récent.

```bash
git clone https://github.com/cmn00by/n00b-project.git
cd n00b-project
npm install
npm run dev
```

Puis ouvrir http://localhost:5173.

## Commandes

| Commande         | Rôle                                                                     |
| ---------------- | ------------------------------------------------------------------------ |
| `npm run dev`    | lancer le jeu en local                                                   |
| `npm test`       | lancer les tests                                                         |
| `npm run check`  | tout vérifier avant une PR : règles d'architecture, cycles, tests, build |
| `npm run format` | formater le code                                                         |

## Contribuer

1. Lire [CLAUDE.md](CLAUDE.md) : les règles du projet (aussi lues automatiquement par Claude Code).
2. Suivre le [guide Git](docs/git.md) : une issue, une branche, une Pull Request.
3. Prendre une tâche sur le [tableau](https://github.com/users/cmn00by/projects/3).

## Documentation

| Document                                     | Contenu                                   |
| -------------------------------------------- | ----------------------------------------- |
| [docs/GDD.md](docs/GDD.md)                   | le game design                            |
| [docs/roadmap.md](docs/roadmap.md)           | les étapes et l'avancement                |
| [docs/features.md](docs/features.md)         | toutes les fonctionnalités, bloc par bloc |
| [docs/architecture.md](docs/architecture.md) | le code en briques LEGO                   |
| [docs/conventions.md](docs/conventions.md)   | le nommage                                |
| [docs/style.md](docs/style.md)               | l'identité visuelle                       |
| [docs/git.md](docs/git.md)                   | le guide Git pas à pas                    |
| [docs/decisions.md](docs/decisions.md)       | les décisions et leurs raisons            |
| [CHANGELOG.md](CHANGELOG.md)                 | le journal des modifications              |
