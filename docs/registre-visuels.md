# Registre des générations

Une ligne par génération (retenue ou non), pour suivre la dépense et savoir refaire un visuel. Voir [style.md](style.md), section 11.
Le journal brut de chaque poste est dans `assets/raw/journal.tsv` (local, non versionné).

**Budget** : 3 $ (clé du propriétaire du repo) · **Dépensé** : 1,89 $ · **Reste** : 1,11 $

| Date       | Fichier             | Modèle  | Références jointes                     | Coût    | Retenu                     | Remarques                                                          |
| ---------- | ------------------- | ------- | -------------------------------------- | ------- | -------------------------- | ------------------------------------------------------------------ |
| 2026-11-15 | personnages-1       | Flash   | aucune                                 | 0,068 $ | ❌                         | décor de rue dans 3 cases, pas assez chibi                         |
| 2026-11-15 | personnages-2       | Flash   | aucune                                 | 0,067 $ | ❌ remplacée               | proportions correctes mais style moins fin que Pro                 |
| 2026-11-15 | vehicules-1         | Flash   | personnages                            | 0,068 $ | ❌ remplacée               | nez vers le bas                                                    |
| 2026-11-15 | sol-1               | Flash   | personnages                            | 0,068 $ | ❌ remplacée               |                                                                    |
| 2026-11-15 | portraits-1         | Flash   | personnages                            | 0,068 $ | ❌ remplacée               |                                                                    |
| 2026-11-15 | batiments-1         | Flash   | personnages                            | 0,068 $ | ❌                         | vue isométrique                                                    |
| 2026-11-15 | batiments-2         | Flash   | personnages, sol                       | 0,069 $ | ❌                         | encore de biais                                                    |
| 2026-11-15 | batiments-3         | Flash   | personnages, sol                       | 0,069 $ | ❌ remplacée               | vue de face, mais mairie coupée en deux                            |
| 2026-11-15 | scene-1             | Flash   | personnages, vehicules, sol, batiments | 0,070 $ | ❌ remplacée               | voitures de côté, texte sur l'enseigne                             |
| 2026-11-15 | test a-trois-quarts | **Pro** | personnages (Flash)                    | 0,141 $ | ✅ `bible/animation.png`   | test : le 3/4 animé est viable (personnage identique sur 16 poses) |
| 2026-11-15 | test b-dessus       | **Pro** | personnages, vehicules (Flash)         | 0,142 $ | ❌                         | test : la vraie vue du dessus échoue (le modèle redessine de face) |
| 2026-11-15 | pro-personnages-1   | **Pro** | aucune                                 | 0,140 $ | ❌                         | proportions réalistes, pas chibi                                   |
| 2026-11-15 | pro-personnages-2   | **Pro** | aucune                                 | 0,140 $ | ✅ `bible/personnages.png` | « 2.5 heads tall, head as big as the torso »                       |
| 2026-11-15 | pro-vehicules-1     | **Pro** | personnages                            | 0,141 $ | ✅ `bible/vehicules.png`   | nez vers le haut du premier coup                                   |
| 2026-11-15 | pro-sol-1           | **Pro** | personnages                            | 0,141 $ | ✅ `bible/sol.png`         |                                                                    |
| 2026-11-15 | pro-batiments-1     | **Pro** | personnages                            | 0,142 $ | ✅ `bible/batiments.png`   | vue de face correcte du premier coup                               |
| 2026-11-15 | pro-portraits-1     | **Pro** | personnages                            | 0,141 $ | ✅ `bible/portraits.png`   |                                                                    |
| 2026-11-15 | pro-scene-1         | **Pro** | personnages, vehicules, sol, batiments | 0,144 $ | ✅ `bible/scene.png`       | cohérente, sans texte ; voitures un peu de biais                   |

## Leçons

- **Modèle** : Gemini 3 Pro Image (≈ 0,14 $ par planche) suit bien mieux les consignes que Gemini 3.1 Flash Image (≈ 0,07 $) : 5 planches sur 6 bonnes du premier coup, contre 3 sur 6. C'est le modèle par défaut du script.
- **Perspective** : la vraie vue du dessus pour les personnages ne marche pas avec ces modèles. On garde le 3/4 (3 directions + miroir) ; seuls les véhicules sont en vue du dessus.
- **Personnages** : préciser « 2.5 heads tall, head as big as the torso », sinon les proportions sont réalistes.
- **Bâtiments** : sans précision, le modèle dessine en isométrique (Flash surtout). Le bloc de `style.md` (5.5) reprend la formulation qui marche.
- **Violets** : la pixelisation par défaut (`--cut 70`) grise les violets. Utiliser `--cut 120` sur les planches qui en contiennent.
- **Scènes complètes** : les voitures ont tendance à être dessinées de côté ; ce n'est gênant que pour les illustrations.
