# Guide Git : les branches, pas à pas

Ce guide explique comment travailler à deux sans rien casser. Pas besoin de tout comprendre à Git : il suffit de suivre les étapes.
Chaque étape est donnée **avec GitHub Desktop** (boutons) et **en ligne de commande** (ou en le demandant à Claude).

## L'idée en 30 secondes

```
main  ──●───────────────●──────────────●──   la version officielle, celle qui est en ligne
         \             /  \            /
          ●──●──●─────●    ●──●──●────●       ta branche : ta copie de travail pour UNE tâche
          feature/4-saut   fix/12-collision
```

- **`main`** est la version officielle. Personne n'y touche directement (GitHub le bloque de toute façon).
- Pour chaque tâche, on crée une **branche** : une copie de `main` où l'on peut tout essayer sans risque.
- Quand la tâche est finie, on ouvre une **Pull Request** (PR) : une demande pour faire entrer sa branche dans `main`.
- L'autre relit, approuve, et `cmn00by` **merge** (fusionne). Le jeu est mis en ligne automatiquement.

**Si tu casses quelque chose sur ta branche, ce n'est pas grave** : `main` n'est pas touchée.

## Vocabulaire

| Mot | Ce que ça veut dire |
|---|---|
| **repo** (dépôt) | le projet, avec tout son historique |
| **clone** | télécharger le repo sur son PC (une seule fois) |
| **branche** | une ligne de travail séparée |
| **commit** | une sauvegarde de ses changements, avec un message |
| **push** | envoyer ses commits sur GitHub |
| **pull** | récupérer les commits des autres depuis GitHub |
| **PR** (Pull Request) | demander à faire entrer sa branche dans `main` |
| **review** | relire la PR de l'autre |
| **merge** | fusionner une branche dans une autre |
| **conflit** | Git ne sait pas choisir entre deux modifications du même endroit |

## 0. Une seule fois : installer et cloner

**GitHub Desktop** : installer https://desktop.github.com, se connecter avec son compte GitHub,
puis *File → Clone repository* → `cmn00by/n00b-project`.

**Ligne de commande** :
```bash
git clone https://github.com/cmn00by/n00b-project.git
cd n00b-project
npm install
```

## 1. Choisir sa tâche

