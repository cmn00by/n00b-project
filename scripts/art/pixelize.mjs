// Transforme un rendu IA (assets/raw) en vrai pixel art pour le jeu (public/assets). Repris de GRINTA, rendu générique.
// Détoure le fond magenta, découpe la planche selon sa grille, réduit chaque case à sa taille finale,
// rend la transparence binaire et limite la palette (PNG8). Voir docs/style.md, sections 5 et 7.
//
// À lancer depuis la racine du repo :
//   node scripts/art/pixelize.mjs --in assets/raw/vehicules-01.png --grid 2x2 --size 32x64 --colors 32 \
//     --out public/assets/vehicles --names mamie-car,delivery-van,sports-car,golf-cart
//
// Modes (--mode) :
//   sprite  (défaut) détourage magenta, recadrage au plus près, posé en bas de la case (personnages, véhicules, objets)
//   portrait détourage magenta, SANS recadrage : chaque buste garde sa place pour s'aligner d'un portrait à l'autre
//   tile     pas de détourage, la case remplit exactement la taille (tuiles de sol)
//   illus    pas de détourage, largeur imposée, proportions gardées (illustrations)
// Options : --pad 0.03 (marge retirée dans chaque case), --cut 70 (seuil du magenta ; 120+ pour garder les violets),
//           --anchor bottom | center (position dans la case en mode sprite), --names a,b,c ("-" pour sauter une case)
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { parseArgs } from 'node:util'

const { values: a } = parseArgs({
  options: {
    in: { type: 'string' },
    out: { type: 'string' },
    names: { type: 'string' },
    grid: { type: 'string', default: '1x1' },
    size: { type: 'string', default: '32x32' },
    colors: { type: 'string', default: '32' },
    mode: { type: 'string', default: 'sprite' },
    pad: { type: 'string', default: '0.03' },
    cut: { type: 'string', default: '70' },
    anchor: { type: 'string', default: 'bottom' },
  },
})

if (!a.in || !a.out || !a.names) throw new Error('Il faut --in, --out et --names')
const [cols, rows] = a.grid.split('x').map(Number)
const [width, height] = a.size.split('x').map(Number)
const names = a.names.split(',').map((n) => n.trim())
const colors = Number(a.colors)
const pad = Number(a.pad)
const cut = Number(a.cut)
if (names.length > cols * rows) throw new Error(`${names.length} noms pour ${cols * rows} cases`)
if (!['sprite', 'portrait', 'tile', 'illus'].includes(a.mode)) throw new Error(`Mode inconnu : ${a.mode}`)

/** Retire le fond magenta et ses bords rosés. `cut` haut (120+) pour garder les violets du dessin. */
async function keyMagenta(input) {
  const tint = cut < 120
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]]
    const m = Math.min(r, b) - g // « magentitude »
    if (m > cut) data[i + 3] = 0
    else if (tint && m > 25) data[i] = data[i + 2] = Math.max(0, Math.min(r, b) - m) + g * 0.2
  }
  return sharp(data, { raw: info })
}

/** Retire le liseré rose : les pixels teintés de magenta qui touchent le dehors tombent, sur quelques passes. */
function defringe(data, w, h, passes = 2) {
  const tinted = (i) => Math.min(data[i], data[i + 2]) - data[i + 1] > 22 && Math.abs(data[i] - data[i + 2]) < 0.45 * Math.max(data[i], data[i + 2])
  const open = (p) => data[p * 4 + 3] < 110
  for (let k = 0; k < passes; k++) {
    const out = new Uint8Array(w * h)
    const stack = []
    for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x)
    for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1)
    while (stack.length) {
      const p = stack.pop()
      if (out[p] || !open(p)) continue
      out[p] = 1
      const x = p % w
      if (x > 0) stack.push(p - 1)
      if (x < w - 1) stack.push(p + 1)
      if (p >= w) stack.push(p - w)
      if (p < w * (h - 1)) stack.push(p + w)
    }
    const drop = []
    for (let p = 0; p < w * h; p++) {
      if (open(p) || !tinted(p * 4)) continue
      const x = p % w
      if ((x > 0 && out[p - 1]) || (x < w - 1 && out[p + 1]) || (p >= w && out[p - w]) || (p < w * (h - 1) && out[p + w])) drop.push(p)
    }
    if (!drop.length) break
    for (const p of drop) data[p * 4 + 3] = 0
  }
}

/** Réduit à la taille finale, rend l'alpha binaire, retire le liseré et limite la palette. */
async function finish(img, resize, file, clean) {
  const { data, info } = await img.resize({ ...resize, kernel: 'mitchell' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let i = 3; i < data.length; i += 4) data[i] = data[i] > 110 ? 255 : 0
  if (clean) defringe(data, info.width, info.height)
  await sharp(data, { raw: info }).png({ palette: true, colors, dither: 0, compressionLevel: 9 }).toFile(file)
  return info
}

const meta = await sharp(a.in).metadata()
const cw = Math.floor(meta.width / cols)
const ch = Math.floor(meta.height / rows)
mkdirSync(a.out, { recursive: true })
const transparent = { r: 0, g: 0, b: 0, alpha: 0 }

for (let i = 0; i < names.length; i++) {
  if (names[i] === '-') continue
  const cell = await sharp(a.in)
    .extract({
      left: (i % cols) * cw + Math.round(cw * pad),
      top: Math.floor(i / cols) * ch + Math.round(ch * pad),
      width: Math.round(cw * (1 - 2 * pad)),
      height: Math.round(ch * (1 - 2 * pad)),
    })
    .png()
    .toBuffer()
  const file = `${a.out}/${names[i]}.png`
  let info
  if (a.mode === 'sprite') {
    const keyed = await (await keyMagenta(cell)).png().toBuffer()
    const trimmed = await sharp(keyed).trim({ threshold: 1 }).png().toBuffer()
    info = await finish(sharp(trimmed), { width, height, fit: 'contain', position: a.anchor === 'center' ? 'centre' : 'bottom', background: transparent }, file, true)
  } else if (a.mode === 'portrait') {
    info = await finish(await keyMagenta(cell), { width, height, fit: 'fill' }, file, true)
  } else if (a.mode === 'tile') {
    info = await finish(sharp(cell), { width, height, fit: 'fill' }, file, false)
  } else {
    info = await finish(sharp(cell), { width }, file, false)
  }
  process.stdout.write(`${names[i]} ${info.width}x${info.height}  `)
}
console.log(`\n→ ${a.out}`)
