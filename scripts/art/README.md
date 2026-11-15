# scripts/art : génération et pixelisation des visuels

Les outils de la chaîne décrite dans [docs/style.md](../../docs/style.md), section 7. Repris de GRINTA.

## Installer (une fois)

```bash
npm --prefix scripts/art install
```

Puis créer un fichier `.env` **à la racine du repo** (jamais commité) :

```
OPENROUTER_API_KEY=sk-or-...
```

Chacun utilise **sa propre clé**, avec une limite de dépense réglée sur openrouter.ai.

## 1. Générer (payant)

```bash
node scripts/art/gen-image.mjs --out assets/raw/vehicules-01.png --prompt-file assets/raw/vehicules-01.txt --ref docs/bible/vehicules.png --aspect 1:1
```

- Le prompt s'assemble à partir des blocs de `docs/style.md` (section 4). Le garder dans un fichier `.txt` à côté du rendu : plus simple à relire et à refaire.
- `--ref` : les planches bible de la catégorie (section 8 de `style.md`). Répétable.
- Chaque génération est notée dans `assets/raw/journal.tsv` (date, fichier, modèle, références, coût, prompt) : il sert à remplir `docs/registre-visuels.md`.
- **Chaque appel coûte de l'argent** : seulement dans le budget fixé par `cmn00by`.

## 2. Pixeliser (gratuit)

```bash
node scripts/art/pixelize.mjs --in assets/raw/vehicules-01.png --grid 2x2 --size 32x64 --colors 32 \
  --out public/assets/vehicles --names mamie-car,delivery-van,sports-car,golf-cart
```

| Option | Rôle | Défaut |
|---|---|---|
| `--in` | la planche brute | |
| `--out` | le dossier de sortie | |
| `--names` | les noms des cases, de gauche à droite puis de haut en bas (`-` pour sauter une case) | |
| `--grid` | colonnes x lignes de la planche | `1x1` |
| `--size` | taille finale de chaque image (section 5 de `style.md`) | `32x32` |
| `--colors` | nombre de couleurs max | `32` |
| `--mode` | `sprite`, `portrait`, `tile` ou `illus` (voir ci-dessous) | `sprite` |
| `--pad` | marge retirée dans chaque case (fraction) | `0.03` |
| `--cut` | seuil de détourage du magenta ; `120` ou plus pour garder les violets | `70` |
| `--anchor` | position dans la case en mode sprite : `bottom` ou `center` | `bottom` |

| Mode | Pour | Ce qu'il fait |
|---|---|---|
| `sprite` | personnages, véhicules, objets, effets, icônes | détoure le magenta, recadre au plus près, pose en bas de la case |
| `portrait` | portraits de dialogue | détoure sans recadrer : chaque buste garde sa place, pour s'aligner |
| `tile` | tuiles de sol | pas de détourage, la case remplit exactement la taille |
| `illus` | illustrations plein cadre | pas de détourage, largeur imposée, proportions gardées |

## Exemples par catégorie

```bash
# Portraits : planche 2x2 des 4 expressions d'un personnage
node scripts/art/pixelize.mjs --in assets/raw/gege.png --grid 2x2 --size 96x96 --colors 48 --mode portrait \
  --out public/assets/portraits --names gege-docker-neutre,gege-docker-content,gege-docker-fache,gege-docker-surpris

# Tuiles : planche 4x4 de sols
node scripts/art/pixelize.mjs --in assets/raw/sol-ville.png --grid 4x4 --size 32x32 --colors 48 --mode tile \
  --out public/assets/tiles/sol-ville --names asphalte,asphalte-ligne,...

# Illustration plein cadre
node scripts/art/pixelize.mjs --in assets/raw/titre.png --size 320x180 --colors 64 --mode illus --out public/assets/illus --names titre
```

Ensuite : contrôle qualité (section 10 de `style.md`), retouches éventuelles dans Aseprite ou Piskel, et une ligne au registre.
