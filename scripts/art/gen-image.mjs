// Génère une image via OpenRouter (repris de GRINTA). Voir docs/style.md, section 7.
// À lancer depuis la racine du repo :
//   node scripts/art/gen-image.mjs --out assets/raw/vehicules-01.png --prompt-file prompts/vehicules-01.txt --ref docs/bible/vehicules.png --aspect 1:1
// Options : --prompt "..." ou --prompt-file <fichier>, --ref <image> (répétable, 3 max conseillé), --aspect 1:1 | 16:9 | ..., --size 1K | 2K, --model <id>
// La clé OPENROUTER_API_KEY est lue dans l'environnement ou dans .env (jamais affichée, jamais commitée).
// CHAQUE APPEL COÛTE DE L'ARGENT : seulement dans le budget fixé par le propriétaire du repo.
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { parseArgs } from 'node:util'

const env = existsSync('.env') ? readFileSync('.env', 'utf8') : ''
const key = process.env.OPENROUTER_API_KEY ?? env.match(/^OPENROUTER_API_KEY=(.+)$/m)?.[1]?.trim()
if (!key) throw new Error('OPENROUTER_API_KEY manquante : la mettre dans .env à la racine du repo')

const { values: a } = parseArgs({
  options: {
    prompt: { type: 'string' },
    'prompt-file': { type: 'string' },
    out: { type: 'string' },
    ref: { type: 'string', multiple: true, default: [] },
    aspect: { type: 'string', default: '1:1' },
    model: { type: 'string', default: 'google/gemini-3-pro-image' },
    size: { type: 'string' },
  },
})

const prompt = a['prompt-file'] ? readFileSync(a['prompt-file'], 'utf8').trim() : a.prompt
if (!prompt || !a.out) throw new Error('Il faut --out et --prompt (ou --prompt-file)')
for (const f of a.ref) if (!existsSync(f)) throw new Error(`Référence introuvable : ${f}`)

const content = [
  { type: 'text', text: prompt },
  ...a.ref.map((f) => ({ type: 'image_url', image_url: { url: `data:image/png;base64,${readFileSync(f).toString('base64')}` } })),
]

const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: a.model,
    modalities: ['image', 'text'],
    image_config: { aspect_ratio: a.aspect, ...(a.size ? { image_size: a.size } : {}) },
    messages: [{ role: 'user', content }],
  }),
})
const json = await res.json()
if (!res.ok) throw new Error(JSON.stringify(json.error ?? json))
const img = json.choices?.[0]?.message?.images?.[0]?.image_url?.url
if (!img) throw new Error("Pas d'image : " + (json.choices?.[0]?.message?.content ?? JSON.stringify(json)).slice(0, 400))

mkdirSync(dirname(a.out), { recursive: true })
writeFileSync(a.out, Buffer.from(img.split(',')[1], 'base64'))

// Journal local de toutes les générations (assets/raw n'est pas versionné) : sert à remplir docs/registre-visuels.md.
const cost = json.usage?.cost
mkdirSync('assets/raw', { recursive: true })
const line = [new Date().toISOString(), a.out, a.model, a.ref.join(' '), cost ?? '', JSON.stringify(prompt)].join('\t')
appendFileSync('assets/raw/journal.tsv', line + '\n')
console.log(`${a.out}  (${cost != null ? '$' + cost.toFixed(4) : 'coût ?'})`)