1. Ouvrir le tableau : https://github.com/users/cmn00by/projects/3
2. Prendre une carte dans **Todo**, s'assigner l'issue, et la glisser dans **In Progress**.
3. Noter son numéro (par exemple **#4**).

## 2. Repartir de la dernière version

**À faire à chaque nouvelle tâche**, sinon on travaille sur une vieille version.

**GitHub Desktop** : *Current branch* → choisir `main`, puis bouton **Fetch origin** → **Pull origin**.

**Ligne de commande** :
```bash
git switch main
git pull
```

## 3. Créer sa branche

Nom : `<type>/<n°issue>-<description-courte>`, en minuscules avec des tirets.

| Type | Quand |
|---|---|
| `feature/` | nouvelle fonctionnalité |
| `fix/` | correction de bug |
| `docs/` | documentation |
| `refactor/` | réorganisation du code sans changer le comportement |

Exemples : `feature/4-saut-joueur`, `fix/12-collision-murs`.

**GitHub Desktop** : *Current branch* → **New branch** → taper le nom → *Create branch* (basée sur `main`).

**Ligne de commande** :
```bash
git switch -c feature/4-saut-joueur
```

**Vérifier qu'on est sur la bonne branche** avant de coder : en haut de GitHub Desktop, ou `git branch` (la branche active a une `*`).

## 4. Coder et faire des commits

Faire un commit **à chaque petite étape qui marche** (pas un seul énorme commit à la fin).

**GitHub Desktop** : à gauche, cocher les fichiers de la tâche, écrire le message en bas (*Summary*), cliquer **Commit to feature/…**

**Ligne de commande** :
```bash
git status                       # voir ce qui a changé
git add src/sim/player.ts        # ajouter les fichiers de la tâche
git commit -m "feat: ajoute le saut du joueur"
```

Message : préfixe (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`) + ce que fait le commit, à l'impératif.

## 5. Envoyer sa branche sur GitHub

**GitHub Desktop** : bouton **Publish branch** (la première fois), puis **Push origin**.

**Ligne de commande** :
```bash
git push -u origin feature/4-saut-joueur   # la première fois
git push                                   # les fois suivantes
```

Pousser souvent, même si ce n'est pas fini : le travail est sauvegardé sur GitHub et l'autre voit où on en est.

## 6. Ouvrir la Pull Request

**GitHub Desktop** : bouton **Create Pull Request** (ouvre GitHub dans le navigateur).

**Ligne de commande** :
```bash
gh pr create --fill
```

Dans la description, écrire :
```markdown
Closes #4

## Ce qui change
- ...

## Comment tester
1. `npm run dev`
2. ...

## Non vérifié
- ...
```

`Closes #4` ferme l'issue et déplace la carte en **Done** automatiquement au merge.
Une **URL de preview** apparaît dans la PR : on peut y tester le jeu avant qu'il soit en ligne.

## 7. Relire une PR

La PR de l'autre doit être relue et approuvée avant d'être mergée.

**À la main, sur GitHub** :
1. Ouvrir la PR → onglet **Files changed** : lire les changements.
2. Tester avec l'URL de preview.
3. **Review changes** → choisir :
   - **Approve** : c'est bon ;
   - **Comment** : une question, une remarque ;
   - **Request changes** : il faut corriger quelque chose avant.
4. **Submit review**.

**Avec Claude** :
1. Dire à Claude : « relis la PR 4 ».
2. Claude lit les changements et fait un résumé : ce qui change, les risques, les points à tester, les problèmes repérés.
3. Lire le résumé, tester si besoin.
4. Dire « ok, approuve » : Claude lance `gh pr review 4 --approve`. **Sans cet accord, Claude n'approuve pas.**

On ne peut pas approuver sa propre PR : c'est toujours l'autre qui relit.

## 8. Corriger après une review

Rester sur sa branche, corriger, commit, push. La PR se met à jour toute seule.
**Ne pas créer une nouvelle branche ni une nouvelle PR.**

## 9. Après le merge

`cmn00by` merge la PR. La branche est supprimée sur GitHub automatiquement.

Pour nettoyer chez soi et repartir propre :

**GitHub Desktop** : passer sur `main` → **Pull origin**. Supprimer l'ancienne branche : *Branch → Delete*.

**Ligne de commande** :
```bash
git switch main
git pull
git branch -d feature/4-saut-joueur
```

Puis retour à l'étape **1** pour la tâche suivante.

## Mettre sa branche à jour avec main

Si `main` a avancé pendant qu'on travaillait (l'autre a fait merger quelque chose), il faut récupérer ces changements dans sa branche :

**GitHub Desktop** : sur sa branche, *Branch → Update from main*.

**Ligne de commande** :
```bash
git switch main && git pull
git switch feature/4-saut-joueur
git merge main
```

Puis relancer le jeu pour vérifier que tout marche encore.

## Les conflits

Un conflit arrive quand les deux ont modifié **le même endroit du même fichier**. Git ne choisit pas : il demande.

Le fichier contient alors :
```
<<<<<<< HEAD
ma version
=======
la version de main
>>>>>>> main
```

1. **Ne pas paniquer, ne rien supprimer au hasard.**
2. Garder la bonne version (ou un mélange des deux), et effacer les lignes `<<<<<<<`, `=======`, `>>>>>>>`.
3. Vérifier que le jeu se lance.
4. `git add <fichier>` puis `git commit`.

En cas de doute : **demander à l'autre** ou à Claude. Le meilleur moyen d'éviter les conflits : ne pas travailler à deux sur les mêmes fichiers en même temps (le tableau sert à ça).

## Problèmes fréquents

| Problème | Solution |
|---|---|
| J'ai codé sur `main` sans faire exprès (pas encore de commit) | Créer la branche maintenant : `git switch -c feature/x`. Les changements suivent. |
| J'ai fait un commit sur `main` | Ne rien pousser. Demander à Claude ou à `cmn00by` : ça se répare facilement. |
| `push` refusé sur `main` | Normal : `main` est protégée. Créer une branche et pousser la branche. |
| `push` refusé : *rejected, fetch first* | Quelqu'un a poussé sur la même branche : `git pull`, puis `git push`. |
| Je ne sais plus sur quelle branche je suis | `git branch` ou regarder en haut de GitHub Desktop. |
| Je veux annuler mes modifs non commitées d'un fichier | Demander à Claude d'abord (c'est définitif). |

## À ne jamais faire

- `git push --force`
- `git reset --hard` sur du travail non poussé
- Supprimer la branche de l'autre
- Commiter des secrets (`.env`, `.dev.vars`, clés, mots de passe) : le repo est **public**

Dans le doute : **s'arrêter et demander.** Rien n'est irréparable tant qu'on n'a pas forcé.
