# Registre des générations

Une ligne par génération (retenue ou non), pour suivre la dépense et savoir refaire un visuel. Voir [style.md](style.md), section 11.
Le journal brut de chaque poste est dans `assets/raw/journal.tsv` (local, non versionné).

**Budget** : 3 $ (clé du propriétaire du repo) · **Dépensé** : 0,61 $ · **Reste** : 2,39 $

| Date       | Fichier       | Catégorie | Références jointes                     | Coût    | Retenu                     | Remarques                                                            |
| ---------- | ------------- | --------- | -------------------------------------- | ------- | -------------------------- | -------------------------------------------------------------------- |
| 2026-11-15 | personnages-1 | bible     | aucune                                 | 0,068 $ | ❌                         | décor de rue dans 3 cases, proportions pas assez chibi               |
| 2026-11-15 | personnages-2 | bible     | aucune                                 | 0,067 $ | ✅ `bible/personnages.png` | prompt renforcé : « absolutely no scenery », tête = 1/3 du corps     |
| 2026-11-15 | vehicules-1   | bible     | personnages                            | 0,068 $ | ✅ `bible/vehicules.png`   | nez vers le bas : tourné de 180°                                     |
| 2026-11-15 | sol-1         | bible     | personnages                            | 0,068 $ | ✅ `bible/sol.png`         |                                                                      |
| 2026-11-15 | portraits-1   | bible     | personnages                            | 0,068 $ | ✅ `bible/portraits.png`   |                                                                      |
| 2026-11-15 | batiments-1   | bible     | personnages                            | 0,068 $ | ❌                         | vue isométrique                                                      |
| 2026-11-15 | batiments-2   | bible     | personnages, sol                       | 0,069 $ | ❌                         | encore de biais                                                      |
| 2026-11-15 | batiments-3   | bible     | personnages, sol                       | 0,069 $ | ✅ `bible/batiments.png`   | prompt « front view, no side walls visible » ; mairie coupée en deux |
| 2026-11-15 | scene-1       | bible     | personnages, vehicules, sol, batiments | 0,070 $ | ✅ `bible/scene.png`       | cohérent ; voitures de côté et texte sur l'enseigne                  |

## Leçons

- **Bâtiments** : sans précision, le modèle dessine en isométrique. Le bloc CATÉGORIE de `style.md` (5.5) reprend maintenant la formulation qui marche.
- **Véhicules** : préciser le sens ne suffit pas toujours ; vérifier et tourner de 180° si besoin (ils sont symétriques).
- **Violets** : la pixelisation par défaut (`--cut 70`) grise les violets (cheveux de la mamie). Utiliser `--cut 120` sur les planches qui en contiennent.
- **Coût** : environ 0,07 $ par planche (Gemini Flash Image), soit moins d'un centime par élément sur une planche de 4 × 4.
